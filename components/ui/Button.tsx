import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "gold" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--lu-purple-500] active:scale-[0.97] cursor-pointer";

const variants: Record<Variant, string> = {
  primary:
    "bg-lu-purple-600 text-white shadow-sm hover:bg-lu-purple-700 hover:shadow-md",
  gold: "bg-lu-gold-500 text-lu-purple-900 shadow-sm hover:bg-lu-gold-400 hover:shadow-md",
  secondary:
    "bg-white text-lu-purple-700 border border-lu-purple-200 hover:bg-lu-purple-50 shadow-sm",
  ghost: "bg-transparent text-lu-purple-700 hover:bg-lu-purple-50",
  danger: "bg-danger text-white hover:opacity-90 shadow-sm",
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
