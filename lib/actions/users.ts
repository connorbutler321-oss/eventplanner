"use server";

import { revalidatePath } from "next/cache";
import { createUser, updateUser, deleteUser, getUserByEmail } from "@/lib/data/users";
import type { Role } from "@/lib/types";

export type UserFormState = { error?: string } | undefined;

export async function createUserAction(
  _prev: UserFormState,
  formData: FormData
): Promise<UserFormState> {
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
  if (getUserByEmail(email)) {
    return { error: "A user with this email already exists." };
  }

  createUser({ name, email, password: "password123", pin, role });
  revalidatePath("/planner/users");
  return undefined;
}

export async function updateUserRoleAction(userId: string, role: Role): Promise<void> {
  updateUser(userId, { role });
  revalidatePath("/planner/users");
}

export async function resetUserPinAction(userId: string, pin: string): Promise<void> {
  if (!/^\d{4,6}$/.test(pin)) return;
  updateUser(userId, { pin });
  revalidatePath("/planner/users");
}

export async function deleteUserAction(userId: string): Promise<void> {
  deleteUser(userId);
  revalidatePath("/planner/users");
}
