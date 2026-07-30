"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { setEventFloorPlanAction } from "@/lib/actions/events";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import type { FloorPlan } from "@/lib/types";

/**
 * Attach / change / remove the floor plan on an existing event.
 * `templates` are cloned on attach; `existingPlans` are standalone plans
 * (not a template, not linked to another event) that attach as-is.
 */
export function EventFloorPlanControl({
  eventId,
  currentPlan,
  templates,
  existingPlans,
  requestMode,
}: {
  eventId: string;
  currentPlan: { id: string; name: string } | null;
  templates: FloorPlan[];
  existingPlans: FloorPlan[];
  requestMode: boolean;
}) {
  const [choice, setChoice] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function apply() {
    if (!choice) return;
    startTransition(async () => {
      const result = await setEventFloorPlanAction(eventId, choice);
      setMessage(result.queued ? "Submitted for admin approval." : "Floor plan updated.");
      setChoice("");
      setTimeout(() => setMessage(null), 3000);
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-sm">
        <span className="text-muted-foreground">Current: </span>
        {currentPlan ? (
          <Link href={`/planner/floorplans/${currentPlan.id}`} className="font-medium text-primary hover:underline">
            {currentPlan.name}
          </Link>
        ) : (
          <span className="text-foreground">No floor plan attached</span>
        )}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          className="w-auto"
          value={choice}
          disabled={pending}
          onChange={(e) => setChoice(e.target.value)}
        >
          <option value="">{currentPlan ? "Change to…" : "Attach…"}</option>
          {currentPlan && <option value="none">No floor plan (remove)</option>}
          <option value="blank">Blank floor plan</option>
          {templates.map((t) => (
            <option key={t.id} value={`template:${t.id}`}>
              From template: {t.name}
            </option>
          ))}
          {existingPlans.map((p) => (
            <option key={p.id} value={`existing:${p.id}`}>
              Existing: {p.name}
            </option>
          ))}
        </Select>
        <Button size="sm" onClick={apply} disabled={pending || !choice}>
          {pending ? "Saving…" : "Apply"}
        </Button>
        {message && <span className="text-sm font-medium text-success">{message}</span>}
      </div>

      {requestMode && (
        <p className="text-xs text-muted-foreground">
          Floor-plan changes are submitted for admin approval.
        </p>
      )}
    </div>
  );
}
