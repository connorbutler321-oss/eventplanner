import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { IconArrowRight } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export function StatCard({
  label,
  value,
  hint,
  href,
  tone = "purple",
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
  tone?: "purple" | "gold";
  icon?: React.ReactNode;
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
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          {icon && (
            <span
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1",
                tone === "gold"
                  ? "bg-lu-gold-500/15 text-lu-gold-600 ring-lu-gold-500/25"
                  : "bg-lu-purple-400/15 text-lu-purple-500 ring-lu-purple-400/25 dark:text-lu-purple-300"
              )}
            >
              {icon}
            </span>
          )}
        </div>
        <p
          className={cn(
            "mt-3 text-[2.75rem] font-bold leading-none tracking-tight tabular-nums",
            tone === "gold" ? "text-lu-gold-600 dark:text-lu-gold-400" : "text-heading"
          )}
        >
          {value}
        </p>
        {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
        {href && (
          <p className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">
            View details
            <IconArrowRight
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
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
