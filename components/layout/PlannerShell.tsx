import Link from "next/link";
import type { User } from "@/lib/types";
import { enterVendorPreviewAction, lockScreenAction, logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";

const NAV_ITEMS = [
  { href: "/planner", label: "Dashboard", icon: "▦" },
  { href: "/planner/events", label: "Events", icon: "📅" },
  { href: "/planner/floorplans", label: "Floor Plans", icon: "🗺️" },
  { href: "/planner/vendors", label: "Vendors", icon: "🏪" },
  { href: "/planner/users", label: "Users & Access", icon: "🔑" },
  { href: "/planner/notifications", label: "Notifications", icon: "🔔" },
];

export function PlannerShell({ user, children }: { user: User; children: React.ReactNode }) {
  const canPreviewVendor = user.role === "admin" || user.role === "planner";

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-lu-purple-900 text-white md:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-lu-gold-400 text-sm font-bold text-lu-purple-900">
            EF
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">EventFlow AI</p>
            <p className="text-[11px] text-lu-purple-200">Operations</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-lu-purple-100 transition-colors hover:bg-lu-purple-700 hover:text-white"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-lu-purple-700/60 px-3 py-4">
          {canPreviewVendor && (
            <form action={enterVendorPreviewAction}>
              <button
                type="submit"
                className="mb-2 flex w-full cursor-pointer items-center gap-2 rounded-lg bg-lu-purple-700/60 px-3 py-2 text-left text-xs font-semibold text-lu-gold-400 hover:bg-lu-purple-700"
              >
                ⇄ Preview vendor view
              </button>
            </form>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:px-6">
          <div className="md:hidden text-sm font-bold text-lu-purple-900">EventFlow AI</div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-lu-purple-900">{user.name}</p>
              <p className="text-xs capitalize text-gray-500">{user.role}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-lu-purple-100 text-sm font-bold text-lu-purple-700">
              {user.name
                .split(" ")
                .map((p) => p[0])
                .join("")}
            </div>
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
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-lu-purple-700 hover:bg-lu-purple-50"
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>
        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
