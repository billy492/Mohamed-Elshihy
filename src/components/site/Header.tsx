"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, site } from "@/content/site";

type LenisLike = { stop: () => void; start: () => void };

// The header is pure white in `difference` blend mode, so it inverts over
// whatever passes under it: white on the dark plates, black on chalk, a
// negative of any film behind it. It tucks away while you read down and
// comes back the moment you scroll up. The menu overlay is a sibling so the
// blend never touches it.
export default function Header() {
  const path = usePathname();
  const [hidden, setHidden] = useState(false);
  // The menu remembers which page it was opened on, so navigating closes it
  // without an effect.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === path;
  const setOpen = (next: boolean | ((o: boolean) => boolean)) =>
    setOpenOn((prev) => {
      const was = prev === path;
      const now = typeof next === "function" ? next(was) : next;
      return now ? path : null;
    });

  useEffect(() => {
    const lenis = (window as unknown as { lenis?: LenisLike }).lenis;
    document.documentElement.classList.toggle("menu-open", open);
    if (open) lenis?.stop();
    else lenis?.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const y = window.scrollY;
        if (Math.abs(y - lastY) > 8) {
          setHidden(y > lastY && y > 240);
          lastY = y;
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className="hdr" data-hidden={(hidden && !open) || undefined} data-open={open || undefined}>
        <Link href="/" className="hdr-mark" aria-label={`${site.short}, home`} data-cursor="Home">
          {site.short}
        </Link>
        <nav className="hdr-nav" aria-label="Main">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hdr-link"
              aria-current={path.startsWith(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hdr-end">
          <Link href="/apply" className="hdr-apply" data-cursor="Apply">
            Apply
          </Link>
          <button
            type="button"
            className="hdr-menu"
            aria-expanded={open}
            aria-controls="menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      <div id="menu" className="menu" data-open={open || undefined} inert={!open}>
        <nav aria-label="Menu" className="menu-nav">
          {nav.map((item, i) => (
            <Link key={item.href} href={item.href} className="menu-link" style={{ "--i": i } as React.CSSProperties}>
              <span className="menu-n">0{i + 1}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="menu-foot">
          <Link href="/apply" className="btn btn-solid">
            <span className="btn-icon" aria-hidden="true" />
            Apply for coaching
          </Link>
          <Link href="/coaching" className="btn btn-ghost">
            Coaching programs
          </Link>
        </div>
      </div>
    </>
  );
}
