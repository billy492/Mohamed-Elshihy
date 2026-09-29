"use server";

import { headers } from "next/headers";
import { after } from "next/server";
import { applicationSchema, fieldErrors, type Application } from "@/lib/apply/schema";
import { overLimit } from "@/lib/auth";
import { newId, newRef } from "@/lib/ids";
import { notifyNewApplication } from "@/lib/notify";
import { getStore } from "@/lib/store";

export type SubmitResult =
  | { ok: true; ref: string; firstName: string }
  | { ok: false; errors?: Record<string, string>; message?: string };

const FAILED =
  "Your application couldn't be saved just now. Try again in a minute, or message Shihy on Instagram.";

export async function submitApplication(
  answers: unknown,
  meta: { startedAt: number; company?: string },
): Promise<SubmitResult> {
  // Bots fill the invisible "company" field, or finish a six-step form in a
  // couple of seconds. They get a convincing success and nothing is stored.
  const tooFast = Number.isFinite(meta.startedAt) && Date.now() - meta.startedAt < 4000;
  if (meta.company || tooFast) return { ok: true, ref: newRef(), firstName: "" };

  const parsed = applicationSchema.safeParse(answers);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  try {
    if (await overLimit("apply", 5, 3600)) {
      return { ok: false, message: "Too many applications from this connection. Try again in an hour." };
    }
    const now = new Date().toISOString();
    const country = (await headers()).get("x-vercel-ip-country") ?? undefined;
    const application: Application = {
      ...parsed.data,
      id: newId(),
      ref: newRef(),
      createdAt: now,
      updatedAt: now,
      status: "new",
      starred: false,
      deskNotes: "",
      country,
    };
    await getStore().createApplication(application);
    after(() => notifyNewApplication(application).catch((e) => console.error("notify failed", e)));
    return { ok: true, ref: application.ref, firstName: application.name.split(/\s+/)[0] };
  } catch (error) {
    console.error("submitApplication failed", error);
    return { ok: false, message: FAILED };
  }
}
