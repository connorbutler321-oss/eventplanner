import { store, nextId } from "./store";
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
//      one active registration at a time.
//   4. No duplicate registrations  — one attendee can't double register.

export function getRegistrations(): Registration[] {
  return store.registrations;
}

export function getRegistrationById(id: string): Registration | undefined {
  return store.registrations.find((r) => r.id === id);
}

export function getRegistrationsForEvent(eventId: string): Registration[] {
  return store.registrations.filter((r) => r.eventId === eventId);
}

export function getRegistrationsForAttendee(attendeeId: string): Registration[] {
  return store.registrations.filter((r) => r.attendeeId === attendeeId);
}

export function confirmedCount(eventId: string): number {
  return getRegistrationsForEvent(eventId).filter(
    (r) => r.status === "Confirmed" || r.status === "Promoted" || r.status === "Attended"
  ).length;
}

export function waitlistCount(eventId: string): number {
  return getRegistrationsForEvent(eventId).filter((r) => r.status === "Waitlisted").length;
}

export function isEventAtCapacity(eventId: string): boolean {
  const event = getEventById(eventId);
  if (!event) return true;
  return confirmedCount(eventId) >= event.capacity;
}

/** Recomputes an Open/Full/Waitlisted event's status from live registration counts. */
function refreshEventStatus(eventId: string): void {
  const event = getEventById(eventId);
  if (!event) return;
  if (!["Open", "Full", "Waitlisted"].includes(event.status)) return;

  const confirmed = confirmedCount(eventId);
  const waitlisted = waitlistCount(eventId);

  if (confirmed < event.capacity) {
    event.status = "Open";
  } else if (waitlisted > 0) {
    event.status = "Waitlisted";
  } else {
    event.status = "Full";
  }
}

export function createRegistration(input: {
  eventId: string;
  attendeeId: string;
  boothId?: string;
  formAnswers: Record<string, string>;
}): Registration {
  const event = getEventById(input.eventId);
  if (!event) throw new RegistrationError("Event not found.");
  if (event.status === "Closed" || event.status === "Completed" || event.status === "Canceled") {
    throw new RegistrationError(`Registration is not open for this event (${event.status}).`);
  }

  const alreadyRegistered = getRegistrationsForEvent(input.eventId).some(
    (r) => r.attendeeId === input.attendeeId && r.status !== "Canceled"
  );
  if (alreadyRegistered) {
    throw new RegistrationError("This attendee is already registered for this event.");
  }

  if (input.boothId) {
    reserveSpace(event.floorPlanId, input.boothId); // throws if unavailable
  }

  const now = new Date().toISOString();
  const atCapacity = isEventAtCapacity(input.eventId);
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
  store.registrations.push(registration);
  refreshEventStatus(input.eventId);

  sendNotification({
    registrationId: registration.id,
    type: atCapacity ? "waitlist" : "confirmation",
    message: atCapacity
      ? `You've been added to the waitlist for ${event.name}. We'll notify you if a spot opens up.`
      : `You're confirmed for ${event.name}! We'll see you on ${new Date(event.date).toLocaleDateString()}.`,
  });

  return registration;
}

export function cancelRegistration(id: string): Registration | null {
  const registration = getRegistrationById(id);
  if (!registration) return null;
  const wasConfirmed = registration.status === "Confirmed" || registration.status === "Promoted";

  registration.status = "Canceled";
  registration.updatedAt = new Date().toISOString();

  const event = getEventById(registration.eventId);
  if (registration.boothId) {
    releaseSpace(event?.floorPlanId, registration.boothId);
  }

  sendNotification({
    registrationId: registration.id,
    type: "cancellation",
    message: `Your registration for ${event?.name ?? "the event"} has been canceled.`,
  });

  if (wasConfirmed) {
    promoteNextWaitlisted(registration.eventId);
  }
  if (event) refreshEventStatus(event.id);

  return registration;
}

function promoteNextWaitlisted(eventId: string): void {
  const nextInLine = getRegistrationsForEvent(eventId)
    .filter((r) => r.status === "Waitlisted")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
  if (!nextInLine) return;

  nextInLine.status = "Promoted";
  nextInLine.updatedAt = new Date().toISOString();

  const event = getEventById(eventId);
  sendNotification({
    registrationId: nextInLine.id,
    type: "promotion",
    message: `Good news! A spot opened up and you've been moved from the waitlist to confirmed for ${
      event?.name ?? "the event"
    }.`,
  });
}

export function setRegistrationStatus(id: string, status: RegistrationStatus): Registration | null {
  const registration = getRegistrationById(id);
  if (!registration) return null;
  registration.status = status;
  registration.updatedAt = new Date().toISOString();
  return registration;
}
