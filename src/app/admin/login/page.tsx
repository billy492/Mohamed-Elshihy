import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { deskConfigured } from "@/lib/session";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Log in — Desk" } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await isAdmin()) redirect("/admin");
  const ready = deskConfigured();

  return (
    <main id="main" className="dk-gate">
      <div className="dk-gate-inner">
        <p className="dk-gate-kicker">Private · applications and waitlist</p>
        <h1 className="dk-gate-title">
          Shihy —<br />
          The desk
        </h1>
        {ready ? <LoginForm next={typeof next === "string" ? next : ""} /> : <Setup />}
      </div>
    </main>
  );
}

function Setup() {
  return (
    <section className="dk-setup" aria-labelledby="dk-setup-h">
      <h2 id="dk-setup-h" className="dk-h">
        Not set up yet
      </h2>
      <p>The desk needs two environment variables before it can open:</p>
      <ol className="dk-steps">
        <li>
          <code>ADMIN_PASSWORD</code> — the password you&apos;ll type here.
        </li>
        <li>
          <code>ADMIN_SESSION_SECRET</code> — a random string of at least 32 characters. Make one with{" "}
          <code>openssl rand -base64 48</code>.
        </li>
      </ol>
      <p>
        On your computer, put both in <code>.env.local</code> and restart the dev server. On Vercel, add them under
        Project → Settings → Environment Variables, then redeploy. Changing either one later signs everyone out.
      </p>
    </section>
  );
}
