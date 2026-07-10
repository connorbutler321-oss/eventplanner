import Link from "next/link";
import { getEvents } from "@/lib/data/events";
import { confirmedCount, waitlistCount } from "@/lib/data/registrations";
import { Card } from "@/components/ui/Card";
import { EventStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default async function PlannerEventsPage() {
  const events = getEvents();

  return (
    <div className="ef-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-lu-purple-900">Events</h1>
          <p className="mt-1 text-sm text-gray-600">Create and manage every event on the calendar.</p>
        </div>
        <Button href="/planner/events/new">+ New event</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-lu-purple-50/60 text-xs uppercase text-gray-500">
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
              {events.map((event) => (
                <tr key={event.id} className="border-b border-border last:border-0 hover:bg-lu-purple-50/40">
                  <td className="px-4 py-3">
                    <Link href={`/planner/events/${event.id}`} className="font-semibold text-lu-purple-700 hover:underline">
                      {event.name}
                    </Link>
                    <p className="text-xs text-gray-500">{event.category}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(event.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{event.location}</td>
                  <td className="px-4 py-3">
                    <EventStatusBadge status={event.status} />
                  </td>
                  <td className="px-4 py-3">
                    {confirmedCount(event.id)} / {event.capacity}
                  </td>
                  <td className="px-4 py-3">{waitlistCount(event.id)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
