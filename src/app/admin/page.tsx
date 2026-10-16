import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminEditor } from "@/components/admin-editor";
import { AdminLogin } from "@/components/admin-login";
import { adminConfigured, isAdmin } from "@/lib/auth";
import { readPosts } from "@/lib/store";
import { shell } from "@/lib/site";

export const metadata: Metadata = {
  title: "Edit · Carter Community",
  robots: { index: false, follow: false },
};

async function AdminDesk() {
  if (!adminConfigured()) {
    return (
      <div className="max-w-md py-16">
        <h1 className="text-3xl font-semibold tracking-[-0.04em]">Edit</h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          Add ADMIN_PASSWORD to .env.local, then restart the server.
        </p>
      </div>
    );
  }

  if (!(await isAdmin())) {
    return (
      <div className="py-16">
        <h1 className="text-3xl font-semibold tracking-[-0.04em]">Edit</h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted">
          Sign in to post on the feed.
        </p>
        <div className="mt-8">
          <AdminLogin />
        </div>
      </div>
    );
  }

  const posts = await readPosts();
  return (
    <div className="py-12">
      <AdminEditor posts={posts} />
    </div>
  );
}

export default function AdminPage() {
  return (
    <main className={`${shell} flex-1`}>
      <Suspense
        fallback={
          <p className="py-16 font-accent text-[10px] tracking-[0.16em] text-muted uppercase">
            Opening
          </p>
        }
      >
        <AdminDesk />
      </Suspense>
    </main>
  );
}
