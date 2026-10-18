import { DiscordLink } from "@/components/discord-link";
import { EmailSignup } from "@/components/email-signup";
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
      <div className={`${shell} flex flex-col gap-8 py-10 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] sm:items-start sm:gap-x-12 sm:gap-y-8`}>
        <p className="max-w-sm text-[13px] font-semibold tracking-[0.14em] uppercase sm:col-start-1 sm:row-start-1">
          Make something. Meet someone. Go do it.
        </p>
        <div className="sm:col-start-2 sm:row-start-1 sm:justify-self-end">
          <EmailSignup />
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 sm:col-start-1 sm:row-start-2 sm:max-w-xl">
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
