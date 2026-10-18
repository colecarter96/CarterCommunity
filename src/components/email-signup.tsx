"use client";

import { useActionState } from "react";
import { subscribe, type SubscribeState } from "@/lib/actions";

export function EmailSignup() {
  const [state, action, pending] = useActionState<SubscribeState, FormData>(subscribe, null);

  return (
    <form action={action} className="max-w-sm">
      <div className="flex items-end gap-4">
        <label className="block min-w-0 flex-1 text-[10px] tracking-[0.16em] text-muted uppercase">
          Email
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="name@email.com"
            className="mt-1 w-full border-b border-line bg-transparent py-2 text-sm tracking-normal text-foreground normal-case outline-none placeholder:text-muted/70 focus-visible:border-foreground"
          />
        </label>
        <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
          <input name="company" tabIndex={-1} autoComplete="off" />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="text-[11px] font-medium tracking-[0.16em] uppercase disabled:opacity-50"
        >
          {pending ? "Joining" : "Join"}
        </button>
      </div>
      {state?.error ? (
        <p role="alert" className="mt-3 text-sm text-accent">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? <p className="mt-3 text-sm text-muted">You are on the list.</p> : null}
    </form>
  );
}
