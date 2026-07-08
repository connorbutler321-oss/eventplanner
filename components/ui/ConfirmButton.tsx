"use client";

import { Button } from "./Button";

type ConfirmButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  confirmMessage: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
};

export function ConfirmButton({ confirmMessage, children, onClick, ...rest }: ConfirmButtonProps) {
  return (
    <Button
      {...rest}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
    >
      {children}
    </Button>
  );
}
