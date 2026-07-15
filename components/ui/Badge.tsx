import { cn } from "@/lib/cn";
import type { EventStatus, RegistrationStatus, SpaceStatus } from "@/lib/types";

// Alpha-tinted fills so badges read correctly on both light and dark surfaces.
const toneClasses: Record<string, string> = {
  neutral: "bg-foreground/8 text-muted-foreground ring-1 ring-inset ring-foreground/10",
  purple: "bg-lu-purple-400/15 text-lu-purple-400 ring-1 ring-inset ring-lu-purple-400/25",
  gold: "bg-lu-gold-500/15 text-lu-gold-600 ring-1 ring-inset ring-lu-gold-500/30",
  success: "bg-success/12 text-success ring-1 ring-inset ring-success/25",
  warning: "bg-warning/12 text-warning ring-1 ring-inset ring-warning/25",
  danger: "bg-danger/12 text-danger ring-1 ring-inset ring-danger/25",
  info: "bg-info/12 text-info ring-1 ring-inset ring-info/25",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: keyof typeof toneClasses;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

const eventStatusTone: Record<EventStatus, keyof typeof toneClasses> = {
  Draft: "neutral",
  Open: "success",
  Full: "warning",
  Waitlisted: "gold",
  Closed: "info",
  Completed: "purple",
  Canceled: "danger",
};

export function EventStatusBadge({ status }: { status: EventStatus }) {
  return <Badge tone={eventStatusTone[status]}>{status}</Badge>;
}

const registrationStatusTone: Record<RegistrationStatus, keyof typeof toneClasses> = {
  Confirmed: "success",
  Waitlisted: "gold",
  Canceled: "danger",
  Promoted: "info",
  Attended: "purple",
  "No-show": "neutral",
};

export function RegistrationStatusBadge({ status }: { status: RegistrationStatus }) {
  return <Badge tone={registrationStatusTone[status]}>{status}</Badge>;
}

const spaceStatusTone: Record<SpaceStatus, keyof typeof toneClasses> = {
  available: "success",
  reserved: "danger",
  blocked: "neutral",
};

export function SpaceStatusBadge({ status }: { status: SpaceStatus }) {
  return <Badge tone={spaceStatusTone[status]}>{status}</Badge>;
}
