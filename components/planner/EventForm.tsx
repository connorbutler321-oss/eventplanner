"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { createEventAction, updateEventAction, type EventFormState } from "@/lib/actions/events";
import { generateEventDescription } from "@/lib/ai";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea, Label, FieldGroup } from "@/components/ui/Field";
import type { EventRecord, FloorPlan } from "@/lib/types";

const CATEGORIES = [
  "Market",
  "Festival",
  "Fair",
  "Workshop",
  "Class",
  "Community Event",
  "Training Session",
  "Appointment",
  "Fundraiser",
  "Volunteer Event",
  "Gala",
  "Other",
];

function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventForm({ event, templates }: { event?: EventRecord; templates?: FloorPlan[] }) {
  const action = event
    ? (updateEventAction.bind(null, event.id) as (
        state: EventFormState,
        formData: FormData
      ) => Promise<EventFormState>)
    : createEventAction;
  const [state, formAction, pending] = useActionState(action, undefined);

  const [description, setDescription] = useState(event?.description ?? "");
  const [aiPending, startAiTransition] = useTransition();
  const nameRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);

  function generateWithAI() {
    startAiTransition(async () => {
      const text = await generateEventDescription({
        name: nameRef.current?.value || "This event",
        category: categoryRef.current?.value || "event",
        location: locationRef.current?.value || "the venue",
      });
      setDescription(text);
    });
  }

  return (
    <form action={formAction} className="ef-fade-in">
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup>
          <Label htmlFor="name">Event name</Label>
          <Input id="name" name="name" ref={nameRef} required defaultValue={event?.name} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="category">Category</Label>
          <Select id="category" name="category" ref={categoryRef} required defaultValue={event?.category ?? ""}>
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
          <Label htmlFor="date">Date &amp; time</Label>
          <Input
            id="date"
            name="date"
            type="datetime-local"
            required
            defaultValue={event ? toDatetimeLocal(event.date) : undefined}
          />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" ref={locationRef} required defaultValue={event?.location} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="capacity">Capacity</Label>
          <Input id="capacity" name="capacity" type="number" min={1} required defaultValue={event?.capacity} />
        </FieldGroup>
        {!event && templates && templates.length > 0 && (
          <FieldGroup>
            <Label htmlFor="templateId" hint="(optional)">
              Start floor plan from template
            </Label>
            <Select id="templateId" name="templateId" defaultValue="">
              <option value="">No floor plan</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </FieldGroup>
        )}
      </div>

      <FieldGroup>
        <div className="mb-1.5 flex items-center justify-between">
          <Label htmlFor="description">Description</Label>
          <button
            type="button"
            onClick={generateWithAI}
            disabled={aiPending}
            className="cursor-pointer text-xs font-semibold text-lu-purple-600 hover:underline disabled:opacity-50"
          >
            {aiPending ? "Generating…" : "✨ Generate with AI"}
          </button>
        </div>
        <Textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </FieldGroup>

      {state?.error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{state.error}</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : event ? "Save changes" : "Create event"}
      </Button>
    </form>
  );
}
