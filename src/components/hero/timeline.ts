// The opening sequence, shared by the 3D hero and its 2D fallback.
// Times in milliseconds from the moment the loader lifts.

export const T = {
  ruler: [0, 950],
  exposeStart: 120,
  exposeGap: 78,
  find: 1550,
  focus: [1600, 2050],
  plumb: [2000, 2350],
  dim: [2300, 2720],
  label: [2600, 2900],
  fix: 3550,
  morph: [3800, 5100],
  whiten: [4200, 5100],
  relabel: [4450, 4800],
  unfocus: [5100, 5600],
  done: 5600,
} as const;

export const ATHLETE_CM = 180; // the plate's athlete is 1.80 m tall

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const prog = (t: number, [a, b]: readonly [number, number]) => clamp01((t - a) / (b - a));
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Everything the frame needs to know about the sequence at time t. */
export function sequenceState(t: number) {
  const focus = easeInOut(prog(t, T.focus)) * (1 - easeInOut(prog(t, T.unfocus)));
  const whiten = easeInOut(prog(t, T.whiten));
  return {
    focus,
    overstride: 1 - easeInOut(prog(t, T.morph)),
    whiten,
    redness: prog(t, T.focus) * (1 - whiten),
    plumb: easeOut(prog(t, T.plumb)),
    dim: easeOut(prog(t, T.dim)),
    label: easeOut(prog(t, T.label)),
    relabel: prog(t, T.relabel),
    ruler: easeOut(prog(t, T.ruler)),
  };
}

/** Strobe envelope for exposure i: fires, overexposes, settles. */
export function exposureIntensity(t: number, i: number) {
  const t0 = T.exposeStart + i * T.exposeGap;
  if (t < t0) return 0;
  const dt = t - t0;
  return clamp01(dt / 28) * (1 + 1.1 * Math.exp(-dt / 160));
}

/** Tell the page where the sequence is, as classes on the hero root. */
export function publishPhase(root: HTMLElement, t: number) {
  root.classList.toggle("is-find", t >= T.find);
  root.classList.toggle("is-fix", t >= T.fix);
  root.classList.toggle("is-done", t >= T.done);
}

/** Resolves once the opening loader has lifted (or immediately if there is none). */
export function whenLoaded(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const w = window as unknown as { __shihyLoaded?: boolean; __shihyTransitioning?: boolean };
  // arriving through a page transition: start once the lanes open
  if (w.__shihyTransitioning) {
    return new Promise((resolve) => window.addEventListener("shihy:revealed", () => resolve(), { once: true }));
  }
  if (w.__shihyLoaded || !document.querySelector("[data-loader]")) return Promise.resolve();
  return new Promise((resolve) => window.addEventListener("shihy:loaded", () => resolve(), { once: true }));
}

/**
 * Resolves when the loader's counter reaches the line (or immediately if there
 * is no loader). The 3D scene is built at this moment: the lane exit that
 * follows is a compositor animation, so a busy main thread can't stall it,
 * and the counter never has to share the main thread with WebGL set-up.
 */
export function whenLoaderFinishing(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const w = window as unknown as { __shihyLoaded?: boolean; __shihyFinishing?: boolean };
  if (w.__shihyLoaded || w.__shihyFinishing || !document.querySelector("[data-loader]")) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => resolve();
    window.addEventListener("shihy:finishing", done, { once: true });
    window.addEventListener("shihy:loaded", done, { once: true });
  });
}
