import { isHttpUrl } from "@/lib/format";

export type NoteLink = {
  label: string;
  url: string;
};

export type NotePart =
  | { kind: "text"; text: string }
  | { kind: "link"; label: string; url: string };

const pattern = /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<]+)/g;

export function parseNote(body: string): { parts: NotePart[]; links: NoteLink[] } {
  const parts: NotePart[] = [];
  const links: NoteLink[] = [];
  const seen = new Set<string>();
  let last = 0;

  for (const match of body.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > last) parts.push({ kind: "text", text: body.slice(last, index) });

    const markdownLabel = match[1];
    const markdownUrl = match[2];
    const bare = match[3];

    if (markdownLabel && markdownUrl && isHttpUrl(markdownUrl)) {
      const label = markdownLabel.trim();
      parts.push({ kind: "link", label, url: markdownUrl });
      remember(links, seen, label, markdownUrl);
    } else if (bare) {
      const url = bare.replace(/[.,!?;:]+$/, "");
      const trailing = bare.slice(url.length);
      if (isHttpUrl(url)) {
        const label = new URL(url).hostname.replace(/^www\./, "");
        parts.push({ kind: "link", label, url });
        if (trailing) parts.push({ kind: "text", text: trailing });
        remember(links, seen, label, url);
      } else {
        parts.push({ kind: "text", text: match[0] });
      }
    } else {
      parts.push({ kind: "text", text: match[0] });
    }

    last = index + match[0].length;
  }

  if (last < body.length) parts.push({ kind: "text", text: body.slice(last) });
  return { parts, links };
}

function remember(links: NoteLink[], seen: Set<string>, label: string, url: string) {
  if (seen.has(url)) return;
  seen.add(url);
  links.push({ label, url });
}

export function linkMarkup(label: string, url: string) {
  const host = new URL(url).hostname.replace(/^www\./, "");
  const safeLabel = label.replace(/[\[\]]/g, "").trim() || host;
  return `[${safeLabel}](${url})`;
}

export function insertMarkup(body: string, start: number, end: number, markup: string) {
  const before = body.slice(0, start);
  const after = body.slice(end);
  const lead = before.length > 0 && !/\s$/.test(before) ? " " : "";
  const trail = after.length > 0 && !/^\s/.test(after) ? " " : "";
  const next = `${before}${lead}${markup}${trail}${after}`;
  return { next, cursor: before.length + lead.length + markup.length };
}
