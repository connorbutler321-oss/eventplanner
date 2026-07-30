import { notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUser, isViewOnly } from "@/lib/auth";
import { getEventById } from "@/lib/data/events";
import { getRegistrationsForEvent, confirmedCount, waitlistCount } from "@/lib/data/registrations";
import { getAttendees } from "@/lib/data/attendees";
import { getFloorPlanById } from "@/lib/data/floorplans";
import { getUserById } from "@/lib/data/users";
import {
  adminCancelRegistrationAction,
  adminSetRegistrationStatusAction,
} from "@/lib/actions/registrations";
import { EventForm } from "@/components/planner/EventForm";
import { EventStatusControl } from "@/components/planner/EventStatusControl";
import { AIAssistPanel } from "@/components/planner/AIAssistPanel";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { RegistrationStatusBadge, EventStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import type { RegistrationStatus } from "@/lib/types";

export default async function PlannerEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const viewer = await getSessionUser();
  const viewOnly = viewer ? isViewOnly(viewer) : false;
  const event = await getEventById(id);
  if (!event) notFound();

  const registrations = (await getRegistrationsForEvent(id)).sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );
  const plan = await getFloorPlanById(event.floorPlanId);
  const confirmed = await confirmedCount(id);
  const waitlisted = await waitlistCount(id);
  const attendees = new Map((await getAttendees()).map((a) => [a.id, a]));
  const creator = event.createdBy ? await getUserById(event.createdBy) : undefined;
  const createdByLabel = event.createdBy ? creator?.name ?? "Unknown user" : "Sample data";

  const nextStatusOptions: RegistrationStatus[] = ["Attended", "No-show"];

  return (
    <div className="ef-fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-heading">{event.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {confirmed}/{event.capacity} confirmed • {waitlisted} waitlisted
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Created by {createdByLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          {plan && (
            <Button href={`/planner/floorplans/${plan.id}`} variant="secondary">
              {viewOnly ? "View floor plan" : "Edit floor plan"}
            </Button>
          )}
          {viewOnly ? (
            <EventStatusBadge status={event.status} />
          ) : (
            <EventStatusControl eventId={event.id} status={event.status} />
          )}
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
                      {viewOnly ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
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
                      )}
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
          {viewOnly ? (
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase text-muted-foreground">Category</dt>
                <dd className="text-foreground">{event.category}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-muted-foreground">Date &amp; time</dt>
                <dd className="text-foreground">{new Date(event.date).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-muted-foreground">Location</dt>
                <dd className="text-foreground">{event.location}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-muted-foreground">Capacity</dt>
                <dd className="text-foreground">{event.capacity}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase text-muted-foreground">Description</dt>
                <dd className="text-foreground">{event.description}</dd>
              </div>
              <p className="sm:col-span-2 text-xs text-muted-foreground">
                Your account has view-only access. Ask an admin to make changes.
              </p>
            </dl>
          ) : (
            <EventForm event={event} />
          )}
        </CardBody>
      </Card>

      <p>
        <Link href="/planner/events" className="text-sm text-primary hover:underline">
          ← Back to all events
        </Link>
      </p>
    </div>
  );
}
