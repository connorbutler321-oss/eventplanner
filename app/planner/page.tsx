import { getEvents, getOpenEvents } from "@/lib/data/events";
import { confirmedCount, waitlistCount, getRegistrations } from "@/lib/data/registrations";
import { getTasks } from "@/lib/data/tasks";
import { flagCapacityRisk } from "@/lib/ai";
import { StatCard } from "@/components/dashboard/StatCard";
import { TrendChart, type TrendDatum } from "@/components/dashboard/TrendChart";
import { TaskList } from "@/components/dashboard/TaskList";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function PlannerDashboardPage() {
  const events = getEvents();
  const openEvents = getOpenEvents();
  const registrations = getRegistrations();
  const tasks = getTasks();

  const totalConfirmed = registrations.filter((r) =>
    ["Confirmed", "Promoted", "Attended"].includes(r.status)
  ).length;
  const totalWaitlisted = registrations.filter((r) => r.status === "Waitlisted").length;

  const trendData: TrendDatum[] = openEvents.map((e) => ({
    name: e.name.length > 16 ? `${e.name.slice(0, 16)}…` : e.name,
    Confirmed: confirmedCount(e.id),
    Waitlisted: waitlistCount(e.id),
  }));

  const risks = await Promise.all(
    openEvents.map(async (e) => ({
      event: e,
      ...(await flagCapacityRisk({
        confirmed: confirmedCount(e.id),
        waitlisted: waitlistCount(e.id),
        capacity: e.capacity,
      })),
    }))
  );
  const atRiskEvents = risks.filter((r) => r.atRisk);

  return (
    <div className="ef-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-lu-purple-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">An overview of everything happening across your events.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total events" value={events.length} href="/planner/events" />
        <StatCard label="Open for registration" value={openEvents.length} href="/planner/events" />
        <StatCard label="Confirmed registrations" value={totalConfirmed} tone="gold" href="/planner/vendors" />
        <StatCard label="Waitlisted" value={totalWaitlisted} tone="gold" href="/planner/vendors" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Registrations by event</CardTitle>
          </CardHeader>
          <CardBody>
            {trendData.length > 0 ? (
              <TrendChart data={trendData} />
            ) : (
              <p className="py-10 text-center text-sm text-gray-500">No open events yet.</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardBody>
            <TaskList tasks={tasks} />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI capacity watch</CardTitle>
          <Badge tone="gold">AI-assist</Badge>
        </CardHeader>
        <CardBody>
          {atRiskEvents.length > 0 ? (
            <ul className="space-y-3">
              {atRiskEvents.map(({ event, recommendation }) => (
                <li key={event.id} className="rounded-lg bg-lu-gold-100/60 px-4 py-3 text-sm">
                  <p className="font-semibold text-lu-purple-900">{event.name}</p>
                  <p className="text-gray-700">{recommendation}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No capacity concerns detected right now.</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
