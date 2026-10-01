"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { overLimit, requireAdmin } from "@/lib/auth";
import { SESSION_COOKIE, SESSION_DAYS, deskConfigured, passwordMatches, signSession } from "@/lib/session";
import { getStore } from "@/lib/store";
import { sendTestAlert, type SendResult } from "@/lib/notify";
import { STATUSES, ids } from "@/lib/apply/options";
import type { Status } from "@/lib/apply/schema";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  if (!deskConfigured()) {
    return { error: "The desk isn't set up yet. Add ADMIN_PASSWORD and ADMIN_SESSION_SECRET to the environment." };
  }
  if (await overLimit("login", 8, 900)) return { error: "Too many attempts. Wait 15 minutes, then try again." };
  if (!passwordMatches(String(form.get("password") ?? ""))) return { error: "That password isn't right." };

  // Secure unless this request came over plain http, which only happens on a
  // local network (testing from a phone): browsers drop Secure cookies there.
  const proto = ((await headers()).get("x-forwarded-proto") ?? "").split(",")[0].trim();
  (await cookies()).set(SESSION_COOKIE, signSession()!, {
    httpOnly: true,
    secure: proto !== "http",
    sameSite: "lax",
    path: "/admin",
    maxAge: SESSION_DAYS * 86_400,
  });
  redirect(safeNext(form.get("next")));
}

/** Only ever send people back inside the desk: never to another site. */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return /^\/admin(\/[\w-]+)?(\?[\w=&%.+-]*)?$/.test(next) && !next.startsWith("/admin/login") ? next : "/admin";
}

export async function logout(): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, "", { path: "/admin", maxAge: 0 });
  redirect("/admin/login");
}

const STATUS_IDS = ids(STATUSES) as readonly string[];

export async function setStatus(id: string, status: Status): Promise<void> {
  await requireAdmin();
  if (typeof id !== "string" || !STATUS_IDS.includes(status)) return;
  await getStore().updateApplication(id, { status });
  revalidatePath("/admin", "layout");
}

export async function setStarred(id: string, starred: boolean): Promise<void> {
  await requireAdmin();
  if (typeof id !== "string" || typeof starred !== "boolean") return;
  await getStore().updateApplication(id, { starred });
  revalidatePath("/admin", "layout");
}

export async function saveNotes(id: string, notes: string): Promise<{ savedAt: string }> {
  await requireAdmin();
  if (typeof id !== "string" || typeof notes !== "string") throw new Error("Invalid notes.");
  await getStore().updateApplication(id, { deskNotes: notes.slice(0, 4000) });
  revalidatePath("/admin", "layout");
  return { savedAt: new Date().toISOString() };
}

export type AlertTestState = { result?: SendResult; at?: string };

/** Alerts page: send one test email and report exactly what Resend said. */
export async function testAlert(): Promise<AlertTestState> {
  await requireAdmin();
  try {
    if (await overLimit("alert-test", 5, 600)) {
      return { result: { ok: false, status: 429, reason: "Five tests in ten minutes is the limit. Wait a few minutes." } };
    }
  } catch {
    // no store to count in: send anyway (the desk is already behind the login)
  }
  return { result: await sendTestAlert(), at: new Date().toISOString() };
}

