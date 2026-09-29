"use client";

import { useRef } from "react";
import BgVideo from "@/components/site/BgVideo";
import { useScrollVar } from "@/lib/useScrollVar";
import { films } from "@/content/media";

// A film in a small window between two halves of a headline. Scroll opens the
// window to full screen and pushes the headline apart, then the manifesto
// develops word by word over the footage, like a print in the tray.
const MANIFESTO =
  "Most programs guess. I don't. I test you, find the one thing holding you back, and build everything around fixing it. Then I test again.";

export default function Statement() {
  const ref = useRef<HTMLElement>(null);
  const wordsRef = useRef<HTMLParagraphElement>(null);
  const words = MANIFESTO.split(" ");

  useScrollVar(ref, {
    start: "top top",
    end: "bottom bottom",
    onProgress: (p) => {
      const spans = wordsRef.current?.children;
      if (!spans) return;
      const lit = Math.floor(((p - 0.48) / 0.4) * spans.length);
      for (let i = 0; i < spans.length; i++) spans[i].classList.toggle("on", i < lit);
    },
  });

  return (
    <section ref={ref} className="stmt" aria-labelledby="stmt-title">
      <div className="stmt-stick">
        <div className="stmt-film">
          <BgVideo film={films.nightPitch} />
          <div className="stmt-shade" aria-hidden="true" />
        </div>
        <h2 id="stmt-title" className="stmt-title">
          <span className="stmt-a">High performance</span>
          <span className="stmt-b">is complex.</span>
        </h2>
        <p ref={wordsRef} className="stmt-words" aria-label={MANIFESTO}>
          {words.map((w, i) => (
            <span key={i} className={/guess|don't|fixing/i.test(w) ? "sw sw-hit" : "sw"} aria-hidden="true">
              {w}{" "}
            </span>
          ))}
        </p>
        <span className="stmt-rec" aria-hidden="true">
          <span className="stmt-rec-dot" /> Rec
        </span>
      </div>
    </section>
  );
}
