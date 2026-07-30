import { cn } from "@/lib/cn";

/**
 * Inline error banner for forms.
 *
 * Uses an alpha-tinted fill rather than a fixed light one (the old `bg-red-50`)
 * so it reads correctly on both light and dark surfaces — same approach as the
 * tone classes in Badge. `role="alert"` lets screen readers announce the message
 * when it appears, which a plain <p> does not.
 */
export function FormError({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      role="alert"
      className={cn(
        "rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger",
        className
      )}
    >
      {children}
    </p>
  );
}
