import { store, nextId } from "./store";
import type { Role, User } from "@/lib/types";

export function getUsers(): User[] {
  return store.users;
}

export function getUserById(id: string): User | undefined {
  return store.users.find((u) => u.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  return store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function verifyPassword(email: string, password: string): User | null {
  const user = getUserByEmail(email);
  if (!user || user.password !== password) return null;
  user.lastLogin = new Date().toISOString();
  return user;
}

export function verifyPin(userId: string, pin: string): User | null {
  const user = getUserById(userId);
  if (!user || user.pin !== pin) return null;
  user.lastLogin = new Date().toISOString();
  return user;
}

export function createUser(input: {
  name: string;
  email: string;
  password: string;
  pin: string;
  role: Role;
  attendeeId?: string;
}): User {
  const user: User = {
    id: nextId("u"),
    createdAt: new Date().toISOString(),
    ...input,
  };
  store.users.push(user);
  return user;
}

export function updateUser(
  id: string,
  patch: Partial<Pick<User, "name" | "role" | "pin" | "password">>
): User | null {
  const user = getUserById(id);
  if (!user) return null;
  Object.assign(user, patch);
  return user;
}

export function deleteUser(id: string): boolean {
  const idx = store.users.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  store.users.splice(idx, 1);
  return true;
}
