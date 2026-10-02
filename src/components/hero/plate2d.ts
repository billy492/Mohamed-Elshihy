import { STRIDE, contactPoint, sprintFigure } from "@/lib/motion/figure";
import { RED, SILVER, WHITE, drawExposure, mixInk, rgba } from "@/components/plate/draw";
import { ATHLETE_CM, T, clamp01, easeInOut, easeOut, prog } from "./timeline";

// The 2D chronophotograph: the fallback when WebGL isn't available, drawn with
// the same body model and the same timeline as the 3D hero.

export type Layout = {
  w: number;
  h: number;
  mobile: boolean;
  n: number;
  k: number;
  body: number;
  ground: number;
  xs: number[];
  phases: number[];
};

export function layout(w: number, h: number): Layout {
  const mobile = w < 760;
  // Marey's plates overlap: exposures a fifth of a body height apart read as
  // one continuous movement rather than a row of separate figures.
  const n = w >= 1180 ? 17 : w >= 760 ? 13 : 9;
  const bottom = mobile ? 78 : 88; // room under the floor for the ruler and the reading
  const top = mobile ? 76 : 104; // clear of the header
  const ground = h - bottom;
  const body = Math.max(90, Math.min(ground - top, w * (mobile ? 0.44 : 0.25)) / 1.02);
  const left = w * (mobile ? 0.08 : 0.05) + body * 0.22;
  const right = w * (mobile ? 0.92 : 0.95) - body * 0.34;
  const gap = (right - left) / (n - 1);
  const k = Math.round((n - 1) * (mobile ? 0.55 : 0.62));
  const dPhase = gap / body / STRIDE;
  const xs = Array.from({ length: n }, (_, i) => left + i * gap);
  const phases = xs.map((_, i) => (i - k) * dPhase);
  return { w, h, mobile, n, k, body, ground, xs, phases };
}

export function drawFrame(ctx: CanvasRenderingContext2D, L: Layout, t: number, font: string) {
  const { w, h, body, ground, xs, phases, k, mobile } = L;
  ctx.clearRect(0, 0, w, h);

  /* ---- the floor: a measuring rule, like the scale on Marey's plates ---- */
  const rule = easeOut(prog(t, T.ruler));
  const cm10 = body / (ATHLETE_CM / 10);
  const origin = xs[0];
  ctx.lineWidth = 1;
  ctx.strokeStyle = rgba(SILVER, 0.55);
  ctx.beginPath();
  ctx.moveTo(0, ground + 0.5);
  ctx.lineTo(w * rule, ground + 0.5);
  ctx.stroke();
  ctx.beginPath();
  const firstTick = -Math.floor(origin / cm10);
  for (let i = firstTick; i < firstTick + 4000; i++) {
    const x = origin + i * cm10;
    if (x > w * rule) break;
    const len = i % 10 === 0 ? 9 : i % 5 === 0 ? 6 : mobile ? 0 : 3;
    if (!len) continue;
    ctx.moveTo(Math.round(x) + 0.5, ground);
    ctx.lineTo(Math.round(x) + 0.5, ground + len);
  }
  ctx.strokeStyle = rgba(SILVER, 0.45);
  ctx.stroke();
  ctx.fillStyle = rgba(SILVER, 0.75);
  ctx.font = `${mobile ? 10 : 11}px ${font}`;
  ctx.textBaseline = "top";
  for (let m = 0; m < 200; m++) {
    const x = origin + m * cm10 * 10;
    if (x > w * rule || x > w - 30) break;
    ctx.fillText(m === 0 ? "0 m" : `${m}`, x + 3, ground + 12);
  }

  /* ---- the analysis state ---- */
  const focus = easeInOut(prog(t, T.focus)) * (1 - easeInOut(prog(t, T.unfocus)));
  const overstride = 1 - easeInOut(prog(t, T.morph));
  const whiten = easeInOut(prog(t, T.whiten));
  const redness = prog(t, T.focus) * (1 - whiten);

  /* ---- exposures ---- */
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < xs.length; i++) {
    const t0 = T.exposeStart + i * T.exposeGap;
    if (t < t0) continue;
    const dt = t - t0;
    let I = clamp01(dt / 28) * (1 + 0.95 * Math.exp(-dt / 150));
    I *= i === k ? 1 + 0.12 * focus : 1 - 0.74 * focus;
    drawExposure(ctx, {
      fig: sprintFigure(phases[i], { overstride }),
      x: xs[i],
      ground,
      scale: body,
      intensity: I,
      ink: WHITE,
      legInk: i === k && redness > 0.01 ? mixInk(WHITE, RED, redness) : undefined,
      emphasis: i === k ? focus : 0,
    });
  }
  ctx.globalCompositeOperation = "source-over";

  /* ---- the reading: plumb line from the hip, distance to the contact ---- */
  const plumb = easeOut(prog(t, T.plumb));
  if (plumb <= 0) return;
  const fig = sprintFigure(0, { overstride });
  const hipX = xs[k];
  const hipY = ground - fig.hip.y * body;
  const c = contactPoint(fig);
  const cx = hipX + c.x * body;
  const cy = ground - c.y * body;
  const ink = mixInk(RED, WHITE, whiten);
  const dimY = ground + (mobile ? 32 : 36);

  ctx.strokeStyle = rgba(ink, 0.95);
  ctx.fillStyle = rgba(ink, 0.95);
  ctx.lineWidth = 1.25;
  ctx.setLineDash([3, 4]);
  ctx.beginPath();
  ctx.moveTo(hipX, hipY);
  ctx.lineTo(hipX, hipY + (dimY + 6 - hipY) * plumb);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(hipX, hipY, 4.5, 0, Math.PI * 2 * plumb);
  ctx.stroke();

  const dim = easeOut(prog(t, T.dim));
  if (dim > 0) {
    const end = hipX + (cx - hipX) * dim;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(hipX, dimY);
    ctx.lineTo(end, dimY);
    ctx.moveTo(hipX, dimY - 5);
    ctx.lineTo(hipX, dimY + 5);
    if (dim > 0.98) {
      ctx.moveTo(cx, dimY - 5);
      ctx.lineTo(cx, dimY + 5);
    }
    ctx.stroke();
    // the telestrator ring around the contact
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy - 2, mobile ? 9 : 11, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * dim);
    ctx.stroke();
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(cx, cy + (mobile ? 9 : 11));
    ctx.lineTo(cx, cy + (dimY - cy) * dim);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

