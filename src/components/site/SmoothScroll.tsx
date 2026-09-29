"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, prefersReduced, registerGsap, ScrollTrigger } from "@/lib/gsap";

// Lenis smooth scroll wired to GSAP's ticker and ScrollTrigger (from FARGO).
// Nothing wraps the page in a transform, so position: sticky and fixed keep
// working. Off entirely for reduced motion, and on the review desk, where
// native scrolling is faster to work with.
export default function SmoothScroll() {
  const path = usePathname();
  const off = path.startsWith("/admin");

  useEffect(() => {
    registerGsap();
    if (off || prefersReduced()) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      anchors: { offset: -72 },
      stopInertiaOnNavigate: true,
    });
    lenis.on("scroll", ScrollTrigger.update);
    (window as unknown as { lenis?: Lenis }).lenis = lenis;

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh).catch(() => {});
    const t = window.setTimeout(refresh, 600);

    return () => {
      window.clearTimeout(t);
      gsap.ticker.remove(raf);
      lenis.destroy();
      const w = window as unknown as { lenis?: Lenis };
      if (w.lenis === lenis) delete w.lenis;
    };
  }, [off]);

  // New page, new top: keep Lenis's internal position in step with the router.
  useEffect(() => {
    if (window.location.hash) return;
    const lenis = (window as unknown as { lenis?: Lenis }).lenis;
    lenis?.scrollTo(0, { immediate: true, force: true });
  }, [path]);

  return null;
}
