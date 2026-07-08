"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyPassword, verifyPin } from "@/lib/data/users";
import { startSession, endSession, lockSession, getDeviceUser, homePathForRole } from "@/lib/auth";

export type ActionState = { error?: string } | undefined;

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const user = verifyPassword(email, password);
  if (!user) {
    return { error: "Invalid email or password. Try one of the demo accounts below." };
  }

  await startSession(user.id);
  redirect(homePathForRole(user.role));
}

export async function pinAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const pin = String(formData.get("pin") ?? "");
  const device = await getDeviceUser();
  if (!device) {
    redirect("/login");
  }

  const user = verifyPin(device.id, pin);
  if (!user) {
    return { error: "Incorrect PIN. Please try again." };
  }

  await startSession(user.id);
  redirect(homePathForRole(user.role));
}

export async function switchAccountAction() {
  const store = await cookies();
  store.delete("ef_device");
  store.delete("ef_session");
  redirect("/login");
}

export async function lockScreenAction() {
  await lockSession();
  redirect("/pin");
}

export async function logoutAction() {
  await endSession();
  redirect("/login");
}

export async function enterVendorPreviewAction() {
  const store = await cookies();
  store.set("ef_preview", "vendor", { httpOnly: false, sameSite: "lax", path: "/" });
  redirect("/vendor");
}

export async function exitVendorPreviewAction() {
  const store = await cookies();
  store.delete("ef_preview");
  redirect("/planner");
}
