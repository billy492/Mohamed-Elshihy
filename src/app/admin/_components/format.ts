// Formatting for the desk. Pure functions, safe on the server and the client.

const CAIRO = "Africa/Cairo";

function cairoParts(date: Date, options: Intl.DateTimeFormatOptions): Record<string, string> {
  const out: Record<string, string> = {};
  for (const p of new Intl.DateTimeFormat("en-US", { timeZone: CAIRO, ...options }).formatToParts(date)) {
    out[p.type] = p.value;
  }
  return out;
}

/** "Mon 28 Sep 2026, 14:02" in Cairo time. */
export function cairoDateTime(iso: string): string {
  const p = cairoParts(new Date(iso), {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  return `${p.weekday} ${p.day} ${p.month} ${p.year}, ${p.hour}:${p.minute}`;
}

/** "28 Sep 2026" in Cairo time. */
export function cairoDate(iso: string): string {
  const p = cairoParts(new Date(iso), { day: "numeric", month: "short", year: "numeric" });
  return `${p.day} ${p.month} ${p.year}`;
}

/** "2026-09-28 14:02" in Cairo time, for spreadsheets. */
export function cairoStamp(iso: string): string {
  const p = cairoParts(new Date(iso), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}`;
}

/** Today's date in Cairo as YYYY-MM-DD, for file names. */
export function cairoToday(): string {
  const p = cairoParts(new Date(), { year: "numeric", month: "2-digit", day: "2-digit" });
  return `${p.year}-${p.month}-${p.day}`;
}

/** "Just now", "12 min ago", "3h ago", "2d ago", "3w ago", then the date. CSS sets it in caps ("3H AGO"). */
export function ago(iso: string, now: number = Date.now()): string {
  const minutes = Math.floor(Math.max(0, now - Date.parse(iso)) / 60_000);
  if (minutes < 1) return "Just now";
  // "min", not "m": in capitals "6M AGO" reads as six months.
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 14) return `${days}d ago`;
  if (days < 56) return `${Math.floor(days / 7)}w ago`;
  return cairoDate(iso);
}

export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? "";

/**
 * International digits for wa.me. The form asks for the country code, but
 * Egyptian mobiles typed locally ("0100 123 4567") are common enough to fix:
 * they become 20 100 123 4567. A leading 00 is treated as "+".
 */
export function whatsappDigits(phone: string): string {
  const raw = phone.trim();
  const digits = raw.replace(/\D/g, "");
  if (raw.startsWith("+")) return digits;
  if (digits.startsWith("00")) return digits.slice(2);
  if (/^01[0125]\d{8}$/.test(digits)) return `20${digits.slice(1)}`;
  return digits;
}

export function whatsappHref(a: { phone: string; name: string; ref: string }): string {
  const text = `Hi ${firstName(a.name)}, this is Shihy. I've read your application (${a.ref}) and `;
  return `https://wa.me/${whatsappDigits(a.phone)}?text=${encodeURIComponent(text)}`;
}

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

export const mailHref = (email: string, ref: string) =>
  `mailto:${email}?subject=${encodeURIComponent(`Your application — ${ref}`)}`;

/** An Instagram handle or profile URL, as a link — or null when it isn't one. */
export function instagram(value: string | undefined): { handle: string; href: string } | null {
  const v = (value ?? "").trim();
  if (!v) return null;
  const fromUrl = v.match(/^(?:https?:\/\/)?(?:www\.)?instagram\.com\/([A-Za-z0-9._]{1,30})\/?(?:[?#].*)?$/i);
  const handle = fromUrl ? fromUrl[1] : v.replace(/^@/, "");
  if (!/^[A-Za-z0-9._]{1,30}$/.test(handle)) return null;
  return { handle: `@${handle}`, href: `https://www.instagram.com/${handle}/` };
}

/** Country name for the ISO code Vercel derives from the applicant's IP. */
export function countryName(code: string | undefined): string | null {
  if (!code) return null;
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

const ARABIC = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

/** Props for text the applicant wrote: right-to-left when it's Arabic, with the Arabic font. */
export function textProps(text: string | undefined): { dir: "auto"; lang?: string } {
  return text && ARABIC.test(text) ? { dir: "auto", lang: "ar" } : { dir: "auto" };
}

// Short forms for the list rows, where the full option labels are too long.
export const PATHWAY_SHORT: Record<string, string> = {
  online: "Online",
  hybrid: "Hybrid",
  performance: "Performance",
  unsure: "Not sure",
};

export const ROLE_SHORT: Record<string, string> = {
  sc: "S&C coach",
  "club-fitness": "Club fitness coach",
  pt: "Personal trainer",
  rehab: "Physio / rehab",
  student: "Student",
  other: "Other role",
};
