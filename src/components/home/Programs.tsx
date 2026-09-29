"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import Split from "@/components/site/Split";
import { programs } from "@/content/programs";

// Program cards with a real 3D tilt: each card leans toward the pointer and a
// sheen follows it across the surface. Phones scroll the row sideways.
export default function Programs() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current!;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    const cards = Array.from(grid.querySelectorAll<HTMLElement>(".prg-card"));
    const handlers = cards.map((card) => {
      const move = (e: PointerEvent) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--rx", `${(0.5 - py) * 14}deg`);
        card.style.setProperty("--ry", `${(px - 0.5) * 18}deg`);
        card.style.setProperty("--mx", `${px * 100}%`);
        card.style.setProperty("--my", `${py * 100}%`);
      };
      const leave = () => {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      };
      card.addEventListener("pointermove", move);
      card.addEventListener("pointerleave", leave);
      return () => {
        card.removeEventListener("pointermove", move);
        card.removeEventListener("pointerleave", leave);
      };
    });
    return () => handlers.forEach((h) => h());
  }, []);

  return (
    <section className="prg" aria-labelledby="prg-title">
      <header className="prg-head">
        <Split as="h2" id="prg-title" className="t-h1" text="Train on your own. The right way." lines={["Train on your own.", "The right way."]} />
        <p className="t-lede prg-lede">
          Not ready for one-to-one coaching? These are the programs I&apos;d write for the most common problems. Ready
          when you are.
        </p>
      </header>
      <div ref={gridRef} className="prg-grid">
        {programs.map((p, i) => (
          <article key={p.slug} className="prg-card" style={{ "--i": i } as React.CSSProperties}>
            <div className="prg-inner">
              <span className="prg-sheen" aria-hidden="true" />
              <div className="prg-weeks">
                <b>{String(p.weeks).padStart(2, "0")}</b>
                <span>Weeks</span>
              </div>
              <h3 className="prg-name">{p.name}</h3>
              <p className="prg-focus">{p.focus}</p>
              <dl className="prg-meta">
                <div>
                  <dt>Sessions</dt>
                  <dd>{p.perWeek} a week</dd>
                </div>
                <div>
                  <dt>Level</dt>
                  <dd>{p.level}</dd>
                </div>
                <div>
                  <dt>For</dt>
                  <dd>{p.forWho}</dd>
                </div>
              </dl>
              <Link className="prg-cta" href={`/programs#${p.slug}`} data-cursor="Join">
                {p.checkout ? "Get the program" : "Join the waitlist"}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
