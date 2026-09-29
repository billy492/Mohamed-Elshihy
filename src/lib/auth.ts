import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, fingerprint, verifySession } from "@/lib/session";
import { getStore } from "@/lib/store";

// The data-access guard for the review desk. proxy.ts already bounces signed-out
// visitors, but every desk page, action and route checks again here: the proxy
// is a convenience, not the lock.

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value);
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

/** True when this caller has used up `max` attempts in the current window. */
export async function overLimit(bucket: string, max: number, windowSec: number): Promise<boolean> {
  const ip = await clientIp();
  const slot = Math.floor(Date.now() / 1000 / windowSec);
  const count = await getStore().hit(`rl:${bucket}:${fingerprint(ip)}:${slot}`, windowSec);
  return count > max;
}
