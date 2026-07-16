import { notFound } from "next/navigation";
import { getEventById } from "@/lib/data/events";
import { getFloorPlanById } from "@/lib/data/floorplans";
import { getSessionUser } from "@/lib/auth";
import { getAttendeeById } from "@/lib/data/attendees";
import { RegistrationForm } from "@/components/vendor/RegistrationForm";
import { Card, CardBody } from "@/components/ui/Card";

export default async function VendorRegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ boothId?: string }>;
}) {
  const { eventId } = await params;
  const { boothId } = await searchParams;
  const event = await getEventById(eventId);
  if (!event) notFound();

  const plan = await getFloorPlanById(event.floorPlanId);
  const booth = boothId ? plan?.spaces.find((s) => s.id === boothId) : undefined;

  const user = await getSessionUser();
  const defaultAttendee = user?.attendeeId ? await getAttendeeById(user.attendeeId) : undefined;

  return (
    <div className="ef-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-heading">Register for {event.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {new Date(event.date).toLocaleDateString()} • {event.location}
        </p>
      </div>
      <Card>
        <CardBody className="p-5">
          <RegistrationForm
            eventId={event.id}
            boothId={booth?.id}
            boothLabel={booth?.label}
            defaultAttendee={defaultAttendee}
          />
        </CardBody>
      </Card>
    </div>
  );
}
