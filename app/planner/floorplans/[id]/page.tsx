import { notFound } from "next/navigation";
import { getSessionUser, isViewOnly } from "@/lib/auth";
import { getFloorPlanById } from "@/lib/data/floorplans";
import { getEvents } from "@/lib/data/events";
import { FloorPlanEditor } from "@/components/floorplan/FloorPlanEditor";
import { FloorPlanCanvas } from "@/components/floorplan/FloorPlanCanvas";

export default async function PlannerFloorPlanEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const viewer = await getSessionUser();
  const viewOnly = viewer ? isViewOnly(viewer) : false;
  const plan = await getFloorPlanById(id);
  if (!plan) notFound();

  const usedByEvent = (await getEvents()).find((e) => e.floorPlanId === plan.id);

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
      {viewOnly ? (
        <>
          <p className="mb-3 text-xs text-muted-foreground">
            View-only access — you can see this layout but not edit it.
          </p>
          <FloorPlanCanvas plan={plan} />
        </>
      ) : (
        <FloorPlanEditor plan={plan} />
      )}
    </div>
  );
}
