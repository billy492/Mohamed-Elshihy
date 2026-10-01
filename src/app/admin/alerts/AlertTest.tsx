"use client";

import { useActionState } from "react";
import { testAlert, type AlertTestState } from "../actions";

/** What to do about Resend's most common refusals, in plain words. */
function hint(status: number, reason: string): string | null {
  if (/not verified/i.test(reason))
    return "Verify shihysc.com in Resend (Domains → Add Domain, then add its DNS records in Cloudflare), or remove NOTIFY_FROM for now.";
  if (/testing emails|own email address/i.test(reason))
    return "Until shihysc.com is verified in Resend, set NOTIFY_EMAIL to the email you signed up to Resend with.";
  if (status === 401 || /api key/i.test(reason)) return "Create a new API key in Resend and paste it into RESEND_API_KEY.";
  if (status === 422 && /from/i.test(reason)) return 'Set NOTIFY_FROM to exactly: Shihy Coaching <desk@shihysc.com>';
  if (status === 0 && /not set/i.test(reason)) return "Add RESEND_API_KEY and NOTIFY_EMAIL as secrets.";
  return null;
}

export default function AlertTest({ ready }: { ready: boolean }) {
  const [state, action, pending] = useActionState<AlertTestState, FormData>(testAlert, {});
  const r = state.result;

  return (
    <form action={action} style={{ display: "grid", gap: 14, justifyItems: "start" }}>
      <button type="submit" className="dk-btn dk-btn-solid" disabled={pending || !ready}>
        {pending ? "Sending…" : "Send test alert"}
      </button>
      {!ready && <p>Add RESEND_API_KEY and NOTIFY_EMAIL first.</p>}
      {r?.ok && (
        <div role="status" style={{ display: "grid", gap: 8 }}>
          <p style={{ color: "var(--dk-fg)" }}>
            Sent to {r.to.join(", ")} from {r.from}. Check the inbox (and spam, the first time).
          </p>
          {r.refusedFrom && (
            <p className="dk-alert">
              Resend refused {r.refusedFrom.from}: “{r.refusedFrom.reason}”. This one went from Resend&apos;s test
              sender instead, which only reaches your Resend sign-up email. Verify shihysc.com in Resend to send from
              your own address.
            </p>
          )}
        </div>
      )}
      {r && !r.ok && (
        <div className="dk-alert" role="alert" style={{ display: "grid", gap: 6 }}>
          <span>
            Not sent{r.status ? ` (Resend said ${r.status})` : ""}: “{r.reason}”
          </span>
          {hint(r.status, r.reason) && <strong>{hint(r.status, r.reason)}</strong>}
        </div>
      )}
    </form>
  );
}
