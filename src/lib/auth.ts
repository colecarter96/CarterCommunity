import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const cookieName = "carter_admin";

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function password() {
  return process.env.ADMIN_PASSWORD ?? "";
}

function sessionToken() {
  return createHmac("sha256", password()).update("carter-admin-session").digest("hex");
}

function sameSecret(left: string, right: string) {
  return timingSafeEqual(createHash("sha256").update(left).digest(), createHash("sha256").update(right).digest());
}

export async function isAdmin() {
  if (!adminConfigured()) return false;
  const jar = await cookies();
  const value = jar.get(cookieName)?.value;
  const expected = sessionToken();
  if (!value || value.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}

export async function signIn(attempt: string) {
  if (!adminConfigured() || !sameSecret(attempt, password())) return false;
  const jar = await cookies();
  jar.set(cookieName, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return true;
}

export async function signOut() {
  const jar = await cookies();
  jar.delete(cookieName);
}
