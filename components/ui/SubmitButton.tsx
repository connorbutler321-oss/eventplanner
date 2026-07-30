"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./Button";

// Mirrors ConfirmButton's prop shape: Button accepts either button or anchor
// props, and spreading that union into a <button> doesn't typecheck.
type SubmitButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  /** Label shown while the form is submitting. Defaults to "Working…". */
  pendingLabel?: React.ReactNode;
};

/**
 * A submit button that disables itself and swaps its label while its form is
 * in flight.
 *
 * Forms rendered by client components get this behaviour from the `pending`
 * flag that `useActionState` returns (see LoginForm, EventForm, etc). Inline
 * `"use server"` forms inside server components can't use that hook, so their
 * buttons stayed enabled and gave no feedback at all — a click looked like
 * nothing had happened until the page revalidated, and an impatient second
 * click submitted the action twice.
 *
 * `useFormStatus` reads the state of the nearest enclosing <form>, which works
 * in both cases. Must be rendered *inside* the form it belongs to — that's how
 * the hook finds it.
 */
export function SubmitButton({ children, pendingLabel, ...rest }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" aria-busy={pending} disabled={pending} {...rest}>
      {pending ? (pendingLabel ?? "Working…") : children}
    </Button>
  );
}
