"use client";

import { useEffect, useRef } from "react";

// Headline that rises into place letter by letter when it enters the screen.
// The words are real text (split into spans for the motion only), so they
// read normally to search engines and screen readers. Each letter carries its
// index as --i; CSS turns that into the stagger.
export default function Split({
  text,
  as = "h2",
  className,
  id,
  lines,
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  id?: string;
  /** Render these lines on separate rows instead of letting the text wrap. */
  lines?: readonly string[];
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-in");
      return;
    }
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.9 && r.bottom > 0) {
      requestAnimationFrame(() => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  let i = 0;
  const renderLine = (line: string, key: number) => (
    <span key={key} className="split-line">
      {line.split(" ").flatMap((word, w) => [
        w > 0 ? " " : null,
        <span key={w} className="split-word">
          {Array.from(word).map((ch, c) => (
            <span key={c} className="split-char" style={{ "--i": i++ } as React.CSSProperties}>
              {ch}
            </span>
          ))}
        </span>,
      ])}
    </span>
  );

  const Tag = as as "h2";
  return (
    <Tag ref={ref as React.RefObject<HTMLHeadingElement>} id={id} className={`split ${className ?? ""}`} aria-label={text}>
      <span aria-hidden="true">{(lines ?? [text]).map(renderLine)}</span>
    </Tag>
  );
}
