import { createHash, createHmac, timingSafeEqual } from "node:crypto";

// Signed session tokens for the review desk. Deliberately free of Next imports
// so proxy.ts can use it too (Proxy runs on the Node runtime in Next 16).
//
// A token is `v1.<expiry>.<hmac>`. The HMAC key mixes ADMIN_SESSION_SECRET with
// a hash of ADMIN_PASSWORD, so changing either one signs everybody out.

export const SESSION_COOKIE = "shihy_desk";
export const SESSION_DAYS = 14;

function key(): Buffer | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const password = process.env.ADMIN_PASSWORD;
  if (!secret || secret.length < 32 || !password) return null;
  return createHash("sha256").update(secret).update("\0").update(password).digest();
}

export function deskConfigured(): boolean {
  return key() !== null;
}

export function signSession(now = Date.now()): string | null {
  const k = key();
  if (!k) return null;
  const payload = `v1.${now + SESSION_DAYS * 86_400_000}`;
  return `${payload}.${createHmac("sha256", k).update(payload).digest("base64url")}`;
}

export function verifySession(token: string | undefined | null, now = Date.now()): boolean {
  const k = key();
  if (!k || !token) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return false;
  const expires = Number(parts[1]);
  if (!Number.isFinite(expires) || expires < now) return false;
  const expected = createHmac("sha256", k).update(`v1.${parts[1]}`).digest();
  const given = Buffer.from(parts[2], "base64url");
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export function passwordMatches(input: string): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  // Hash both sides first so the comparison is constant-time whatever the lengths.
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(password).digest();
  return timingSafeEqual(a, b);
}

/** A short, salted fingerprint of an IP address, so rate limits never store raw IPs. */
export function fingerprint(value: string): string {
  const salt = process.env.ADMIN_SESSION_SECRET ?? "shihy";
  return createHash("sha256").update(salt).update(value).digest("base64url").slice(0, 16);
}
