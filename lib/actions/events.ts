"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSessionUser, requiresApproval, isViewOnly } from "@/lib/auth";
import { createEvent, updateEvent, getEventById } from "@/lib/data/events";
import { cloneFloorPlanFromTemplate } from "@/lib/data/floorplans";
import { createChangeRequest } from "@/lib/data/requests";
import type { EventStatus } from "@/lib/types";

export type EventFormState = { error?: string; notice?: string } | undefined;

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
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (isViewOnly(user)) {
    return { error: "Your account has view-only access. Ask an admin for edit access." };
  }

  const fields = readEventFields(formData);
  if (!fields.name || !fields.date || !fields.location || fields.capacity <= 0) {
    return { error: "Please fill in all required fields with a capacity greater than 0." };
  }

  const templateId = String(formData.get("templateId") ?? "") || undefined;

  if (requiresApproval(user)) {
    await createChangeRequest({
      type: "event.create",
      requestedBy: user.id,
      summary: `Create event “${fields.name}”`,
      payload: { fields, templateId },
    });
    revalidatePath("/planner/requests");
    return { notice: "Submitted for admin approval. It will appear once an admin approves it." };
  }

  let floorPlanId: string | undefined;
  if (templateId) {
    const plan = await cloneFloorPlanFromTemplate(templateId, `${fields.name} Layout`);
    floorPlanId = plan.id;
  }

  const event = await createEvent({ ...fields, floorPlanId });
  revalidatePath("/planner/events");
  revalidatePath("/planner");
  redirect(`/planner/events/${event.id}`);
}

export async function updateEventAction(
  eventId: string,
  _prev: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (isViewOnly(user)) {
    return { error: "Your account has view-only access. Ask an admin for edit access." };
  }

  const fields = readEventFields(formData);
  if (!fields.name || !fields.date || !fields.location || fields.capacity <= 0) {
    return { error: "Please fill in all required fields with a capacity greater than 0." };
  }

  if (requiresApproval(user)) {
    await createChangeRequest({
      type: "event.update",
      requestedBy: user.id,
      targetId: eventId,
      summary: `Edit event “${fields.name}”`,
      payload: { fields },
    });
    revalidatePath("/planner/requests");
    return { notice: "Changes submitted for admin approval. The event is unchanged until approved." };
  }

  await updateEvent(eventId, fields);
  revalidatePath(`/planner/events/${eventId}`);
  revalidatePath("/planner/events");
  revalidatePath("/planner");
  return undefined;
}

export async function setEventStatusAction(eventId: string, status: EventStatus): Promise<void> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (isViewOnly(user)) throw new Error("Forbidden: your account has view-only access.");

  if (requiresApproval(user)) {
    const event = await getEventById(eventId);
    await createChangeRequest({
      type: "event.status",
      requestedBy: user.id,
      targetId: eventId,
      summary: `Set “${event?.name ?? "event"}” status to ${status}`,
      payload: { status },
    });
    revalidatePath("/planner/requests");
    return;
  }

  await updateEvent(eventId, { status });
  revalidatePath(`/planner/events/${eventId}`);
  revalidatePath("/planner/events");
  revalidatePath("/planner");
}
