"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

/**
 * Sidebar navigation link with active-route highlighting.
 * A route is "active" when the current path matches exactly, or is a
 * sub-path of the item (so /planner/events/123 keeps "Events" highlighted).
 * The dashboard root ("/planner") only highlights on an exact match.
 */
export function NavItem({
  href,
  icon,
  label,
  exact,
}: {
  href: string;
  icon: string;
  label: string;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const active = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
        active
          ? "bg-white/10 text-white shadow-sm"
          : "text-lu-purple-100 hover:bg-white/5 hover:text-white"
      )}
    >
      {/* active indicator */}
      <span
        className={cn(
          "absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-lu-gold-400 transition-all duration-200",
          active ? "opacity-100" : "opacity-0 group-hover:opacity-40"
        )}
      />
      <span className="text-base opacity-90">{icon}</span>
      {label}
    </Link>
  );
}
