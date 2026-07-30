"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSessionUser, assertCanEdit } from "@/lib/auth";
import { findOrCreateAttendeeByEmail } from "@/lib/data/attendees";
import {
  createRegistration,
  cancelRegistration,
  setRegistrationStatus,
  RegistrationError,
} from "@/lib/data/registrations";
import { getEventById } from "@/lib/data/events";
import type { RegistrationStatus } from "@/lib/types";

export type RegisterState = { error?: string } | undefined;

export async function registerForEventAction(
  eventId: string,
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const event = await getEventById(eventId);
  if (!event) return { error: "This event no longer exists." };

  const name = String(formData.get("contactName") ?? "").trim();
  const businessName = String(formData.get("businessName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const needsElectricity = String(formData.get("needsElectricity") ?? "");
  const tableCount = String(formData.get("tableCount") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  const boothId = String(formData.get("boothId") ?? "") || undefined;

  if (!name || !email || !phone || !category) {
    return { error: "Please fill in all required fields." };
  }

  const attendee = await findOrCreateAttendeeByEmail({ name, businessName, email, phone, category });

  try {
    await createRegistration({
      eventId,
      attendeeId: attendee.id,
      boothId,
      formAnswers: { needsElectricity, tableCount, notes },
    });
  } catch (err) {
    if (err instanceof RegistrationError) return { error: err.message };
    throw err;
  }

  // Registering can reserve a booth (see reserveSpace in lib/data/registrations.ts),
  // which changes floor-plan data rendered on nested routes — most importantly the
  // vendor booth picker at /vendor/floorplan/[eventId]. A literal path only refreshes
  // that one page, so use "layout" to cover the whole subtree; per the revalidatePath
  // docs, that invalidates the layout and every page beneath it.
  revalidatePath("/vendor", "layout");
  revalidatePath("/planner", "layout");
  redirect("/vendor/my-registrations");
}

export async function cancelMyRegistrationAction(registrationId: string): Promise<void> {
  await cancelRegistration(registrationId);
  // Canceling releases the booth, so the picker and both floor-plan views are stale.
  revalidatePath("/vendor", "layout");
  revalidatePath("/planner", "layout");
}

export async function adminCancelRegistrationAction(eventId: string, registrationId: string): Promise<void> {
  await assertCanEdit();
  await cancelRegistration(registrationId);
  revalidatePath(`/planner/events/${eventId}`);
  revalidatePath("/planner", "layout");
  revalidatePath("/vendor", "layout");
}

export async function adminSetRegistrationStatusAction(
  eventId: string,
  registrationId: string,
  status: RegistrationStatus
): Promise<void> {
  await assertCanEdit();
  await setRegistrationStatus(registrationId, status);
  revalidatePath(`/planner/events/${eventId}`);
  revalidatePath("/planner", "layout");
  revalidatePath("/vendor", "layout");
}
