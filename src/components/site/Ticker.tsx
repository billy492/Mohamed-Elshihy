"use client";

import { useEffect, useRef } from "react";

// A ticker that runs on its own and answers the scroll: scroll faster and it
// speeds up and leans into the direction of travel; scroll back up and it
// reverses. Driven by the Lenis velocity when smooth scrolling is on.
export default function Ticker({
  items,
  className,
  speed = 60,
  reverse = false,
}: {
  items: readonly string[];
  className?: string;
  /** pixels per second at rest */
  speed?: number;
  reverse?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    let x = 0;
    let last = performance.now();
    let dir = reverse ? 1 : -1;
    let boost = 0;
    let skew = 0;
    let raf = 0;
    let visible = false;
    let lastY = window.scrollY;

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(track);

    function loop(now: number) {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const lenis = (window as unknown as { lenis?: { velocity: number } }).lenis;
      const y = window.scrollY;
      const v = lenis ? lenis.velocity : (y - lastY) / Math.max(dt, 0.001) / 60;
      lastY = y;
      if (Math.abs(v) > 0.4) dir = (v > 0 ? -1 : 1) * (reverse ? -1 : 1);
      boost += (Math.min(Math.abs(v) * 0.9, 14) - boost) * 0.08;
      skew += ((v > 0 ? -1 : 1) * Math.min(Math.abs(v) * 0.6, 9) - skew) * 0.1;
      const half = track.scrollWidth / 2;
      x += dir * speed * (1 + boost) * dt;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      track.style.transform = `translate3d(${x}px,0,0) skewX(${skew.toFixed(2)}deg)`;
      if (visible) raf = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [speed, reverse]);

  const row = items.flatMap((item, i) => [
    <span key={`t${i}`} className="tick-item">
      {item}
    </span>,
    <span key={`s${i}`} className="tick-star" aria-hidden="true">
      ✱
    </span>,
  ]);

  return (
    <div className={`ticker ${className ?? ""}`}>
      <p className="sr-only">{items.join(". ")}</p>
      <div ref={trackRef} className="ticker-track" aria-hidden="true">
        <div className="ticker-row">{row}</div>
        <div className="ticker-row">{row}</div>
      </div>
    </div>
  );
}
