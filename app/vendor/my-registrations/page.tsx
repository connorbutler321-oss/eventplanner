import { getSessionUser } from "@/lib/auth";
import { getRegistrationsForAttendee } from "@/lib/data/registrations";
import { getEventById } from "@/lib/data/events";
import { getFloorPlanById } from "@/lib/data/floorplans";
import { cancelMyRegistrationAction } from "@/lib/actions/registrations";
import { Card, CardBody } from "@/components/ui/Card";
import { RegistrationStatusBadge } from "@/components/ui/Badge";
import { ConfirmButton } from "@/components/ui/ConfirmButton";

export default async function MyRegistrationsPage() {
  const user = await getSessionUser();
  const registrations = user?.attendeeId ? getRegistrationsForAttendee(user.attendeeId) : [];

  return (
    <div className="ef-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-lu-purple-900">My Registrations</h1>
        <p className="mt-1 text-sm text-gray-600">Track the status of the events you&apos;ve registered for.</p>
      </div>

      <div className="space-y-3">
        {registrations.map((r) => {
          const event = getEventById(r.eventId);
          const plan = getFloorPlanById(event?.floorPlanId);
          const space = plan?.spaces.find((s) => s.id === r.boothId);
          const cancelable = r.status === "Confirmed" || r.status === "Waitlisted" || r.status === "Promoted";
          return (
            <Card key={r.id}>
              <CardBody className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold text-lu-purple-900">{event?.name ?? "Unknown event"}</p>
                  <p className="text-xs text-gray-500">
                    {event && new Date(event.date).toLocaleDateString()} • {event?.location}
                    {space && ` • Space ${space.label}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <RegistrationStatusBadge status={r.status} />
                  {cancelable && (
                    <form
                      action={async () => {
                        "use server";
                        await cancelMyRegistrationAction(r.id);
                      }}
                    >
                      <ConfirmButton
                        type="submit"
                        variant="danger"
                        size="sm"
                        confirmMessage="Cancel this registration?"
                      >
                        Cancel
                      </ConfirmButton>
                    </form>
                  )}
                </div>
              </CardBody>
            </Card>
          );
        })}
        {registrations.length === 0 && (
          <p className="text-sm text-gray-500">You haven&apos;t registered for any events yet.</p>
        )}
      </div>
    </div>
  );
}
