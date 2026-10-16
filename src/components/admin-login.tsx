"use client";

import { useActionState } from "react";
import { login, type FormState } from "@/lib/actions";

const fieldClass =
  "mt-1 w-full border-b border-line bg-transparent py-2 text-sm outline-none placeholder:text-muted/70 focus-visible:border-foreground";

export function AdminLogin() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, null);

  return (
    <form action={action} className="max-w-sm">
      <label className="block text-[10px] tracking-[0.16em] text-muted uppercase">
        Password
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          className={fieldClass}
        />
      </label>
      {state?.error ? (
        <p role="alert" className="mt-4 text-sm text-accent">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-6 text-[11px] font-medium tracking-[0.16em] text-accent uppercase disabled:opacity-50"
      >
        {pending ? "Checking" : "Enter"}
      </button>
    </form>
  );
}
