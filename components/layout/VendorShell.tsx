import type { User } from "@/lib/types";
import { exitVendorPreviewAction, lockScreenAction, logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { TopNavItem } from "@/components/layout/TopNavItem";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { IconStore, IconClipboard } from "@/components/ui/icons";

const NAV_ITEMS = [
  { href: "/vendor", label: "Browse Events", icon: <IconStore size={16} />, exact: true },
  { href: "/vendor/my-registrations", label: "My Registrations", icon: <IconClipboard size={16} /> },
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

      <header className="sticky top-0 z-20 border-b border-white/10 bg-gradient-to-r from-lu-purple-900 via-lu-purple-800 to-lu-purple-900 text-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-lu-gold-400 to-lu-gold-500 text-sm font-bold text-lu-purple-900 shadow-md">
              EF
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">EventFlow AI</p>
              <p className="text-[11px] font-medium text-lu-purple-200">Vendor Registration</p>
            </div>
          </div>

          <nav className="hidden gap-1 sm:flex">
            {NAV_ITEMS.map((item) => (
              <TopNavItem key={item.href} {...item} />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-lu-purple-200">{businessName ?? "Vendor"}</p>
            </div>
            <ThemeToggle variant="onColor" />
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
            <TopNavItem key={item.href} {...item} compact />
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-6">{children}</main>
    </div>
  );
}
