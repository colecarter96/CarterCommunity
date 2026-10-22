import { cookies } from "next/headers";

const cookieName = "carter_heart";

function isVisitorId(value: string | undefined): value is string {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value));
}

export async function visitorId(): Promise<string | null> {
  const jar = await cookies();
  const value = jar.get(cookieName)?.value;
  return isVisitorId(value) ? value : null;
}

export async function ensureVisitorId(): Promise<string> {
  const existing = await visitorId();
  if (existing) return existing;
  const id = crypto.randomUUID();
  const jar = await cookies();
  jar.set(cookieName, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return id;
}
