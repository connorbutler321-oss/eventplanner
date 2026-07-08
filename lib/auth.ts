import "server-only";
import { cookies } from "next/headers";
import { getUserById } from "@/lib/data/users";
import type { User } from "@/lib/types";

// Auth model for this shell:
//   - SESSION_COOKIE: an active, unlocked session (contains a userId).
//   - DEVICE_COOKIE:  "this browser recognizes this user" — set after a
//     full email+password login, long-lived, and used to route returning
//     users to the quick PIN screen instead of full login.
//
// A real deployment would sign/encrypt these cookies (e.g. with iron-session
// or NextAuth) and hash passwords/PINs — this mock keeps things in plain
// cookies since there is no real credential material yet.

const SESSION_COOKIE = "ef_session";
const DEVICE_COOKIE = "ef_device";

export async function getSessionUser(): Promise<User | null> {
  const store = await cookies();
  const userId = store.get(SESSION_COOKIE)?.value;
  if (!userId) return null;
  return getUserById(userId) ?? null;
}

export async function getDeviceUser(): Promise<User | null> {
  const store = await cookies();
  const userId = store.get(DEVICE_COOKIE)?.value;
  if (!userId) return null;
  return getUserById(userId) ?? null;
}

export async function startSession(userId: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, userId, { httpOnly: true, sameSite: "lax", path: "/" });
  store.set(DEVICE_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

/** Locks the session (e.g. "Lock screen") but keeps device recognition for a fast PIN re-auth. */
export async function lockSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Full sign-out: clears both the session and device recognition. */
export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(DEVICE_COOKIE);
}

export function homePathForRole(role: User["role"]): string {
  return role === "vendor" ? "/vendor" : "/planner";
}

export async function isPreviewingVendor(): Promise<boolean> {
  const store = await cookies();
  return store.get("ef_preview")?.value === "vendor";
}
