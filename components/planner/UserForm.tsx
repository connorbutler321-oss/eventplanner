"use client";

import { useActionState } from "react";
import { createUserAction } from "@/lib/actions/users";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { Input, Select, Label, FieldGroup } from "@/components/ui/Field";

export function UserForm() {
  const [state, formAction, pending] = useActionState(createUserAction, undefined);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
      <FieldGroup className="mb-0">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required />
      </FieldGroup>
      <FieldGroup className="mb-0">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </FieldGroup>
      <FieldGroup className="mb-0">
        <Label htmlFor="role">Access level</Label>
        <Select id="role" name="role" defaultValue="staff">
          <option value="admin">Admin</option>
          <option value="planner">Event Planner</option>
          <option value="staff">Staff</option>
        </Select>
      </FieldGroup>
      <FieldGroup className="mb-0">
        <Label htmlFor="pin">Initial PIN</Label>
        <Input id="pin" name="pin" inputMode="numeric" maxLength={6} placeholder="4-6 digits" required />
      </FieldGroup>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add user"}
      </Button>
      {state?.error && (
        <FormError className="col-span-full">{state.error}</FormError>
      )}
    </form>
  );
}
