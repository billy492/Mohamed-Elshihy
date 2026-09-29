"use client";

import Link from "next/link";
import { useRef } from "react";
import BgVideo from "@/components/site/BgVideo";
import { useScrollVar } from "@/lib/useScrollVar";
import { films } from "@/content/media";
import { site } from "@/content/site";

// The last word, from the brochure: ready to start? The two lines slide in
// from opposite sides as the section scrolls up.
export default function FinalCta() {
  const ref = useRef<HTMLElement>(null);
  useScrollVar(ref, { start: "top bottom", end: "center center" });
  return (
    <section ref={ref} className="fin" aria-labelledby="fin-title">
      <BgVideo film={films.sprintStart} className="fin-film" />
      <div className="fin-shade" aria-hidden="true" />
      <h2 id="fin-title" className="fin-title">
        <span className="fin-a">Ready</span>
        <span className="fin-b">to start?</span>
      </h2>
      <div className="fin-foot">
        <p className="t-lede fin-text">
          Every client begins with a comprehensive consultation. Apply here, or DM {site.social.instagram.handle} to
          book yours.
        </p>
        <div className="actions">
          <Link className="btn btn-solid btn-xl" href="/apply" data-magnet data-cursor="Apply">
            <span className="btn-icon" aria-hidden="true" />
            Apply for coaching
          </Link>
          <a className="btn btn-ghost" href={site.social.instagram.href} target="_blank" rel="noopener">
            DM {site.social.instagram.handle}
          </a>
        </div>
      </div>
    </section>
  );
}
