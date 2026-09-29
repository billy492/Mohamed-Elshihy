"use client";

import { useEffect, useRef } from "react";
import Split from "@/components/site/Split";
import { problems } from "@/content/coaching";
import { shots } from "@/content/media";
import { imgSrcSet } from "@/lib/img";

// The problems archive on chalk. On desktop, a photograph follows the pointer
// down the list and swaps with each row, revealed through a clip. Every row
// opens to show how the problem is found and how it's fixed.
// Shihy's own sessions, one per problem.
const IMAGES = [
  shots.trainingRow,
  shots.coachingAthletes,
  shots.trainingFloor,
  shots.coachingTalk,
  shots.redbull,
  shots.redbullWalk,
];

export default function Problems() {
  const listRef = useRef<HTMLOListElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current!;
    const float = floatRef.current!;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    let x = 0;
    let y = 0;
    let fx = 0;
    let fy = 0;
    let raf = 0;
    let active = -1;
    const imgs = Array.from(float.querySelectorAll<HTMLElement>(".prb-float-img"));

    const loop = () => {
      raf = 0;
      fx += (x - fx) * 0.14;
      fy += (y - fy) * 0.14;
      const tilt = Math.max(-10, Math.min(10, (x - fx) * 0.08));
      float.style.transform = `translate3d(${fx}px, ${fy}px, 0) rotate(${tilt}deg)`;
      if (Math.abs(x - fx) + Math.abs(y - fy) > 0.3) raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const row = (e.target as HTMLElement).closest<HTMLElement>("[data-row]");
      const idx = row ? Number(row.dataset.row) : -1;
      if (idx !== active) {
        active = idx;
        float.classList.toggle("is-on", idx >= 0);
        imgs.forEach((im, i) => im.classList.toggle("is-on", i === idx));
      }
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onLeave = () => {
      active = -1;
      float.classList.remove("is-on");
    };
    list.addEventListener("pointermove", onMove);
    list.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      list.removeEventListener("pointermove", onMove);
      list.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <section className="prb" data-tone="chalk" aria-labelledby="prb-title">
      <header className="prb-head">
        <Split as="h2" id="prb-title" className="t-h1" text="Problems I fix" lines={["Problems", "I fix"]} />
        <p className="t-lede prb-lede">
          Every athlete arrives with their own problem. These come up again and again. Here&apos;s how I find each one,
          and how I fix it.
        </p>
      </header>
      <ol ref={listRef} className="prb-list">
        {problems.map((p, i) => (
          <li key={p.name} data-row={i}>
            <details className="prb-item">
              <summary className="prb-sum" data-cursor="Open">
                <span className="prb-n">0{i + 1}</span>
                <span className="prb-name">{p.name}</span>
                <span className="prb-plus" aria-hidden="true" />
              </summary>
              <div className="prb-body">
                <div>
                  <h3 className="prb-k prb-k-find">How I find it</h3>
                  <p>{p.find}</p>
                </div>
                <div>
                  <h3 className="prb-k">How I fix it</h3>
                  <p>{p.fix}</p>
                </div>
              </div>
            </details>
          </li>
        ))}
      </ol>
      <div ref={floatRef} className="prb-float" aria-hidden="true">
        {IMAGES.map((shot) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={shot.src}
            className="prb-float-img"
            src={shot.src}
            srcSet={imgSrcSet(shot.src)}
            sizes="320px"
            alt=""
            loading="lazy"
            decoding="async"
          />
        ))}
      </div>
    </section>
  );
}
