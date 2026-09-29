"use client";

import { useEffect, type RefObject } from "react";
import { registerGsap, ScrollTrigger } from "@/lib/gsap";

// Publish an element's scroll progress (0 → 1) as a CSS custom property, so
// the motion itself lives in CSS transforms and opacity. ScrollTrigger is fed
// by Lenis, so the value is already smoothed.
export function useScrollVar(
  ref: RefObject<HTMLElement | null>,
  {
    start = "top bottom",
    end = "bottom top",
    name = "--p",
    onProgress,
  }: { start?: string; end?: string; name?: string; onProgress?: (p: number) => void } = {},
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    registerGsap();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const set = (p: number) => {
      el.style.setProperty(name, p.toFixed(4));
      onProgress?.(p);
    };
    if (reduced) {
      set(1);
      return;
    }
    const st = ScrollTrigger.create({
      trigger: el,
      start,
      end,
      onUpdate: (self) => set(self.progress),
      onRefresh: (self) => set(self.progress),
    });
    return () => st.kill();
    // onProgress is intentionally not a dependency: callers pass inline functions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, start, end, name]);
}
