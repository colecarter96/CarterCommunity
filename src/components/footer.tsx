import { DiscordLink } from "@/components/discord-link";
import { configuredHref, shell, site } from "@/lib/site";

export function Footer() {
  const links = [
    ...site.socials.map((item) => ({
      label: item.label,
      href: configuredHref(item.href),
    })),
    { label: "Community", href: configuredHref(site.joinUrl) },
  ].filter((item): item is { label: string; href: string } => Boolean(item.href));

  return (
    <footer className="mt-auto border-t border-line">
      <div className={`${shell} flex flex-col gap-6 py-10 sm:flex-row sm:items-end sm:justify-between`}>
        <p className="max-w-sm text-[13px] font-semibold tracking-[0.14em] uppercase">
          Make something. Meet someone. Go do it.
        </p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1 text-[11px] tracking-[0.16em] text-muted uppercase hover:text-foreground"
              >
                {link.label}
                <span className="nudge inline-block" aria-hidden="true">
                  ↗
                </span>
              </a>
            </li>
          ))}
          <li>
            <DiscordLink />
          </li>
        </ul>
      </div>
    </footer>
  );
}
