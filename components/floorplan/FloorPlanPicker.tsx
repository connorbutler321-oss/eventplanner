"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FloorPlan, FloorPlanSpace } from "@/lib/types";
import { FloorPlanCanvas } from "./FloorPlanCanvas";
import { Button } from "@/components/ui/Button";

export function FloorPlanPicker({ plan, eventId }: { plan: FloorPlan; eventId: string }) {
  const [selected, setSelected] = useState<FloorPlanSpace | null>(null);
  const router = useRouter();

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_260px]">
      <FloorPlanCanvas
        plan={plan}
        selectedId={selected?.id}
        onSpaceClick={(space) => {
          if (space.status === "available") setSelected(space);
        }}
      />

      <div>
        <div className="mb-4 space-y-1.5 text-xs">
          <LegendRow swatch="bg-green-50 border-success" label="Available" />
          <LegendRow swatch="bg-red-50 border-danger" label="Reserved" />
          <LegendRow swatch="bg-surface-muted border-gray-400" label="Blocked / stage / walkway" />
        </div>

        {selected ? (
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-sm font-semibold text-heading">Space {selected.label}</p>
            <p className="mb-3 text-xs capitalize text-muted-foreground">{selected.type}</p>
            {selected.price !== undefined && (
              <p className="mb-3 text-sm text-foreground">Fee: ${selected.price}</p>
            )}
            <Button
              className="w-full"
              onClick={() =>
                router.push(`/vendor/register/${eventId}?boothId=${encodeURIComponent(selected.id)}`)
              }
            >
              Continue with Space {selected.label}
            </Button>
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
            Click an available (green) space on the floor plan to select it.
          </p>
        )}
      </div>
    </div>
  );
}

function LegendRow({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded border ${swatch}`} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
