import { db, nextId } from "./db";
import type { AccessMode, Role, User } from "@/lib/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    pin: row.pin,
    role: row.role,
    attendeeId: row.attendee_id ?? undefined,
    accessMode: row.access_mode ?? undefined,
    createdAt: row.created_at,
    lastLogin: row.last_login ?? undefined,
  };
}

export async function getUsers(): Promise<User[]> {
  const sql = await db();
  const rows = await sql`SELECT * FROM users ORDER BY created_at, id`;
  return rows.map(mapUser);
}

export async function getUserById(id: string): Promise<User | undefined> {
  const sql = await db();
  const rows = await sql`SELECT * FROM users WHERE id = ${id}`;
  return rows[0] ? mapUser(rows[0]) : undefined;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const sql = await db();
  const rows = await sql`SELECT * FROM users WHERE lower(email) = lower(${email})`;
  return rows[0] ? mapUser(rows[0]) : undefined;
}

async function touchLastLogin(userId: string): Promise<string> {
  const sql = await db();
  const now = new Date().toISOString();
  await sql`UPDATE users SET last_login = ${now} WHERE id = ${userId}`;
  return now;
}

export async function verifyPassword(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email);
  if (!user || user.password !== password) return null;
  user.lastLogin = await touchLastLogin(user.id);
  return user;
}

export async function verifyPin(userId: string, pin: string): Promise<User | null> {
  const user = await getUserById(userId);
  if (!user || user.pin !== pin) return null;
  user.lastLogin = await touchLastLogin(user.id);
  return user;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  pin: string;
  role: Role;
  attendeeId?: string;
}): Promise<User> {
  // New planners start in request mode and staff view-only; others are direct.
  const accessMode: AccessMode | undefined =
    input.role === "planner" ? "request" : input.role === "staff" ? "view" : undefined;
  const user: User = {
    id: nextId("u"),
    accessMode,
    createdAt: new Date().toISOString(),
    ...input,
  };
  const sql = await db();
  await sql`INSERT INTO users (id, name, email, password, pin, role, attendee_id, access_mode, created_at)
    VALUES (${user.id}, ${user.name}, ${user.email}, ${user.password}, ${user.pin}, ${user.role}, ${user.attendeeId ?? null}, ${user.accessMode ?? null}, ${user.createdAt})`;
  return user;
}

export async function updateUser(
  id: string,
  patch: Partial<Pick<User, "name" | "role" | "pin" | "password" | "accessMode">>
): Promise<User | null> {
  const existing = await getUserById(id);
  if (!existing) return null;
  const merged = { ...existing, ...patch };
  const sql = await db();
  await sql`UPDATE users
    SET name = ${merged.name}, role = ${merged.role}, pin = ${merged.pin}, password = ${merged.password}, access_mode = ${merged.accessMode ?? null}
    WHERE id = ${id}`;
  return merged;
}

export async function deleteUser(id: string): Promise<boolean> {
  const sql = await db();
  const rows = await sql`DELETE FROM users WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}
