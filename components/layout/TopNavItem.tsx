"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

/** Horizontal nav link (top bar) with active-route highlighting. */
export function TopNavItem({
  href,
  label,
  exact,
  compact,
}: {
  href: string;
  label: string;
  exact?: boolean;
  compact?: boolean;
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
        "whitespace-nowrap rounded-lg font-medium transition-colors",
        compact ? "px-3 py-1.5 text-xs" : "px-3 py-2 text-sm",
        active
          ? "bg-white/15 text-white"
          : "text-lu-purple-100 hover:bg-white/10 hover:text-white"
      )}
    >
      {label}
    </Link>
  );
}
