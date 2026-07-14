import { notFound } from "next/navigation";
import { getFloorPlanById } from "@/lib/data/floorplans";
import { getEvents } from "@/lib/data/events";
import { FloorPlanEditor } from "@/components/floorplan/FloorPlanEditor";

export default async function PlannerFloorPlanEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plan = getFloorPlanById(id);
  if (!plan) notFound();

  const usedByEvent = getEvents().find((e) => e.floorPlanId === plan.id);

  return (
    <div className="ef-fade-in">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-heading">{plan.isTemplate ? "Template: " : ""}{plan.name}</h1>
        {usedByEvent && (
          <p className="mt-1 text-sm text-muted-foreground">
            Used by <span className="font-medium text-primary">{usedByEvent.name}</span>
          </p>
        )}
      </div>
      <FloorPlanEditor plan={plan} />
    </div>
  );
}
