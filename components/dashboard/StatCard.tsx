import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

export function StatCard({
  label,
  value,
  hint,
  href,
  tone = "purple",
}: {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
  tone?: "purple" | "gold";
}) {
  const content = (
    <Card className="group relative h-full overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* accent bar */}
      <span
        className={cn(
          "absolute inset-x-0 top-0 h-1",
          tone === "gold"
            ? "bg-gradient-to-r from-lu-gold-500 to-lu-gold-400"
            : "bg-gradient-to-r from-lu-purple-600 to-lu-purple-400"
        )}
      />
      <div className="p-5 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            "mt-2 text-4xl font-bold tracking-tight tabular-nums",
            tone === "gold" ? "text-lu-gold-600" : "text-lu-purple-900"
          )}
        >
          {value}
        </p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        {href && (
          <p className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-lu-purple-600">
            View details
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </p>
        )}
      </div>
    </Card>
  );

  return href ? (
    <Link
      href={href}
      className="block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {content}
    </Link>
  ) : (
    content
  );
}
