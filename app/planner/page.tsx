import { getEvents, getOpenEvents } from "@/lib/data/events";
import { confirmedCount, waitlistCount, getRegistrations } from "@/lib/data/registrations";
import { getTasks } from "@/lib/data/tasks";
import { flagCapacityRisk } from "@/lib/ai";
import { StatCard } from "@/components/dashboard/StatCard";
import { TrendChart, type TrendDatum } from "@/components/dashboard/TrendChart";
import { TaskList } from "@/components/dashboard/TaskList";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  IconCalendar,
  IconCalendarCheck,
  IconUserCheck,
  IconClock,
  IconSparkles,
} from "@/components/ui/icons";

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
    <div className="ef-fade-in space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle="An overview of everything happening across your events."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total events" value={events.length} href="/planner/events" icon={<IconCalendar size={20} />} />
        <StatCard label="Open for registration" value={openEvents.length} href="/planner/events" icon={<IconCalendarCheck size={20} />} />
        <StatCard label="Confirmed registrations" value={totalConfirmed} tone="gold" href="/planner/vendors" icon={<IconUserCheck size={20} />} />
        <StatCard label="Waitlisted" value={totalWaitlisted} tone="gold" href="/planner/vendors" icon={<IconClock size={20} />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Registrations by event</CardTitle>
            <span className="text-xs font-medium text-muted-foreground">Confirmed vs waitlisted</span>
          </CardHeader>
          <CardBody>
            {trendData.length > 0 ? (
              <TrendChart data={trendData} />
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">No open events yet.</p>
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
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-lu-gold-500/15 text-lu-gold-600 ring-1 ring-lu-gold-500/25 dark:text-lu-gold-400">
              <IconSparkles size={16} />
            </span>
            AI capacity watch
          </CardTitle>
          <Badge tone="gold">
            <IconSparkles size={12} />
            AI-assist
          </Badge>
        </CardHeader>
        <CardBody>
          {atRiskEvents.length > 0 ? (
            <ul className="space-y-3">
              {atRiskEvents.map(({ event, recommendation }) => (
                <li
                  key={event.id}
                  className="rounded-xl border border-lu-gold-500/25 bg-lu-gold-500/10 px-4 py-3 text-sm"
                >
                  <p className="font-semibold text-heading">{event.name}</p>
                  <p className="text-foreground">{recommendation}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No capacity concerns detected right now.</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
