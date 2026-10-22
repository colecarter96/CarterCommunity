import { Suspense } from "react";
import { FeedEntry } from "@/components/feed-entry";
import { getHeartMap } from "@/lib/get-hearts";
import { visitorId } from "@/lib/heart-visitor";
import type { Post } from "@/lib/posts";

function NoteList({
  posts,
  hearts,
  mine,
}: {
  posts: Post[];
  hearts: Record<string, string[]>;
  mine: string | null;
}) {
  return (
    <ol>
      {posts.map((post) => (
        <li key={post.id}>
          <FeedEntry
            post={post}
            heartCount={hearts[post.id]?.length ?? 0}
            hearted={Boolean(mine && hearts[post.id]?.includes(mine))}
          />
        </li>
      ))}
    </ol>
  );
}

async function HeartedNotes({ posts }: { posts: Post[] }) {
  const [hearts, mine] = await Promise.all([getHeartMap(), visitorId()]);
  return <NoteList posts={posts} hearts={hearts} mine={mine} />;
}

export function Feed({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return <p className="py-14 text-sm text-muted">Nothing posted yet.</p>;
  }

  return (
    <Suspense fallback={<NoteList posts={posts} hearts={{}} mine={null} />}>
      <HeartedNotes posts={posts} />
    </Suspense>
  );
}
