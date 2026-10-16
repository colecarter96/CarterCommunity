"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { wordmark } from "@/lib/mark";

type Box = { left: number; top: number; width: number; height: number };

const COUNT_MS = 1100;
const OPEN_MS = 860;

export function OpenScreen() {
  const centerRef = useRef<HTMLDivElement>(null);
  const readyRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"count" | "open" | "done">("count");
  const [flight, setFlight] = useState<{ from: Box; to: Box; move: boolean } | null>(null);
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.opening = "";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const image = centerRef.current?.querySelector("img");
    if (image?.complete && image.naturalWidth > 0) readyRef.current = true;

    const start = performance.now();
    let frame = 0;
    let hold = 0;

    const finishCount = () => {
      setProgress(100);
      hold = window.setTimeout(() => setPhase("open"), reduce ? 0 : 180);
    };

    const tick = (now: number) => {
      if (reduce) {
        if (!readyRef.current) {
          frame = requestAnimationFrame(tick);
          return;
        }
        finishCount();
        return;
      }

      const t = Math.min(1, (now - start) / COUNT_MS);
      const eased = 1 - (1 - t) ** 3;
      let value = Math.round(eased * 100);
      if (!readyRef.current) value = Math.min(value, 96);
      if (readyRef.current && t >= 1) value = 100;
      setProgress(value);
      if (value >= 100 && readyRef.current) {
        finishCount();
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(hold);
    };
  }, []);

  useEffect(() => {
    if (phase !== "open") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = centerRef.current?.getBoundingClientRect();
    const to = document.getElementById("site-mark")?.getBoundingClientRect();
    let frame = 0;
    let done = 0;

    const close = () => {
      delete document.documentElement.dataset.opening;
      setPhase("done");
    };

    if (reduce || !from || !to || to.width < 2) {
      setReveal(true);
      done = window.setTimeout(close, reduce ? 160 : 420);
      return () => window.clearTimeout(done);
    }

    setFlight({
      from: { left: from.left, top: from.top, width: from.width, height: from.height },
      to: { left: to.left, top: to.top, width: to.width, height: to.height },
      move: false,
    });
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        setFlight((current) => (current ? { ...current, move: true } : current));
        setReveal(true);
      });
    });
    done = window.setTimeout(close, OPEN_MS);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(done);
    };
  }, [phase]);

  useEffect(() => {
    return () => {
      delete document.documentElement.dataset.opening;
    };
  }, []);

  if (phase === "done") return null;

  const scale = flight ? flight.to.width / flight.from.width : 1;
  const shift = flight
    ? {
        x: flight.to.left - flight.from.left,
        y: flight.to.top - flight.from.top,
      }
    : { x: 0, y: 0 };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-background transition-opacity duration-500 ease-out ${
          reveal ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <p className="sr-only">Loading</p>
        <div
          ref={centerRef}
          className={`absolute top-1/2 left-1/2 w-[min(52vw,300px)] -translate-x-1/2 -translate-y-1/2 ${
            flight ? "invisible" : ""
          }`}
        >
          <Image
            src={wordmark.src}
            alt=""
            width={wordmark.width}
            height={wordmark.height}
            unoptimized
            preload
            onLoad={() => {
              readyRef.current = true;
            }}
            onError={() => {
              readyRef.current = true;
            }}
            className="h-auto w-full"
          />
        </div>
        <p
          aria-hidden="true"
          className={`fixed right-[max(1.5rem,env(safe-area-inset-right))] bottom-[max(1.75rem,env(safe-area-inset-bottom))] text-right font-accent text-5xl leading-none transition-opacity duration-300 md:right-14 md:bottom-16 md:text-6xl ${
            reveal ? "opacity-0" : "opacity-100"
          }`}
        >
          {progress}%
        </p>
      </div>
      {flight ? (
        <div
          className="fixed z-50"
          style={{
            left: flight.from.left,
            top: flight.from.top,
            width: flight.from.width,
            height: flight.from.height,
            transformOrigin: "top left",
            transform: flight.move
              ? `translate(${shift.x}px, ${shift.y}px) scale(${scale})`
              : "none",
            transition: flight.move
              ? "transform 780ms cubic-bezier(0.16, 1, 0.3, 1)"
              : "none",
          }}
        >
          <Image
            src={wordmark.src}
            alt=""
            width={wordmark.width}
            height={wordmark.height}
            unoptimized
            className="h-full w-full"
          />
        </div>
      ) : null}
    </>
  );
}
