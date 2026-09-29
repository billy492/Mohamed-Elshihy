"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

// Moving between pages is a scene change, not a jump cut.
//
//   1. cover   — the page tilts back into the screen while six lanes swing
//                shut in 3D like stadium blinds, and the destination slams in
//   2. hold    — the router swaps the page behind the lanes
//   3. reveal  — the lanes flip open edge-on and the new page settles forward
//
// Every internal link on the site goes through it (a capture-phase listener,
// so plain <a> and Next <Link> both work). The desk (/admin), same-page
// anchors and query changes, new tabs, downloads and modified clicks are left
// alone. A hard timeout means a failed navigation can never leave the screen
// covered.

const COVER_MS = 620;
const PUSH_AT = 430;
const HOLD_MIN = 260;
const REVEAL_MS = 900;
const SAFETY_MS = 6000;

const LABELS: Record<string, string> = {
  "/": "Shihy",
  "/coaching": "Coaching",
  "/mentorship": "Mentorship",
  "/programs": "Programs",
  "/film-room": "Film room",
  "/about": "About",
  "/apply": "Apply",
  "/privacy": "Privacy",
};

type Phase = "idle" | "cover" | "hold" | "reveal";
type Flags = {
  __shihyTransitioning?: boolean;
  __shihyNavigated?: boolean;
  lenis?: { scrollTo: (target: unknown, options?: object) => void };
};
type State = { phase: Phase; target: string; hash: string; startedAt: number; timers: number[] };

const flags = () => window as unknown as Flags;

/** Open the lanes onto whatever page is now mounted. */
function reveal(state: State, root: HTMLDivElement | null) {
  if (!root || state.phase === "reveal" || state.phase === "idle") return;
  state.phase = "reveal";
  const w = flags();
  // land at the top of the new page, or on its anchor
  const anchor = state.hash ? document.querySelector<HTMLElement>(state.hash) : null;
  if (w.lenis) w.lenis.scrollTo(anchor ?? 0, { immediate: true, force: true, offset: anchor ? -90 : 0 });
  else window.scrollTo(0, anchor ? anchor.getBoundingClientRect().top + window.scrollY - 90 : 0);
  document.documentElement.classList.remove("pt-covering");
  document.documentElement.classList.add("pt-revealing");
  root.dataset.phase = "reveal";
  w.__shihyTransitioning = false;
  window.dispatchEvent(new Event("shihy:revealed"));
  state.timers.forEach(clearTimeout);
  state.timers = [
    window.setTimeout(() => {
      root.dataset.phase = "idle";
      document.documentElement.classList.remove("pt-revealing");
      state.phase = "idle";
    }, REVEAL_MS),
  ];
}

export default function PageTransition() {
  const router = useRouter();
  const path = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const stateRef = useRef<State>({ phase: "idle", target: "", hash: "", startedAt: 0, timers: [] });

  // Intercept internal navigation.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const s = stateRef.current;

    const start = (url: URL) => {
      const root = rootRef.current!;
      const w = flags();
      s.phase = "cover";
      s.target = url.pathname;
      s.hash = url.hash;
      s.startedAt = performance.now();
      w.__shihyTransitioning = true;
      w.__shihyNavigated = true;
      labelRef.current!.textContent = LABELS[url.pathname] ?? url.pathname.replace(/[/-]+/g, " ").trim();
      root.dataset.phase = "cover";
      document.documentElement.classList.add("pt-covering");
      router.prefetch(url.pathname); // warm the destination while the lanes close
      s.timers.push(
        window.setTimeout(() => router.push(url.pathname + url.search + url.hash, { scroll: false }), PUSH_AT),
        window.setTimeout(() => {
          if (s.phase !== "cover") return;
          s.phase = "hold";
          root.dataset.phase = "hold";
        }, COVER_MS),
        window.setTimeout(() => reveal(s, rootRef.current), SAFETY_MS),
      );
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download") || a.dataset.noTransition !== undefined) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname.startsWith("/admin") || window.location.pathname.startsWith("/admin")) return;
      if (url.pathname === window.location.pathname) return; // anchors and query changes stay put
      e.preventDefault();
      if (s.phase === "idle") start(url);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  // The new route has rendered behind the lanes: open them — two frames after
  // it paints, and never before the lanes have closed and held for a beat.
  useEffect(() => {
    const s = stateRef.current;
    if (s.phase === "idle" || path !== s.target) return;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const due = s.startedAt + COVER_MS + HOLD_MIN;
        s.timers.push(window.setTimeout(() => reveal(s, rootRef.current), Math.max(60, due - performance.now())));
      }),
    );
  }, [path]);

  return (
    <div ref={rootRef} className="pt" data-phase="idle" aria-hidden="true">
      <div className="pt-lanes">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="pt-lane" style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>
      <div className="pt-ui">
        <span className="pt-mark">Shihy</span>
        <span ref={labelRef} className="pt-label" />
        <span className="pt-bar" />
      </div>
    </div>
  );
}
