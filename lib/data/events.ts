import { db, nextId } from "./db";
import type { EventRecord, EventStatus } from "@/lib/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapEvent(row: any): EventRecord {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    date: row.date,
    location: row.location,
    capacity: row.capacity,
    status: row.status,
    floorPlanId: row.floor_plan_id ?? undefined,
    createdAt: row.created_at,
  };
}

export async function getEvents(): Promise<EventRecord[]> {
  const sql = await db();
  const rows = await sql`SELECT * FROM events ORDER BY date`;
  return rows.map(mapEvent);
}

export async function getOpenEvents(): Promise<EventRecord[]> {
  const sql = await db();
  const rows = await sql`SELECT * FROM events WHERE status IN ('Open', 'Full', 'Waitlisted') ORDER BY date`;
  return rows.map(mapEvent);
}

export async function getEventById(id: string): Promise<EventRecord | undefined> {
  const sql = await db();
  const rows = await sql`SELECT * FROM events WHERE id = ${id}`;
  return rows[0] ? mapEvent(rows[0]) : undefined;
}

export async function createEvent(input: {
  name: string;
  description: string;
  category: string;
  date: string;
  location: string;
  capacity: number;
  floorPlanId?: string;
}): Promise<EventRecord> {
  const event: EventRecord = {
    id: nextId("e"),
    status: "Draft",
    createdAt: new Date().toISOString(),
    ...input,
  };
  const sql = await db();
  await sql`INSERT INTO events (id, name, description, category, date, location, capacity, status, floor_plan_id, created_at)
    VALUES (${event.id}, ${event.name}, ${event.description}, ${event.category}, ${event.date}, ${event.location}, ${event.capacity}, ${event.status}, ${event.floorPlanId ?? null}, ${event.createdAt})`;
  return event;
}

export async function updateEvent(
  id: string,
  patch: Partial<Omit<EventRecord, "id" | "createdAt">>
): Promise<EventRecord | null> {
  const existing = await getEventById(id);
  if (!existing) return null;
  const merged = { ...existing, ...patch };
  const sql = await db();
  await sql`UPDATE events
    SET name = ${merged.name}, description = ${merged.description}, category = ${merged.category},
        date = ${merged.date}, location = ${merged.location}, capacity = ${merged.capacity},
        status = ${merged.status}, floor_plan_id = ${merged.floorPlanId ?? null}
    WHERE id = ${id}`;
  return merged;
}

export async function setEventStatus(id: string, status: EventStatus): Promise<EventRecord | null> {
  return updateEvent(id, { status });
}
