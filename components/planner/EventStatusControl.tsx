"use client";

import { useTransition } from "react";
import { setEventStatusAction } from "@/lib/actions/events";
import type { EventStatus } from "@/lib/types";
import { Select } from "@/components/ui/Field";

const STATUSES: EventStatus[] = ["Draft", "Open", "Full", "Waitlisted", "Closed", "Completed", "Canceled"];

export function EventStatusControl({ eventId, status }: { eventId: string; status: EventStatus }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Select
        key={status}
        defaultValue={status}
        disabled={pending}
        className="w-auto"
        onChange={(e) => {
          const next = e.target.value as EventStatus;
          startTransition(() => setEventStatusAction(eventId, next));
        }}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>
      {pending && <span className="text-xs text-muted-foreground">Saving…</span>}
    </div>
  );
}
