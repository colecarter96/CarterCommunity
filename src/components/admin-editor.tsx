"use client";

import { useActionState, useRef, useState, type RefObject } from "react";
import {
  createPost,
  deletePost,
  logout,
  updatePost,
  type FormState,
} from "@/lib/actions";
import { postFontFamily, postFonts, type PostFontId } from "@/lib/fonts";
import { formatStamp, isHttpUrl } from "@/lib/format";
import { insertMarkup, linkMarkup } from "@/lib/note";
import type { Post } from "@/lib/posts";

const fieldClass =
  "mt-1 w-full border-b border-line bg-transparent py-2 text-sm outline-none placeholder:text-muted/70 focus-visible:border-foreground";

function NoteFields({
  author,
  body,
  font,
  onAuthor,
  onBody,
  onFont,
  textRef,
}: {
  author: string;
  body: string;
  font: PostFontId;
  onAuthor: (value: string) => void;
  onBody: (value: string) => void;
  onFont: (value: PostFontId) => void;
  textRef: RefObject<HTMLTextAreaElement | null>;
}) {
  const [words, setWords] = useState("");
  const [url, setUrl] = useState("");
  const [linkError, setLinkError] = useState("");
  const face = postFontFamily(font);

  function placeLink() {
    const href = url.trim();
    if (!isHttpUrl(href)) {
      setLinkError("Use a full http or https link.");
      return;
    }
    const markup = linkMarkup(words, href);
    const field = textRef.current;
    const start = field?.selectionStart ?? body.length;
    const end = field?.selectionEnd ?? body.length;
    const { next, cursor } = insertMarkup(body, start, end, markup);
    onBody(next);
    setWords("");
    setUrl("");
    setLinkError("");
    requestAnimationFrame(() => {
      field?.focus();
      field?.setSelectionRange(cursor, cursor);
    });
  }

  return (
    <>
      <label className="mt-5 block text-[10px] tracking-[0.16em] text-muted uppercase">
        Author
        <input
          name="author"
          value={author}
          onChange={(event) => onAuthor(event.target.value)}
          maxLength={80}
          placeholder="Name"
          className={fieldClass}
        />
      </label>
      <label className="mt-5 block text-[10px] tracking-[0.16em] text-muted uppercase">
        Note
        <textarea
          ref={textRef}
          name="body"
          value={body}
          onChange={(event) => onBody(event.target.value)}
          rows={5}
          maxLength={4000}
          placeholder="A little thing worth saying"
          className={`${fieldClass} resize-y text-lg`}
          style={face ? { fontFamily: face } : undefined}
        />
      </label>
      <fieldset className="mt-5">
        <legend className="text-[10px] tracking-[0.16em] text-muted uppercase">Font</legend>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
          {postFonts.map((item) => (
            <label
              key={item.id}
              className="inline-flex items-center gap-2 text-base"
              style={item.variable ? { fontFamily: `var(${item.variable}), var(--font-sans), sans-serif` } : undefined}
            >
              <input
                type="radio"
                name="font"
                value={item.id}
                checked={font === item.id}
                onChange={() => onFont(item.id)}
              />
              {item.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="mt-5">
        <p className="text-[10px] tracking-[0.16em] text-muted uppercase">Link in the note</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <input
            value={words}
            onChange={(event) => setWords(event.target.value)}
            placeholder="Words in the sentence"
            className={fieldClass}
          />
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://"
            inputMode="url"
            className={fieldClass}
          />
        </div>
        {linkError ? (
          <p role="alert" className="mt-3 text-sm text-accent">
            {linkError}
          </p>
        ) : null}
        <button
          type="button"
          onClick={placeLink}
          className="mt-4 text-[11px] tracking-[0.16em] text-foreground uppercase"
        >
          Place it here
        </button>
      </div>
    </>
  );
}

function NewPost() {
  const [state, action, pending] = useActionState<FormState, FormData>(createPost, null);
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [font, setFont] = useState<PostFontId>("geist");
  const textRef = useRef<HTMLTextAreaElement>(null);

  return (
    <form action={action}>
      <NoteFields
        author={author}
        body={body}
        font={font}
        onAuthor={setAuthor}
        onBody={setBody}
        onFont={setFont}
        textRef={textRef}
      />
      {state?.error ? (
        <p role="alert" className="mt-4 text-sm text-accent">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="group mt-6 inline-flex items-center gap-1 text-[11px] font-medium tracking-[0.16em] text-accent uppercase disabled:opacity-50"
      >
        {pending ? "Posting" : "Post it"}
        <span className="nudge inline-block" aria-hidden="true">
          ↗
        </span>
      </button>
    </form>
  );
}

function ExistingPost({ post }: { post: Post }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updatePost, null);
  const [author, setAuthor] = useState(post.author ?? "");
  const [body, setBody] = useState(post.body);
  const [font, setFont] = useState<PostFontId>(
    postFonts.some((item) => item.id === post.font) ? (post.font as PostFontId) : "geist",
  );
  const textRef = useRef<HTMLTextAreaElement>(null);

  return (
    <article className="border-t border-line py-8">
      <time
        dateTime={post.createdAt}
        className="text-[10px] tracking-[0.16em] text-muted uppercase"
      >
        {formatStamp(post.createdAt)}
      </time>
      <form action={action} className="mt-4">
        <input type="hidden" name="id" value={post.id} />
        <NoteFields
          author={author}
          body={body}
          font={font}
          onAuthor={setAuthor}
          onBody={setBody}
          onFont={setFont}
          textRef={textRef}
        />
        {state?.error ? (
          <p role="alert" className="mt-4 text-sm text-accent">
            {state.error}
          </p>
        ) : null}
        {state?.ok ? <p className="mt-4 text-sm text-muted">Saved.</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="mt-6 text-[11px] font-medium tracking-[0.16em] text-accent uppercase disabled:opacity-50"
        >
          {pending ? "Saving" : "Save"}
        </button>
      </form>
      <form
        action={deletePost}
        className="mt-3"
        onSubmit={(event) => {
          if (!confirm("Remove this post?")) event.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={post.id} />
        <button type="submit" className="text-[11px] tracking-[0.16em] text-muted uppercase">
          Remove
        </button>
      </form>
    </article>
  );
}

export function AdminEditor({ posts }: { posts: Post[] }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-[-0.04em]">Post</h1>
        <form action={logout}>
          <button type="submit" className="text-[11px] tracking-[0.16em] text-muted uppercase">
            Log out
          </button>
        </form>
      </div>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted">
        Write the note, pick a font, and place a link in the sentence wherever the cursor is. Each
        link is listed again at the bottom, with an arrow.
      </p>
      <NewPost key={posts[0]?.id ?? "empty"} />
      {posts.length > 0 ? (
        <div className="mt-12">
          {posts.map((post) => (
            <ExistingPost key={post.id} post={post} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
