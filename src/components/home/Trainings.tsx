"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { registerGsap, ScrollTrigger } from "@/lib/gsap";
import Split from "@/components/site/Split";
import { imgSrcSet } from "@/lib/img";
import { trainings } from "@/content/trainings";
import { pricingNote } from "@/content/coaching";

// Every way to train with Shihy, straight after the opening, so nobody has to
// hunt for what they can apply to. Each lane is one link to its application.
// The lanes stand up off the track as they scroll into view, and a red run
// sweeps across the one under the pointer.
export default function Trainings() {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    registerGsap();
    const rows = Array.from(listRef.current!.querySelectorAll<HTMLElement>(".trn-row"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const set = (row: HTMLElement, p: number) => row.style.setProperty("--up", p.toFixed(3));
    const triggers = rows.map((row) =>
      ScrollTrigger.create({
        trigger: row,
        start: "top bottom",
        end: "bottom 86%",
        onUpdate: (self) => set(row, self.progress),
        onRefresh: (self) => set(row, self.progress),
      }),
    );
    return () => triggers.forEach((t) => t.kill());
  }, []);

  return (
    <section id="trainings" className="trn" data-tone="chalk" aria-labelledby="trn-title">
      <header className="trn-head">
        <p className="trn-status">
          <span className="trn-live" aria-hidden="true" />
          Applications open
        </p>
        <Split as="h2" id="trn-title" className="trn-title" text="Train with Shihy." lines={["Train with", "Shihy."]} />
        <p className="trn-lede">
          Pick the training that fits you and apply. Shihy reads every application himself.
        </p>
      </header>

      <ul ref={listRef} className="trn-list">
        {trainings.map((t) => (
          <li key={t.id} className="trn-row">
            <Link href={t.href} className="trn-link" data-cursor={t.action === "Apply" ? "Apply" : "Join"}>
              <span className="trn-thumb" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.shot.src}
                  srcSet={imgSrcSet(t.shot.src)}
                  sizes="120px"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  style={{ objectPosition: t.focus }}
                />
              </span>
              <span className="trn-name">{t.name}</span>
              <span className="trn-meta">
                <span className="trn-kind">{t.kind}</span>
                <span className="trn-where">{t.where}</span>
              </span>
              <span className="trn-line">{t.line}</span>
              <span className="trn-go">
                <span className="btn-icon" aria-hidden="true" />
                <span className="trn-go-label">{t.action}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="trn-foot">
        <p>{pricingNote}</p>
        <p>
          Not sure which one fits? Apply and choose &ldquo;I&apos;m not sure yet&rdquo;: Shihy will recommend one.{" "}
          <a className="text-link" href="#pathways">
            Compare the coaching pathways
          </a>
        </p>
      </div>
    </section>
  );
}
