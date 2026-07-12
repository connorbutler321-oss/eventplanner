import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "gold" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 ease-out disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] active:translate-y-0 cursor-pointer";

const variants: Record<Variant, string> = {
  primary:
    "bg-lu-purple-600 text-white shadow-sm hover:bg-lu-purple-700 hover:shadow-md hover:-translate-y-px",
  gold: "bg-lu-gold-500 text-lu-purple-900 shadow-sm hover:bg-lu-gold-400 hover:shadow-md hover:-translate-y-px",
  secondary:
    "bg-surface text-lu-purple-700 border border-border-strong hover:bg-lu-purple-50 hover:border-lu-purple-200 shadow-xs hover:shadow-sm",
  ghost: "bg-transparent text-lu-purple-700 hover:bg-lu-purple-50",
  danger: "bg-danger text-white shadow-sm hover:opacity-90 hover:shadow-md hover:-translate-y-px",
};

const sizes: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5",
  md: "text-sm px-4 py-2.5",
  lg: "text-base px-6 py-3",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

type ButtonProps = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type LinkButtonProps = CommonProps & {
  href: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
  ...rest
}: ButtonProps | LinkButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className);
  if (href) {
    return (
      <Link href={href} className={classes} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
