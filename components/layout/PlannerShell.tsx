import Link from "next/link";
import type { User } from "@/lib/types";
import { enterVendorPreviewAction, lockScreenAction, logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { NavItem } from "@/components/layout/NavItem";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import {
  IconDashboard,
  IconCalendar,
  IconMap,
  IconStore,
  IconUsers,
  IconBell,
} from "@/components/ui/icons";

const NAV_ITEMS = [
  { href: "/planner", label: "Dashboard", icon: <IconDashboard size={18} />, exact: true },
  { href: "/planner/events", label: "Events", icon: <IconCalendar size={18} /> },
  { href: "/planner/floorplans", label: "Floor Plans", icon: <IconMap size={18} /> },
  { href: "/planner/vendors", label: "Vendors", icon: <IconStore size={18} /> },
  { href: "/planner/users", label: "Users & Access", icon: <IconUsers size={18} /> },
  { href: "/planner/notifications", label: "Notifications", icon: <IconBell size={18} /> },
];

export function PlannerShell({ user, children }: { user: User; children: React.ReactNode }) {
  const canPreviewVendor = user.role === "admin" || user.role === "planner";

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="app-sidebar hidden w-64 shrink-0 flex-col md:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-(--sidebar-logo-from) to-(--sidebar-logo-to) text-sm font-bold text-(--sidebar-logo-fg) shadow-md">
            EF
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-sidebar-active-fg">EventFlow AI</p>
            <p className="text-[11px] font-medium text-sidebar-fg-muted">Operations</p>
          </div>
        </div>
        <p className="px-5 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-fg-muted">
          Menu
        </p>
        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>
        <div className="border-t border-sidebar-border px-3 py-4">
          {canPreviewVendor && (
            <form action={enterVendorPreviewAction}>
              <button
                type="submit"
                className="flex w-full cursor-pointer items-center gap-2 rounded-xl bg-sidebar-hover px-3 py-2.5 text-left text-xs font-semibold text-lu-gold-600 transition-colors hover:bg-sidebar-active dark:text-lu-gold-400"
              >
                ⇄ Preview vendor view
              </button>
            </form>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="ef-glass sticky top-0 z-20 flex items-center justify-between px-4 py-3 md:px-8">
          <div className="md:hidden text-sm font-bold text-heading">EventFlow AI</div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-heading">{user.name}</p>
              <p className="text-xs capitalize text-muted-foreground">{user.role}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-lu-purple-400 to-lu-purple-600 text-sm font-bold text-white ring-1 ring-lu-purple-500/30">
              {user.name
                .split(" ")
                .map((p) => p[0])
                .join("")}
            </div>
            <ThemeToggle />
            <form action={lockScreenAction}>
              <Button type="submit" variant="ghost" size="sm">
                Lock
              </Button>
            </form>
            <form action={logoutAction}>
              <Button type="submit" variant="secondary" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-surface px-4 py-2 md:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-muted"
            >
              <span className="[&>svg]:h-4 [&>svg]:w-4">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="flex-1 px-4 py-8 md:px-10">{children}</main>
      </div>
    </div>
  );
}
