"use client";

import Link from "next/link";
import { useRef } from "react";
import BgVideo from "@/components/site/BgVideo";
import { useScrollVar } from "@/lib/useScrollVar";
import { films } from "@/content/media";

// The last word, over a sprint start: the two lines slide in from opposite
// sides as the section scrolls up, and the button leans toward the pointer.
export default function FinalCta() {
  const ref = useRef<HTMLElement>(null);
  useScrollVar(ref, { start: "top bottom", end: "center center" });
  return (
    <section ref={ref} className="fin" aria-labelledby="fin-title">
      <BgVideo film={films.sprintStart} className="fin-film" />
      <div className="fin-shade" aria-hidden="true" />
      <h2 id="fin-title" className="fin-title">
        <span className="fin-a">Stop guessing.</span>
        <span className="fin-b">Start fixing.</span>
      </h2>
      <div className="fin-foot">
        <p className="t-lede fin-text">
          Every athlete I coach starts with an application. I read every one myself.
        </p>
        <div className="actions">
          <Link className="btn btn-solid btn-xl" href="/apply" data-magnet data-cursor="Apply">
            <span className="btn-icon" aria-hidden="true" />
            Apply now
          </Link>
          <Link className="btn btn-ghost" href="/apply?track=mentorship">
            Apply for mentorship
          </Link>
        </div>
      </div>
    </section>
  );
}
