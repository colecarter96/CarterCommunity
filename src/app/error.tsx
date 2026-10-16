"use client";

import { shell } from "@/lib/site";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className={`${shell} flex-1 py-16`}>
      <h1 className="text-2xl font-semibold tracking-[-0.03em]">The feed failed to load.</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted">
        Refresh the page, or try opening it again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 text-[11px] tracking-[0.16em] text-accent uppercase"
      >
        Try again
      </button>
    </main>
  );
}
