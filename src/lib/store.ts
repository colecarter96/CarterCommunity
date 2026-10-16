import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { isPostFont } from "@/lib/fonts";
import { isHttpUrl } from "@/lib/format";
import { sortPosts, type Post } from "@/lib/posts";

const filePath = path.join(process.cwd(), "data", "posts.json");

function normalizePost(value: unknown): Post | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Post & { linkUrl?: string; linkTitle?: string };
  if (
    typeof record.id !== "string" ||
    typeof record.createdAt !== "string" ||
    typeof record.body !== "string"
  ) {
    return null;
  }

  let body = record.body;
  if (typeof record.linkUrl === "string" && isHttpUrl(record.linkUrl) && !body.includes(record.linkUrl)) {
    const label =
      typeof record.linkTitle === "string" && record.linkTitle.trim()
        ? record.linkTitle.trim()
        : record.linkUrl;
    body = body ? `${body}\n[${label}](${record.linkUrl})` : `[${label}](${record.linkUrl})`;
  }

  const post: Post = { id: record.id, createdAt: record.createdAt, body };
  if (typeof record.author === "string" && record.author.trim()) post.author = record.author.trim();
  if (typeof record.font === "string" && isPostFont(record.font) && record.font !== "geist") {
    post.font = record.font;
  }
  return post;
}

export async function readPosts(): Promise<Post[]> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return sortPosts(parsed.flatMap((item) => {
      const post = normalizePost(item);
      return post ? [post] : [];
    }));
  } catch {
    return [];
  }
}

export async function writePosts(posts: Post[]) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(sortPosts(posts), null, 2)}\n`, "utf8");
}

export type PostInput = {
  body: string;
  author?: string;
  font?: string;
};

export function parsePostForm(
  formData: FormData,
): { ok: true; value: PostInput } | { ok: false; message: string } {
  const body = String(formData.get("body") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const font = String(formData.get("font") ?? "").trim();

  if (!body) return { ok: false, message: "Write a few words first." };
  if (body.length > 4000) return { ok: false, message: "Keep the note under 4,000 characters." };
  if (author.length > 80) return { ok: false, message: "Keep the author name short." };

  const value: PostInput = { body };
  if (author) value.author = author;
  if (isPostFont(font) && font !== "geist") value.font = font;
  return { ok: true, value };
}
