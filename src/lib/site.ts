/**
 * Public destinations for Carter Community.
 * Leave a string empty until the real URL exists. Empty values are not rendered.
 */
export const site = {
  name: "Carter Community",
  descriptor: "A life in motion",
  description:
    "What we're making, where we're going, and the people we meet along the way.",
  joinUrl: "",
  /** Paste the Discord invite here once the server exists. */
  discordUrl: "",
  socials: [
    { label: "YouTube", href: "" },
    { label: "TikTok", href: "" },
    { label: "Substack", href: "" },
  ],
};

export const shell = "mx-auto w-full max-w-6xl px-5 md:px-8";

export function configuredHref(href: string): string | null {
  try {
    const url = new URL(href);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}
