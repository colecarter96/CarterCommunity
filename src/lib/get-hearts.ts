import { cacheLife, cacheTag } from "next/cache";
import { readHeartMap } from "@/lib/hearts";

export async function getHeartMap(): Promise<Record<string, string[]>> {
  "use cache";
  cacheTag("hearts");
  cacheLife("hours");
  return readHeartMap();
}
