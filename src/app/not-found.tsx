import Link from "next/link";
import { shell } from "@/lib/site";

export default function NotFound() {
  return (
    <main className={`${shell} flex-1 py-16`}>
      <p className="font-accent text-[10px] tracking-[0.18em] text-muted uppercase">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">
        This page is outside the feed.
      </h1>
      <Link
        href="/"
        className="group mt-6 inline-flex items-center gap-1 text-[11px] tracking-[0.16em] text-accent uppercase"
      >
        Back to the feed
        <span className="nudge inline-block" aria-hidden="true">
          ↗
        </span>
      </Link>
    </main>
  );
}
