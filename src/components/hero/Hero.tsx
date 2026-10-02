"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { registerGsap, ScrollTrigger } from "@/lib/gsap";
import { useIsoLayoutEffect } from "@/lib/useIso";
import { T, publishPhase, whenLoaded, whenLoaderFinishing } from "./timeline";
import { site } from "@/content/site";

// The opening act. After the loader lifts, a chronophotograph of a sprinter
// strobes in exposure by exposure, the analysis finds the fault (the foot
// landing far ahead of the hip) and the fix plays out on every exposure while
// the measurement counts down. Then scrolling takes over: the camera orbits
// out of Marey's flat side view into a low three-quarter dolly zoom, and the
// plate turns out to be a body moving through space.

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Armed before first paint, so nothing flashes in and out.
  useIsoLayoutEffect(() => {
    rootRef.current?.classList.add("is-armed");
  }, []);

  useEffect(() => {
    const root = rootRef.current!;
    const stage = stageRef.current!;
    const canvas = canvasRef.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.innerWidth < 760;
    registerGsap();

    let raf = 0;
    let disposed = false;
    let start = 0;
    let t = reduced ? T.done : 0;
    let scroll = 0;
    let smooth = 0;
    let vel = 0;
    let last = 0; // time of the previous frame; 0 after a pause
    let dt = 1 / 60;
    let visible = true;
    const pointer = { x: 0, y: 0 };
    let render: (() => void) | null = null;
    let cleanupScene: (() => void) | null = null;

    const st = ScrollTrigger.create({
      trigger: root,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        scroll = self.progress;
        kick();
      },
    });

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      kick();
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (!visible) return;
      // back in view: start from where the page really is, never rewind to it
      smooth = scroll;
      vel = 0;
      kick();
    });
    io.observe(stage);

    let idleUntil = 0;
    function kick() {
      idleUntil = performance.now() + 1600;
      // nothing draws behind the loader: the counter gets the whole main thread
      if (!raf && render && visible && start) raf = requestAnimationFrame(loop);
    }
    function loop(now: number) {
      raf = 0;
      if (disposed || !render) return;
      dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      if (start) t = reduced ? T.done : now - start;
      if (reduced) {
        smooth = scroll;
        vel = 0;
      } else {
        // A critically damped spring: the camera eases into every stop and
        // turns round smoothly when the scroll does, at any frame rate.
        const w = 12;
        vel += (-w * w * (smooth - scroll) - 2 * w * vel) * dt;
        smooth += vel * dt;
      }
      root.style.setProperty("--p", smooth.toFixed(4));
      root.classList.toggle("is-past", smooth > 0.33);
      publishPhase(root, t);
      render();
      const animating =
        t < T.done || Math.abs(scroll - smooth) > 0.0004 || Math.abs(vel) > 0.0004 || now < idleUntil;
      // keep a gentle idle drift on desktop; phones rest to save battery
      if (visible && (animating || !mobile)) raf = requestAnimationFrame(loop);
      else last = 0;
    }

    (async () => {
      // download three.js while the loader counts, build the scene when it finishes
      const [{ createHeroScene }] = await Promise.all([
        import("./scene3d"),
        document.fonts?.ready,
        whenLoaderFinishing(),
      ]);
      if (disposed) return;
      const size = () => {
        const r = stage.getBoundingClientRect();
        return { w: r.width, h: r.height };
      };

      // Try the 3D plate; any failure to get a WebGL context falls back to 2D.
      let scene: ReturnType<typeof createHeroScene> | null = null;
      try {
        scene = createHeroScene(canvas, mobile);
      } catch {
        scene = null;
      }
      if (scene) {
        let { w, h } = size();
        scene.resize(w, h);
        render = () => {
          scene.frame(t, smooth, pointer, dt);
        };
        render(); // one warm-up frame compiles the shaders while the loader runs
        const ro = new ResizeObserver(() => {
          const s = size();
          // ignore the iOS address bar collapsing mid-scroll (height-only)
          if (Math.abs(s.w - w) < 1 && Math.abs(s.h - h) < 120) return;
          w = s.w;
          h = s.h;
          scene.resize(w, h);
          kick();
        });
        ro.observe(stage);
        cleanupScene = () => {
          ro.disconnect();
          scene.dispose();
        };
      } else {
        const { layout, drawFrame } = await import("./plate2d");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const font = getComputedStyle(canvas).fontFamily;
        let L = layout(1, 1);
        const fit = () => {
          const { w, h } = size();
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          canvas.width = Math.round(w * dpr);
          canvas.height = Math.round(h * dpr);
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          L = layout(w, h * 0.78);
        };
        fit();
        render = () => drawFrame(ctx, L, t, font);
        const ro = new ResizeObserver(() => {
          fit();
          kick();
        });
        ro.observe(stage);
        cleanupScene = () => ro.disconnect();
      }

      await whenLoaded();
      if (disposed) return;
      start = performance.now();
      if (reduced) root.classList.add("is-find", "is-fix", "is-done");
      kick();
      // run the whole sequence even if nobody moves
      const keepAlive = () => {
        if (disposed) return;
        kick();
        if (t < T.done + 300) window.setTimeout(keepAlive, 400);
      };
      keepAlive();
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      st.kill();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      cleanupScene?.();
    };
  }, []);

  return (
    <section ref={rootRef} className="hero" aria-labelledby="hero-title">
      <div ref={stageRef} className="hero-stage">
        <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true" />
        <div className="hero-vignette" aria-hidden="true" />
        <p className="sr-only">
          A chronophotograph of a sprinter: the analysis finds the stride fault, then corrects it so the foot
          lands under the body.
        </p>

        <div className="hero-top">
          <p className="hero-kicker">
            <span className="hero-dot" aria-hidden="true" />
            {site.role}
          </p>
          <a className="hero-kicker hero-kicker-r" href="#levels">
            <span className="hero-live" aria-hidden="true" />
            Applications open
          </a>
        </div>

        <h1 id="hero-title" className="hero-title">
          <span className="hero-l1">{site.motto[0]}</span>
          <span className="hero-l2">{site.motto[1]}</span>
        </h1>

        <div className="hero-foot">
          <p className="hero-intro">
            Online &amp; hybrid coaching for athletes and high-achieving professionals.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-solid" href="/apply" data-cursor="Apply">
              <span className="btn-icon" aria-hidden="true" />
              Apply for coaching
            </Link>
            <a className="btn btn-ghost" href="#levels" data-cursor="Scroll">
              See the programs
            </a>
          </div>
        </div>

        <div className="hero-scroll" aria-hidden="true">
          <span>Scroll</span>
          <span className="hero-scroll-bar" />
        </div>
      </div>
    </section>
  );
}
