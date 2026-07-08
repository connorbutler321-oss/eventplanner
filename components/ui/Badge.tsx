import { cn } from "@/lib/cn";
import type { EventStatus, RegistrationStatus, SpaceStatus } from "@/lib/types";

const toneClasses: Record<string, string> = {
  neutral: "bg-gray-100 text-gray-700",
  purple: "bg-lu-purple-100 text-lu-purple-700",
  gold: "bg-lu-gold-100 text-lu-gold-600",
  success: "bg-green-100 text-success",
  warning: "bg-amber-100 text-warning",
  danger: "bg-red-100 text-danger",
  info: "bg-blue-100 text-info",
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
