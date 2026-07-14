import { notFound } from "next/navigation";
import { getEventById } from "@/lib/data/events";
import { getFloorPlanById } from "@/lib/data/floorplans";
import { FloorPlanPicker } from "@/components/floorplan/FloorPlanPicker";
import { Card, CardBody } from "@/components/ui/Card";

export default async function VendorFloorPlanPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = getEventById(eventId);
  if (!event) notFound();
  const plan = getFloorPlanById(event.floorPlanId);
  if (!plan) notFound();

  return (
    <div className="ef-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-heading">{event.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Pick an available space on the floor plan below.</p>
      </div>
      <Card>
        <CardBody className="p-5">
          <FloorPlanPicker plan={plan} eventId={event.id} />
        </CardBody>
      </Card>
    </div>
  );
}
