"use client";

import { useActionState } from "react";
import { registerForEventAction } from "@/lib/actions/registrations";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea, Label, FieldGroup } from "@/components/ui/Field";
import type { Attendee } from "@/lib/types";

const CATEGORIES = [
  "Food & Beverage",
  "Arts & Crafts",
  "Retail",
  "Produce",
  "Nonprofit / Community",
  "Other",
];

export function RegistrationForm({
  eventId,
  boothId,
  boothLabel,
  defaultAttendee,
}: {
  eventId: string;
  boothId?: string;
  boothLabel?: string;
  defaultAttendee?: Attendee;
}) {
  const action = registerForEventAction.bind(null, eventId);
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="ef-fade-in">
      {boothId && <input type="hidden" name="boothId" value={boothId} />}

      {boothLabel && (
        <p className="mb-4 rounded-lg bg-lu-purple-50 px-3 py-2 text-sm text-lu-purple-800">
          Reserving space <strong>{boothLabel}</strong>
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup>
          <Label htmlFor="contactName">Contact name</Label>
          <Input id="contactName" name="contactName" required defaultValue={defaultAttendee?.name} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="businessName">Business / organization name</Label>
          <Input id="businessName" name="businessName" defaultValue={defaultAttendee?.businessName} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required defaultValue={defaultAttendee?.email} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" required defaultValue={defaultAttendee?.phone} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="category">Vendor category</Label>
          <Select id="category" name="category" required defaultValue={defaultAttendee?.category ?? ""}>
            <option value="" disabled>
              Select a category…
            </option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="tableCount">Tables needed</Label>
          <Select id="tableCount" name="tableCount" defaultValue="1">
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3+</option>
          </Select>
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="needsElectricity">Need electricity?</Label>
          <Select id="needsElectricity" name="needsElectricity" defaultValue="no">
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </Select>
        </FieldGroup>
      </div>

      <FieldGroup>
        <Label htmlFor="notes" hint="(optional)">
          Anything else we should know?
        </Label>
        <Textarea id="notes" name="notes" placeholder="Special requests, product list, etc." />
      </FieldGroup>

      {state?.error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{state.error}</p>
      )}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Submitting…" : "Submit registration"}
      </Button>
    </form>
  );
}
