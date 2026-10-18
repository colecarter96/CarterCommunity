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
  discordUrl: "https://discord.gg/r6aM2TYBG6",
  socials: [
    { label: "YouTube", href: "https://www.youtube.com/@bryceandcolecarter" },
    { label: "TikTok", href: "https://www.tiktok.com/@bryce.cole.carter" },
    { label: "TikTok Bryce", href: "https://www.tiktok.com/@b_ricee" },
    { label: "TikTok Cole", href: "https://www.tiktok.com/@colecartr" },
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
