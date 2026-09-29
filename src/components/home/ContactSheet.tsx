"use client";

import { useEffect, useRef } from "react";
import { registerGsap, ScrollTrigger } from "@/lib/gsap";
import Split from "@/components/site/Split";
import { imgSrcSet } from "@/lib/img";
import { sheet } from "@/content/media";

// Shihy's own photographs as a contact sheet: a strip of film on white paper,
// running sideways as you scroll down. Frames sit in black and white and
// develop into colour as they reach the middle; the picks get circled in red
// grease pencil, the way a photographer (or a coach) marks the frame that
// matters. Sticky, not pinned: nothing wraps React's DOM.
export default function ContactSheet() {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsap();
    const root = rootRef.current!;
    const track = trackRef.current!;
    const frames = Array.from(track.querySelectorAll<HTMLElement>(".cs-frame"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.add("is-static");
      frames.forEach((f) => f.style.setProperty("--dev", "1"));
      return;
    }
    let travel = 0;
    let vw = 1;
    let centers: number[] = [];
    // the section is exactly as tall as the strip is long, so one screen of
    // scrolling moves the film one screen sideways
    const measure = () => {
      vw = window.innerWidth;
      travel = Math.max(0, track.scrollWidth - vw);
      root.style.setProperty("--travel", `${travel}px`);
      centers = frames.map((f) => f.offsetLeft + f.offsetWidth / 2);
    };
    const apply = (p: number) => {
      const x = -p * travel;
      track.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
      for (let i = 0; i < frames.length; i++) {
        const d = Math.abs(centers[i] + x - vw / 2) / (vw * 0.46);
        frames[i].style.setProperty("--dev", Math.max(0, 1 - d).toFixed(3));
      }
    };
    measure();
    ScrollTrigger.addEventListener("refreshInit", measure);
    const st = ScrollTrigger.create({
      trigger: root,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => apply(self.progress),
    });
    ScrollTrigger.refresh();
    return () => {
      ScrollTrigger.removeEventListener("refreshInit", measure);
      st.kill();
    };
  }, []);

  return (
    <section ref={rootRef} className="cs" data-tone="chalk" aria-labelledby="cs-title">
      <div className="cs-stick">
        <header className="cs-head">
          <Split as="h2" id="cs-title" className="cs-title" text="On the pitch." lines={["On the", "pitch."]} />
          <p className="t-lede cs-lede">
            Six years inside Al Ahly SC. The warm-ups, the drills, the night sessions: the work behind the titles.
          </p>
        </header>
        <div className="cs-film">
          <div ref={trackRef} className="cs-track">
            {sheet.map((f, i) => (
              <figure
                key={f.photo.src}
                className={`cs-frame${f.pick ? " is-pick" : ""}`}
                style={{ "--ar": f.photo.ar } as React.CSSProperties}
              >
                <span className="cs-edge" aria-hidden="true">
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <span>{String(i + 1).padStart(2, "0")}A</span>
                </span>
                <div className="cs-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={f.photo.src}
                    srcSet={imgSrcSet(f.photo.src)}
                    sizes={`(max-width: 760px) ${Math.round(f.photo.ar * 48)}vh, ${Math.round(f.photo.ar * 56)}vh`}
                    alt={f.photo.alt}
                    loading="lazy"
                    decoding="async"
                  />
                  {f.pick ? (
                    <svg className="cs-mark" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                      <path
                        pathLength={1}
                        d="M14 62C8 36 34 8 62 9c30 1 38 34 28 60-9 24-44 30-66 18C7 78 4 55 18 40c9-10 22-15 34-16"
                      />
                    </svg>
                  ) : null}
                </div>
                <figcaption>{f.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
