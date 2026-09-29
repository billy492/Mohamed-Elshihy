"use client";

import { useRef } from "react";
import { useScrollVar } from "@/lib/useScrollVar";

// The motto at billboard size, driven by the scroll: two rows sliding in
// opposite directions, set in difference so they invert across whatever the
// band straddles.
export default function ScrollMarquee({ a, b }: { a: string; b: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollVar(ref, { start: "top bottom", end: "bottom top" });
  const row = (text: string, n = 4) =>
    Array.from({ length: n }, (_, i) => (
      <span key={i} className="smq-item">
        {text}
        <span className="smq-star">✱</span>
      </span>
    ));
  return (
    <div ref={ref} className="smq" aria-hidden="true">
      <div className="smq-row smq-a">{row(a)}</div>
      <div className="smq-row smq-b">{row(b)}</div>
    </div>
  );
}
