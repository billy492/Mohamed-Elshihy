import * as THREE from "three";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { SEG, STRIDE, contactPoint, sprintFigure, type Figure, type Side } from "@/lib/motion/figure";
import { ATHLETE_CM, T, clamp01, exposureIntensity, sequenceState } from "./timeline";

// The hero chronophotograph in 3D. Marey dressed his runners in black suits
// with white stripes down the limbs, so only the stripes reached the plate.
// Every exposure here is that suit, built from the same body model: rigid
// black segments with ball joints (a motion-capture mannequin), the stripes
// riding on the surface that faces the camera, markers on the joints.
// Side-on, the suits vanish into the black and you are looking at Marey's
// plate. Scroll swings the camera round to the front: floodlight catches the
// bodies, the stripes start passing behind them, and the plate turns out to
// be an athlete running at you through space.

const GAP = 0.21; // strobe spacing, body heights
const LANES = [0.34, 1.02, 1.7, 2.38];
const AXIS_TOP = 1.2; // the reading hangs at the top of the measuring axis
const HALF_HIP = 0.055;
// How far each joint sits from the midline, in body heights; the near side is +z.
const Z = { shoulder: 0.1, elbow: 0.112, wrist: 0.094, hip: HALF_HIP, knee: 0.05, ankle: 0.046 } as const;
const FOOT_LEN = 0.134; // heel to ball of the foot
const HEAD_W = 0.047; // half-width of the head; it is taller than it is wide
const HEAD_H = 0.057;
const NECK_LEN = SEG.neck - HEAD_H * 0.85;

type Pointer = { x: number; y: number };
export type Reading = { x: number; y: number; cm: number; alpha: number; relabel: number; ink: number } | null;

export type HeroScene = {
  resize(w: number, h: number): void;
  frame(t: number, scroll: number, pointer: Pointer, dt: number): Reading;
  dispose(): void;
};

// sRGB, written straight to the canvas
type RGB = readonly [number, number, number];
const BG: RGB = [7 / 255, 7 / 255, 7 / 255];
const WHITE: RGB = [0.957, 0.957, 0.945];
const RED: RGB = [0.894, 0.024, 0.102];
const vec3 = (c: RGB) => new THREE.Vector3(c[0], c[1], c[2]);

/* ------------------------------------------------------------ shaders --- */

// Instances whose exposure has not fired yet are dropped outside the clip box.
const HIDE = /* glsl */ `gl_Position = vec4(0.0, 0.0, 2.0, 1.0); return;`;
// Normals through an instance matrix whose columns are orthogonal (rotation x scale).
const NORMAL_W = /* glsl */ `
  vec3 c0 = instanceMatrix[0].xyz;
  vec3 c1 = instanceMatrix[1].xyz;
  vec3 c2 = instanceMatrix[2].xyz;
  vec3 nW = normalize(c0 * (normal.x / dot(c0, c0)) + c1 * (normal.y / dot(c1, c1)) + c2 * (normal.z / dot(c2, c2)));`;

function bodyMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uBg: { value: vec3(BG) },
      uKey: { value: new THREE.Vector3(0, 1, 0) },
      uReveal: { value: 0 },
      uAgeFade: { value: 0 },
      uFog: { value: new THREE.Vector2(6, 16) },
    },
    vertexShader: /* glsl */ `
      attribute float aI;
      attribute float aAge;
      uniform vec2 uFog;
      uniform float uAgeFade;
      varying vec3 vN;
      varying vec3 vV;
      varying float vI;
      varying float vFog;
      void main() {
        // in space, older exposures fade: the newest athlete leads the trail
        vI = aI * mix(1.0, 0.2 + 0.8 * pow(aAge, 1.7), uAgeFade);
        if (aI <= 0.0005) { ${HIDE} }
        ${NORMAL_W}
        vec4 mv = viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0);
        vN = normalize(mat3(viewMatrix) * nW);
        vV = -mv.xyz;
        vFog = smoothstep(uFog.x, uFog.y, -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uBg;
      uniform vec3 uKey;
      uniform float uReveal;
      varying vec3 vN;
      varying vec3 vV;
      varying float vI;
      varying float vFog;
      void main() {
        vec3 N = normalize(vN);
        vec3 V = normalize(vV);
        float ndv = clamp(dot(N, V), 0.0, 1.0);
        float rim = pow(1.0 - ndv, 3.0);
        float key = clamp(dot(N, uKey), 0.0, 1.0);
        float I = clamp(vI, 0.0, 1.6);
        // a black suit under floodlight: almost nothing face-on, silver at the edges
        vec3 lit = uBg * 1.5 + vec3(0.11 * key * key + 0.016) * I + vec3(0.5, 0.51, 0.54) * rim * I;
        vec3 col = mix(uBg, lit, uReveal);
        gl_FragColor = vec4(mix(col, uBg, vFog), 1.0);
      }`,
  });
}

function stripeMaterial(depth: boolean) {
  return new THREE.ShaderMaterial({
    uniforms: { uAlpha: { value: 1 }, uAgeFade: { value: 0 }, uFog: { value: new THREE.Vector2(6, 16) } },
    vertexShader: /* glsl */ `
      attribute vec3 aCol;
      attribute float aLift;
      attribute float aAge;
      uniform vec2 uFog;
      uniform float uAgeFade;
      varying vec3 vCol;
      varying float vShade;
      varying float vFog;
      void main() {
        vCol = aCol * mix(1.0, 0.16 + 0.84 * pow(aAge, 1.7), uAgeFade);
        if (aCol.r + aCol.g + aCol.b <= 0.0005) { ${HIDE} }
        ${NORMAL_W}
        vec4 mv = viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0);
        vec3 toCam = normalize(-mv.xyz);
        // slide along the view ray onto the body's surface: same place on
        // screen, but now other bodies can pass in front of it
        mv.xyz += toCam * aLift;
        vShade = 0.72 + 0.28 * abs(dot(normalize(mat3(viewMatrix) * nW), toCam));
        vFog = smoothstep(uFog.x, uFog.y, -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uAlpha;
      varying vec3 vCol;
      varying float vShade;
      varying float vFog;
      void main() {
        gl_FragColor = vec4(vCol * vShade * (1.0 - vFog) * uAlpha, 1.0);
      }`,
    transparent: true,
    depthWrite: false,
    depthTest: depth,
    blending: THREE.AdditiveBlending,
  });
}

// The head is a sphere, and a sphere's outline is a circle from every angle.
function ringMaterial(depth: boolean) {
  return new THREE.ShaderMaterial({
    uniforms: { uAlpha: { value: 1 }, uFog: { value: new THREE.Vector2(6, 16) } },
    vertexShader: /* glsl */ `
      attribute vec3 aCol;
      uniform vec2 uFog;
      varying vec3 vCol;
      varying float vFog;
      void main() {
        vCol = aCol;
        if (aCol.r + aCol.g + aCol.b <= 0.0005) { ${HIDE} }
        vec4 mv = viewMatrix * modelMatrix * vec4(instanceMatrix[3].xyz, 1.0);
        mv.xy += position.xy * length(instanceMatrix[0].xyz);
        vFog = smoothstep(uFog.x, uFog.y, -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uAlpha;
      varying vec3 vCol;
      varying float vFog;
      void main() {
        gl_FragColor = vec4(vCol * (1.0 - vFog) * uAlpha, 1.0);
      }`,
    transparent: true,
    depthWrite: false,
    depthTest: depth,
    blending: THREE.AdditiveBlending,
  });
}

// The track: lane lines and metre ticks drawn analytically, so they stay
// clean at any angle instead of crawling while the camera moves.
function groundMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uBg: { value: vec3(BG) },
      uFog: { value: new THREE.Vector2(6, 16) },
      uLanes: { value: LANES },
      uPool: { value: new THREE.Vector2(0, 0) },
      uReveal: { value: 0 },
      uPerM: { value: ATHLETE_CM / 100 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vW;
      varying float vDepth;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        vec4 mv = viewMatrix * w;
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uBg;
      uniform vec2 uFog;
      uniform float uLanes[4];
      uniform vec2 uPool;
      uniform float uReveal;
      uniform float uPerM;
      varying vec3 vW;
      varying float vDepth;
      float band(float d, float w) {
        float fw = fwidth(d) * 1.1;
        return 1.0 - smoothstep(w - fw, w + fw, d);
      }
      void main() {
        float z = abs(vW.z);
        float a = 0.0;
        float near = 9.0;
        for (int i = 0; i < 4; i++) {
          float d = abs(z - uLanes[i]);
          near = min(near, d);
          a = max(a, band(d, 0.0055));
        }
        float m = vW.x * uPerM;
        float dm = abs(fract(m + 0.5) - 0.5) / uPerM;
        a = max(a, band(dm, 0.0035) * (1.0 - smoothstep(0.02, 0.03, near)));
        // a pool of floodlight where the athlete runs
        vec2 q = (vW.xz - uPool) * vec2(0.34, 0.9);
        float pool = exp(-dot(q, q)) * 0.03 * uReveal;
        vec3 col = uBg + vec3(pool) + vec3(0.957, 0.957, 0.945) * a * 0.19;
        float fog = smoothstep(uFog.x, uFog.y, vDepth);
        gl_FragColor = vec4(mix(col, uBg, fog), 1.0);
      }`,
  });
}

// Floodlight haze behind the athletes: the suits stand out against it in silhouette.
function hazeMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uReveal: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uReveal;
      varying vec2 vUv;
      void main() {
        vec2 q = (vUv - vec2(0.5, 0.42)) * vec2(1.0, 1.9);
        float g = exp(-dot(q, q) * 7.0) * 0.085 * uReveal;
        gl_FragColor = vec4(vec3(g * 0.96, g * 0.97, g), 1.0);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

function dustMaterial(size: number, dpr: number) {
  return new THREE.ShaderMaterial({
    uniforms: { uSize: { value: size }, uDpr: { value: dpr }, uTime: { value: 0 }, uFog: { value: new THREE.Vector2(6, 16) } },
    vertexShader: /* glsl */ `
      attribute vec3 color;
      varying vec3 vColor;
      uniform float uSize;
      uniform float uDpr;
      uniform float uTime;
      uniform vec2 uFog;
      void main() {
        vec3 p = position;
        p.y += sin(uTime * 0.35 + position.x * 1.7 + position.z) * 0.06;
        p.x += cos(uTime * 0.21 + position.y * 2.3) * 0.05;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vColor = color * (1.0 - smoothstep(uFog.x, uFog.y, -mv.z));
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * uDpr;
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.12, d);
        gl_FragColor = vec4(vColor * a, a);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

/* ----------------------------------------------------------- geometry --- */

type Profile = readonly (readonly [number, number])[]; // [fraction along the segment, radius]

// Radii in body heights, from anthropometric girths of a sprinter.
const PROFILE = {
  thigh: [[0, 0.05], [0.18, 0.053], [0.55, 0.045], [0.9, 0.035], [1, 0.033]],
  shank: [[0, 0.033], [0.22, 0.037], [0.55, 0.029], [0.88, 0.021], [1, 0.02]],
  upper: [[0, 0.031], [0.35, 0.029], [1, 0.022]],
  fore: [[0, 0.023], [0.3, 0.024], [1, 0.016]],
  torso: [[0, 0.07], [0.32, 0.064], [0.7, 0.079], [0.9, 0.072], [1, 0.05]],
  neck: [[0, 0.027], [1, 0.025]],
  foot: [[0, 0.02], [0.3, 0.027], [0.72, 0.021], [1, 0.013]],
} as const satisfies Record<string, Profile>;

/** A limb as a lathe along +y, from 0 to `len`, with rounded ends. */
function limbGeometry(len: number, prof: Profile, radial: number) {
  const pts: THREE.Vector2[] = [];
  const r0 = prof[0][1];
  const r1 = prof[prof.length - 1][1];
  for (let i = 0; i <= 5; i++) {
    const a = -Math.PI / 2 + (i / 5) * (Math.PI / 2);
    pts.push(new THREE.Vector2(Math.cos(a) * r0 + 1e-4, Math.sin(a) * r0));
  }
  for (const [t, r] of prof.slice(1, -1)) pts.push(new THREE.Vector2(r, t * len));
  for (let i = 0; i <= 5; i++) {
    const a = (i / 5) * (Math.PI / 2);
    pts.push(new THREE.Vector2(Math.cos(a) * r1 + 1e-4, len + Math.sin(a) * r1));
  }
  return new THREE.LatheGeometry(pts, radial);
}

const bx = new THREE.Vector3();
const by = new THREE.Vector3();
const bz = new THREE.Vector3();
const LAT = new THREE.Vector3(0, 0, 1);

/** Matrix taking a segment modelled along +y (length `len`) onto a → b, keeping its sides lateral. */
function orient(a: THREE.Vector3, b: THREE.Vector3, len: number, sx: number, sz: number, out: THREE.Matrix4) {
  by.subVectors(b, a);
  const d = by.length() || 1e-6;
  by.divideScalar(d);
  bz.copy(LAT).addScaledVector(by, -LAT.dot(by)).normalize();
  bx.crossVectors(by, bz);
  const sy = d / len;
  return out.set(
    bx.x * sx, by.x * sy, bz.x * sz, a.x,
    bx.y * sx, by.y * sy, bz.y * sz, a.y,
    bx.z * sx, by.z * sy, bz.z * sz, a.z,
    0, 0, 0, 1,
  );
}
const ball = (c: THREE.Vector3, r: number, out: THREE.Matrix4) => out.makeScale(r, r, r).setPosition(c);

type Limb3 = Record<"sh" | "el" | "wr" | "hip" | "kn" | "an" | "he" | "to", THREE.Vector3>;
const limb3 = (): Limb3 => ({
  sh: new THREE.Vector3(),
  el: new THREE.Vector3(),
  wr: new THREE.Vector3(),
  hip: new THREE.Vector3(),
  kn: new THREE.Vector3(),
  an: new THREE.Vector3(),
  he: new THREE.Vector3(),
  to: new THREE.Vector3(),
});
function place3(L: Limb3, s: Side, f: Figure, x0: number, sign: number) {
  L.sh.set(x0 + f.shoulder.x, f.shoulder.y, sign * Z.shoulder);
  L.el.set(x0 + s.elbow.x, s.elbow.y, sign * Z.elbow);
  L.wr.set(x0 + s.wrist.x, s.wrist.y, sign * Z.wrist);
  L.hip.set(x0 + f.hip.x, f.hip.y, sign * Z.hip);
  L.kn.set(x0 + s.knee.x, s.knee.y, sign * Z.knee);
  L.an.set(x0 + s.ankle.x, s.ankle.y, sign * Z.ankle);
  L.he.set(x0 + s.heel.x, s.heel.y, sign * Z.ankle);
  L.to.set(x0 + s.toe.x, s.toe.y, sign * Z.ankle);
}

/* ------------------------------------------------------------- camera --- */

type Key = { p: number; az: number; el: number; fov: number; dist: number; tx: number; ty: number };

/** Monotone cubic through the keys, flat at both ends: no overshoot, no stops in between. */
function monotone(xs: number[], ys: number[]) {
  const n = xs.length;
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  const m = new Array<number>(n).fill(0);
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const s = a * a + b * b;
    if (s > 9) {
      const k = 3 / Math.sqrt(s);
      m[i] = k * a * d[i];
      m[i + 1] = k * b * d[i];
    }
  }
  return (x: number) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i];
    const t = (x - xs[i]) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1]
    );
  };
}

function rig(keys: Key[]) {
  const ps = keys.map((k) => k.p);
  const f = (pick: (k: Key) => number) => monotone(ps, keys.map(pick));
  return { az: f((k) => k.az), el: f((k) => k.el), fov: f((k) => k.fov), dist: f((k) => k.dist), tx: f((k) => k.tx), ty: f((k) => k.ty) };
}

/* -------------------------------------------------------------- scene --- */

export function createHeroScene(canvas: HTMLCanvasElement, mobile: boolean): HeroScene {
  const maxDpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(maxDpr);
  renderer.setClearColor(0x070707, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(16, 1, 0.05, 80);

  const n = mobile ? 11 : 17;
  const k = Math.round((n - 1) * 0.62);
  const xs = Array.from({ length: n }, (_, i) => (i - k) * GAP);
  const phases = xs.map((x) => x / STRIDE);
  const fogged: { value: THREE.Vector2 }[] = [];
  const fogOf = (m: THREE.ShaderMaterial) => {
    fogged.push(m.uniforms.uFog as { value: THREE.Vector2 });
    return m;
  };

  /* ------------------------------------------------------------ track --- */
  const groundMat = fogOf(groundMaterial());
  groundMat.uniforms.uPool.value.set(xs[0] + (xs[n - 1] - xs[0]) * 0.55, 0);
  const groundGeo = new THREE.PlaneGeometry(44, 26).rotateX(-Math.PI / 2);
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.x = -1;
  scene.add(ground);

  const hazeMat = hazeMaterial();
  const hazeGeo = new THREE.PlaneGeometry(1, 1);
  const haze = new THREE.Mesh(hazeGeo, hazeMat);
  haze.frustumCulled = false;
  haze.renderOrder = 2;
  scene.add(haze);

  /* ------------------------------------------------------------- dust --- */
  const DUST = mobile ? 160 : 380;
  const dustPos = new Float32Array(DUST * 3);
  const dustCol = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 16;
    dustPos[i * 3 + 1] = 0.05 + Math.random() * 2.6;
    dustPos[i * 3 + 2] = (Math.random() - 0.7) * 10;
    const g = 0.08 + Math.random() * 0.14;
    dustCol.set([g, g, g], i * 3);
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  dustGeo.setAttribute("color", new THREE.BufferAttribute(dustCol, 3));
  const dustMat = fogOf(dustMaterial(2.2, maxDpr));
  const dust = new THREE.Points(dustGeo, dustMat);
  dust.frustumCulled = false;
  dust.renderOrder = 2;
  scene.add(dust);

  /* ----------------------------------------------------------- bodies --- */
  // 0 for the first exposure, 1 for the newest, per instance
  const ages = (per: number) =>
    new THREE.InstancedBufferAttribute(Float32Array.from({ length: n * per }, (_, j) => Math.floor(j / per) / (n - 1)), 1);
  const bodyMat = fogOf(bodyMaterial());
  const radial = mobile ? 12 : 16;
  const parts = {
    thigh: { geo: limbGeometry(SEG.thigh, PROFILE.thigh, radial), per: 2 },
    shank: { geo: limbGeometry(SEG.shank, PROFILE.shank, radial), per: 2 },
    foot: { geo: limbGeometry(FOOT_LEN, PROFILE.foot, radial), per: 2 },
    upper: { geo: limbGeometry(SEG.upperArm, PROFILE.upper, radial), per: 2 },
    fore: { geo: limbGeometry(SEG.forearm, PROFILE.fore, radial), per: 2 },
    torso: { geo: limbGeometry(SEG.torso, PROFILE.torso, radial + 4), per: 1 },
    neck: { geo: limbGeometry(NECK_LEN, PROFILE.neck, radial - 4), per: 1 },
    head: { geo: new THREE.SphereGeometry(1, 24, 18), per: 1 },
    joint: { geo: new THREE.SphereGeometry(1, mobile ? 12 : 14, mobile ? 8 : 10), per: 12 },
  };
  type PartName = keyof typeof parts;
  const bodies = {} as Record<PartName, { mesh: THREE.InstancedMesh; aI: THREE.InstancedBufferAttribute; per: number }>;
  for (const name of Object.keys(parts) as PartName[]) {
    const { geo, per } = parts[name];
    const count = per * n;
    const aI = new THREE.InstancedBufferAttribute(new Float32Array(count), 1);
    geo.setAttribute("aI", aI);
    geo.setAttribute("aAge", ages(per));
    const mesh = new THREE.InstancedMesh(geo, bodyMat, count);
    mesh.frustumCulled = false;
    mesh.renderOrder = 1;
    scene.add(mesh);
    bodies[name] = { mesh, aI, per };
  }

  /* ---------------------------------------------- stripes and markers --- */
  // Two passes of the same instances: without depth they are Marey's plate
  // (every exposure shows through every other); with depth they are stripes
  // on bodies in space. Scroll crossfades from one to the other.
  const STRIPES = 14;
  const MARKERS = 10;
  const rTube = mobile ? 0.0056 : 0.0042;
  const rMark = mobile ? 0.0105 : 0.0088;
  // body radius under each stripe and marker, so it sits on the surface
  const STRIPE_LIFT = [0.031, 0.024, 0.05, 0.034, 0.022, 0.075, 0.08, 0.072, 0.027, 0.031, 0.024, 0.05, 0.034, 0.022];
  const MARK_LIFT = [0.036, 0.024, 0.021, 0.052, 0.035, 0.023, 0.024, 0.021, 0.035, 0.023];

  const tubeGeo = new THREE.CylinderGeometry(1, 1, 1, 6, 1, true).translate(0, 0.5, 0);
  const stripeCol = new THREE.InstancedBufferAttribute(new Float32Array(n * STRIPES * 3), 3);
  const stripeLift = new THREE.InstancedBufferAttribute(new Float32Array(n * STRIPES), 1);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < STRIPES; j++) stripeLift.setX(i * STRIPES + j, STRIPE_LIFT[j] + rTube + 0.002);
  tubeGeo.setAttribute("aCol", stripeCol);
  tubeGeo.setAttribute("aLift", stripeLift);
  tubeGeo.setAttribute("aAge", ages(STRIPES));

  const markGeo = new THREE.IcosahedronGeometry(1, 1);
  const markCol = new THREE.InstancedBufferAttribute(new Float32Array(n * MARKERS * 3), 3);
  const markLift = new THREE.InstancedBufferAttribute(new Float32Array(n * MARKERS), 1);
  for (let i = 0; i < n; i++) for (let j = 0; j < MARKERS; j++) markLift.setX(i * MARKERS + j, MARK_LIFT[j] + rMark);
  markGeo.setAttribute("aCol", markCol);
  markGeo.setAttribute("aLift", markLift);
  markGeo.setAttribute("aAge", ages(MARKERS));

  const ringGeo = new THREE.RingGeometry(1.04, 1.04 + (mobile ? 0.13 : 0.1), 40);
  const ringCol = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3);
  ringGeo.setAttribute("aCol", ringCol);

  const passes = [false, true].map((depth) => {
    const stripeMat = fogOf(stripeMaterial(depth));
    const markMat = fogOf(stripeMaterial(depth));
    const ringMat = fogOf(ringMaterial(depth));
    const stripes = new THREE.InstancedMesh(tubeGeo, stripeMat, n * STRIPES);
    const marks = new THREE.InstancedMesh(markGeo, markMat, n * MARKERS);
    const rings = new THREE.InstancedMesh(ringGeo, ringMat, n);
    for (const m of [stripes, marks, rings]) {
      m.frustumCulled = false;
      m.renderOrder = depth ? 3 : 4;
      scene.add(m);
    }
    return { stripes, marks, rings, mats: [stripeMat, markMat, ringMat] };
  });
  // the depth pass draws the same instances as the plate pass
  passes[1].stripes.instanceMatrix = passes[0].stripes.instanceMatrix;
  passes[1].marks.instanceMatrix = passes[0].marks.instanceMatrix;
  passes[1].rings.instanceMatrix = passes[0].rings.instanceMatrix;

  /* ------------------------------------------------------- annotation --- */
  const ANN = 72;
  const annPos = new Float32Array(ANN * 6);
  const annCol = new Float32Array(ANN * 6);
  const annGeo = new LineSegmentsGeometry();
  annGeo.setPositions(annPos);
  annGeo.setColors(annCol);
  const annMat = new LineMaterial({
    color: 0xffffff,
    linewidth: mobile ? 1.6 : 2,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    worldUnits: false,
  });
  const ann = new LineSegments2(annGeo, annMat);
  ann.frustumCulled = false;
  ann.renderOrder = 5;
  scene.add(ann);

  /* ------------------------------------------------------------- pose --- */
  const figures: Figure[] = new Array(n);
  const J = Array.from({ length: n }, () => ({
    near: limb3(),
    far: limb3(),
    hipC: new THREE.Vector3(),
    shC: new THREE.Vector3(),
    head: new THREE.Vector3(),
    neckEnd: new THREE.Vector3(),
    hand: new THREE.Vector3(),
  }));
  const M = new THREE.Matrix4();
  const tv = new THREE.Vector3();

  function buildGeometry(overstride: number) {
    const S = passes[0].stripes;
    const K = passes[0].marks;
    const R = passes[0].rings;
    for (let i = 0; i < n; i++) {
      const f = sprintFigure(phases[i], { overstride });
      figures[i] = f;
      const x0 = xs[i];
      const b = J[i];
      place3(b.near, f.near, f, x0, 1);
      place3(b.far, f.far, f, x0, -1);
      b.hipC.set(x0 + f.hip.x, f.hip.y, 0);
      b.shC.set(x0 + f.shoulder.x, f.shoulder.y, 0);
      b.head.set(x0 + f.head.x, f.head.y, 0);
      tv.subVectors(b.head, b.shC).normalize();
      b.neckEnd.copy(b.head).addScaledVector(tv, -HEAD_H * 0.85);

      // the suit
      const sides = [b.far, b.near];
      sides.forEach((L, s) => {
        const at = 2 * i + s;
        bodies.thigh.mesh.setMatrixAt(at, orient(L.hip, L.kn, SEG.thigh, 1, 1, M));
        bodies.shank.mesh.setMatrixAt(at, orient(L.kn, L.an, SEG.shank, 1, 1, M));
        bodies.foot.mesh.setMatrixAt(at, orient(L.he, L.to, FOOT_LEN, 0.66, 1.15, M));
        bodies.upper.mesh.setMatrixAt(at, orient(L.sh, L.el, SEG.upperArm, 1, 1, M));
        bodies.fore.mesh.setMatrixAt(at, orient(L.el, L.wr, SEG.forearm, 1, 1, M));
        const jb = i * 12 + s * 6;
        tv.subVectors(L.wr, L.el).normalize();
        bodies.joint.mesh.setMatrixAt(jb, ball(tv.multiplyScalar(0.022).add(L.wr), 0.021, M));
        bodies.joint.mesh.setMatrixAt(jb + 1, ball(L.sh, 0.036, M));
        bodies.joint.mesh.setMatrixAt(jb + 2, ball(L.el, 0.024, M));
        bodies.joint.mesh.setMatrixAt(jb + 3, ball(L.kn, 0.035, M));
        bodies.joint.mesh.setMatrixAt(jb + 4, ball(L.an, 0.023, M));
        bodies.joint.mesh.setMatrixAt(jb + 5, ball(L.hip, 0.05, M));
      });
      bodies.torso.mesh.setMatrixAt(i, orient(b.hipC, b.shC, SEG.torso, 0.82, 1.38, M));
      bodies.neck.mesh.setMatrixAt(i, orient(b.shC, b.neckEnd, NECK_LEN, 1, 1, M));
      bodies.head.mesh.setMatrixAt(i, M.makeScale(HEAD_W, HEAD_H, HEAD_W).setPosition(b.head));

      // the stripes, in the order paint() colours them: far limbs, girdles,
      // spine, neck, near limbs
      const segs: [THREE.Vector3, THREE.Vector3][] = [
        [b.far.sh, b.far.el],
        [b.far.el, b.far.wr],
        [b.far.hip, b.far.kn],
        [b.far.kn, b.far.an],
        [b.far.an, b.far.to],
        [b.far.hip, b.near.hip],
        [b.far.sh, b.near.sh],
        [b.hipC, b.shC],
        [b.shC, b.neckEnd],
        [b.near.sh, b.near.el],
        [b.near.el, b.near.wr],
        [b.near.hip, b.near.kn],
        [b.near.kn, b.near.an],
        [b.near.an, b.near.to],
      ];
      segs.forEach(([p, q], j) => S.setMatrixAt(i * STRIPES + j, orient(p, q, 1, rTube, rTube, M)));
      const marks = [b.near.sh, b.near.el, b.near.wr, b.near.hip, b.near.kn, b.near.an, b.far.el, b.far.wr, b.far.kn, b.far.an];
      marks.forEach((p, j) => K.setMatrixAt(i * MARKERS + j, ball(p, rMark, M)));
      R.setMatrixAt(i, ball(b.head, HEAD_W, M));
    }
    for (const { mesh } of Object.values(bodies)) mesh.instanceMatrix.needsUpdate = true;
    S.instanceMatrix.needsUpdate = true;
    K.instanceMatrix.needsUpdate = true;
    R.instanceMatrix.needsUpdate = true;
  }

  /* ------------------------------------------------------------ paint --- */
  const col = (attr: THREE.InstancedBufferAttribute, idx: number, c: RGB, s: number) =>
    attr.setXYZ(idx, c[0] * s, c[1] * s, c[2] * s);
  const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

  function paint(t: number, s: ReturnType<typeof sequenceState>) {
    const legInk = s.redness > 0.01 ? mix(WHITE, RED, s.redness) : WHITE;
    for (let i = 0; i < n; i++) {
      let I = exposureIntensity(t, i);
      I *= i === k ? 1 + 0.25 * s.focus : 1 - 0.78 * s.focus;
      const a = Math.min(1.9, 0.8 * I);
      for (const { aI, per } of Object.values(bodies)) for (let j = 0; j < per; j++) aI.setX(i * per + j, I);
      for (let j = 0; j < STRIPES; j++) {
        const far = j < 5;
        const nearLeg = i === k && j >= 11;
        col(stripeCol, i * STRIPES + j, nearLeg ? legInk : WHITE, a * (far ? 0.34 : 1) * (nearLeg ? 1.25 : 1));
      }
      for (let j = 0; j < MARKERS; j++) col(markCol, i * MARKERS + j, WHITE, a * (j < 6 ? 0.95 : 0.3));
      col(ringCol, i, WHITE, a * 0.62);
    }
    for (const { aI } of Object.values(bodies)) aI.needsUpdate = true;
    stripeCol.needsUpdate = true;
    markCol.needsUpdate = true;
    ringCol.needsUpdate = true;
  }

  /* ------------------------------------------------------- annotation --- */
  const writeSeg = (arr: Float32Array, idx: number, a: THREE.Vector3Like, b: THREE.Vector3Like) => {
    const o = idx * 6;
    arr[o] = a.x;
    arr[o + 1] = a.y;
    arr[o + 2] = a.z;
    arr[o + 3] = b.x;
    arr[o + 4] = b.y;
    arr[o + 5] = b.z;
  };
  const writeCol = (arr: Float32Array, idx: number, c: THREE.Color, s: number) => {
    const o = idx * 6;
    arr[o] = arr[o + 3] = c.r * s;
    arr[o + 1] = arr[o + 4] = c.g * s;
    arr[o + 2] = arr[o + 5] = c.b * s;
  };
  const INK_RED = new THREE.Color("#e4061a");
  const INK_WHITE = new THREE.Color("#f4f4f1");
  const ink = new THREE.Color();
  function annotate(s: ReturnType<typeof sequenceState>) {
    annCol.fill(0);
    if (s.plumb <= 0) {
      (annGeo.attributes.instanceColorStart as THREE.InterleavedBufferAttribute).data.needsUpdate = true;
      return null;
    }
    const f = figures[k];
    const c = contactPoint(f);
    const hipY = f.hip.y;
    const cx = xs[k] + c.x;
    ink.copy(INK_RED).lerp(INK_WHITE, s.whiten);
    let seg = 0;
    const put = (a: THREE.Vector3Like, b: THREE.Vector3Like, alpha: number) => {
      if (seg >= ANN) return;
      writeSeg(annPos, seg, a, b);
      writeCol(annCol, seg, ink, alpha);
      seg++;
    };
    // the measuring axis: from above the head, through the hip, to the floor
    const dashes = 30;
    const top = AXIS_TOP;
    const bottom = -0.02;
    for (let d = 0; d < dashes; d++) {
      const y0 = top - ((top - bottom) * d) / dashes;
      const y1 = y0 - ((top - bottom) / dashes) * 0.55;
      if (d / dashes > s.plumb) break;
      put({ x: xs[k], y: y0, z: HALF_HIP }, { x: xs[k], y: y1, z: HALF_HIP }, y0 > hipY ? 0.6 : 1.2);
    }
    // hip marker
    for (let r = 0; r < 12; r++) {
      if (r / 12 > s.plumb) break;
      const a0 = (r / 12) * Math.PI * 2;
      const a1 = ((r + 1) / 12) * Math.PI * 2;
      put(
        { x: xs[k] + Math.cos(a0) * 0.022, y: hipY + Math.sin(a0) * 0.022, z: HALF_HIP },
        { x: xs[k] + Math.cos(a1) * 0.022, y: hipY + Math.sin(a1) * 0.022, z: HALF_HIP },
        1.2,
      );
    }
    if (s.dim > 0) {
      const z = HALF_HIP + 0.12;
      const end = xs[k] + (cx - xs[k]) * s.dim;
      put({ x: xs[k], y: 0.002, z }, { x: end, y: 0.002, z }, 1.4);
      put({ x: xs[k], y: 0, z: z - 0.04 }, { x: xs[k], y: 0, z: z + 0.04 }, 1.4);
      put({ x: xs[k], y: 0, z: HALF_HIP }, { x: xs[k], y: 0, z }, 0.8);
      if (s.dim > 0.98) put({ x: cx, y: 0, z: z - 0.04 }, { x: cx, y: 0, z: z + 0.04 }, 1.4);
      // ring on the floor around the contact
      for (let r = 0; r < 20; r++) {
        if (r / 20 > s.dim) break;
        const a0 = (r / 20) * Math.PI * 2;
        const a1 = ((r + 1) / 20) * Math.PI * 2;
        put(
          { x: cx + Math.cos(a0) * 0.07, y: 0.003, z: HALF_HIP + Math.sin(a0) * 0.07 },
          { x: cx + Math.cos(a1) * 0.07, y: 0.003, z: HALF_HIP + Math.sin(a1) * 0.07 },
          1.3,
        );
      }
    }
    (annGeo.attributes.instanceStart as THREE.InterleavedBufferAttribute).data.needsUpdate = true;
    (annGeo.attributes.instanceColorStart as THREE.InterleavedBufferAttribute).data.needsUpdate = true;
    return { cx, cm: Math.round(c.x * ATHLETE_CM) };
  }

  /* ----------------------------------------------------------- camera --- */
  let W = 1;
  let H = 1;
  let path = rig([{ p: 0, az: 0, el: 6, fov: 16, dist: 6, tx: 0, ty: 0.4 }]);
  const view = { pAz: 0, pEl: 0, clock: 0 };
  const target = new THREE.Vector3();
  const keyWorld = new THREE.Vector3(-0.25, 1, 0.65).normalize();
  const keyView = new THREE.Vector3();
  const hv = new THREE.Vector3();
  const v = new THREE.Vector3();

  function frame(aspect: number) {
    // Side-on (Marey's plate) → round to the front, low, the athlete coming at you.
    if (mobile) {
      return rig([
        { p: 0, az: 26, el: 9, fov: 31, dist: 6.6, tx: -0.15, ty: 0.42 },
        { p: 0.45, az: 42, el: 8, fov: 36, dist: 4.8, tx: 0.08, ty: 0.47 },
        { p: 1, az: 56, el: 5, fov: 42, dist: 3.15, tx: 0.5, ty: 0.52 },
      ]);
    }
    const seqW = (n - 1) * GAP + 0.9;
    const fit = (seqW * 1.08) / (2 * Math.tan(THREE.MathUtils.degToRad(8)) * aspect);
    const d0 = Math.max(fit, 5.5);
    return rig([
      { p: 0, az: 0, el: 6, fov: 16, dist: d0, tx: 0.05, ty: 0.36 },
      { p: 0.3, az: 14, el: 8, fov: 20, dist: d0 * 0.8, tx: 0.02, ty: 0.4 },
      { p: 0.65, az: 40, el: 7, fov: 27, dist: 4.1, tx: 0.08, ty: 0.46 },
      { p: 1, az: 56, el: 4.5, fov: 31, dist: 3.35, tx: 0.36, ty: 0.5 },
    ]);
  }

  function place(scroll: number, pointer: Pointer, dt: number) {
    const p = clamp01(scroll);
    // pointer parallax and a slow drift keep the scene alive; both follow
    // time that only runs while we draw, so nothing jumps after a pause
    const follow = 1 - Math.exp(-dt * 3);
    view.pAz += (pointer.x * 3 - view.pAz) * follow;
    view.pEl += (pointer.y * 1.6 - view.pEl) * follow;
    view.clock += dt;
    const drift = Math.sin(view.clock / 4.2) * 0.8;
    const A = THREE.MathUtils.degToRad(path.az(p) + view.pAz + drift);
    const E = THREE.MathUtils.degToRad(path.el(p) + view.pEl);
    const dist = path.dist(p);
    target.set(path.tx(p), path.ty(p), 0);
    camera.fov = path.fov(p);
    camera.aspect = W / H;
    camera.position.set(
      target.x + dist * Math.sin(A) * Math.cos(E),
      target.y + dist * Math.sin(E),
      target.z + dist * Math.cos(A) * Math.cos(E),
    );
    camera.lookAt(target);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    // fog follows the camera: the nearest athlete is crisp, the trail fades
    for (const u of fogged) u.value.set(dist * 0.85, dist + 9);
    keyView.copy(keyWorld).transformDirection(camera.matrixWorldInverse);
    bodyMat.uniforms.uKey.value.copy(keyView);
    hv.subVectors(target, camera.position).setY(0).normalize();
    haze.position.copy(target).addScaledVector(hv, 7);
    haze.position.y = 1.1;
    haze.quaternion.copy(camera.quaternion);
    const hs = (dist + 7) * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 2.4;
    haze.scale.set(hs * camera.aspect, hs, 1);
  }

  let lastOverstride = -1;
  let settled = false;
  let reading: { cx: number; cm: number } | null = null;

  return {
    resize(w, h) {
      W = Math.max(1, w);
      H = Math.max(1, h);
      // keep the pixel count bounded on big screens; multisampling stays on
      const budget = mobile ? 1.7e6 : 6.4e6;
      const dpr = Math.min(maxDpr, Math.sqrt(budget / (W * H)));
      renderer.setPixelRatio(dpr);
      dustMat.uniforms.uDpr.value = dpr;
      renderer.setSize(W, H, false);
      annMat.resolution.set(W, H);
      path = frame(W / H);
    },
    frame(t, scroll, pointer, dt) {
      const s = sequenceState(t);
      if (Math.abs(s.overstride - lastOverstride) > 1e-4) {
        buildGeometry(s.overstride);
        lastOverstride = s.overstride;
      }
      // Once the sequence has settled, only the camera moves: the colour
      // buffers stop being rewritten and re-uploaded every frame.
      if (t < T.done + 200 || !settled) {
        paint(t, s);
        reading = annotate(s);
        settled = t >= T.done + 200;
      }
      const p = clamp01(scroll);
      // the plate becomes bodies as the camera leaves the side-on view
      const e = clamp01((p - 0.04) / 0.4);
      const reveal = e * e * (3 - 2 * e);
      bodyMat.uniforms.uReveal.value = reveal;
      bodyMat.uniforms.uAgeFade.value = reveal;
      groundMat.uniforms.uReveal.value = reveal;
      hazeMat.uniforms.uReveal.value = reveal;
      haze.visible = reveal > 0.001;
      for (const m of passes[0].mats) m.uniforms.uAlpha.value = 1 - reveal;
      for (const m of passes[1].mats) m.uniforms.uAlpha.value = reveal;
      for (const m of [...passes[0].mats, ...passes[1].mats]) if (m.uniforms.uAgeFade) m.uniforms.uAgeFade.value = reveal;
      for (const m of [passes[0].stripes, passes[0].marks, passes[0].rings]) m.visible = reveal < 0.999;
      for (const m of [passes[1].stripes, passes[1].marks]) m.visible = reveal > 0.001;
      // in space the head is a lit body; the ring is only for the flat plate
      passes[1].rings.visible = false;
      // the analysis belongs to the plate; it clears as the bodies arrive
      annMat.opacity = 1 - reveal;
      ann.visible = reveal < 0.999;
      dustMat.uniforms.uTime.value = view.clock;
      place(scroll, pointer, dt);
      renderer.render(scene, camera);
      if (!reading || s.label <= 0) return null;
      v.set(xs[k], AXIS_TOP, HALF_HIP).project(camera);
      return {
        x: (v.x * 0.5 + 0.5) * W,
        y: (-v.y * 0.5 + 0.5) * H,
        cm: reading.cm,
        alpha: s.label * (1 - Math.min(1, p * 3)),
        relabel: s.relabel,
        ink: s.whiten,
      };
    },
    dispose() {
      for (const { geo } of Object.values(parts)) geo.dispose();
      for (const g of [groundGeo, hazeGeo, dustGeo, tubeGeo, markGeo, ringGeo, annGeo]) g.dispose();
      for (const m of [groundMat, hazeMat, dustMat, bodyMat, annMat, ...passes.flatMap((p) => p.mats)]) m.dispose();
      renderer.dispose();
    },
  };
}
