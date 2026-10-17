"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin, signIn, signOut } from "@/lib/auth";
import { parsePostForm, readPosts, writePosts } from "@/lib/store";
import type { Post } from "@/lib/posts";

export type FormState = { error?: string; ok?: boolean } | null;

async function requireAdmin(): Promise<FormState | null> {
  if (await isAdmin()) return null;
  return { error: "Sign in again." };
}

async function persist(posts: Post[]): Promise<FormState> {
  try {
    await writePosts(posts);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "The note could not be saved.",
    };
  }
  updateTag("posts");
  return null;
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const attempt = String(formData.get("password") ?? "");
  const signedIn = await signIn(attempt);
  if (!signedIn) return { error: "That password does not match." };
  redirect("/admin");
}

export async function logout() {
  await signOut();
  redirect("/admin");
}

export async function createPost(_prev: FormState, formData: FormData): Promise<FormState> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = parsePostForm(formData);
  if (!parsed.ok) return { error: parsed.message };

  const posts = await readPosts();
  const post: Post = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...parsed.value,
  };
  const failure = await persist([post, ...posts]);
  if (failure) return failure;
  return { ok: true };
}

export async function updatePost(_prev: FormState, formData: FormData): Promise<FormState> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const id = String(formData.get("id") ?? "");
  const parsed = parsePostForm(formData);
  if (!parsed.ok) return { error: parsed.message };

  const posts = await readPosts();
  const index = posts.findIndex((post) => post.id === id);
  if (index < 0) return { error: "That post is no longer on the feed." };

  const current = posts[index];
  posts[index] = {
    id: current.id,
    createdAt: current.createdAt,
    ...parsed.value,
  };
  const failure = await persist(posts);
  if (failure) return failure;
  return { ok: true };
}

export async function deletePost(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAdmin())) return { error: "Sign in again." };
  const id = String(formData.get("id") ?? "");
  const posts = await readPosts();
  const failure = await persist(posts.filter((post) => post.id !== id));
  if (failure) return failure;
  return { ok: true };
}
