"use client";

import { useRef } from "react";
import Split from "@/components/site/Split";
import VideoFacade from "@/components/home/VideoFacade";
import { useScrollVar } from "@/lib/useScrollVar";
import { media } from "@/content/record";
import { reels } from "@/content/media";
import { imgSrcSet } from "@/lib/img";
import { site } from "@/content/site";

// The film room: the interview frame starts oversized and settles into place
// as it scrolls in, with the title sliding under it.
export default function FilmRoom({ page = false }: { page?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  useScrollVar(ref, { start: "top bottom", end: "center center" });
  const feature = media[0];
  return (
    <section ref={ref} className="flm" aria-labelledby="flm-title">
      <div className="flm-head">
        <Split as={page ? "h1" : "h2"} id="flm-title" className="t-mega flm-title" text="Film room" />
        <p className="t-lede flm-lede">
          Interviews, breakdowns and lectures. Load, recovery and speed, and the thinking behind them.
        </p>
      </div>
      <figure className="flm-frame">
        <div className="flm-zoom" data-cursor="Play">
          <VideoFacade id={feature.id} title={feature.title} />
        </div>
        <figcaption className="flm-cap">
          <span className="tag">
            <b>{feature.outlet}</b> {feature.kind}
          </span>
          <span className="flm-cap-title">{feature.title}</span>
          <span className="flm-cap-ar" lang="ar" dir="rtl">
            {feature.titleAr}
          </span>
        </figcaption>
      </figure>
      <div className="flm-reels" aria-label="Latest on Instagram">
        <p className="flm-reels-k">
          <span className="tag">
            <b>On Instagram</b> @shihy.sc
          </span>
        </p>
        <ul className="flm-reel-list">
          {reels.map((r) => (
            <li key={r.src}>
              <a className="flm-reel" href={r.post} target="_blank" rel="noopener" data-cursor="Watch">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.src} srcSet={imgSrcSet(r.src)} sizes="(max-width: 760px) 60vw, 22vw" alt={r.alt} loading="lazy" decoding="async" />
                <span className="sr-only">{r.title}, watch on Instagram</span>
                <span className="flm-reel-go" aria-hidden="true">Watch</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="actions flm-actions">
        <a className="btn btn-solid" href={site.social.youtube.href} target="_blank" rel="noopener" data-magnet>
          <span className="btn-icon" aria-hidden="true" />
          Subscribe on YouTube
        </a>
        <a className="btn btn-ghost" href={site.social.instagram.href} target="_blank" rel="noopener">
          Follow {site.social.instagram.handle}
        </a>
      </div>
    </section>
  );
}
