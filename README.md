# Carter Community

A single-page feed. Post short notes and links from the edit page.

## Develop

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Posting

The edit page is at [/admin](http://localhost:3000/admin). Sign in with `ADMIN_PASSWORD`. Locally that lives in `.env.local`. On the deployed site, set it in the project’s environment variables.

A post can be text only. Add an author name if you want one. Place a link in the sentence from the editor, or write `[words](https://...)`. Every link in the note is listed again at the bottom with an arrow.

On this computer, posts are saved in `data/posts.json`. On Vercel they are saved in a private Blob store. Create that store, connect it to the project, and redeploy. YouTube, TikTok, Substack, and the join link live in `src/lib/site.ts`. Leave a string empty until the real URL exists. The Discord invite is `discordUrl` in that same file.
