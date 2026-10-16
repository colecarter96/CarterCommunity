import { postFontFamily } from "@/lib/fonts";
import { formatStamp } from "@/lib/format";
import { parseNote } from "@/lib/note";
import type { Post } from "@/lib/posts";

export function FeedEntry({ post }: { post: Post }) {
  const { parts, links } = parseNote(post.body);
  const visible = parts.map((part) => (part.kind === "text" ? part.text : part.label)).join("");
  const short = visible.length <= 180;
  const face = postFontFamily(post.font);

  return (
    <article className="border-b border-line py-8 md:py-12">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {post.author ? <p className="text-sm font-medium">{post.author}</p> : null}
        <time
          dateTime={post.createdAt}
          className="text-[10px] tracking-[0.16em] text-muted uppercase"
        >
          {formatStamp(post.createdAt)}
        </time>
      </div>
      <p
        className={
          short
            ? `mt-4 max-w-3xl text-[clamp(1.65rem,3vw,2.35rem)] leading-[1.25] text-balance whitespace-pre-wrap ${face ? "" : "font-medium tracking-[-0.03em]"}`
            : "mt-4 max-w-2xl text-base leading-7 whitespace-pre-wrap"
        }
        style={face ? { fontFamily: face } : undefined}
      >
        {parts.map((part, index) =>
          part.kind === "text" ? (
            <span key={index}>{part.text}</span>
          ) : (
            <a
              key={index}
              href={part.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-1 underline-offset-[0.18em]"
            >
              {part.label}
            </a>
          ),
        )}
      </p>
      {links.length > 0 ? (
        <ul className="mt-6 max-w-xl border-t border-line">
          {links.map((link) => (
            <li key={link.url} className="border-b border-line">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-6 py-3 text-sm"
              >
                <span className="underline decoration-1 underline-offset-[0.18em]">{link.label}</span>
                <span className="nudge" aria-hidden="true">
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
