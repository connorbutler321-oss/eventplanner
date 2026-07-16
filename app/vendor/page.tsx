import { getOpenEvents } from "@/lib/data/events";
import { confirmedCount } from "@/lib/data/registrations";
import { Card, CardBody } from "@/components/ui/Card";
import { EventStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default async function VendorEventListPage() {
  const events = await getOpenEvents();
  const rows = await Promise.all(
    events.map(async (event) => ({ event, confirmed: await confirmedCount(event.id) }))
  );

  return (
    <div className="ef-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-heading">Upcoming Events</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose an event below to register your business as a vendor.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {rows.map(({ event, confirmed }) => {
          const spotsLeft = Math.max(event.capacity - confirmed, 0);
          return (
            <Card key={event.id} className="flex flex-col">
              <CardBody className="flex flex-1 flex-col p-5">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-heading">{event.name}</h2>
                  <EventStatusBadge status={event.status} />
                </div>
                <p className="mb-3 flex-1 text-sm text-muted-foreground">{event.description}</p>
                <dl className="mb-4 grid grid-cols-2 gap-y-1 text-xs text-muted-foreground">
                  <dt className="font-medium">Date</dt>
                  <dd>{new Date(event.date).toLocaleDateString()}</dd>
                  <dt className="font-medium">Location</dt>
                  <dd>{event.location}</dd>
                  <dt className="font-medium">Category</dt>
                  <dd>{event.category}</dd>
                  <dt className="font-medium">Availability</dt>
                  <dd>{spotsLeft > 0 ? `${spotsLeft} spot(s) left` : "Waitlist only"}</dd>
                </dl>
                <Button
                  href={event.floorPlanId ? `/vendor/floorplan/${event.id}` : `/vendor/register/${event.id}`}
                  className="mt-auto w-full"
                >
                  {event.floorPlanId ? "Choose a spot" : "Register"}
                </Button>
              </CardBody>
            </Card>
          );
        })}
        {events.length === 0 && (
          <p className="col-span-2 text-sm text-muted-foreground">No events are open for registration right now.</p>
        )}
      </div>
    </div>
  );
}
