"use client";

import { useState, useTransition } from "react";
import { updateUserRoleAction, resetUserPinAction, deleteUserAction } from "@/lib/actions/users";
import type { Role, User } from "@/lib/types";
import { Select, Input } from "@/components/ui/Field";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { Badge } from "@/components/ui/Badge";

const roleTone: Record<Role, "purple" | "gold" | "info" | "neutral"> = {
  admin: "gold",
  planner: "purple",
  staff: "info",
  vendor: "neutral",
};

export function UsersTable({ users, currentUserId }: { users: User[]; currentUserId: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-surface-muted text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Access level</th>
            <th className="px-4 py-3">Reset PIN</th>
            <th className="px-4 py-3">Last login</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <UserRow key={u.id} user={u} isSelf={u.id === currentUserId} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UserRow({ user, isSelf }: { user: User; isSelf: boolean }) {
  const [pin, setPin] = useState("");
  const [pending, startTransition] = useTransition();
  const isStaffRole = user.role !== "vendor";

  return (
    <tr className="border-b border-border last:border-0 hover:bg-surface-muted">
      <td className="px-4 py-3 font-medium text-heading">
        {user.name}
        {isSelf && <span className="ml-2 text-xs font-normal text-muted-foreground">(you)</span>}
      </td>
      <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
      <td className="px-4 py-3">
        {isStaffRole ? (
          <Select
            className="w-auto"
            defaultValue={user.role}
            disabled={pending}
            onChange={(e) =>
              startTransition(() => updateUserRoleAction(user.id, e.target.value as Role))
            }
          >
            <option value="admin">Admin</option>
            <option value="planner">Event Planner</option>
            <option value="staff">Staff</option>
          </Select>
        ) : (
          <Badge tone={roleTone[user.role]}>Vendor</Badge>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Input
            className="w-24"
            placeholder="New PIN"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
          <button
            type="button"
            disabled={pending || !pin}
            onClick={() =>
              startTransition(async () => {
                await resetUserPinAction(user.id, pin);
                setPin("");
              })
            }
            className="cursor-pointer text-xs font-semibold text-lu-purple-600 hover:underline disabled:opacity-40"
          >
            Set
          </button>
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}
      </td>
      <td className="px-4 py-3">
        {!isSelf && (
          <ConfirmButton
            variant="danger"
            size="sm"
            confirmMessage={`Remove ${user.name}'s access?`}
            onClick={() => startTransition(() => deleteUserAction(user.id))}
          >
            Remove
          </ConfirmButton>
        )}
      </td>
    </tr>
  );
}
