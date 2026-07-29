import { db, nextId } from "./db";
import type { Attendee } from "@/lib/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapAttendee(row: any): Attendee {
  return {
    id: row.id,
    name: row.name,
    businessName: row.business_name ?? undefined,
    email: row.email,
    phone: row.phone,
    category: row.category,
        listVisible: row.list_visible ?? true,
  };
}

export async function getAttendees(): Promise<Attendee[]> {
  const sql = await db();
  const rows = await sql`SELECT * FROM attendees ORDER BY name`;
  return rows.map(mapAttendee);
}

export async function getAttendeeById(id: string): Promise<Attendee | undefined> {
  const sql = await db();
  const rows = await sql`SELECT * FROM attendees WHERE id = ${id}`;
  return rows[0] ? mapAttendee(rows[0]) : undefined;
}

export async function findOrCreateAttendeeByEmail(input: {
  name: string;
  businessName?: string;
  email: string;
  phone: string;
  category: string;
}): Promise<Attendee> {
  const sql = await db();
  const existing = await sql`SELECT * FROM attendees WHERE lower(email) = lower(${input.email})`;
  if (existing[0]) {
    const rows = await sql`UPDATE attendees
      SET name = ${input.name}, business_name = ${input.businessName ?? null}, email = ${input.email}, phone = ${input.phone}, category = ${input.category}
      WHERE id = ${existing[0].id}
      RETURNING *`;
    return mapAttendee(rows[0]);
  }
    const attendee: Attendee = { id: nextId("a"), listVisible: true, ...input };

  await sql`INSERT INTO attendees (id, name, business_name, email, phone, category)
    VALUES (${attendee.id}, ${attendee.name}, ${attendee.businessName ?? null}, ${attendee.email}, ${attendee.phone}, ${attendee.category})`;
  return attendee;
  }
  /** Sets whether an attendee appears on the event attendee lists other vendors can see. */
export async function setAttendeeVisibility(id: string, visible: boolean): Promise<void> {
  const sql = await db();
  await sql`UPDATE attendees SET list_visible = ${visible} WHERE id = ${id}`;
}
