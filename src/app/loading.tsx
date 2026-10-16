import { shell } from "@/lib/site";

export default function Loading() {
  return (
    <main className={`${shell} flex-1 py-10`}>
      <p className="font-accent text-[10px] tracking-[0.18em] text-muted uppercase">
        Loading the feed
      </p>
    </main>
  );
}
