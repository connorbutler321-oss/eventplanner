import Link from "next/link";
import type { User } from "@/lib/types";
import { exitVendorPreviewAction, lockScreenAction, logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";

const NAV_ITEMS = [
  { href: "/vendor", label: "Browse Events" },
  { href: "/vendor/my-registrations", label: "My Registrations" },
];

export function VendorShell({
  user,
  businessName,
  isStaffPreview,
  children,
}: {
  user: User;
  businessName?: string;
  isStaffPreview: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {isStaffPreview && (
        <div className="flex items-center justify-between bg-lu-gold-400 px-4 py-2 text-sm font-semibold text-lu-purple-900">
          <span>👁️ Previewing the vendor experience as staff</span>
          <form action={exitVendorPreviewAction}>
            <button type="submit" className="cursor-pointer underline">
              Exit preview
            </button>
          </form>
        </div>
      )}

      <header className="border-b border-border bg-lu-purple-900 text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-lu-gold-400 text-sm font-bold text-lu-purple-900">
              EF
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">EventFlow AI</p>
              <p className="text-[11px] text-lu-purple-200">Vendor Registration</p>
            </div>
          </div>

          <nav className="hidden gap-1 sm:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-lu-purple-100 hover:bg-lu-purple-700 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-lu-purple-200">{businessName ?? "Vendor"}</p>
            </div>
            {!isStaffPreview && (
              <>
                <form action={lockScreenAction}>
                  <Button type="submit" variant="ghost" size="sm" className="!text-white hover:!bg-lu-purple-700">
                    Lock
                  </Button>
                </form>
                <form action={logoutAction}>
                  <Button type="submit" variant="gold" size="sm">
                    Sign out
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-4 pb-2 sm:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-lu-purple-100 hover:bg-lu-purple-700 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-6">{children}</main>
    </div>
  );
}
