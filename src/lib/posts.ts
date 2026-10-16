export type Post = {
  id: string;
  createdAt: string;
  author?: string;
  font?: string;
  body: string;
};

export function byNewest(a: Post, b: Post) {
  const delta = Date.parse(b.createdAt) - Date.parse(a.createdAt);
  if (delta !== 0) return delta;
  return b.id.localeCompare(a.id);
}

export function sortPosts(posts: Post[]) {
  return [...posts].sort(byNewest);
}
