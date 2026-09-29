"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { registerGsap, ScrollTrigger } from "@/lib/gsap";
import BgVideo from "@/components/site/BgVideo";
import Split from "@/components/site/Split";
import { pathways, pricingNote } from "@/content/coaching";

// Three full-screen cards that stack as you scroll: each new pathway slides up
// over the last, which sinks back and darkens underneath it.
export default function Pathways() {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsap();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cards = Array.from(listRef.current!.querySelectorAll<HTMLElement>(".pth-card"));
    const triggers = cards.slice(0, -1).map((card, i) =>
      ScrollTrigger.create({
        trigger: cards[i + 1],
        start: "top bottom",
        end: "top top",
        onUpdate: (self) => card.style.setProperty("--cover", self.progress.toFixed(4)),
      }),
    );
    const reveals = cards.map((card) =>
      ScrollTrigger.create({
        trigger: card,
        start: "top 70%",
        onEnter: () => card.classList.add("is-in"),
        onLeaveBack: () => card.classList.remove("is-in"),
      }),
    );
    return () => [...triggers, ...reveals].forEach((t) => t.kill());
  }, []);

  return (
    <section id="pathways" className="pth" aria-labelledby="pth-title">
      <header className="pth-head">
        <Split as="h2" id="pth-title" className="t-h1" text="Choose your pathway" lines={["Choose your", "pathway"]} />
        <p className="pth-note">{pricingNote}</p>
      </header>
      <div ref={listRef} className="pth-list">
        {pathways.map((p, i) => (
          <article
            key={p.id}
            className="pth-card"
            style={{ "--i": i, "--len": p.short.length } as React.CSSProperties}
            aria-labelledby={`pth-${p.id}`}
          >
            <BgVideo film={p.film} className="pth-film" />
            <div className="pth-shade" aria-hidden="true" />
            <div className="pth-body">
              <div className="pth-top">
                <span className="tag">
                  <b>0{i + 1}</b> Pathway
                </span>
                <span className="tag tag-ghost">{p.inPersonLabel}</span>
              </div>
              <h3 id={`pth-${p.id}`} className="pth-name">
                {p.short}
              </h3>
              <p className="pth-punch">{p.punch}</p>
              <div className="pth-grid">
                <dl className="pth-dl">
                  <div>
                    <dt>For</dt>
                    <dd>{p.who}</dd>
                  </div>
                  <div>
                    <dt>How it works</dt>
                    <dd>{p.how}</dd>
                  </div>
                </dl>
                <ul className="pth-list-inc">
                  {p.includes.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
              <div className="pth-meter" style={{ "--v": p.inPerson } as React.CSSProperties}>
                <span>Remote</span>
                <span className="pth-bar" aria-hidden="true">
                  <i />
                </span>
                <span>In person</span>
              </div>
              <Link className="btn btn-solid pth-cta" href={`/apply?pathway=${p.id}`} data-magnet data-cursor="Apply">
                <span className="btn-icon" aria-hidden="true" />
                Apply for {p.short.toLowerCase()}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
