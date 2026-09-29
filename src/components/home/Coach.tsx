"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import Split from "@/components/site/Split";
import { useScrollVar } from "@/lib/useScrollVar";
import { imgSrcSet } from "@/lib/img";
import { shots } from "@/content/media";
import { words } from "@/content/record";

// The coach himself. The portrait develops like a print in the tray: it opens
// from a sliver, and the colour (the Al Ahly red) comes up out of the black
// and white as the section scrolls through. The numbers run up once, on sight.
const STATS = [
  { to: 6, pad: 2, suffix: "", label: "Years at Al Ahly SC" },
  { to: 18, pad: 2, suffix: "+", label: "Championships" },
  { to: 32, pad: 2, suffix: "K", label: "Follow his work" },
];

export default function Coach() {
  const ref = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLDListElement>(null);
  useScrollVar(ref, { start: "top bottom", end: "bottom top" });

  useEffect(() => {
    const el = statsRef.current!;
    const nums = Array.from(el.querySelectorAll<HTMLElement>("[data-to]"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const show = (n: HTMLElement, v: number) => {
      n.textContent = String(Math.round(v)).padStart(Number(n.dataset.pad), "0");
    };
    if (reduced) {
      nums.forEach((n) => show(n, Number(n.dataset.to)));
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / 1400);
          const eased = 1 - Math.pow(1 - p, 4);
          nums.forEach((n) => show(n, Number(n.dataset.to) * eased));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const p = shots.pitch;
  return (
    <section ref={ref} className="cch" data-tone="chalk" aria-labelledby="cch-title">
      <figure className="cch-photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.src}
          srcSet={imgSrcSet(p.src)}
          sizes="(max-width: 900px) 100vw, 42vw"
          alt={p.alt}
          width={1500}
          height={2000}
          loading="lazy"
          decoding="async"
        />
        <figcaption className="cch-cap">
          <a href={p.post} target="_blank" rel="noopener">
            @shihy.sc
          </a>
        </figcaption>
      </figure>
      <div className="cch-copy">
        <span className="tag">
          <b>The coach</b> Cairo, Egypt
        </span>
        <Split as="h2" id="cch-title" className="t-h1 cch-name" text="Mohamed El Shihy" lines={["Mohamed", "El Shihy"]} />
        <blockquote className="cch-quote">
          <p>{words.person}</p>
        </blockquote>
        <dl ref={statsRef} className="cch-stats">
          {STATS.map((s) => (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd>
                <span data-to={s.to} data-pad={s.pad}>
                  {String(s.to).padStart(s.pad, "0")}
                </span>
                {s.suffix}
              </dd>
            </div>
          ))}
        </dl>
        <div className="actions">
          <Link className="btn btn-solid" href="/about" data-magnet data-cursor="Open">
            <span className="btn-icon" aria-hidden="true" />
            The full record
          </Link>
          <a className="btn btn-ghost" href="https://www.instagram.com/shihy.sc/" target="_blank" rel="noopener">
            Follow @shihy.sc
          </a>
        </div>
      </div>
    </section>
  );
}
