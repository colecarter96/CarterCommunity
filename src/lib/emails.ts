import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { get, put } from "@vercel/blob";
import type { Subscriber } from "@/lib/subscribers";

const filePath = path.join(process.cwd(), "data", "emails.json");
const blobPath = "emails.json";
const saveError =
  "That email could not be saved. In Vercel, create a private Blob store, connect it to this project, and redeploy.";

function blobConfigured() {
  return Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);
}

function subscribersFromUnknown(value: unknown): Subscriber[] {
  if (!Array.isArray(value)) return [];
  return value
    .flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const record = item as Subscriber;
      if (typeof record.email !== "string" || typeof record.createdAt !== "string") return [];
      const email = record.email.trim().toLowerCase();
      if (!email) return [];
      return [{ email, createdAt: record.createdAt }];
    })
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

async function readFileEmails(): Promise<Subscriber[]> {
  try {
    const raw = await readFile(filePath, "utf8");
    return subscribersFromUnknown(JSON.parse(raw));
  } catch {
    return [];
  }
}

async function readBlobEmails(): Promise<Subscriber[] | null> {
  const result = await get(blobPath, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200 || !result.stream) return null;
  const raw = await new Response(result.stream).text();
  return subscribersFromUnknown(JSON.parse(raw));
}

async function writeBlobEmails(subscribers: Subscriber[]) {
  await put(blobPath, `${JSON.stringify(subscribers, null, 2)}\n`, {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function readEmails(): Promise<Subscriber[]> {
  if (!blobConfigured()) return readFileEmails();
  try {
    const stored = await readBlobEmails();
    if (stored !== null) return stored;
  } catch {
    // The store is not reachable yet.
  }
  return readFileEmails();
}

export async function writeEmails(subscribers: Subscriber[]) {
  const sorted = subscribersFromUnknown(subscribers);
  if (blobConfigured()) {
    try {
      await readBlobEmails();
      await writeBlobEmails(sorted);
      return;
    } catch {
      throw new Error(saveError);
    }
  }
  if (process.env.VERCEL) throw new Error(saveError);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(sorted, null, 2)}\n`, "utf8");
}
