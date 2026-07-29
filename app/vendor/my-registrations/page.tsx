import { getSessionUser } from "@/lib/auth";
import {
  getRegistrationsForAttendee,
  getEventAttendeeList,
  type EventAttendeeList,
} from "@/lib/data/registrations";
import { getAttendeeById } from "@/lib/data/attendees";
import { getEvents } from "@/lib/data/events";
import { getFloorPlans } from "@/lib/data/floorplans";
import { cancelMyRegistrationAction, setMyListVisibilityAction } from "@/lib/actions/registrations";
import { Card, CardBody } from "@/components/ui/Card";
import { RegistrationStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/ui/ConfirmButton";

export default async function MyRegistrationsPage() {
  const user = await getSessionUser();
  const attendee = user?.attendeeId ? await getAttendeeById(user.attendeeId) : undefined;
  const registrations = user?.attendeeId ? await getRegistrationsForAttendee(user.attendeeId) : [];
  const events = new Map((await getEvents()).map((e) => [e.id, e]));
  const plans = new Map((await getFloorPlans()).map((p) => [p.id, p]));

  // One attendee list per event (a vendor only sees lists for events they registered for).
  const attendeeLists = new Map<string, EventAttendeeList>();
  for (const r of registrations) {
    if (r.status !== "Canceled" && !attendeeLists.has(r.eventId)) {
      attendeeLists.set(r.eventId, await getEventAttendeeList(r.eventId));
    }
  }

  const listVisible = attendee?.listVisible ?? true;

  return (
    <div className="ef-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-heading">My Registrations</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track the status of the events you&apos;ve registered for.</p>
      </div>

      {attendee && (
        <Card className="mb-6">
          <CardBody className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-semibold text-heading">Attendee list visibility</p>
              <p className="text-xs text-muted-foreground">
                {listVisible
                  ? "Other vendors registered for the same event can see your business and contact name."
                  : "You're hidden from attendee lists — other vendors won't see your name."}
              </p>
            </div>
            <form
              action={async () => {
                "use server";
                await setMyListVisibilityAction(!listVisible);
              }}
            >
              <Button type="submit" variant="secondary" size="sm">
                {listVisible ? "Hide me from attendee lists" : "Show me on attendee lists"}
              </Button>
            </form>
          </CardBody>
        </Card>
      )}

      <div className="space-y-3">
        {registrations.map((r) => {
          const event = events.get(r.eventId);
          const plan = event?.floorPlanId ? plans.get(event.floorPlanId) : undefined;
          const space = plan?.spaces.find((s) => s.id === r.boothId);
          const cancelable = r.status === "Confirmed" || r.status === "Waitlisted" || r.status === "Promoted";
          const list = r.status !== "Canceled" ? attendeeLists.get(r.eventId) : undefined;
          return (
            <Card key={r.id}>
              <CardBody className="space-y-3 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-heading">{event?.name ?? "Unknown event"}</p>
                    <p className="text-xs text-muted-foreground">
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
                </div>

                {list && (
                  <div className="border-t border-border pt-3">
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Who&apos;s attending
                    </p>
                    <ul className="space-y-1 text-sm">
                      {list.visible.map((a, i) => (
                        <li key={i}>
                          <span className="font-medium text-heading">{a.businessName ?? a.name}</span>
                          {a.businessName && <span className="text-muted-foreground"> — {a.name}</span>}
                          <span className="text-xs text-muted-foreground"> ({a.category})</span>
                        </li>
                      ))}
                    </ul>
                    {list.hiddenCount > 0 && (
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        +{list.hiddenCount} attendee{list.hiddenCount === 1 ? "" : "s"} not shown by their choice
                      </p>
                    )}
                    {list.visible.length === 0 && list.hiddenCount === 0 && (
                      <p className="text-xs text-muted-foreground">No other attendees yet.</p>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
        {registrations.length === 0 && (
          <p className="text-sm text-muted-foreground">You haven&apos;t registered for any events yet.</p>
        )}
      </div>
    </div>
  );
}