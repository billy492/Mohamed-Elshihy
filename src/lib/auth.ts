import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, fingerprint, verifySession } from "@/lib/session";
import { getStore } from "@/lib/store";

// The data-access guard for the review desk: every desk page, action and route
// checks here. (There is no proxy.ts gate: on Cloudflare a Node proxy bundles a
// second copy of the Next server into the Worker, over the free plan's size limit.)

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value);
}

/** `returnTo` is where to come back to after signing in (the link in the new-application email). */
export async function requireAdmin(returnTo?: string): Promise<void> {
  if (await isAdmin()) return;
  redirect(returnTo ? `/admin/login?next=${encodeURIComponent(returnTo)}` : "/admin/login");
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  // On Cloudflare, cf-connecting-ip is set by the edge and can't be spoofed by
  // the client (the first x-forwarded-for entry can).
  return h.get("cf-connecting-ip") || h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

/** True when this caller has used up `max` attempts in the current window. */
export async function overLimit(bucket: string, max: number, windowSec: number): Promise<boolean> {
  const ip = await clientIp();
  const slot = Math.floor(Date.now() / 1000 / windowSec);
  const count = await getStore().hit(`rl:${bucket}:${fingerprint(ip)}:${slot}`, windowSec);
  return count > max;
}
