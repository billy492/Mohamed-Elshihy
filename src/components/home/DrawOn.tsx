"use client";

import { useEffect, useRef } from "react";

// Draws an SVG plate on when it scrolls into view: every line strokes itself
// in, exposure after exposure, then the red measurement appears last.
export default function DrawOn({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-drawn");
      return;
    }
    el.querySelectorAll<SVGGeometryElement>("line, path").forEach((l) => {
      const len = Math.ceil(l.getTotalLength?.() ?? 0);
      if (len) {
        l.style.setProperty("--len", String(len));
      }
    });
    el.querySelectorAll<SVGGElement>(".plate-shot").forEach((g, i) => g.style.setProperty("--i", String(i)));
    el.classList.add("is-armed");
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("is-drawn");
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="drawon">
      {children}
    </div>
  );
}
