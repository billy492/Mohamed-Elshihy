import { ImageResponse } from "next/og";
import { STRIDE, segments, sprintFigure } from "@/lib/motion/figure";
import { site } from "@/content/site";

// The link preview (WhatsApp, Instagram DMs, X): the chronophotograph from
// the hero, drawn server-side from the same body model, under the motto.
export const alt = `${site.name}: Find the problem. Fix the problem.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function barlow(): Promise<ArrayBuffer | null> {
  try {
    // An old Safari user agent makes Google Fonts serve TTF, which the renderer needs.
    const css = await (
      await fetch("https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&display=swap", {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; en-us) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
        },
      })
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function OpenGraphImage() {
  const font = await barlow();
  const body = 250;
  const ground = 300;
  const gap = body * 0.24;
  const lines: string[] = [];
  for (let i = 0; i < 13; i++) {
    const x = 90 + i * gap;
    const f = sprintFigure((i * gap) / body / STRIDE);
    const s = segments(f);
    const P = (p: { x: number; y: number }) => [x + p.x * body, ground - p.y * body];
    for (const [a, b] of [...s.trunk, ...s.near, ...s.far]) {
      const [x1, y1] = P(a);
      const [x2, y2] = P(b);
      lines.push(`M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`);
    }
  }
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#070707",
          color: "#f4f4f1",
          padding: "44px 56px",
          fontFamily: font ? "Barlow Condensed" : "sans-serif",
        }}
      >
        <svg width="1100" height="320" viewBox="0 0 1100 320" style={{ position: "absolute", top: 20, left: 40 }}>
          <path d={lines.join("")} stroke="rgba(244,244,241,0.55)" strokeWidth="3" fill="none" strokeLinecap="round" />
          <line x1="0" y1={ground} x2="1100" y2={ground} stroke="rgba(244,244,241,0.35)" strokeWidth="2" />
        </svg>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, letterSpacing: 2 }}>
          <span>SHIHY</span>
          <span style={{ color: "#8a8a86" }}>11 YEARS · HIGH PERFORMANCE COACHING</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 118, lineHeight: 0.84 }}>
          <span>FIND THE PROBLEM.</span>
          <span style={{ color: "#e4061a" }}>FIX THE PROBLEM.</span>
        </div>
      </div>
    ),
    { ...size, fonts: font ? [{ name: "Barlow Condensed", data: font, weight: 900, style: "normal" }] : [] },
  );
}
