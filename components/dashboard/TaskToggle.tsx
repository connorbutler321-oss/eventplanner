"use client";

import { useFormStatus } from "react-dom";
import { IconCheck } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/**
 * The round check control in the dashboard task list.
 *
 * Split out of TaskList purely so it can read `useFormStatus` — TaskList is a
 * server component, and this button lives in an inline `"use server"` form, so
 * there was no way to tell the user their click had registered. Without it the
 * tick only appeared after the whole dashboard revalidated.
 */
export function TaskToggle({ done }: { done: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      aria-label={done ? "Mark as not done" : "Mark as done"}
      className={cn(
        "mt-0.5 flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 transition-colors",
        // While in flight, show the state the click is moving toward so the tick
        // is immediate rather than waiting on the server round trip.
        pending
          ? "border-success/50 bg-success/50 text-white"
          : done
            ? "border-success bg-success text-white"
            : "border-border-strong text-transparent hover:border-lu-purple-400 hover:bg-lu-purple-400/10"
      )}
    >
      <IconCheck size={12} />
    </button>
  );
}
