"use client";

import { useRef, useState, useTransition } from "react";
import { toggleHeart } from "@/lib/actions";

export function HeartButton({
  postId,
  count,
  hearted,
}: {
  postId: string;
  count: number;
  hearted: boolean;
}) {
  const [current, setCurrent] = useState({ count, hearted });
  const [pending, startTransition] = useTransition();
  const busy = useRef(false);

  function onHeart() {
    if (busy.current) return;
    busy.current = true;
    const previous = current;
    const nextHearted = !current.hearted;
    setCurrent({ count: Math.max(0, current.count + (nextHearted ? 1 : -1)), hearted: nextHearted });
    startTransition(async () => {
      const result = await toggleHeart(postId);
      setCurrent("error" in result ? previous : result);
      busy.current = false;
    });
  }

  return (
    <button
      type="button"
      onClick={onHeart}
      disabled={pending}
      aria-pressed={current.hearted}
      aria-label={current.hearted ? "Remove heart" : "Heart this note"}
      className="mt-5 inline-flex items-center gap-1.5 disabled:opacity-50"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={`h-5 w-5 ${current.hearted ? "fill-foreground stroke-foreground" : "fill-none stroke-foreground"}`}
      >
        <path
          strokeWidth="1.6"
          d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z"
        />
      </svg>
      <span className="text-sm text-foreground">{current.count}</span>
    </button>
  );
}
