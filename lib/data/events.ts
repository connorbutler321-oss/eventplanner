import { store, nextId } from "./store";
import type { EventRecord, EventStatus } from "@/lib/types";

export function getEvents(): EventRecord[] {
  return [...store.events].sort((a, b) => a.date.localeCompare(b.date));
}

export function getOpenEvents(): EventRecord[] {
  return getEvents().filter((e) => e.status === "Open" || e.status === "Full" || e.status === "Waitlisted");
}

export function getEventById(id: string): EventRecord | undefined {
  return store.events.find((e) => e.id === id);
}

export function createEvent(input: {
  name: string;
  description: string;
  category: string;
  date: string;
  location: string;
  capacity: number;
  floorPlanId?: string;
}): EventRecord {
  const event: EventRecord = {
    id: nextId("e"),
    status: "Draft",
    createdAt: new Date().toISOString(),
    ...input,
  };
  store.events.push(event);
  return event;
}

export function updateEvent(
  id: string,
  patch: Partial<Omit<EventRecord, "id" | "createdAt">>
): EventRecord | null {
  const event = getEventById(id);
  if (!event) return null;
  Object.assign(event, patch);
  return event;
}

export function setEventStatus(id: string, status: EventStatus): EventRecord | null {
  return updateEvent(id, { status });
}
