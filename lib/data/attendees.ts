import { store, nextId } from "./store";
import type { Attendee } from "@/lib/types";

export function getAttendees(): Attendee[] {
  return store.attendees;
}

export function getAttendeeById(id: string): Attendee | undefined {
  return store.attendees.find((a) => a.id === id);
}

export function findOrCreateAttendeeByEmail(input: {
  name: string;
  businessName?: string;
  email: string;
  phone: string;
  category: string;
}): Attendee {
  const existing = store.attendees.find(
    (a) => a.email.toLowerCase() === input.email.toLowerCase()
  );
  if (existing) {
    Object.assign(existing, input);
    return existing;
  }
  const attendee: Attendee = { id: nextId("a"), ...input };
  store.attendees.push(attendee);
  return attendee;
}
