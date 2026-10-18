"use client";

import { useActionState } from "react";
import { removeEmail, type FormState } from "@/lib/actions";
import { formatStamp } from "@/lib/format";
import type { Subscriber } from "@/lib/subscribers";

function Address({ subscriber }: { subscriber: Subscriber }) {
  const [state, action, pending] = useActionState<FormState, FormData>(removeEmail, null);

  return (
    <li className="border-b border-line py-3">
      <div className="flex items-baseline justify-between gap-4">
        <span className="min-w-0 text-sm break-all">{subscriber.email}</span>
        <div className="flex shrink-0 items-baseline gap-4">
          <time
            dateTime={subscriber.createdAt}
            className="text-[10px] tracking-[0.16em] text-muted uppercase"
          >
            {formatStamp(subscriber.createdAt)}
          </time>
          <form
            action={action}
            onSubmit={(event) => {
              if (!confirm("Remove this email?")) event.preventDefault();
            }}
          >
            <input type="hidden" name="email" value={subscriber.email} />
            <button
              type="submit"
              disabled={pending}
              className="text-[11px] tracking-[0.16em] text-muted uppercase disabled:opacity-50"
            >
              {pending ? "Removing" : "Remove"}
            </button>
          </form>
        </div>
      </div>
      {state?.error ? (
        <p role="alert" className="mt-2 text-sm text-accent">
          {state.error}
        </p>
      ) : null}
    </li>
  );
}

export function EmailList({ emails }: { emails: Subscriber[] }) {
  return (
    <section className="mt-16 border-t border-line pt-10">
      <h2 className="text-3xl font-semibold tracking-[-0.04em]">Emails</h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted">
        {emails.length === 0
          ? "No one has joined yet. Addresses from the footer show up here."
          : `${emails.length} ${emails.length === 1 ? "address" : "addresses"} from the footer.`}
      </p>
      {emails.length > 0 ? (
        <ul className="mt-6 max-w-xl">
          {emails.map((subscriber) => (
            <Address key={subscriber.email} subscriber={subscriber} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}
