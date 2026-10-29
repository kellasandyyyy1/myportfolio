import * as React from 'react';
import { seeded } from '../lib/seeded';

/**
 * Photocopy / xerox treatment for an image, rendered on a <canvas> at runtime.
 *
 * Pipeline, per pixel: grayscale → optional unsharp mask → optional hard bands
 * (always-ink below `solidBelow`, always-paper above `paperAbove`) → levels
 * (black/white point) + S-curve → uniform noise → threshold against a random
 * per-pixel threshold (stochastic, never ordered or halftone) → 2×2 toner
 * clumping → stray toner specks → optional bottom fade → two-colour output.
 * Every random draw comes from a seeded generator, so the grain is identical
 * on every load.
 *
 * Colours accept any CSS colour, including `var(--token)` (resolved against
 * the component's place in the page and re-resolved when the theme changes),
 * and `paperColor="transparent"` leaves paper pixels clear.
 *
 * Animated GIFs: with `animate`, each frame is decoded (ImageDecoder, where
 * supported), processed with the same seed so the grain holds still, and
 * played back at the GIF's own timing. Elsewhere, or with reduced motion, the
 * first frame is shown still.
 *
 * The source <img> stays in the DOM, visually hidden, for alt text and SEO.
 */
export interface XeroxPortraitProps {
  src: string;
  alt: string;
  inkColor?: string;
  paperColor?: string;
  /** Black and white points, remapped to 0–255. */
  contrast?: [number, number];
  /** Uniform noise added to luminance, ± this amount. */
  noiseAmount?: number;
  /** Per-pixel threshold is drawn uniformly from this range. */
  thresholdRange?: [number, number];
  /** 1 = fine grain, 2 = chunky toner clumps. */
  grainSize?: 1 | 2;
  /**
   * Unsharp-mask strength applied to luminance before thresholding (0 = off).
   * Keeps feature edges (eyes, brows, mouth) from dissolving into the grain.
   */
  sharpen?: number;
  /** Luminance below this is always ink (protects outlines and solid blacks). */
  solidBelow?: number;
  /** Luminance above this is always paper. */
  paperAbove?: number;
  /** Fraction of stray toner specks on paper. */
  speckRate?: number;
  /**
   * Bottom fade start, as a fraction of height (1 = no fade). Below it, alpha
   * falls linearly to 0 and toner density thins, so the image dissolves into
   * specks instead of going semi-transparent.
   */
  fadeFrom?: number;
  seed?: number;
  /** Cover-crop focus as fractions, like object-position. */
  focus?: [number, number];
  /** Play every frame of an animated GIF (where the browser can decode them). */
  animate?: boolean;
  /** Box aspect ratio, for when the parent doesn't size the box itself. */
  aspectRatio?: number;
  /** Crossfade to a neighbouring seed on hover. */
  hoverReseed?: boolean;
  onError?: () => void;
  /** Receives the processed still (first frame) as a PNG data URL, once ready. */
  onRendered?: (url: string) => void;
}

type RGBA = [number, number, number, number];

interface Config {
  src: string;
  ink: RGBA;
  paper: RGBA;
  contrast: [number, number];
  noiseAmount: number;
  thresholdRange: [number, number];
  grainSize: 1 | 2;
  sharpen: number;
  solidBelow: number;
  paperAbove: number;
  speckRate: number;
  fadeFrom: number;
  seed: number;
  focus: [number, number];
}


/**
 * Any CSS colour → RGBA, resolved in context so `var(--token)` follows the
 * current theme. Painting a pixel normalises every syntax (hex, rgb(),
 * color-mix(), named) to plain bytes.
 */
function resolveColor(context: Element, css: string): RGBA {
  if (css === 'transparent') return [0, 0, 0, 0];
  const probe = document.createElement('span');
  probe.style.display = 'none';
  probe.style.color = css;
  context.appendChild(probe);
  const computed = getComputedStyle(probe).color;
  probe.remove();
  const c = document.createElement('canvas');
  c.width = c.height = 1;
  const x = c.getContext('2d', { willReadFrequently: true });
  if (!x) return [0, 0, 0, 255];
  x.fillStyle = computed;
  x.fillRect(0, 0, 1, 1);
  const d = x.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2], d[3]];
}

/** Symmetric S-curve: gamma > 1 pushes shadows down and highlights up. */
const sCurve = (x: number, gamma: number) =>
  x < 0.5 ? 0.5 * Math.pow(2 * x, gamma) : 1 - 0.5 * Math.pow(2 - 2 * x, gamma);

const S_CURVE_GAMMA = 1.1;
/** How far the threshold climbs across the fade zone, so ink thins to specks. */
const FADE_THRESHOLD_LIFT = 150;

function photocopy(
  source: CanvasImageSource,
  srcW: number,
  srcH: number,
  w: number,
  h: number,
  c: Config,
): string {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('2d context unavailable');

  // Cover-crop the source into the box. Transparent areas read as paper.
  const scale = Math.max(w / srcW, h / srcH);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (srcW - sw) * c.focus[0];
  const sy = (srcH - sh) * c.focus[1];
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(source, sx, sy, sw, sh, 0, 0, w, h);

  const image = ctx.getImageData(0, 0, w, h);
  const px = image.data;
  const rand = seeded(c.seed);
  const [black, white] = c.contrast;
  const [tMin, tMax] = c.thresholdRange;
  const ink = new Uint8Array(w * h);

  const luma = new Float32Array(w * h);
  for (let i = 0; i < luma.length; i++) {
    const o = i * 4;
    luma[i] = 0.299 * px[o] + 0.587 * px[o + 1] + 0.114 * px[o + 2];
  }

  // Optional unsharp mask: L + k·(L − 3×3 box blur), so edges outlast the grain.
  if (c.sharpen > 0) {
    const src = luma.slice();
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        const blur =
          (src[i - w - 1] + src[i - w] + src[i - w + 1] +
            src[i - 1] + src[i] + src[i + 1] +
            src[i + w - 1] + src[i + w] + src[i + w + 1]) / 9;
        luma[i] = src[i] + c.sharpen * (src[i] - blur);
      }
    }
  }

  // 0 above the fade, rising to 1 at the bottom edge.
  const fadeStart = Math.round(h * c.fadeFrom);
  const fadeAt = (y: number) => (y < fadeStart ? 0 : (y - fadeStart) / Math.max(1, h - fadeStart));

  // Bands → levels → S-curve → noise → stochastic threshold (lifted in the fade).
  for (let i = 0; i < ink.length; i++) {
    const lum = luma[i];
    const fade = fadeAt((i / w) | 0);
    const value =
      sCurve(Math.min(1, Math.max(0, (lum - black) / (white - black))), S_CURVE_GAMMA) * 255 +
      (rand() * 2 - 1) * c.noiseAmount;
    const threshold = tMin + rand() * (tMax - tMin) - fade * FADE_THRESHOLD_LIFT;
    if (lum > c.paperAbove) ink[i] = 0;
    // Solid ink holds outside the fade; inside it, solids thin like everything else.
    else if (lum < c.solidBelow && rand() >= fade) ink[i] = 1;
    else ink[i] = value < threshold ? 1 : 0;
  }

  // Toner clumping: a 2×2 block that is mostly ink becomes all ink.
  if (c.grainSize >= 2) {
    for (let y = 0; y + 1 < h; y += 2) {
      for (let x = 0; x + 1 < w; x += 2) {
        const i = y * w + x;
        if (ink[i] + ink[i + 1] + ink[i + w] + ink[i + w + 1] >= 3) {
          ink[i] = ink[i + 1] = ink[i + w] = ink[i + w + 1] = 1;
        }
      }
    }
  }

  // Stray toner specks on the paper, 1–3px clusters.
  for (let i = 0; i < ink.length; i++) {
    if (ink[i] || rand() >= c.speckRate) continue;
    const size = 1 + Math.floor(rand() * 3);
    const x0 = i % w;
    const y0 = (i / w) | 0;
    for (let dy = 0; dy < size && y0 + dy < h; dy++) {
      for (let dx = 0; dx < size && x0 + dx < w; dx++) ink[(y0 + dy) * w + x0 + dx] = 1;
    }
  }

  for (let i = 0; i < ink.length; i++) {
    const [r, g, b, a] = ink[i] ? c.ink : c.paper;
    const o = i * 4;
    px[o] = r;
    px[o + 1] = g;
    px[o + 2] = b;
    px[o + 3] = a * (1 - fadeAt((i / w) | 0));
  }
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL('image/png');
}

// --- Loading -----------------------------------------------------------------

interface SourceFrame {
  source: CanvasImageSource;
  width: number;
  height: number;
  /** Display time in ms. */
  duration: number;
}

const images = new Map<string, Promise<HTMLImageElement>>();

const loadImage = (src: string) => {
  let p = images.get(src);
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
    images.set(src, p);
  }
  return p;
};

/** ImageDecoder yields VideoFrames: drawable, with size and timing, closed after use. */
type DecodedFrame = VideoFrame;

/** Minimal shape of the WebCodecs ImageDecoder we use, which isn't in every TS lib. */
interface ImageDecoderLike {
  tracks: { ready: Promise<void>; selectedTrack: { frameCount: number } | null };
  decode(opts: { frameIndex: number }): Promise<{ image: DecodedFrame }>;
  close(): void;
}
type ImageDecoderCtor = new (init: { data: ArrayBuffer; type: string }) => ImageDecoderLike;

const FALLBACK_FRAME_MS = 160;

/**
 * Every frame of an animated GIF, or null where frames can't be decoded.
 * Frames are processed straight away, so each one is closed by the caller.
 */
async function decodeFrames(src: string): Promise<SourceFrame[] | null> {
  const Decoder = (window as unknown as { ImageDecoder?: ImageDecoderCtor }).ImageDecoder;
  if (!Decoder) return null;
  try {
    const data = await (await fetch(src)).arrayBuffer();
    const decoder = new Decoder({ data, type: 'image/gif' });
    await decoder.tracks.ready;
    const count = decoder.tracks.selectedTrack?.frameCount ?? 1;
    const frames: SourceFrame[] = [];
    for (let i = 0; i < count; i++) {
      const { image } = await decoder.decode({ frameIndex: i });
      frames.push({
        source: image,
        width: image.displayWidth,
        height: image.displayHeight,
        duration: image.duration ? image.duration / 1000 : FALLBACK_FRAME_MS,
      });
    }
    decoder.close();
    return frames;
  } catch {
    return null;
  }
}

// --- Rendering ---------------------------------------------------------------

interface Processed {
  urls: string[];
  durations: number[];
}

/** Processed results by config + size, shared across re-renders and remounts. */
const cache = new Map<string, Promise<Processed>>();

function processImage(c: Config, w: number, h: number, animate: boolean): Promise<Processed> {
  const key = JSON.stringify([c, w, h, animate]);
  let p = cache.get(key);
  if (!p) {
    p = (async () => {
      const frames = animate ? await decodeFrames(c.src) : null;
      if (frames && frames.length > 1) {
        const urls = frames.map((f) => {
          const url = photocopy(f.source, f.width, f.height, w, h, c);
          (f.source as DecodedFrame).close();
          return url;
        });
        return { urls, durations: frames.map((f) => f.duration) };
      }
      frames?.forEach((f) => (f.source as DecodedFrame).close());
      const img = await loadImage(c.src);
      return { urls: [photocopy(img, img.naturalWidth, img.naturalHeight, w, h, c)], durations: [0] };
    })();
    p.catch(() => cache.delete(key));
    cache.set(key, p);
  }
  return p;
}

/**
 * Draws the processed frames to the canvas: once for a still, or looping on
 * the frames' own timing. Returns a stop function.
 */
async function show(target: HTMLCanvasElement, w: number, h: number, result: Processed, loop: boolean) {
  const frames = await Promise.all(result.urls.map(loadImage));
  target.width = w;
  target.height = h;
  const g = target.getContext('2d');
  if (!g) return () => {};
  let index = 0;
  let timer = 0;
  const draw = () => {
    g.clearRect(0, 0, w, h);
    g.drawImage(frames[index], 0, 0);
  };
  draw();
  if (loop && frames.length > 1) {
    const tick = () => {
      index = (index + 1) % frames.length;
      draw();
      timer = window.setTimeout(tick, result.durations[index]);
    };
    timer = window.setTimeout(tick, result.durations[0]);
  }
  return () => window.clearTimeout(timer);
}

/** Processing size: 2× the displayed box for retina, capped at 1200px on the long side. */
const MAX_SIDE = 1200;
const processingSize = (el: HTMLElement) => {
  // Layout size, not getBoundingClientRect: the hero mounts mid-animation at a
  // fraction of its scale, and transforms must not shrink the bitmap.
  const width = el.offsetWidth;
  const height = el.offsetHeight;
  const k = Math.min(2, MAX_SIDE / Math.max(width, height, 1));
  return [Math.max(1, Math.round(width * k)), Math.max(1, Math.round(height * k))] as const;
};

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Bumps when the theme flips, so colours given as CSS variables re-resolve. */
function useThemeEpoch(active: boolean) {
  const [epoch, setEpoch] = React.useState(0);
  React.useEffect(() => {
    if (!active) return;
    const bump = () => setEpoch((n) => n + 1);
    const observer = new MutationObserver(bump);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', bump);
    return () => {
      observer.disconnect();
      mq.removeEventListener('change', bump);
    };
  }, [active]);
  return epoch;
}

export function XeroxPortrait({
  src,
  alt,
  inkColor = '#141310',
  paperColor = '#ECE8DF',
  contrast = [60, 200],
  noiseAmount = 60,
  thresholdRange = [90, 165],
  grainSize = 2,
  sharpen = 0,
  solidBelow = -1,
  paperAbove = 256,
  speckRate = 0.003,
  fadeFrom = 1,
  seed = 7,
  focus = [0.5, 0.5],
  animate = false,
  aspectRatio,
  hoverReseed = true,
  onError,
  onRendered,
}: XeroxPortraitProps) {
  // Latest callback without re-running the processing effect when it changes.
  const onRenderedRef = React.useRef(onRendered);
  onRenderedRef.current = onRendered;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const mainRef = React.useRef<HTMLCanvasElement>(null);
  const altRef = React.useRef<HTMLCanvasElement>(null);
  // `failed`: processing failed, so show the original image instead.
  // `broken`: the image itself didn't load, so show nothing.
  const [failed, setFailed] = React.useState(false);
  const [broken, setBroken] = React.useState(false);
  const altDone = React.useRef(false);
  const themeEpoch = useThemeEpoch(/var\(/.test(inkColor + paperColor));

  // Arrays arrive as fresh literals each render; key the effect on their values.
  const optionsKey = JSON.stringify([
    src, inkColor, paperColor, contrast, noiseAmount, thresholdRange, grainSize, sharpen,
    solidBelow, paperAbove, speckRate, fadeFrom, seed, focus, animate,
  ]);

  /** Full config with colours resolved against the current theme. */
  const buildConfig = React.useCallback(
    (root: Element): Config => ({
      src,
      ink: resolveColor(root, inkColor),
      paper: resolveColor(root, paperColor),
      contrast,
      noiseAmount,
      thresholdRange,
      grainSize,
      sharpen,
      solidBelow,
      paperAbove,
      speckRate,
      fadeFrom,
      seed,
      focus,
    }),
    [optionsKey],
  );

  // Process only once the image is near the viewport: the work is synchronous
  // on the main thread, and an image far down the page must not compete with
  // what's on screen (like the hero's opening animation).
  const [nearView, setNearView] = React.useState(false);
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || nearView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNearView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px 0px' },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [nearView]);

  React.useEffect(() => {
    const root = rootRef.current;
    const main = mainRef.current;
    if (!nearView || !root || !main) return;
    altDone.current = false;
    let stop: (() => void) | undefined;
    let cancelled = false;
    const [w, h] = processingSize(root);
    const loop = animate && !prefersReducedMotion();
    processImage(buildConfig(root), w, h, loop)
      .then((result) => {
        if (cancelled) return undefined;
        onRenderedRef.current?.(result.urls[0]);
        return show(main, w, h, result, loop);
      })
      .then((s) => {
        if (cancelled) s?.();
        else stop = s;
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [buildConfig, animate, themeEpoch, nearView]);

  // Hover "re-photocopy": the same pipeline on a neighbouring seed, built on
  // first hover so the initial load only pays for one pass. Stills only.
  const prepareAlt = () => {
    const root = rootRef.current;
    const alt = altRef.current;
    if (!hoverReseed || animate || altDone.current || !root || !alt || prefersReducedMotion()) return;
    altDone.current = true;
    const [w, h] = processingSize(root);
    processImage({ ...buildConfig(root), seed: seed + 1 }, w, h, false)
      .then((result) => show(alt, w, h, result, false))
      .catch(() => {});
  };

  return (
    <div
      ref={rootRef}
      className={`xerox${failed ? ' is-failed' : ''}${broken ? ' is-broken' : ''}`}
      style={aspectRatio ? { aspectRatio: String(aspectRatio), height: 'auto' } : undefined}
      onPointerEnter={prepareAlt}
    >
      <img
        className="xerox-src"
        src={src}
        alt={alt}
        onError={() => {
          setBroken(true);
          onError?.();
        }}
      />
      {!failed && !broken && (
        <>
          <canvas ref={mainRef} className="xerox-canvas" aria-hidden="true" />
          {hoverReseed && !animate && (
            <canvas ref={altRef} className="xerox-canvas xerox-alt" aria-hidden="true" />
          )}
        </>
      )}
    </div>
  );
}
