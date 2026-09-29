"use client";

import Link from "next/link";
import { useRef } from "react";
import { useScrollVar } from "@/lib/useScrollVar";
import { nav, site } from "@/content/site";
import { media } from "@/content/record";

// The sign-off: the name at the full width of the screen, each letter rising
// out of the floor in turn as the footer scrolls into view.
export default function Footer() {
  const ref = useRef<HTMLElement>(null);
  useScrollVar(ref, { start: "top bottom", end: "bottom bottom" });
  const youtube = site.social.youtube.href || `https://www.youtube.com/watch?v=${media[0].id}`;
  const letters = Array.from(site.short);
  return (
    <footer ref={ref} className="ftr">
      <div className="ftr-top">
        <p className="ftr-motto">
          {site.motto[0]}
          <br />
          {site.motto[1]}
        </p>
        <p className="ftr-ar" lang="ar" dir="rtl">
          {site.arabic}
        </p>
      </div>

      <div className="ftr-grid">
        <div className="ftr-col">
          <h2 className="ftr-h">Work with me</h2>
          <Link href="/apply">Apply for coaching</Link>
          <Link href="/apply?track=mentorship">Apply for mentorship</Link>
          <Link href="/programs">Training programs</Link>
        </div>
        <div className="ftr-col">
          <h2 className="ftr-h">Explore</h2>
          {nav.map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
            </Link>
          ))}
        </div>
        <div className="ftr-col">
          <h2 className="ftr-h">Follow</h2>
          <a href={site.social.instagram.href} rel="me noopener" target="_blank">
            Instagram {site.social.instagram.handle}
          </a>
          <a href={youtube} rel="noopener" target="_blank">
            YouTube
          </a>
        </div>
        <div className="ftr-col ftr-note">
          <p>Every application is read by Shihy himself. If it&apos;s a fit, you hear back directly on WhatsApp or email.</p>
        </div>
      </div>

      <p className="ftr-giant" aria-hidden="true">
        {letters.map((l, i) => (
          <span key={i} style={{ "--i": i, "--n": letters.length } as React.CSSProperties}>
            {l}
          </span>
        ))}
      </p>

      <div className="ftr-base">
        <span>
          © {new Date().getFullYear()} {site.name}
        </span>
        <span>{site.base}</span>
        <Link href="/privacy">Privacy</Link>
      </div>
    </footer>
  );
}
