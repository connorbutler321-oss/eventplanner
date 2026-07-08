"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createEvent, updateEvent } from "@/lib/data/events";
import { cloneFloorPlanFromTemplate } from "@/lib/data/floorplans";
import type { EventStatus } from "@/lib/types";

export type EventFormState = { error?: string } | undefined;

function readEventFields(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim(),
    date: String(formData.get("date") ?? ""),
    location: String(formData.get("location") ?? "").trim(),
    capacity: Number(formData.get("capacity") ?? 0),
  };
}

export async function createEventAction(
  _prev: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const fields = readEventFields(formData);
  if (!fields.name || !fields.date || !fields.location || fields.capacity <= 0) {
    return { error: "Please fill in all required fields with a capacity greater than 0." };
  }

  const templateId = String(formData.get("templateId") ?? "");
  let floorPlanId: string | undefined;
  if (templateId) {
    const plan = cloneFloorPlanFromTemplate(templateId, `${fields.name} Layout`);
    floorPlanId = plan.id;
  }

  const event = createEvent({ ...fields, floorPlanId });
  revalidatePath("/planner/events");
  revalidatePath("/planner");
  redirect(`/planner/events/${event.id}`);
}

export async function updateEventAction(
  eventId: string,
  _prev: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const fields = readEventFields(formData);
  if (!fields.name || !fields.date || !fields.location || fields.capacity <= 0) {
    return { error: "Please fill in all required fields with a capacity greater than 0." };
  }

  updateEvent(eventId, fields);
  revalidatePath(`/planner/events/${eventId}`);
  revalidatePath("/planner/events");
  revalidatePath("/planner");
  return undefined;
}

export async function setEventStatusAction(eventId: string, status: EventStatus): Promise<void> {
  updateEvent(eventId, { status });
  revalidatePath(`/planner/events/${eventId}`);
  revalidatePath("/planner/events");
  revalidatePath("/planner");
}
