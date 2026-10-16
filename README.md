# Carter Community

A single-page feed. Post short notes and links from the edit page.

## Develop

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Posting

The edit page is at [/admin](http://localhost:3000/admin). Sign in with `ADMIN_PASSWORD` from `.env.local`.

A post can be text only. Add an author name if you want one. Place a link in the sentence from the editor, or write `[words](https://...)`. Every link in the note is listed again at the bottom with an arrow.

Posts are saved in `data/posts.json`. YouTube, TikTok, Substack, and the join link live in `src/lib/site.ts`. Leave a string empty until the real URL exists.
