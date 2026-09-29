"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap } from "@/lib/gsap";
import { STRIDE, sprintFigure } from "@/lib/motion/figure";
import { RED, WHITE, drawExposure, mixInk } from "@/components/plate/draw";
import { method } from "@/content/coaching";
import { photo, photos } from "@/content/media";

// The method as a race. The section pins and the five steps travel sideways
// as you scroll; along the bottom a sprinter runs the same distance, leaving a
// chronophotographic trail, and lights each timing gate as it passes. At gate
// two (find the problem) the leg flashes red.
const GATES = method.length;
const gateAt = (i: number) => 0.08 + (i / (GATES - 1)) * 0.84;

export default function Method() {
  const sectionRef = useRef<HTMLElement>(null);
  // GSAP pins by wrapping the pinned element in a spacer. It must never be an
  // element React inserted directly into the page, or React can't remove it on
  // navigation ("This page couldn't load"): pin an inner wrapper instead.
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLCanvasElement>(null);
  const countRef = useRef<HTMLElement>(null);

  useEffect(() => {
    registerGsap();
    const section = sectionRef.current!;
    const track = trackRef.current!;
    const canvas = railRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0;
    let H = 0;
    let p = 0;
    let drawn = -1;
    let raf = 0;
    let alive = true;

    const fit = () => {
      if (!alive) return;
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawn = -1;
      draw();
    };

    function draw() {
      raf = 0;
      // A detached or collapsed canvas (mid-navigation, display: none) has no
      // size: drawing then would step the trail forward by 0px, forever.
      if (!alive || W < 40 || H < 40) return;
      if (Math.abs(p - drawn) < 0.0005) return;
      drawn = p;
      ctx.clearRect(0, 0, W, H);
      const body = Math.min(H * 0.72, 92);
      const ground = H - 14;
      const x0 = W * 0.04;
      const x1 = W * 0.96;
      const x = x0 + (x1 - x0) * p;
      // the rail and its gates
      ctx.strokeStyle = "rgba(244,244,241,0.28)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, ground + 0.5);
      ctx.lineTo(W, ground + 0.5);
      ctx.stroke();
      for (let g = 0; g < GATES; g++) {
        const gx = x0 + (x1 - x0) * gateAt(g);
        const passed = x >= gx;
        ctx.fillStyle = g === 1 && passed ? "#e4061a" : passed ? "#f4f4f1" : "rgba(244,244,241,0.25)";
        ctx.fillRect(Math.round(gx) - 1, ground - body * 1.15, 2, body * 1.15 + 6);
      }
      // the trail: an exposure every fifth of a body height travelled
      const stepPx = Math.max(8, body * 0.34);
      const redGate = x0 + (x1 - x0) * gateAt(1);
      ctx.globalCompositeOperation = "lighter";
      for (let sx = x0; sx <= x; sx += stepPx) {
        const phase = (sx - x0) / body / STRIDE;
        const age = (x - sx) / (x1 - x0);
        const near = Math.max(0, 1 - Math.abs(sx - redGate) / (body * 0.9));
        drawExposure(ctx, {
          fig: sprintFigure(phase, { overstride: sx < redGate ? 0.85 : 0 }),
          x: sx,
          ground,
          scale: body,
          intensity: Math.max(0.12, 0.55 - age * 1.4),
          ink: WHITE,
          legInk: near > 0.05 ? mixInk(WHITE, RED, near) : undefined,
        });
      }
      const phase = (x - x0) / body / STRIDE;
      drawExposure(ctx, {
        fig: sprintFigure(phase, { overstride: x < redGate ? 0.85 : 0 }),
        x,
        ground,
        scale: body,
        intensity: 1.35,
        ink: WHITE,
        emphasis: 1,
      });
      ctx.globalCompositeOperation = "source-over";
    }

    const request = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(fit);
    ro.observe(canvas);

    const setActive = (progress: number) => {
      p = progress;
      const idx = Math.min(GATES - 1, Math.max(0, Math.round(progress * (GATES - 1))));
      section.style.setProperty("--p", progress.toFixed(4));
      section.dataset.step = String(idx);
      if (countRef.current) countRef.current.textContent = String(idx + 1).padStart(2, "0");
      request();
    };

    if (reduced) {
      setActive(1);
      return () => {
        alive = false;
        ro.disconnect();
      };
    }

    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const motion = gsap.context(() => {
      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          pin: pinRef.current,
          start: "top top",
          end: () => `+=${distance() + window.innerHeight * 0.35}`,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => setActive(self.progress),
        },
      });
    }, section);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      motion.revert(); // unpins and restores the DOM exactly as React left it
    };
  }, []);

  return (
    <section ref={sectionRef} id="method" className="mth" aria-labelledby="mth-title" data-step="0">
      <div ref={pinRef} className="mth-pin">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="mth-bg" src={photo(photos.trackLanes, 1920)} alt="" loading="lazy" decoding="async" />
      <div className="mth-shade" aria-hidden="true" />
      <header className="mth-head">
        <h2 id="mth-title" className="mth-title">
          The method
        </h2>
        <p className="mth-sub">Five steps. No guesswork.</p>
        <p className="mth-count" aria-hidden="true">
          <b ref={countRef}>01</b>
          <span>/ 05</span>
        </p>
      </header>

      <div ref={trackRef} className="mth-track">
        {method.map((s, i) => (
          <article key={s.name} className={`mth-panel${i === 1 ? " is-key" : ""}`} style={{ "--i": i } as React.CSSProperties}>
            <span className="mth-num" aria-hidden="true">
              0{i + 1}
            </span>
            <div className="mth-copy">
              <p className="mth-step">Step 0{i + 1} of 05</p>
              <h3 className="mth-name">{s.name}</h3>
              <p className="mth-text">{s.text}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mth-rail">
        <canvas ref={railRef} className="mth-canvas" aria-hidden="true" />
        <ol className="mth-gates" aria-hidden="true">
          {method.map((s, i) => (
            <li key={s.name} style={{ left: `${(0.04 + gateAt(i) * 0.92) * 100}%` }}>
              {s.name}
            </li>
          ))}
        </ol>
      </div>
      </div>
    </section>
  );
}
