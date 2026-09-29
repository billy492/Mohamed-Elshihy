"use client";

import { useEffect, useRef, useState } from "react";

// The loading screen runs a 100 m sprint: the counter is the distance, the red
// dot is the runner, the status line is the lab calibrating. At the line, the
// screen splits into five running lanes that sprint off upward and the hero
// takes over. It plays on every full load of the homepage, never on a
// client-side navigation (a module flag remembers it already ran this visit).
//
// The black is an inline style on the server markup: it has to paint before
// any stylesheet arrives (FARGO: the CSS took 8.5 s on Slow 4G once).

let played = false;

const STATUS = ["Calibrating", "Measuring", "Analysing", "Problem found"] as const;
const LANES = 5;

export default function Loader() {
  // Full page loads only: arriving through an in-site link plays the page
  // transition instead (it sets __shihyNavigated).
  const [show] = useState(
    () =>
      !played &&
      !(typeof window !== "undefined" && (window as unknown as { __shihyNavigated?: boolean }).__shihyNavigated),
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const runnerRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const w = window as unknown as { __shihyLoaded?: boolean };
    const finish = () => {
      played = true;
      w.__shihyLoaded = true;
      document.documentElement.classList.remove("is-loading");
      window.dispatchEvent(new Event("shihy:loaded"));
    };
    if (!show) {
      finish();
      return;
    }
    const root = rootRef.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.classList.add("is-loading");
    if (reduced) {
      root.classList.add("is-gone");
      finish();
      return;
    }

    const mobile = window.innerWidth < 760;
    const DURATION = mobile ? 1500 : 1800;
    let raf = 0;
    let start = 0;
    let ready = false;
    let fontsReady = false;
    document.fonts?.ready.then(() => (fontsReady = true));
    const cap = window.setTimeout(() => (fontsReady = true), 2600);

    // A sprint: slow out of the blocks, flying through the middle, a dip at the line.
    const run = (x: number) => (x < 0.18 ? 2.6 * x * x : x < 0.9 ? 0.084 + (x - 0.18) * 1.155 : 0.916 + (x - 0.9) * 0.84);

    const tick = (now: number) => {
      if (!start) start = now;
      let p = Math.min(1, (now - start) / DURATION);
      if (p >= 1 && !fontsReady) p = 0.999; // hold at the line until the type is in
      const d = Math.min(100, run(p) * 100);
      numRef.current!.textContent = String(Math.floor(d)).padStart(3, "0");
      runnerRef.current!.style.transform = `translate3d(${d}cqw, 0, 0)`;
      statusRef.current!.textContent = STATUS[Math.min(STATUS.length - 1, Math.floor(p * STATUS.length))];
      root.style.setProperty("--p", p.toFixed(3));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }
      if (ready) return;
      ready = true;
      root.classList.add("is-done");
      (window as unknown as { __shihyFinishing?: boolean }).__shihyFinishing = true;
      window.dispatchEvent(new Event("shihy:finishing"));
      window.setTimeout(() => root.classList.add("is-leaving"), 260);
      window.setTimeout(finish, 520); // the hero starts while the lanes are still clearing
      window.setTimeout(() => root.classList.add("is-gone"), 1400);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(cap);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      ref={rootRef}
      className="ldr"
      data-loader=""
      role="status"
      aria-label="Loading"
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "#070707", color: "#f4f4f1" }}
    >
      <div className="ldr-lanes" aria-hidden="true">
        {Array.from({ length: LANES }, (_, i) => (
          <span key={i} className="ldr-lane" style={{ "--i": i } as React.CSSProperties}>
            <span className="ldr-lane-n">{i + 1}</span>
          </span>
        ))}
      </div>
      <div className="ldr-ui">
        <div className="ldr-top">
          <span className="ldr-mark">Shihy</span>
          <span className="ldr-meta">Performance coaching / Cairo</span>
        </div>
        <div className="ldr-count">
          <span ref={numRef} className="ldr-num">
            000
          </span>
          <span className="ldr-unit">m</span>
        </div>
        <div className="ldr-track">
          <div className="ldr-rule" aria-hidden="true">
            {Array.from({ length: 11 }, (_, i) => (
              <span key={i} className="ldr-tick" />
            ))}
            <span ref={runnerRef} className="ldr-runner" />
          </div>
          <div className="ldr-labels">
            <span>Start</span>
            <span ref={statusRef}>Calibrating</span>
            <span>Finish</span>
          </div>
        </div>
      </div>
    </div>
  );
}
