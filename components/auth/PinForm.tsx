"use client";

import { useActionState } from "react";
import { pinAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";

export function PinForm() {
  const [state, formAction, pending] = useActionState(pinAction, undefined);

  return (
    <form action={formAction} className="ef-fade-in">
      <input
        name="pin"
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        required
        autoFocus
        aria-label="PIN"
        placeholder="• • • •"
        className="mb-4 w-full rounded-lg border border-border bg-surface px-4 py-4 text-center text-3xl tracking-[0.5em] shadow-sm outline-none focus:border-lu-purple-500 focus:ring-2 focus:ring-lu-purple-100"
      />

      {state?.error && (
        <FormError className="mb-4 text-center">{state.error}</FormError>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Unlocking…" : "Unlock"}
      </Button>
    </form>
  );
}
