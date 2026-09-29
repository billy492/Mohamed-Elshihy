"use server";

import { overLimit } from "@/lib/auth";
import { newId } from "@/lib/ids";
import { fieldErrors, waitlistSchema } from "@/lib/apply/schema";
import { getStore } from "@/lib/store";
import { programs } from "@/content/programs";

export type WaitlistState = { ok?: boolean; error?: string; program?: string };

export async function joinWaitlist(_prev: WaitlistState, form: FormData): Promise<WaitlistState> {
  const program = String(form.get("program") ?? "");
  if (form.get("company")) return { ok: true, program }; // honeypot
  const parsed = waitlistSchema.safeParse({ email: form.get("email"), program });
  if (!parsed.success) return { error: Object.values(fieldErrors(parsed.error))[0], program };
  if (!programs.some((p) => p.slug === parsed.data.program)) return { error: "Choose a program.", program };
  try {
    if (await overLimit("waitlist", 10, 3600)) return { error: "Too many sign-ups from this connection. Try again later.", program };
    await getStore().addWaitlist({ ...parsed.data, id: newId(), createdAt: new Date().toISOString() });
    return { ok: true, program };
  } catch (error) {
    console.error("joinWaitlist failed", error);
    return { error: "That didn't go through. Try again in a minute.", program };
  }
}
