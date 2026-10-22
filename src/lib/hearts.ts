import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { get, put } from "@vercel/blob";

const filePath = path.join(process.cwd(), "data", "hearts.json");
const blobPath = "hearts.json";

function blobConfigured() {
  return Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);
}

function heartsFromUnknown(value: unknown): Record<string, string[]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const map: Record<string, string[]> = {};
  for (const [postId, visitors] of Object.entries(value)) {
    if (!Array.isArray(visitors)) continue;
    const ids = [...new Set(visitors.filter((id): id is string => typeof id === "string" && id.length > 0))];
    if (ids.length > 0) map[postId] = ids;
  }
  return map;
}

async function readFileHearts(): Promise<Record<string, string[]>> {
  try {
    const raw = await readFile(filePath, "utf8");
    return heartsFromUnknown(JSON.parse(raw));
  } catch {
    return {};
  }
}

async function readBlobHearts(): Promise<Record<string, string[]> | null> {
  const result = await get(blobPath, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200 || !result.stream) return null;
  const raw = await new Response(result.stream).text();
  return heartsFromUnknown(JSON.parse(raw));
}

async function writeBlobHearts(hearts: Record<string, string[]>) {
  await put(blobPath, `${JSON.stringify(hearts, null, 2)}\n`, {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function readHeartMap(): Promise<Record<string, string[]>> {
  if (!blobConfigured()) return readFileHearts();
  try {
    const stored = await readBlobHearts();
    if (stored !== null) return stored;
  } catch {
    // The store is not reachable yet.
  }
  return readFileHearts();
}

export async function writeHeartMap(hearts: Record<string, string[]>) {
  const sorted = heartsFromUnknown(hearts);
  if (blobConfigured()) {
    try {
      await readBlobHearts();
      await writeBlobHearts(sorted);
      return;
    } catch {
      throw new Error("The heart could not be saved.");
    }
  }
  if (process.env.VERCEL) throw new Error("The heart could not be saved.");
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(sorted, null, 2)}\n`, "utf8");
}
