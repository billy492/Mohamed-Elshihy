import {
  STRIDE,
  leanFigure,
  segments,
  sprintFigure,
  squatFigure,
  type Figure,
  type Vec,
} from "@/lib/motion/figure";

// Static chronophotographs, rendered on the server as SVG: no JavaScript, crisp
// at any size. Same body model as the animated hero.
//
//   squat  — a squat filmed down and up. On the way up the hips rise first and
//            the chest tips forward; the plate measures the trunk angle.
//   accel  — a sprint start: the whole body rises out of a deep lean while the
//            strides lengthen, exposure by exposure.

type Kind = "squat" | "accel";
type Shot = { fig: Figure; x: number; strong?: boolean };
type Scene = { w: number; h: number; body: number; ground: number; shots: Shot[] };

function squatScene(): Scene & { mark: Shot } {
  const w = 1000;
  const h = 520;
  const body = 360;
  const ground = h - 56;
  // Down on the left, back up on the right: the fault is in the second half.
  const depths = [0, 0.55, 1, 0.62, 0.3];
  const shots = depths.map((d, i) => ({
    fig: squatFigure(d, { hipsFirst: i > 2 ? 1 : 0 }),
    x: 130 + i * 175,
    strong: i === 3,
  }));
  return { w, h, body, ground, shots, mark: shots[3] };
}

function accelScene(): Scene {
  const w = 1400;
  const h = 440;
  const body = 300;
  const ground = h - 40;
  const n = 12;
  const shots: Shot[] = [];
  let x = 70;
  let phase = 0.55;
  for (let i = 0; i < n; i++) {
    const p = i / (n - 1);
    // body lean eases from 42° out of the start to upright running
    const lean = 42 * Math.pow(1 - p, 1.4);
    shots.push({ fig: leanFigure(sprintFigure(phase), lean), x });
    const gap = 58 + 74 * Math.pow(p, 0.9);
    x += gap;
    phase += gap / body / STRIDE;
  }
  return { w, h, body, ground, shots };
}

function Exposure({ f, x, ground, body, strong }: { f: Figure; x: number; ground: number; body: number; strong?: boolean }) {
  const P = (p: Vec) => [x + p.x * body, ground - p.y * body] as const;
  const s = segments(f);
  const line = (a: Vec, b: Vec, key: string) => {
    const [x1, y1] = P(a);
    const [x2, y2] = P(b);
    return <line key={key} x1={x1.toFixed(1)} y1={y1.toFixed(1)} x2={x2.toFixed(1)} y2={y2.toFixed(1)} />;
  };
  const [hx, hy] = P(f.head);
  const lw = strong ? 2.2 : 1.7;
  const on = strong ? 1 : 0.72;
  return (
    <g className="plate-shot">
      <g stroke="currentColor" strokeOpacity={on * 0.34} strokeWidth={lw} strokeLinecap="round">
        {s.far.map(([a, b], i) => line(a, b, `f${i}`))}
      </g>
      <g stroke="currentColor" strokeOpacity={on} strokeWidth={lw} strokeLinecap="round" fill="none">
        {[...s.trunk, ...s.near].map(([a, b], i) => line(a, b, `n${i}`))}
        <circle cx={hx.toFixed(1)} cy={hy.toFixed(1)} r={(f.headR * body * 0.55).toFixed(1)} strokeOpacity={on * 0.7} />
      </g>
      <g fill="currentColor" fillOpacity={on}>
        {s.joints.map((j, i) => {
          const [cx, cy] = P(j);
          return <circle key={i} cx={cx.toFixed(1)} cy={cy.toFixed(1)} r={strong ? 3.4 : 2.6} />;
        })}
      </g>
    </g>
  );
}

export default function Plate({ kind, className, title }: { kind: Kind; className?: string; title: string }) {
  const scene = kind === "squat" ? squatScene() : accelScene();
  const { w, h, body, ground, shots } = scene;

  let annotation: React.ReactNode = null;
  if (kind === "squat") {
    const m = (scene as ReturnType<typeof squatScene>).mark;
    const hip: Vec = { x: m.x + m.fig.hip.x * body, y: ground - m.fig.hip.y * body };
    const sh: Vec = { x: m.x + m.fig.shoulder.x * body, y: ground - m.fig.shoulder.y * body };
    const angle = Math.atan2(sh.x - hip.x, hip.y - sh.y); // trunk angle from vertical
    const deg = Math.round((angle * 180) / Math.PI);
    const r = 56;
    const len = 170;
    const tip = { x: hip.x + Math.sin(angle) * len, y: hip.y - Math.cos(angle) * len };
    annotation = (
      <g className="plate-mark" fill="none" strokeWidth={1.8}>
        <line x1={hip.x} y1={hip.y} x2={hip.x} y2={hip.y - len} strokeDasharray="2 6" />
        <line x1={hip.x} y1={hip.y} x2={tip.x} y2={tip.y} strokeDasharray="6 5" />
        <path
          d={`M ${hip.x} ${hip.y - r} A ${r} ${r} 0 0 1 ${hip.x + Math.sin(angle) * r} ${hip.y - Math.cos(angle) * r}`}
          strokeWidth={2.4}
        />
        <circle cx={hip.x} cy={hip.y} r={6} />
        <text x={hip.x - 8} y={hip.y - len - 18} className="plate-mark-text" stroke="none" textAnchor="middle">
          {deg}°
        </text>
      </g>
    );
  }

  return (
    <svg
      className={`plate ${className ?? ""}`}
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label={title}
      preserveAspectRatio="xMidYMid meet"
    >
      <line className="plate-floor" x1={0} y1={ground} x2={w} y2={ground} />
      {shots.map((s, i) => (
        <Exposure key={i} f={s.fig} x={s.x} ground={ground} body={body} strong={s.strong} />
      ))}
      {annotation}
    </svg>
  );
}
