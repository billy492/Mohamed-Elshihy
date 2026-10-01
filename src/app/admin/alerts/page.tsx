import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { alertConfig } from "@/lib/notify";
import DeskNav from "../_components/DeskNav";
import AlertTest from "./AlertTest";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Alerts — Desk" } };

/** Where new-application emails go, and a button that proves it works. */
export default async function AlertsPage() {
  await requireAdmin("/admin/alerts");
  const { key, to, from } = alertConfig();

  return (
    <>
      <DeskNav section="alerts" />
      <main id="main" className="dk-page">
        <header className="dk-head">
          <div className="dk-head-top">
            <h1 className="dk-title">Alerts</h1>
          </div>
          <p className="dk-summary">
            <span>An email for every new application, through Resend.</span>
          </p>
        </header>

        <section className="dk-empty" aria-labelledby="dk-alerts-h">
          <h2 id="dk-alerts-h" className="dk-field-label">
            Settings
          </h2>
          <ul className="dk-steps" style={{ listStyle: "none", paddingLeft: 0 }}>
            <li>
              <strong>RESEND_API_KEY</strong>: {key ? "set" : "missing"}
            </li>
            <li>
              <strong>NOTIFY_EMAIL</strong>: {to.length ? to.join(", ") : "missing"}
            </li>
            <li>
              <strong>NOTIFY_FROM</strong>:{" "}
              {from ?? "not set (Resend's test sender, which only delivers to your Resend sign-up email)"}
            </li>
          </ul>
          <p>
            Change these in Cloudflare: Workers &amp; Pages → shihy-coaching → Settings → Variables and Secrets. They
            apply within seconds; reload this page to see them.
          </p>
          <AlertTest ready={key && to.length > 0} />
        </section>
      </main>
    </>
  );
}
