import { Feed } from "@/components/feed";
import { getPosts } from "@/lib/get-posts";
import { shell, site } from "@/lib/site";

export default async function Page() {
  const posts = await getPosts();

  return (
    <main className={`${shell} flex-1`}>
      <section className="grid items-end gap-6 border-b border-line py-7 md:grid-cols-12 md:py-9">
        <h1 className="max-w-xl text-[clamp(2.35rem,4.6vw,3.35rem)] leading-[0.92] font-semibold tracking-[-0.045em] text-balance md:col-span-7">
          A LIFE IN MOTION.
        </h1>
        <div className="md:col-span-5">
          <p className="max-w-sm text-sm leading-6">{site.description}</p>
        </div>
      </section>
      <section id="feed" className="scroll-mt-20" aria-label="Feed">
        <Feed posts={posts} />
      </section>
    </main>
  );
}
