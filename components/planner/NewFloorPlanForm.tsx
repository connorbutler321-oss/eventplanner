"use client";

import { useState, useTransition } from "react";
import { createBlankFloorPlanAction, createFloorPlanFromTemplateAction } from "@/lib/actions/floorplans";
import { Button } from "@/components/ui/Button";
import { Input, Select, Label, FieldGroup } from "@/components/ui/Field";
import type { FloorPlan } from "@/lib/types";

export function NewFloorPlanForm({ templates }: { templates: FloorPlan[] }) {
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <FieldGroup className="mb-0">
        <Label htmlFor="newPlanName">New floor plan name</Label>
        <Input
          id="newPlanName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Homecoming Fair Layout"
        />
      </FieldGroup>
      <FieldGroup className="mb-0">
        <Label htmlFor="templateId" hint="(optional)">
          Start from template
        </Label>
        <Select id="templateId" value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
          <option value="">Blank canvas</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>
      </FieldGroup>
      <Button
        disabled={!name || pending}
        onClick={() =>
          startTransition(async () => {
            if (templateId) {
              await createFloorPlanFromTemplateAction(templateId, name);
            } else {
              await createBlankFloorPlanAction(name);
            }
          })
        }
      >
        {pending ? "Creating…" : "Create"}
      </Button>
    </div>
  );
}
