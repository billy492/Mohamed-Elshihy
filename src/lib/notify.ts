import "server-only";
import type { Application } from "@/lib/apply/schema";
import { GAPS, GOALS, LEVELS, PATHWAYS, labelOf } from "@/lib/apply/options";
import { site } from "@/content/site";

// Optional email alert for each new application, through Resend's REST API.
// Set RESEND_API_KEY and NOTIFY_EMAIL to turn it on; NOTIFY_FROM once a domain
// is verified in Resend. Without them this does nothing, and the application
// still lands in the desk.

export async function notifyNewApplication(a: Application): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!key || !to) return;

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

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.NOTIFY_FROM ?? "Shihy Coaching <onboarding@resend.dev>",
      to: [to],
      subject: `New application: ${a.name} (${a.track === "coaching" ? labelOf(PATHWAYS, a.pathway) : "Mentorship"})`,
      text,
    }),
  });
  if (!res.ok) console.error("notify: Resend returned", res.status, await res.text().catch(() => ""));
}
