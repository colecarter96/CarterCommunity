"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin, signIn, signOut } from "@/lib/auth";
import { readEmails, writeEmails } from "@/lib/emails";
import { ensureVisitorId } from "@/lib/heart-visitor";
import { readHeartMap, writeHeartMap } from "@/lib/hearts";
import { parsePostForm, readPosts, writePosts } from "@/lib/store";
import type { Post } from "@/lib/posts";

export type FormState = { error?: string; ok?: boolean } | null;
export type SubscribeState = { error?: string; ok?: boolean } | null;
export type HeartState = { count: number; hearted: boolean } | { error: string };

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

export async function subscribe(_prev: SubscribeState, formData: FormData): Promise<SubscribeState> {
  if (String(formData.get("company") ?? "").trim()) return { ok: true };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return { error: "That email doesn't look right." };
  }

  const list = await readEmails();
  if (list.some((item) => item.email === email)) return { ok: true };

  try {
    await writeEmails([{ email, createdAt: new Date().toISOString() }, ...list]);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "That email could not be saved.",
    };
  }
  revalidatePath("/admin");
  return { ok: true };
}

export async function removeEmail(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAdmin())) return { error: "Sign in again." };
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const list = await readEmails();
  try {
    await writeEmails(list.filter((item) => item.email !== email));
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "That address could not be removed.",
    };
  }
  revalidatePath("/admin");
  return { ok: true };
}

export async function toggleHeart(postId: string): Promise<HeartState> {
  if (!/^[0-9a-f-]{36}$/i.test(postId)) return { error: "That note is gone." };
  const posts = await readPosts();
  if (!posts.some((post) => post.id === postId)) return { error: "That note is gone." };

  const mine = await ensureVisitorId();
  const hearts = await readHeartMap();
  const visitors = new Set(hearts[postId] ?? []);
  const hearted = !visitors.has(mine);
  if (hearted) visitors.add(mine);
  else visitors.delete(mine);

  if (visitors.size > 0) hearts[postId] = [...visitors];
  else delete hearts[postId];

  try {
    await writeHeartMap(hearts);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "The heart could not be saved.",
    };
  }
  updateTag("hearts");
  revalidatePath("/");
  return { count: visitors.size, hearted };
}
