import Link from "next/link";
import { getEvents } from "@/lib/data/events";
import { confirmedCount, waitlistCount } from "@/lib/data/registrations";
import { Card } from "@/components/ui/Card";
import { EventStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default async function PlannerEventsPage() {
  const events = await getEvents();
  const rows = await Promise.all(
    events.map(async (event) => ({
      event,
      confirmed: await confirmedCount(event.id),
      waitlisted: await waitlistCount(event.id),
    }))
  );

  return (
    <div className="ef-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading">Events</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create and manage every event on the calendar.</p>
        </div>
        <Button href="/planner/events/new">+ New event</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Confirmed / Capacity</th>
                <th className="px-4 py-3">Waitlist</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ event, confirmed, waitlisted }) => (
                <tr key={event.id} className="border-b border-border last:border-0 hover:bg-surface-muted">
                  <td className="px-4 py-3">
                    <Link href={`/planner/events/${event.id}`} className="font-semibold text-primary hover:underline">
                      {event.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{event.category}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(event.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{event.location}</td>
                  <td className="px-4 py-3">
                    <EventStatusBadge status={event.status} />
                  </td>
                  <td className="px-4 py-3">
                    {confirmed} / {event.capacity}
                  </td>
                  <td className="px-4 py-3">{waitlisted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
