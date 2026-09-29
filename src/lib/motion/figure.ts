// A small sagittal-plane model of a human body, used to draw chronophotographs:
// the multiple-exposure motion studies Étienne-Jules Marey made in the 1880s,
// the first time anyone measured human movement instead of guessing at it.
//
// Units are body heights (1 = the athlete's height). x points forward, y points
// UP, and the origin is the ground directly under the hip. Every angle is
// measured from straight down, positive = rotated forward; `dir()` turns one
// into a vector. Segment lengths are Winter's anthropometric ratios.
//
// Nothing here touches the DOM, so the same model draws the animated canvas in
// the hero and the static SVG plates rendered on the server.

export type Vec = { x: number; y: number };
export type Side = { elbow: Vec; wrist: Vec; knee: Vec; ankle: Vec; heel: Vec; toe: Vec };
export type Figure = { hip: Vec; shoulder: Vec; head: Vec; headR: number; near: Side; far: Side };

const DEG = Math.PI / 180;

export const SEG = {
  thigh: 0.245,
  shank: 0.246,
  foot: 0.105, // ankle -> ball of the foot
  heel: 0.055,
  ankleH: 0.045, // ankle height above the floor with the foot flat
  torso: 0.29, // hip -> shoulder
  neck: 0.12, // shoulder -> centre of the head
  headR: 0.058,
  upperArm: 0.186,
  forearm: 0.15,
} as const;

// With the shank vertical and the foot flat, the ankle -> ball line points 65°
// forward of straight down. Plantarflexion (toes down) subtracts from this.
const FOOT_NEUTRAL = 65;
const HEEL_OFFSET = -110;

const vec = (x: number, y: number): Vec => ({ x, y });
const add = (a: Vec, b: Vec): Vec => vec(a.x + b.x, a.y + b.y);
export const dir = (deg: number, len: number): Vec =>
  vec(Math.sin(deg * DEG) * len, -Math.cos(deg * DEG) * len);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mod1 = (t: number) => ((t % 1) + 1) % 1;

/* -------------------------------------------------------------------------- */
/*  Periodic keyframe curves                                                  */
/* -------------------------------------------------------------------------- */

type Curve = { at: readonly number[]; v: readonly number[] };

/** Cubic Hermite through periodic keyframes (finite-difference tangents). */
function sample(c: Curve, phase: number): number {
  const n = c.at.length;
  const t = mod1(phase);
  let i = -1;
  for (let k = 0; k < n; k++) if (c.at[k] <= t) i = k;
  const P = (k: number) => c.at[((k % n) + n) % n] + Math.floor(k / n);
  const V = (k: number) => c.v[((k % n) + n) % n];
  const p0 = P(i);
  const p1 = P(i + 1);
  const h = p1 - p0;
  const m0 = (V(i + 1) - V(i - 1)) / (P(i + 1) - P(i - 1));
  const m1 = (V(i + 2) - V(i)) / (P(i + 2) - P(i));
  const s = (t - p0) / h;
  const s2 = s * s;
  const s3 = s2 * s;
  return (
    (2 * s3 - 3 * s2 + 1) * V(i) +
    (s3 - 2 * s2 + s) * h * m0 +
    (-2 * s3 + 3 * s2) * V(i + 1) +
    (s3 - s2) * h * m1
  );
}

/** Two curves on the same keyframes, blended value-by-value. */
function blend(a: Curve, b: Curve, t: number): Curve {
  if (t <= 0) return a;
  if (t >= 1) return b;
  return { at: a.at, v: a.v.map((x, i) => lerp(x, b.v[i], t)) };
}

/* -------------------------------------------------------------------------- */
/*  Sprinting at top speed                                                    */
/* -------------------------------------------------------------------------- */
// Phase 0 = the near foot touches down. Ground contact lasts ~22% of the cycle
// at top speed; the far leg runs half a cycle behind.

export const STANCE = 0.22;
const CLEARANCE = 0.02; // how high the hip rises in each flight phase
export const STRIDE = 2.1; // body heights travelled per full cycle (two steps)

const LEG_AT = [0, 0.1, 0.22, 0.32, 0.5, 0.66, 0.78, 0.9];
// Clean mechanics: the foot lands close under the hip with the shank near
// vertical, the knee drives high in front, the heel folds tight behind.
const GOOD = {
  thigh: { at: LEG_AT, v: [18, 6, -18, -24, 18, 56, 64, 40] },
  knee: { at: LEG_AT, v: [30, 44, 26, 74, 126, 108, 78, 38] },
  ankle: { at: LEG_AT, v: [12, -14, 32, 22, 4, -6, -8, -2] },
};
// Overstriding: the lower leg is flung out in front and lands on the heel with
// a nearly straight knee, far ahead of the hip — a brake on every single step,
// and a classic source of hamstring load.
const OVERSTRIDE = {
  thigh: { at: LEG_AT, v: [34, 18, -16, -24, 18, 56, 66, 48] },
  knee: { at: LEG_AT, v: [6, 28, 26, 74, 126, 108, 64, 14] },
  ankle: { at: LEG_AT, v: [-14, -6, 32, 22, 4, -6, -10, -14] },
};
// The arm on the same side swings against its leg.
const ARM_AT = [0, 0.15, 0.3, 0.45, 0.6, 0.78, 0.9];
const ARM = { at: ARM_AT, v: [-20, 30, 56, 30, -20, -46, -40] };
const ELBOW = { at: ARM_AT, v: [95, 80, 70, 80, 100, 110, 104] };

export type SprintParams = {
  /** 0 = clean mechanics, 1 = overstriding. */
  overstride?: number;
  /** Extra forward lean in degrees (acceleration posture). */
  lean?: number;
};

type LegPts = { knee: Vec; ankle: Vec; heel: Vec; toe: Vec };

function footFrom(ankle: Vec, footDeg: number) {
  return {
    toe: add(ankle, dir(footDeg, SEG.foot)),
    heel: add(ankle, dir(footDeg + HEEL_OFFSET, SEG.heel)),
  };
}

function sprintLeg(phase: number, os: number): LegPts {
  const thigh = sample(blend(GOOD.thigh, OVERSTRIDE.thigh, os), phase);
  const knee = sample(blend(GOOD.knee, OVERSTRIDE.knee, os), phase);
  const ankleFlex = sample(blend(GOOD.ankle, OVERSTRIDE.ankle, os), phase);
  const kneePt = dir(thigh, SEG.thigh);
  const shank = thigh - knee;
  const anklePt = add(kneePt, dir(shank, SEG.shank));
  return { knee: kneePt, ankle: anklePt, ...footFrom(anklePt, shank + FOOT_NEUTRAL - ankleFlex) };
}

/** How far below the hip this leg's lowest point reaches. */
function reach(l: LegPts) {
  return -Math.min(l.ankle.y, l.heel.y, l.toe.y);
}

/** Hip height: planted on the stance leg, ballistic in each flight phase. */
function sprintHipHeight(phase: number, os: number) {
  const t = mod1(phase);
  const R = (p: number) => reach(sprintLeg(p, os));
  if (t < STANCE) return R(t);
  if (t >= 0.5 && t < 0.5 + STANCE) return R(t - 0.5);
  const a = t < 0.5 ? STANCE : 0.5 + STANCE;
  const b = t < 0.5 ? 0.5 : 1;
  const s = (t - a) / (b - a);
  return lerp(R(STANCE), R(0), s) + CLEARANCE * Math.sin(Math.PI * s);
}

function arm(shoulder: Vec, phase: number, lean: number) {
  const ua = sample(ARM, phase) + lean * 0.5;
  const el = sample(ELBOW, phase);
  const elbow = add(shoulder, dir(ua, SEG.upperArm));
  return { elbow, wrist: add(elbow, dir(ua + el, SEG.forearm)) };
}

export function sprintFigure(phase: number, p: SprintParams = {}): Figure {
  const os = Math.min(1, Math.max(0, p.overstride ?? 0));
  const lean = lerp(8, 2, os) + (p.lean ?? 0);
  const hip = vec(0, sprintHipHeight(phase, os));
  const shoulder = add(hip, dir(180 - lean, SEG.torso));
  const head = add(shoulder, dir(180 - lean - 4, SEG.neck));
  const nearLeg = sprintLeg(phase, os);
  const farLeg = sprintLeg(phase + 0.5, os);
  const off = (l: LegPts): LegPts => ({
    knee: add(hip, l.knee),
    ankle: add(hip, l.ankle),
    heel: add(hip, l.heel),
    toe: add(hip, l.toe),
  });
  return {
    hip,
    shoulder,
    head,
    headR: SEG.headR,
    near: { ...arm(shoulder, phase, lean), ...off(nearLeg) },
    far: { ...arm(shoulder, phase + 0.5, lean), ...off(farLeg) },
  };
}

/* -------------------------------------------------------------------------- */
/*  Squat                                                                     */
/* -------------------------------------------------------------------------- */
// Built up from the planted foot. `depth` 0 = standing, 1 = thighs just below
// parallel. `hipsFirst` is the classic fault out of the bottom: the hips rise
// faster than the chest and the squat turns into a good-morning.

export type SquatParams = { hipsFirst?: number };

export function squatFigure(depth: number, p: SquatParams = {}): Figure {
  const d = Math.min(1, Math.max(0, depth));
  const fault = p.hipsFirst ?? 0;
  const shankTilt = 36 * d; // knee travels forward over the toes
  const thighTilt = 84 * d * (1 - 0.18 * fault); // thigh tips back towards the floor
  const lean = 4 + 40 * d + 26 * fault * Math.sin(Math.PI * d); // chest drops when the hips shoot up
  const ankle = vec(0, SEG.ankleH);
  const knee = add(ankle, dir(180 - shankTilt, SEG.shank));
  const hip = add(knee, dir(180 + thighTilt, SEG.thigh));
  const shoulder = add(hip, dir(180 - lean, SEG.torso));
  const head = add(shoulder, dir(180 - lean + 10 * d, SEG.neck));
  const ua = 88 * d + 4;
  const elbow = add(shoulder, dir(ua, SEG.upperArm));
  const wrist = add(elbow, dir(ua + 6, SEG.forearm));
  const foot = footFrom(ankle, FOOT_NEUTRAL);
  const side: Side = { elbow, wrist, knee, ankle, ...foot };
  // Shift everything so x = 0 sits under the hip, like the sprint model.
  const shift = (v: Vec) => vec(v.x - hip.x, v.y);
  const s = (sd: Side): Side => ({
    elbow: shift(sd.elbow),
    wrist: shift(sd.wrist),
    knee: shift(sd.knee),
    ankle: shift(sd.ankle),
    heel: shift(sd.heel),
    toe: shift(sd.toe),
  });
  return {
    hip: shift(hip),
    shoulder: shift(shoulder),
    head: shift(head),
    headR: SEG.headR,
    near: s(side),
    far: s(side),
  };
}

/* -------------------------------------------------------------------------- */
/*  Acceleration: the whole body inclines, not just the trunk                 */
/* -------------------------------------------------------------------------- */

/** Tip a figure forward by `deg` about its hip, then set it back on the floor. */
export function leanFigure(f: Figure, deg: number): Figure {
  const r = deg * DEG;
  const c = Math.cos(r);
  const sn = Math.sin(r);
  const rot = (p: Vec): Vec => {
    const dx = p.x - f.hip.x;
    const dy = p.y - f.hip.y;
    return vec(f.hip.x + dx * c + dy * sn, f.hip.y - dx * sn + dy * c);
  };
  const side = (s: Side): Side => ({
    elbow: rot(s.elbow),
    wrist: rot(s.wrist),
    knee: rot(s.knee),
    ankle: rot(s.ankle),
    heel: rot(s.heel),
    toe: rot(s.toe),
  });
  const near = side(f.near);
  const far = side(f.far);
  const floor = Math.min(near.toe.y, near.heel.y, near.ankle.y, far.toe.y, far.heel.y, far.ankle.y);
  const lift = (p: Vec) => vec(p.x, p.y - floor);
  const liftSide = (s: Side): Side => ({
    elbow: lift(s.elbow),
    wrist: lift(s.wrist),
    knee: lift(s.knee),
    ankle: lift(s.ankle),
    heel: lift(s.heel),
    toe: lift(s.toe),
  });
  return {
    hip: lift(f.hip),
    shoulder: lift(rot(f.shoulder)),
    head: lift(rot(f.head)),
    headR: f.headR,
    near: liftSide(near),
    far: liftSide(far),
  };
}

/* -------------------------------------------------------------------------- */
/*  Helpers shared by the renderers                                           */
/* -------------------------------------------------------------------------- */

/** The point of the near foot that is lowest, i.e. what touches the ground. */
export function contactPoint(f: Figure): Vec {
  const { ankle, heel, toe } = f.near;
  return [ankle, heel, toe].reduce((lo, p) => (p.y < lo.y ? p : lo));
}

export type Segment = readonly [Vec, Vec];

/** Line segments of one figure, split so renderers can shade near/far apart. */
export function segments(f: Figure) {
  // The foot is one stroke, ankle to ball, the way Marey's striped suits read.
  const limb = (s: Side): Segment[] => [
    [f.shoulder, s.elbow],
    [s.elbow, s.wrist],
    [f.hip, s.knee],
    [s.knee, s.ankle],
    [s.ankle, s.toe],
  ];
  return {
    far: limb(f.far),
    trunk: [[f.hip, f.shoulder] as Segment],
    near: limb(f.near),
    joints: [f.shoulder, f.near.elbow, f.near.wrist, f.hip, f.near.knee, f.near.ankle],
    farJoints: [f.far.elbow, f.far.wrist, f.far.knee, f.far.ankle],
  };
}
