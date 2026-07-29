import { redirect } from "next/navigation";
import { getSessionUser, isViewOnly } from "@/lib/auth";
import { getTemplates } from "@/lib/data/floorplans";
import { EventForm } from "@/components/planner/EventForm";
import { Card, CardBody } from "@/components/ui/Card";

export default async function NewEventPage() {
  const viewer = await getSessionUser();
  if (viewer && isViewOnly(viewer)) redirect("/planner/events");
  const templates = await getTemplates();

  return (
    <div className="ef-fade-in max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-heading">New event</h1>
        <p className="mt-1 text-sm text-muted-foreground">New events start in Draft status until you open registration.</p>
      </div>
      <Card>
        <CardBody className="p-5">
          <EventForm templates={templates} />
        </CardBody>
      </Card>
    </div>
  );
}
