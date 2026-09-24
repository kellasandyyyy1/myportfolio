import { useEffect, useRef } from 'react';

/**
 * Ambient "liquid grid" background — a dot field warped by overlapping sine
 * waves so the whole surface ripples as one sheet, with soft cursor repulsion.
 *
 * Deliberately quiet: the alpha ceiling is 0.21 (0.35 only right under the
 * cursor) and a full wave cycle takes 27s. Both numbers exist so this reads as
 * texture rather than motion — raising either makes it compete with the text.
 */

const BASE_SPACING_DESKTOP = 26;
const BASE_SPACING_MOBILE = 31;
/** Above this the grid coarsens rather than dropping frames on large monitors. */
const MAX_DOTS = 2500;

const WAVE_CYCLE_SECONDS = 27;
const DRIFT_PX = 3.5;

const RADIUS_MIN = 0.5;
const RADIUS_MAX = 1.6;
const ALPHA_MIN = 0.05;
const ALPHA_MAX = 0.21;
/** Ceiling directly under the cursor; falls off to ALPHA_MAX at the edge. */
const ALPHA_CURSOR = 0.35;

const CURSOR_RADIUS = 135;
const CURSOR_PUSH_PX = 10;
const LERP = 0.1;

/** Alpha is quantised into this many levels so each frame is a handful of
 *  fill() calls instead of one per dot. */
const ALPHA_LEVELS = 16;

const THEME_RGB = {
  dark: '242,242,239',   // #f2f2ef
  light: '26,26,24',     // #1a1a18
} as const;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const LiquidGrid = ({ theme }: { theme: 'dark' | 'light' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const themeRef = useRef(theme);
  // Read in the loop so a theme change recolours on the next frame instead of
  // tearing down and restarting it.
  themeRef.current = theme;

  // Set when the theme flips; the loop idles for the length of the View
  // Transition, which was previously identified as a jank source here.
  const pausedUntilRef = useRef(0);

  useEffect(() => {
    pausedUntilRef.current = Date.now() + 500;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = prefersReducedMotion();

    let rafId = 0;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    let width = 0;
    let height = 0;
    let spacing = BASE_SPACING_DESKTOP;
    let cols = 0;
    let rows = 0;

    // Per-dot smoothed offsets, flat arrays indexed row * cols + col.
    let offsetX = new Float32Array(0);
    let offsetY = new Float32Array(0);

    // Pre-allocated draw buckets: [x, y, r, x, y, r, ...] per alpha level.
    const buckets: number[][] = Array.from({ length: ALPHA_LEVELS }, () => []);

    let pointerX = -9999;
    let pointerY = -9999;
    let pointerActive = false;

    const layout = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      const base = width < 768 ? BASE_SPACING_MOBILE : BASE_SPACING_DESKTOP;
      spacing = base;
      // Coarsen until the dot count is affordable, rather than skipping render
      // entirely — a blank background on a wide monitor is worse than a sparser one.
      while (
        (Math.ceil(width / spacing) + 1) * (Math.ceil(height / spacing) + 1) > MAX_DOTS
      ) {
        spacing += 2;
      }

      cols = Math.ceil(width / spacing) + 1;
      rows = Math.ceil(height / spacing) + 1;

      const total = cols * rows;
      if (offsetX.length !== total) {
        offsetX = new Float32Array(total);
        offsetY = new Float32Array(total);
      }

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (elapsedSeconds: number) => {
      const t = elapsedSeconds * ((Math.PI * 2) / WAVE_CYCLE_SECONDS);
      const rgb = THEME_RGB[themeRef.current];

      ctx.clearRect(0, 0, width, height);
      for (const b of buckets) b.length = 0;

      for (let row = 0; row < rows; row++) {
        const baseY = row * spacing;
        for (let col = 0; col < cols; col++) {
          const baseX = col * spacing;
          const i = row * cols + col;

          // One shared wave field, so the grid moves as a surface.
          const wave =
            Math.sin(baseX * 0.02 + t) + Math.cos(baseY * 0.02 + t); // -2..2
          const n = (wave + 2) / 4; // 0..1

          // Drift is keyed to the opposite axis so rows and columns don't
          // travel in lockstep.
          let targetX = Math.sin(baseY * 0.03 + t) * DRIFT_PX;
          let targetY = Math.cos(baseX * 0.03 + t) * DRIFT_PX;

          let alpha = ALPHA_MIN + n * (ALPHA_MAX - ALPHA_MIN);

          if (pointerActive && !reduced) {
            const dx = baseX - pointerX;
            const dy = baseY - pointerY;
            const dist = Math.hypot(dx, dy);
            if (dist < CURSOR_RADIUS) {
              const falloff = 1 - dist / CURSOR_RADIUS; // 1 at cursor, 0 at edge
              // Guard the exact-centre case where the direction is undefined.
              const inv = dist > 0.001 ? 1 / dist : 0;
              targetX += dx * inv * falloff * CURSOR_PUSH_PX;
              targetY += dy * inv * falloff * CURSOR_PUSH_PX;
              alpha += falloff * (ALPHA_CURSOR - ALPHA_MAX);
            }
          }

          if (reduced) {
            offsetX[i] = targetX;
            offsetY[i] = targetY;
          } else {
            // Ease toward the target so entering and leaving the cursor's
            // influence feels fluid instead of snapping.
            offsetX[i] += (targetX - offsetX[i]) * LERP;
            offsetY[i] += (targetY - offsetY[i]) * LERP;
          }

          const level = Math.min(
            ALPHA_LEVELS - 1,
            Math.max(0, Math.round((alpha / ALPHA_CURSOR) * (ALPHA_LEVELS - 1)))
          );
          const bucket = buckets[level];
          bucket.push(baseX + offsetX[i], baseY + offsetY[i], RADIUS_MIN + n * (RADIUS_MAX - RADIUS_MIN));
        }
      }

      for (let level = 0; level < ALPHA_LEVELS; level++) {
        const bucket = buckets[level];
        if (bucket.length === 0) continue;
        ctx.fillStyle = `rgba(${rgb},${(level / (ALPHA_LEVELS - 1)) * ALPHA_CURSOR})`;
        ctx.beginPath();
        for (let k = 0; k < bucket.length; k += 3) {
          const x = bucket[k];
          const y = bucket[k + 1];
          const r = bucket[k + 2];
          // moveTo before each arc, or consecutive arcs join with a line.
          ctx.moveTo(x + r, y);
          ctx.arc(x, y, r, 0, Math.PI * 2);
        }
        ctx.fill();
      }
    };

    layout();

    if (reduced) {
      // One static frame: texture without motion, and no listeners at all.
      draw(0);
      return;
    }

    const start = performance.now();
    const loop = () => {
      rafId = requestAnimationFrame(loop);
      if (Date.now() < pausedUntilRef.current) return;
      draw((performance.now() - start) / 1000);
    };
    loop();

    // Tracked on window, not the canvas: the canvas is pointer-events:none, and
    // this keeps us clear of anything that could affect page scrolling.
    const onPointerMove = (e: PointerEvent) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
      pointerActive = true;
    };
    const onPointerOut = () => {
      // Targets fall back to the base wave; the lerp eases dots home.
      pointerActive = false;
    };

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(layout, 150);
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        cancelAnimationFrame(rafId);
        rafId = 0;
      } else if (!rafId) {
        loop();
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerOut, { passive: true });
    window.addEventListener('pointercancel', onPointerOut, { passive: true });
    window.addEventListener('blur', onPointerOut);
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(resizeTimer);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerOut);
      window.removeEventListener('pointercancel', onPointerOut);
      window.removeEventListener('blur', onPointerOut);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
    // theme is read via themeRef, so the loop is never restarted by a recolour.
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
};

export default LiquidGrid;
