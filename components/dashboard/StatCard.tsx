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
    <Card className="h-full transition-shadow hover:shadow-md">
      <div className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
        <p
          className={cn(
            "mt-1 text-3xl font-bold",
            tone === "gold" ? "text-lu-gold-600" : "text-lu-purple-900"
          )}
        >
          {value}
        </p>
        {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
        {href && <p className="mt-3 text-xs font-semibold text-lu-purple-600">View details →</p>}
      </div>
    </Card>
  );

  return href ? (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  ) : (
    content
  );
}
