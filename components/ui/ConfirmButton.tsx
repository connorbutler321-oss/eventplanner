"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./Button";

type ConfirmButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  confirmMessage: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  /** Label shown while the form is submitting. Defaults to "Working…". */
  pendingLabel?: React.ReactNode;
};

export function ConfirmButton({
  confirmMessage,
  children,
  onClick,
  pendingLabel,
  ...rest
}: ConfirmButtonProps) {
  // Same reasoning as SubmitButton: these sit in inline "use server" forms, so
  // without this the button stayed enabled and clickable after confirming.
  const { pending } = useFormStatus();

  return (
    <Button
      {...rest}
      aria-busy={pending}
      disabled={pending}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
    >
      {pending ? (pendingLabel ?? "Working…") : children}
    </Button>
  );
}
