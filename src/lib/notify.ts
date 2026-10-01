import "server-only";
import type { Application } from "@/lib/apply/schema";
import { GAPS, GOALS, LEVELS, PATHWAYS, labelOf } from "@/lib/apply/options";
import { site } from "@/content/site";

// Optional email alert for each new application, through Resend's REST API.
// Set RESEND_API_KEY and NOTIFY_EMAIL (one address, or several separated by
// commas) to turn it on; NOTIFY_FROM once a domain is verified in Resend.
// Without them this does nothing, and the application still lands in the desk.
// The desk's Alerts page (/admin/alerts) sends a test and shows Resend's answer.

/** Resend's shared sender: works without a verified domain, but only to the Resend account's own email. */
const FALLBACK_FROM = "Shihy Coaching <onboarding@resend.dev>";

export type AlertConfig = { key: boolean; to: string[]; from: string | null };

export function alertConfig(): AlertConfig {
  const to = (process.env.NOTIFY_EMAIL ?? "")
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter((s) => s.includes("@"));
  return { key: Boolean(process.env.RESEND_API_KEY), to, from: process.env.NOTIFY_FROM?.trim() || null };
}

export type SendResult =
  | { ok: true; to: string[]; from: string; refusedFrom?: { from: string; reason: string } }
  | { ok: false; status: number; reason: string };

type Attempt = { ok: true } | { ok: false; status: number; reason: string };

async function post(key: string, from: string, to: string[], subject: string, text: string): Promise<Attempt> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, text }),
    });
    if (res.ok) return { ok: true };
    const body = await res.text().catch(() => "");
    let reason = body;
    try {
      reason = (JSON.parse(body) as { message?: string }).message ?? body;
    } catch {
      // not JSON: keep the raw text
    }
    return { ok: false, status: res.status, reason: reason || res.statusText };
  } catch (error) {
    return { ok: false, status: 0, reason: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Sends one alert. If Resend refuses NOTIFY_FROM (usually: the domain isn't
 * verified yet), it retries once from Resend's shared sender, so alerts keep
 * arriving while the domain is being set up.
 */
async function send(subject: string, text: string): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  const { to, from } = alertConfig();
  if (!key || to.length === 0) {
    return { ok: false, status: 0, reason: "RESEND_API_KEY or NOTIFY_EMAIL is not set." };
  }

  const first = await post(key, from ?? FALLBACK_FROM, to, subject, text);
  if (first.ok) return { ok: true, to, from: from ?? FALLBACK_FROM };
  if (!from || (first.status !== 403 && first.status !== 422)) return first;

  console.error("notify: Resend refused NOTIFY_FROM, retrying from its shared sender:", first.status, first.reason);
  const second = await post(key, FALLBACK_FROM, to, subject, text);
  if (second.ok) return { ok: true, to, from: FALLBACK_FROM, refusedFrom: { from, reason: first.reason } };
  return second;
}

export async function notifyNewApplication(a: Application): Promise<void> {
  if (!process.env.RESEND_API_KEY || alertConfig().to.length === 0) return;

  const what =
    a.track === "coaching"
      ? `${labelOf(PATHWAYS, a.pathway)} · ${a.sport}, ${labelOf(LEVELS, a.level)}`
      : "Mentorship";
  const focus =
    a.track === "coaching"
      ? a.goals.map((g) => labelOf(GOALS, g)).join(", ")
      : a.gaps.map((g) => labelOf(GAPS, g)).join(", ");
  const link = `${site.url.replace(/\/$/, "")}/admin/${a.id}`;

  const text = [
    `${a.name} applied for ${what}.`,
    "",
    `The problem, in their words:`,
    a.problem,
    "",
    `Focus: ${focus}`,
    `Location: ${a.location}`,
    `Reference: ${a.ref}`,
    "",
    `Review it: ${link}`,
  ].join("\n");

  const result = await send(
    `New application: ${a.name} (${a.track === "coaching" ? labelOf(PATHWAYS, a.pathway) : "Mentorship"})`,
    text,
  );
  if (!result.ok) console.error("notify: Resend returned", result.status, result.reason);
}

/** The desk's "Send test alert" button. */
export async function sendTestAlert(): Promise<SendResult> {
  const desk = `${site.url.replace(/\/$/, "")}/admin`;
  return send(
    "Test alert from the Shihy desk",
    [
      "This is a test from the Alerts page of the review desk.",
      "If you're reading it, new applications will be emailed here too.",
      "",
      `Desk: ${desk}`,
    ].join("\n"),
  );
}
