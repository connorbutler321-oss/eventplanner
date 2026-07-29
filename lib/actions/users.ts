"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createUser, updateUser, deleteUser, getUserByEmail } from "@/lib/data/users";
import type { AccessMode, Role } from "@/lib/types";

// Every action in this file manages staff access and is therefore admin-only.
// The page guard in app/planner/users/page.tsx protects the page, not these
// endpoints — see requireAdmin() in lib/auth.ts.

export type UserFormState = { error?: string } | undefined;

export async function createUserAction(
  _prev: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "staff") as Role;
  const pin = String(formData.get("pin") ?? "").trim();

  if (!name || !email || !pin) {
    return { error: "Name, email, and a PIN are all required." };
  }
  if (!/^\d{4,6}$/.test(pin)) {
    return { error: "PIN must be 4-6 digits." };
  }
  if (await getUserByEmail(email)) {
    return { error: "A user with this email already exists." };
  }

  await createUser({ name, email, password: "password123", pin, role });
  revalidatePath("/planner/users");
  return undefined;
}

export async function updateUserRoleAction(userId: string, role: Role): Promise<void> {
  await requireAdmin();
  await updateUser(userId, { role });
  revalidatePath("/planner/users");
}

export async function setUserAccessModeAction(userId: string, mode: AccessMode): Promise<void> {
  await requireAdmin();
  await updateUser(userId, { accessMode: mode });
  revalidatePath("/planner/users");
}

export async function resetUserPinAction(userId: string, pin: string): Promise<void> {
  await requireAdmin();
  if (!/^\d{4,6}$/.test(pin)) return;
  await updateUser(userId, { pin });
  revalidatePath("/planner/users");
}

export async function deleteUserAction(userId: string): Promise<void> {
  await requireAdmin();
  await deleteUser(userId);
  revalidatePath("/planner/users");
}
