import * as React from 'react';
import { DEFAULT_DUOTONE, type WorkProject } from '../data/projects';

/**
 * Two-tone Atkinson dither of a project thumbnail, like a 1-bit Mac or
 * risograph print in the project's own colour pair.
 *
 * Pipeline: cover-crop and smoothly downscale the source so each output pixel
 * is a visible square (~3px at display) → grayscale → levels + slight S-curve
 * (so UI structure survives) → Atkinson error diffusion (threshold 128, 1/8 of
 * the error to six neighbours) → exactly two colours. Displayed upscaled with
 * nearest-neighbour, so every pixel stays a sharp square.
 *
 * With `step` it shows one of four stacked states: dither at the project's
 * pixel size (0), 2px (1), 1px (2) and the original screenshot (3). All four
 * are rendered once the thumbnail nears the viewport and cached in memory, so
 * the parent's stop-motion stepping is an instant swap. Nothing is processed
 * twice across re-renders or remounts.
 */
export interface DitherThumbProps {
  project: WorkProject;
  /** 0 = base dither … 3 = original. */
  step?: number;
  className?: string;
}

/** Processing caps, in output pixels on the long side. */
const BASE_CAP = 200;
const FINE_CAP = 640;

const hexToRgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** Symmetric S-curve; gamma just above 1 is the "slight" contrast lift. */
const sCurve = (x: number, gamma: number) =>
  x < 0.5 ? 0.5 * Math.pow(2 * x, gamma) : 1 - 0.5 * Math.pow(2 - 2 * x, gamma);

interface DitherOptions {
  cols: number;
  rows: number;
  black: number;
  white: number;
  ink: string;
  paper: string;
}

function atkinson(img: HTMLImageElement, o: DitherOptions): string {
  const { cols: w, rows: h } = o;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('2d context unavailable');

  // Cover-crop, smooth downscale. Biased toward the top, where UI screenshots
  // keep their navigation and headline.
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (img.naturalWidth - sw) / 2;
  const sy = (img.naturalHeight - sh) * 0.2;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

  const image = ctx.getImageData(0, 0, w, h);
  const px = image.data;
  const lum = new Float32Array(w * h);
  for (let i = 0; i < lum.length; i++) {
    const p = i * 4;
    const l = 0.299 * px[p] + 0.587 * px[p + 1] + 0.114 * px[p + 2];
    const level = Math.min(1, Math.max(0, (l - o.black) / (o.white - o.black)));
    lum[i] = sCurve(level, 1.2) * 255;
  }

  // Atkinson: diffuse 1/8 of the error to right, right+2, below-left, below,
  // below-right and below+2. The other 2/8 is dropped, which is what keeps
  // highlights crisp and gives the sparkly 1-bit texture.
  const ink = new Uint8Array(w * h);
  const spread = (x: number, y: number, e: number) => {
    if (x >= 0 && x < w && y < h) lum[y * w + x] += e;
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const old = lum[i];
      const out = old < 128 ? 0 : 255;
      ink[i] = out === 0 ? 1 : 0;
      const e = (old - out) / 8;
      spread(x + 1, y, e);
      spread(x + 2, y, e);
      spread(x - 1, y + 1, e);
      spread(x, y + 1, e);
      spread(x + 1, y + 1, e);
      spread(x, y + 2, e);
    }
  }

  const inkRgb = hexToRgb(o.ink);
  const paperRgb = hexToRgb(o.paper);
  for (let i = 0; i < ink.length; i++) {
    const [r, g, b] = ink[i] ? inkRgb : paperRgb;
    const p = i * 4;
    px[p] = r;
    px[p + 1] = g;
    px[p + 2] = b;
    px[p + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL('image/png');
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

/** Dithers by source + grid + palette, kept for the life of the page. */
const cache = new Map<string, Promise<string>>();
function dither(src: string, o: DitherOptions) {
  const key = JSON.stringify([src, o]);
  let p = cache.get(key);
  if (!p) {
    p = loadImage(src).then((img) => atkinson(img, o));
    p.catch(() => cache.delete(key));
    cache.set(key, p);
  }
  return p;
}

/** Output grid for a pixel size: box ÷ pixel, capped on the long side. */
function gridFor(boxW: number, boxH: number, pixel: number, cap: number) {
  let cols = Math.max(8, Math.round(boxW / pixel));
  let rows = Math.max(8, Math.round(boxH / pixel));
  const k = Math.min(1, cap / Math.max(cols, rows));
  cols = Math.round(cols * k);
  rows = Math.round(rows * k);
  return { cols, rows };
}

export function DitherThumb({ project, step = 0, className }: DitherThumbProps) {
  const rootRef = React.useRef<HTMLSpanElement>(null);
  const [near, setNear] = React.useState(false);
  const [urls, setUrls] = React.useState<(string | null)[]>([null, null, null]);

  const { ink, paper } = project.duotone ?? DEFAULT_DUOTONE;
  const [inkColor, paperColor] = project.invert ? [paper, ink] : [ink, paper];
  const basePixel = project.ditherPixel ?? 3;
  const black = project.ditherBlack ?? 40;
  const white = project.ditherWhite ?? 215;

  // Process only near the viewport; once near, stay near.
  React.useEffect(() => {
    const el = rootRef.current;
    if (!el || near) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [near]);

  React.useEffect(() => {
    const el = rootRef.current;
    if (!near || !el || !project.cover) return;
    let live = true;
    // Layout size, so a transform on an ancestor can't shrink the grid.
    const boxW = el.offsetWidth || 1;
    const boxH = el.offsetHeight || 1;
    const pixels = [basePixel, Math.min(basePixel, 2), 1];
    pixels.forEach((pixel, i) => {
      const { cols, rows } = gridFor(boxW, boxH, pixel, i === 0 ? BASE_CAP : FINE_CAP);
      dither(project.cover, { cols, rows, black, white, ink: inkColor, paper: paperColor })
        .then((url) => {
          if (live) setUrls((prev) => prev.map((u, j) => (j === i ? url : u)));
        })
        .catch(() => {});
    });
    return () => {
      live = false;
    };
  }, [near, project.cover, basePixel, black, white, inkColor, paperColor]);

  return (
    <span
      ref={rootRef}
      className={`dt${className ? ` ${className}` : ''}`}
      data-step={step}
      // Placeholder until the dither lands: the pair's light colour, which
      // dominates the print either way (an inverted dark UI is mostly paper).
      style={{ background: paper }}
    >
      {urls.map((url, i) =>
        url ? (
          <img
            key={i}
            className="dt-layer dt-dither"
            data-layer={i}
            src={url}
            // The base dither carries the alt; the hover states are decoration.
            alt={i === 0 ? project.title : ''}
            aria-hidden={i === 0 ? undefined : true}
            draggable={false}
          />
        ) : null,
      )}
      {near && project.cover && (
        <img
          className="dt-layer dt-original"
          data-layer={3}
          src={project.cover}
          alt=""
          aria-hidden="true"
          loading="lazy"
          draggable={false}
        />
      )}
    </span>
  );
}
