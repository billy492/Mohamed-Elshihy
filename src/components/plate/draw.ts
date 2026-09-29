import { segments, type Figure, type Segment, type Vec } from "@/lib/motion/figure";

// Canvas drawing for one exposure of a chronophotograph. Exposures are drawn
// with additive blending ("lighter"), exactly how a multiple-exposure plate
// works: where two exposures overlap, the silver builds up and glows.
// Marey's subjects wore black suits with white stripes down each limb and a
// bright button at each joint, so a figure is thin lines, small dots, and a
// small ring for the head.

export type Ink = readonly [number, number, number];
export const WHITE: Ink = [243, 243, 239];
export const RED: Ink = [212, 21, 31];
export const SILVER: Ink = [141, 141, 136];

export const mixInk = (a: Ink, b: Ink, t: number): Ink => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
export const rgba = (c: Ink, a: number) =>
  `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${Math.max(0, Math.min(1, a)).toFixed(3)})`;

export type Exposure = {
  fig: Figure;
  /** Screen x of the hip. */
  x: number;
  /** Screen y of the ground line. */
  ground: number;
  /** Body height in CSS pixels. */
  scale: number;
  /** 1 = settled exposure; >1 while the strobe fires. */
  intensity: number;
  ink: Ink;
  /** Optional ink for the near leg (the telestrator highlight). */
  legInk?: Ink;
  /** 0..1 — how much this exposure is the one under analysis. */
  emphasis?: number;
};

export function drawExposure(ctx: CanvasRenderingContext2D, e: Exposure) {
  const { fig, x, ground, scale: H, intensity: I, ink } = e;
  if (I <= 0.001) return;
  const em = e.emphasis ?? 0;
  const px = (p: Vec) => x + p.x * H;
  const py = (p: Vec) => ground - p.y * H;
  const stroke = (segs: readonly Segment[]) => {
    ctx.beginPath();
    for (const [a, b] of segs) {
      ctx.moveTo(px(a), py(a));
      ctx.lineTo(px(b), py(b));
    }
    ctx.stroke();
  };
  const dot = (p: Vec, r: number) => {
    ctx.moveTo(px(p) + r, py(p));
    ctx.arc(px(p), py(p), r, 0, Math.PI * 2);
  };
  const s = segments(fig);
  const alpha = Math.min(1, 0.74 * I);
  const lw = Math.max(1.05, H * 0.0042) * (1 + 0.45 * em);
  const flash = Math.max(0, I - 1);

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // The body's mass: a faint wide smear that builds up where exposures overlap.
  ctx.shadowBlur = 0;
  ctx.lineWidth = H * 0.07;
  ctx.strokeStyle = rgba(ink, 0.022 * Math.min(I, 1.4));
  stroke([...s.trunk, s.near[2], s.near[3], s.far[2], s.far[3]]);

  if (flash > 0) {
    ctx.shadowColor = rgba(ink, 0.95);
    ctx.shadowBlur = 20 * flash;
  }

  // Far limbs first and dimmer: depth without any perspective maths.
  ctx.lineWidth = lw;
  ctx.strokeStyle = rgba(ink, alpha * 0.3);
  stroke(s.far);

  // Trunk, near arm, head.
  ctx.strokeStyle = rgba(ink, alpha);
  stroke([...s.trunk, s.near[0], s.near[1]]);
  ctx.strokeStyle = rgba(ink, alpha * (0.62 + 0.38 * em));
  ctx.beginPath();
  ctx.arc(px(fig.head), py(fig.head), fig.headR * H * (0.5 + 0.2 * em), 0, Math.PI * 2);
  ctx.stroke();

  // Near leg, optionally in the highlight ink.
  if (e.legInk) {
    ctx.strokeStyle = rgba(e.legInk, Math.min(1, alpha * 1.15));
    ctx.shadowColor = rgba(e.legInk, 0.85);
    ctx.shadowBlur = Math.max(flash > 0 ? 20 * flash : 0, 8);
    ctx.lineWidth = lw * 1.25;
  }
  stroke([s.near[2], s.near[3], s.near[4]]);
  ctx.lineWidth = lw;
  ctx.shadowBlur = flash > 0 ? 20 * flash : 0;

  // Joint buttons.
  const r = Math.max(1.2, H * 0.0056) * (1 + 0.4 * em);
  ctx.fillStyle = rgba(ink, alpha);
  ctx.beginPath();
  for (const j of s.joints) dot(j, r);
  ctx.fill();
  ctx.fillStyle = rgba(ink, alpha * 0.3);
  ctx.beginPath();
  for (const j of s.farJoints) dot(j, r * 0.8);
  ctx.fill();
  ctx.shadowBlur = 0;
}
