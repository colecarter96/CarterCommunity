import { cacheLife, cacheTag } from "next/cache";
import { readPosts } from "@/lib/store";
import type { Post } from "@/lib/posts";

export async function getPosts(): Promise<Post[]> {
  "use cache";
  cacheTag("posts");
  cacheLife("hours");
  return readPosts();
}
