"use client";

import { useEffect, useRef } from "react";
import type { Film } from "@/content/media";

// Background film, following FARGO's rules: muted, looping, inline,
// preload="none". Two observers per film — a wide one that starts the
// download a screen and a half early, a tight one that plays and pauses — so
// films never compete with the critical path or burn the iOS decoder budget
// while off screen. Play is retried on the events iOS uses to refuse it.
export default function BgVideo({
  film,
  className,
  eager = false,
}: {
  film: Film;
  className?: string;
  eager?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let wanted = false;
    const attach = () => {
      if (!v.src) {
        v.src = film.src;
        v.preload = "auto";
      }
    };
    const tryPlay = () => {
      if (!wanted || reduced) return;
      attach();
      v.play().catch(() => {});
    };
    const warm = new IntersectionObserver(([e]) => e.isIntersecting && attach(), { rootMargin: "150% 0px" });
    const play = new IntersectionObserver(
      ([e]) => {
        wanted = e.isIntersecting;
        if (wanted) tryPlay();
        else v.pause();
      },
      { threshold: 0.05 },
    );
    if (eager) attach();
    warm.observe(v);
    play.observe(v);
    const retry = () => wanted && v.paused && tryPlay();
    const events = ["loadeddata", "canplay", "stalled", "suspend"] as const;
    events.forEach((ev) => v.addEventListener(ev, retry));
    document.addEventListener("visibilitychange", retry);
    return () => {
      warm.disconnect();
      play.disconnect();
      events.forEach((ev) => v.removeEventListener(ev, retry));
      document.removeEventListener("visibilitychange", retry);
    };
  }, [film.src, eager]);

  return (
    <video
      ref={ref}
      className={`bgv ${className ?? ""}`}
      poster={film.poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
