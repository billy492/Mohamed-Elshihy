import { Fragment } from "react";
import { STATUSES, labelOf } from "@/lib/apply/options";
import type { Status } from "@/lib/apply/schema";

// Small presentational pieces with no state: usable from server and client components.

export function StatusPill({ status }: { status: Status }) {
  return (
    <span className="dk-pill" data-status={status}>
      {labelOf(STATUSES, status)}
    </span>
  );
}

/** Commitment 1–10 as ten bars. */
export function Meter({ value, max = 10 }: { value: number; max?: number }) {
  return (
    <span className="dk-meter" role="img" aria-label={`Commitment ${value} of ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < value ? "dk-bar dk-bar-on" : "dk-bar"} />
      ))}
    </span>
  );
}

// Applicant text with web addresses made clickable. Only http(s) links are
// ever produced, whatever the applicant typed.
const URL_PART = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/i;

function safeHref(raw: string): string | null {
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

export function Linkify({ text }: { text: string }) {
  const parts = text.split(URL_PART);
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>;
        const [, url, tail] = part.match(/^(.*?)([.,;:!?)\]]*)$/) ?? [part, part, ""];
        const href = safeHref(url);
        return (
          <Fragment key={i}>
            {href ? (
              <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="dk-link">
                {url}
              </a>
            ) : (
              url
            )}
            {tail}
          </Fragment>
        );
      })}
    </>
  );
}

/** Shown instead of the desk when no application store is configured (hosted without Upstash). */
export function StoreMissing() {
  return (
    <main id="main" className="dk-page">
      <section className="dk-empty" aria-labelledby="dk-store-h">
        <h1 id="dk-store-h" className="dk-empty-title">
          Storage isn&apos;t connected
        </h1>
        <p>
          Applications are saved in Upstash Redis in production. Until it&apos;s connected, the form can&apos;t save
          anything and there is nothing to review.
        </p>
        <ol className="dk-steps">
          <li>
            Create a free Redis database at <strong>console.upstash.com</strong> and copy its REST URL and token.
          </li>
          <li>
            In Cloudflare, open <strong>Workers &amp; Pages → shihy-coaching → Settings → Variables and Secrets</strong>{" "}
            and add them as secrets named <code>UPSTASH_REDIS_REST_URL</code> and{" "}
            <code>UPSTASH_REDIS_REST_TOKEN</code>. (<code>KV_REST_API_URL</code> / <code>KV_REST_API_TOKEN</code>{" "}
            work too.)
          </li>
          <li>Redeploy, then reload this page.</li>
        </ol>
        <p>Locally nothing is needed: applications go to a file in .data/.</p>
      </section>
    </main>
  );
}
