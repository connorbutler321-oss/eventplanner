import { notFound } from "next/navigation";
import Link from "next/link";
import { getEventById } from "@/lib/data/events";
import { getRegistrationsForEvent, confirmedCount, waitlistCount } from "@/lib/data/registrations";
import { getAttendees } from "@/lib/data/attendees";
import { getFloorPlanById } from "@/lib/data/floorplans";
import {
  adminCancelRegistrationAction,
  adminSetRegistrationStatusAction,
} from "@/lib/actions/registrations";
import { EventForm } from "@/components/planner/EventForm";
import { EventStatusControl } from "@/components/planner/EventStatusControl";
import { AIAssistPanel } from "@/components/planner/AIAssistPanel";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { RegistrationStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import type { RegistrationStatus } from "@/lib/types";

export default async function PlannerEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  const registrations = (await getRegistrationsForEvent(id)).sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );
  const plan = await getFloorPlanById(event.floorPlanId);
  const confirmed = await confirmedCount(id);
  const waitlisted = await waitlistCount(id);
  const attendees = new Map((await getAttendees()).map((a) => [a.id, a]));

  const nextStatusOptions: RegistrationStatus[] = ["Attended", "No-show"];

  return (
    <div className="ef-fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-heading">{event.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {confirmed}/{event.capacity} confirmed • {waitlisted} waitlisted
          </p>
        </div>
        <div className="flex items-center gap-2">
          {plan && (
            <Button href={`/planner/floorplans/${plan.id}`} variant="secondary">
              Edit floor plan
            </Button>
          )}
          <EventStatusControl eventId={event.id} status={event.status} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI assist</CardTitle>
        </CardHeader>
        <CardBody>
          <AIAssistPanel event={event} confirmed={confirmed} waitlisted={waitlisted} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registrations</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Space</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((r) => {
                const attendee = attendees.get(r.attendeeId);
                const space = plan?.spaces.find((s) => s.id === r.boothId);
                const cancelable = r.status !== "Canceled";
                return (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-surface-muted">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-heading">{attendee?.businessName || attendee?.name}</p>
                      <p className="text-xs text-muted-foreground">{attendee?.category}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {attendee?.email}
                      <br />
                      {attendee?.phone}
                    </td>
                    <td className="px-4 py-3">{space?.label ?? "—"}</td>
                    <td className="px-4 py-3">
                      <RegistrationStatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {r.status === "Confirmed" &&
                          nextStatusOptions.map((s) => (
                            <form
                              key={s}
                              action={async () => {
                                "use server";
                                await adminSetRegistrationStatusAction(event.id, r.id, s);
                              }}
                            >
                              <Button type="submit" variant="secondary" size="sm">
                                Mark {s}
                              </Button>
                            </form>
                          ))}
                        {cancelable && (
                          <form
                            action={async () => {
                              "use server";
                              await adminCancelRegistrationAction(event.id, r.id);
                            }}
                          >
                            <ConfirmButton
                              type="submit"
                              variant="danger"
                              size="sm"
                              confirmMessage="Cancel this vendor's registration? If confirmed, the next waitlisted vendor will be promoted automatically."
                            >
                              Cancel
                            </ConfirmButton>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {registrations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No registrations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event details</CardTitle>
        </CardHeader>
        <CardBody>
          <EventForm event={event} />
        </CardBody>
      </Card>

      <p>
        <Link href="/planner/events" className="text-sm text-lu-purple-600 hover:underline">
          ← Back to all events
        </Link>
      </p>
    </div>
  );
}
