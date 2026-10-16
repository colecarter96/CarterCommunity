import { configuredHref, site } from "@/lib/site";

export function DiscordLink({ className = "" }: { className?: string }) {
  const href = configuredHref(site.discordUrl);
  const classNames = `group inline-flex items-center gap-1 text-[11px] tracking-[0.16em] uppercase ${className}`;
  const content = (
    <>
      <span className="underline decoration-1 underline-offset-[0.18em]">Discord</span>
      <span className="nudge inline-block" aria-hidden="true">
        ↗
      </span>
    </>
  );

  if (!href) {
    return <span className={classNames}>{content}</span>;
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classNames}>
      {content}
    </a>
  );
}
