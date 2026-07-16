import { getNotifications } from "@/lib/data/notifications";
import { getRegistrationById } from "@/lib/data/registrations";
import { getEventById } from "@/lib/data/events";
import { getAttendeeById } from "@/lib/data/attendees";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const typeTone = {
  confirmation: "success",
  waitlist: "gold",
  promotion: "info",
  reminder: "purple",
  cancellation: "danger",
} as const;

export default async function PlannerNotificationsPage() {
  const notifications = getNotifications();

  return (
    <div className="ef-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-heading">Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A live log of every email confirmation, waitlist notice, and reminder sent to vendors. Currently
          simulated in-app — swap <code className="rounded bg-surface-muted px-1">lib/notifications.ts</code> for a
          real SendGrid/Resend/Gmail integration to send for real.
        </p>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => {
          const registration = getRegistrationById(n.registrationId);
          const event = registration ? getEventById(registration.eventId) : undefined;
          const attendee = registration ? getAttendeeById(registration.attendeeId) : undefined;
          return (
            <Card key={n.id}>
              <CardBody className="p-4">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-heading">
                    {attendee?.businessName || attendee?.name || "Unknown vendor"}
                    {event && <span className="font-normal text-muted-foreground"> • {event.name}</span>}
                  </p>
                  <Badge tone={typeTone[n.type]}>{n.type}</Badge>
                </div>
                <p className="text-sm text-foreground">{n.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(n.sentAt).toLocaleString()}</p>
              </CardBody>
            </Card>
          );
        })}
        {notifications.length === 0 && (
          <p className="text-sm text-muted-foreground">No notifications yet — they&apos;ll appear here as vendors register.</p>
        )}
      </div>
    </div>
  );
}
