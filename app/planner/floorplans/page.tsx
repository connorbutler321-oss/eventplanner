import { getFloorPlans } from "@/lib/data/floorplans";
import { getEvents } from "@/lib/data/events";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { NewFloorPlanForm } from "@/components/planner/NewFloorPlanForm";

export default async function PlannerFloorPlansPage() {
  const plans = await getFloorPlans();
  const templates = plans.filter((p) => p.isTemplate);
  const eventPlans = plans.filter((p) => !p.isTemplate);
  const events = await getEvents();

  return (
    <div className="ef-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-heading">Floor Plans</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Build custom layouts, start from a template, or upload an existing floor plan to trace over.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create a floor plan</CardTitle>
        </CardHeader>
        <CardBody>
          <NewFloorPlanForm templates={templates} />
        </CardBody>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Event floor plans</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {eventPlans.map((plan) => {
            const linkedEvent = events.find((e) => e.floorPlanId === plan.id);
            return (
              <Card key={plan.id}>
                <CardBody className="p-4">
                  <p className="font-semibold text-heading">{plan.name}</p>
                  <p className="mb-3 text-xs text-muted-foreground">
                    {linkedEvent ? `Used by ${linkedEvent.name}` : "Not linked to an event"} • {plan.spaces.length} spaces
                  </p>
                  <Button href={`/planner/floorplans/${plan.id}`} size="sm" variant="secondary" className="w-full">
                    Edit
                  </Button>
                </CardBody>
              </Card>
            );
          })}
          {eventPlans.length === 0 && <p className="text-sm text-muted-foreground">No floor plans yet.</p>}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Templates</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((plan) => (
            <Card key={plan.id}>
              <CardBody className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-semibold text-heading">{plan.name}</p>
                  <Badge tone="purple">Template</Badge>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">{plan.spaces.length} spaces</p>
                <Button href={`/planner/floorplans/${plan.id}`} size="sm" variant="secondary" className="w-full">
                  Preview / edit
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
