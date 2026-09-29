"use client";

import { useEffect, useRef } from "react";

// A difference-blend cursor for mouse users: a dot that trails the pointer and
// a ring that swells over anything interactive, showing what a click will do
// (`data-cursor="Play"`). Buttons with `data-magnet` lean toward the pointer.
// Touch devices and reduced motion get nothing: the native cursor stays.
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    const dot = dotRef.current!;
    const ring = ringRef.current!;
    const label = labelRef.current!;
    document.documentElement.classList.add("has-cursor");

    let x = -100;
    let y = -100;
    let rx = -100;
    let ry = -100;
    let scale = 1;
    let target = 1;
    let raf = 0;
    let magnet: HTMLElement | null = null;

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
      if (magnet) {
        const r = magnet.getBoundingClientRect();
        const dx = (x - (r.left + r.width / 2)) * 0.22;
        const dy = (y - (r.top + r.height / 2)) * 0.3;
        magnet.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      }
    };
    const onOver = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("a, button, [data-cursor], label, summary, input, textarea, select");
      const text = el?.dataset.cursor ?? "";
      target = el ? (text ? 4.2 : 2.2) : 1;
      label.textContent = text;
      ring.classList.toggle("has-label", Boolean(text));
      const m = (e.target as HTMLElement).closest<HTMLElement>("[data-magnet]");
      if (m !== magnet) {
        if (magnet) magnet.style.transform = "";
        magnet = m;
      }
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onLeave = () => {
      x = y = -100;
      rx = ry = -100;
      if (!raf) raf = requestAnimationFrame(loop);
    };

    function loop() {
      raf = 0;
      rx += (x - rx) * 0.2;
      ry += (y - ry) * 0.2;
      scale += (target - scale) * 0.18;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) scale(${scale})`;
      label.style.transform = `scale(${1 / scale})`;
      if (Math.abs(x - rx) + Math.abs(y - ry) > 0.2 || Math.abs(target - scale) > 0.01) raf = requestAnimationFrame(loop);
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return (
    <div className="cursor" aria-hidden="true">
      <div ref={ringRef} className="cursor-ring">
        <span ref={labelRef} className="cursor-label" />
      </div>
      <div ref={dotRef} className="cursor-dot" />
    </div>
  );
}
