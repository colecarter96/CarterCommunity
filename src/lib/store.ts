import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { get, put } from "@vercel/blob";
import bundledPosts from "../../data/posts.json";
import { isPostFont } from "@/lib/fonts";
import { isHttpUrl } from "@/lib/format";
import { sortPosts, type Post } from "@/lib/posts";

const filePath = path.join(process.cwd(), "data", "posts.json");
const blobPath = "posts.json";
const saveError =
  "This note could not be saved. In Vercel, create a private Blob store, connect it to this project, and redeploy.";

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

function postsFromUnknown(value: unknown): Post[] {
  if (!Array.isArray(value)) return [];
  return sortPosts(
    value.flatMap((item) => {
      const post = normalizePost(item);
      return post ? [post] : [];
    }),
  );
}

function blobConfigured() {
  return Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);
}

async function readFilePosts(): Promise<Post[]> {
  try {
    const raw = await readFile(filePath, "utf8");
    return postsFromUnknown(JSON.parse(raw));
  } catch {
    return postsFromUnknown(bundledPosts);
  }
}

/** Null means the store is connected and this file has not been created yet. */
async function readBlobPosts(): Promise<Post[] | null> {
  const result = await get(blobPath, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200 || !result.stream) return null;
  const raw = await new Response(result.stream).text();
  return postsFromUnknown(JSON.parse(raw));
}

async function writeBlobPosts(posts: Post[]) {
  await put(blobPath, `${JSON.stringify(posts, null, 2)}\n`, {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function readPosts(): Promise<Post[]> {
  if (!blobConfigured()) return readFilePosts();
  try {
    const stored = await readBlobPosts();
    if (stored !== null) return stored;
  } catch {
    // The store is not reachable yet. Show the notes shipped with this deploy.
  }
  return readFilePosts();
}

export async function writePosts(posts: Post[]) {
  const sorted = sortPosts(posts);
  if (blobConfigured()) {
    try {
      await readBlobPosts();
      await writeBlobPosts(sorted);
      return;
    } catch {
      throw new Error(saveError);
    }
  }
  if (process.env.VERCEL) throw new Error(saveError);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(sorted, null, 2)}\n`, "utf8");
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
