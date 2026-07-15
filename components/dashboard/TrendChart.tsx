"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface TrendDatum {
  name: string;
  Confirmed: number;
  Waitlisted: number;
}

// Chart series colors — theme-adaptive via CSS variables (validated
// brand-family for light; lightened for the dark surface).
const SERIES = {
  Confirmed: "var(--chart-1)",
  Waitlisted: "var(--chart-2)",
} as const;

const colorFor = (name: string) =>
  name === "Waitlisted" ? "var(--chart-2)" : "var(--chart-1)";

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-surface/95 px-3.5 py-2.5 shadow-lg backdrop-blur">
      <p className="mb-1.5 text-xs font-semibold text-heading">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 rounded-[3px]"
              style={{ backgroundColor: colorFor(entry.name) }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto font-semibold tabular-nums text-heading">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LegendContent({ payload }: { payload?: Array<{ value: string; color: string }> }) {
  return (
    <div className="mt-2 flex items-center justify-center gap-5">
      {payload?.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: colorFor(entry.value) }} />
          <span className="text-xs font-medium text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function TrendChart({ data }: { data: TrendDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 4 }} barGap={4}>
        <defs>
          <linearGradient id="barConfirmed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SERIES.Confirmed} stopOpacity={1} />
            <stop offset="100%" stopColor={SERIES.Confirmed} stopOpacity={0.75} />
          </linearGradient>
          <linearGradient id="barWaitlisted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SERIES.Waitlisted} stopOpacity={1} />
            <stop offset="100%" stopColor={SERIES.Waitlisted} stopOpacity={0.75} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="0" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          interval={0}
          angle={-12}
          textAnchor="end"
          height={54}
          tickLine={false}
          axisLine={{ stroke: "var(--border)" }}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          width={40}
        />
        <Tooltip
          content={<ChartTooltip />}
          cursor={{ fill: "var(--lu-purple-500)", fillOpacity: 0.06 }}
        />
        <Legend content={<LegendContent />} />
        <Bar dataKey="Confirmed" fill="url(#barConfirmed)" radius={[4, 4, 0, 0]} maxBarSize={44} />
        <Bar dataKey="Waitlisted" fill="url(#barWaitlisted)" radius={[4, 4, 0, 0]} maxBarSize={44} />
      </BarChart>
    </ResponsiveContainer>
  );
}
