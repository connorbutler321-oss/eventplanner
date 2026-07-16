import { db, nextId } from "./db";
import type { Registration, RegistrationStatus } from "@/lib/types";
import { getEventById } from "./events";
import { reserveSpace, releaseSpace } from "./floorplans";
import { sendNotification } from "@/lib/notifications";
import { RegistrationError } from "./registrations-errors";

export { RegistrationError };

// Business rules live here (not in the UI layer):
//   1. Capacity enforcement       — confirming beyond capacity auto-waitlists.
//   2. Automatic waitlist promotion — canceling a confirmed spot promotes
//      the earliest waitlisted registration.
//   3. Booth-level capacity        — a floor-plan space can only be held by
//      one active registration at a time (enforced by a conditional UPDATE
//      in floorplans.ts).
//   4. No duplicate registrations  — one attendee can't double register.

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapRegistration(row: any): Registration {
  return {
    id: row.id,
    eventId: row.event_id,
    attendeeId: row.attendee_id,
    status: row.status,
    boothId: row.booth_id ?? undefined,
    formAnswers: row.form_answers as Record<string, string>,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getRegistrations(): Promise<Registration[]> {
  const sql = await db();
  const rows = await sql`SELECT * FROM registrations ORDER BY created_at`;
  return rows.map(mapRegistration);
}

export async function getRegistrationById(id: string): Promise<Registration | undefined> {
  const sql = await db();
  const rows = await sql`SELECT * FROM registrations WHERE id = ${id}`;
  return rows[0] ? mapRegistration(rows[0]) : undefined;
}

export async function getRegistrationsForEvent(eventId: string): Promise<Registration[]> {
  const sql = await db();
  const rows = await sql`SELECT * FROM registrations WHERE event_id = ${eventId} ORDER BY created_at`;
  return rows.map(mapRegistration);
}

export async function getRegistrationsForAttendee(attendeeId: string): Promise<Registration[]> {
  const sql = await db();
  const rows = await sql`SELECT * FROM registrations WHERE attendee_id = ${attendeeId} ORDER BY created_at`;
  return rows.map(mapRegistration);
}

export async function confirmedCount(eventId: string): Promise<number> {
  const sql = await db();
  const rows = await sql`SELECT count(*)::int AS count FROM registrations
    WHERE event_id = ${eventId} AND status IN ('Confirmed', 'Promoted', 'Attended')`;
  return rows[0].count;
}

export async function waitlistCount(eventId: string): Promise<number> {
  const sql = await db();
  const rows = await sql`SELECT count(*)::int AS count FROM registrations
    WHERE event_id = ${eventId} AND status = 'Waitlisted'`;
  return rows[0].count;
}

export async function isEventAtCapacity(eventId: string): Promise<boolean> {
  const event = await getEventById(eventId);
  if (!event) return true;
  return (await confirmedCount(eventId)) >= event.capacity;
}

/** Recomputes an Open/Full/Waitlisted event's status from live registration counts. */
async function refreshEventStatus(eventId: string): Promise<void> {
  const event = await getEventById(eventId);
  if (!event) return;
  if (!["Open", "Full", "Waitlisted"].includes(event.status)) return;

  const confirmed = await confirmedCount(eventId);
  const waitlisted = await waitlistCount(eventId);

  let status: string;
  if (confirmed < event.capacity) {
    status = "Open";
  } else if (waitlisted > 0) {
    status = "Waitlisted";
  } else {
    status = "Full";
  }
  if (status !== event.status) {
    const sql = await db();
    await sql`UPDATE events SET status = ${status} WHERE id = ${eventId}`;
  }
}

export async function createRegistration(input: {
  eventId: string;
  attendeeId: string;
  boothId?: string;
  formAnswers: Record<string, string>;
}): Promise<Registration> {
  const event = await getEventById(input.eventId);
  if (!event) throw new RegistrationError("Event not found.");
  if (event.status === "Closed" || event.status === "Completed" || event.status === "Canceled") {
    throw new RegistrationError(`Registration is not open for this event (${event.status}).`);
  }

  const sql = await db();
  const duplicates = await sql`SELECT 1 FROM registrations
    WHERE event_id = ${input.eventId} AND attendee_id = ${input.attendeeId} AND status <> 'Canceled'
    LIMIT 1`;
  if (duplicates.length > 0) {
    throw new RegistrationError("This attendee is already registered for this event.");
  }

  if (input.boothId) {
    await reserveSpace(event.floorPlanId, input.boothId); // throws if unavailable
  }

  const now = new Date().toISOString();
  const atCapacity = await isEventAtCapacity(input.eventId);
  const registration: Registration = {
    id: nextId("r"),
    eventId: input.eventId,
    attendeeId: input.attendeeId,
    boothId: input.boothId,
    formAnswers: input.formAnswers,
    status: atCapacity ? "Waitlisted" : "Confirmed",
    createdAt: now,
    updatedAt: now,
  };
  await sql`INSERT INTO registrations (id, event_id, attendee_id, status, booth_id, form_answers, created_at, updated_at)
    VALUES (${registration.id}, ${registration.eventId}, ${registration.attendeeId}, ${registration.status}, ${registration.boothId ?? null}, ${JSON.stringify(registration.formAnswers)}::jsonb, ${registration.createdAt}, ${registration.updatedAt})`;
  await refreshEventStatus(input.eventId);

  await sendNotification({
    registrationId: registration.id,
    type: atCapacity ? "waitlist" : "confirmation",
    message: atCapacity
      ? `You've been added to the waitlist for ${event.name}. We'll notify you if a spot opens up.`
      : `You're confirmed for ${event.name}! We'll see you on ${new Date(event.date).toLocaleDateString()}.`,
  });

  return registration;
}

export async function cancelRegistration(id: string): Promise<Registration | null> {
  const registration = await getRegistrationById(id);
  if (!registration) return null;
  const wasConfirmed = registration.status === "Confirmed" || registration.status === "Promoted";

  const now = new Date().toISOString();
  const sql = await db();
  await sql`UPDATE registrations SET status = 'Canceled', updated_at = ${now} WHERE id = ${id}`;
  registration.status = "Canceled";
  registration.updatedAt = now;

  const event = await getEventById(registration.eventId);
  if (registration.boothId) {
    await releaseSpace(event?.floorPlanId, registration.boothId);
  }

  await sendNotification({
    registrationId: registration.id,
    type: "cancellation",
    message: `Your registration for ${event?.name ?? "the event"} has been canceled.`,
  });

  if (wasConfirmed) {
    await promoteNextWaitlisted(registration.eventId);
  }
  if (event) await refreshEventStatus(event.id);

  return registration;
}

async function promoteNextWaitlisted(eventId: string): Promise<void> {
  const sql = await db();
  const rows = await sql`SELECT * FROM registrations
    WHERE event_id = ${eventId} AND status = 'Waitlisted'
    ORDER BY created_at
    LIMIT 1`;
  if (rows.length === 0) return;
  const nextInLine = mapRegistration(rows[0]);

  const now = new Date().toISOString();
  await sql`UPDATE registrations SET status = 'Promoted', updated_at = ${now} WHERE id = ${nextInLine.id}`;

  const event = await getEventById(eventId);
  await sendNotification({
    registrationId: nextInLine.id,
    type: "promotion",
    message: `Good news! A spot opened up and you've been moved from the waitlist to confirmed for ${
      event?.name ?? "the event"
    }.`,
  });
}

export async function setRegistrationStatus(
  id: string,
  status: RegistrationStatus
): Promise<Registration | null> {
  const sql = await db();
  const now = new Date().toISOString();
  const rows = await sql`UPDATE registrations SET status = ${status}, updated_at = ${now} WHERE id = ${id} RETURNING *`;
  return rows[0] ? mapRegistration(rows[0]) : null;
}
