import * as React from 'react';
import { atkinsonField } from '../lib/dither';
import { seeded } from '../lib/seeded';

/**
 * Services as a connected chip diagram: each service is a rounded label chip,
 * joined by bars that melt into the chips through a "goo" filter (blur, then
 * a hard alpha threshold), so every join gets a smooth liquid fillet. Chips
 * carry faint toner specks, labels stay crisp, and the section sits on a quiet
 * two-tone Atkinson-dithered field. Hovering or focusing a service tints its chip in
 * its own duotone and shows a dithered swatch with its description.
 *
 * Chip widths are measured from the rendered labels once fonts are ready, and
 * every position comes from one layout function, recomputed on resize. The
 * drawing is decorative (aria-hidden): a visually hidden list carries the
 * content, and a real button sits over each chip for keyboard users.
 *
 * Renders two siblings: the background field (absolutely covering the parent
 * section, which must be position: relative) and the diagram itself.
 */
export interface ServiceItem {
  title: string;
  description: string;
}

export interface ServicesDiagramProps {
  /** In flow order: portfolio, landing, ecommerce, web apps, SEO, maintenance. */
  services: ServiceItem[];
  /** Ink / paper per service, in the same order. */
  duotones: { ink: string; paper: string }[];
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Layout {
  width: number;
  height: number;
  chipH: number;
  fontSize: number;
  /** One per service, in flow order. */
  chips: Box[];
  bars: Box[];
  /** Mobile: where the open service's inline panel sits. */
  panel: Box | null;
}

const MOBILE_MAX = 639;
/** Widest the diagram gets, so the right-aligned branch stays a short reach. */
const MAX_WIDTH = 760;
const PAD_X = 18;
const OVERLAP = 8;
const ROW_GAP = 24;
const SWATCH = 120;

/** Label width in the chip font, uppercased to match the CSS transform. */
function measure(labels: string[], fontSize: number) {
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return labels.map((l) => l.length * fontSize * 0.62);
  ctx.font = `500 ${fontSize}px "Cal Sans", system-ui, sans-serif`;
  // Canvas ignores CSS letter-spacing, so add the -0.01em per gap by hand.
  return labels.map((l) => ctx.measureText(l.toUpperCase()).width - 0.01 * fontSize * (l.length - 1));
}

const right = (b: Box) => b.x + b.w;

/** Vertical bar from the bottom of `a` into the top of `b`, centred in their shared span. */
function vbar(a: Box, b: Box, bar: number, at?: number): Box {
  const lo = Math.max(a.x, b.x) + bar;
  const hi = Math.min(right(a), right(b)) - bar;
  const cx = at ?? (lo <= hi ? (lo + hi) / 2 : (Math.max(a.x, b.x) + Math.min(right(a), right(b))) / 2);
  const top = a.y + a.h - OVERLAP;
  return { x: cx - bar / 2, y: top, w: bar, h: b.y + OVERLAP - top };
}

/** Horizontal bar from the right edge of `l` into the left edge of `r`, at `r`'s centre line. */
function hbar(fromX: number, r: Box, bar: number): Box {
  return { x: fromX, y: r.y + r.h / 2 - bar / 2, w: r.x + OVERLAP - fromX, h: bar };
}

function layoutDesktop(width: number, widths: number[]): Layout {
  const chipH = 48;
  const bar = Math.round(chipH * 0.3);
  const row = (i: number) => i * (chipH + ROW_GAP);
  const chip = (x: number, r: number, i: number): Box => ({ x, y: row(r), w: widths[i] + PAD_X * 2, h: chipH });

  const portfolio = chip(0, 0, 0);
  const landing = chip(0, 1, 1);
  landing.x = width - landing.w;
  const ecommerce = chip(0, 2, 2);
  const webapps = chip(Math.round(ecommerce.w * 0.5), 3, 3);
  const seo = chip(0, 4, 4);
  const maintenance = chip(0, 4, 5);
  // Maintenance drops from web apps' span, clear of SEO and inside the column.
  maintenance.x = Math.min(
    width - maintenance.w,
    Math.max(webapps.x + webapps.w * 0.45, right(seo) + 40),
  );

  // Spine: down from portfolio into ecommerce, inside both chips' spans.
  const spineX = Math.max(portfolio.x, ecommerce.x) + bar * 1.6;
  const spine = vbar(portfolio, ecommerce, bar, spineX);

  const bars = [
    spine,
    hbar(spineX - bar / 2, landing, bar),
    vbar(ecommerce, webapps, bar),
    vbar(webapps, maintenance, bar),
    hbar(right(seo) - OVERLAP, maintenance, bar),
  ];
  return {
    width,
    height: row(4) + chipH,
    chipH,
    fontSize: 19,
    chips: [portfolio, landing, ecommerce, webapps, seo, maintenance],
    bars,
    panel: null,
  };
}

/** Phones: one column, alternating left and right, with the open panel inline. */
function layoutMobile(width: number, widths: number[], open: number | null, panelH: number): Layout {
  const chipH = 44;
  const bar = Math.round(chipH * 0.3);
  const chips: Box[] = [];
  let y = 0;
  let panel: Box | null = null;
  widths.forEach((tw, i) => {
    const w = Math.min(width, tw + PAD_X * 2);
    const prev = chips[i - 1];
    // Odd rows step right, but never so far the connector loses its overlap.
    const x = i % 2 === 0 || !prev ? 0 : Math.max(0, Math.min(width - w, prev.w * 0.42));
    chips.push({ x, y, w, h: chipH });
    y += chipH + ROW_GAP;
    if (open !== null && i === open) {
      panel = { x: 0, y: y - ROW_GAP / 2, w: width, h: panelH };
      y += panelH + ROW_GAP / 2;
    }
  });
  // No bar through an open panel: it would run under the description.
  const bars = chips
    .slice(1)
    .map((c, i) => (open !== null && i === open ? null : vbar(chips[i], c, bar)))
    .filter((b): b is Box => b !== null);
  return { width, height: y - ROW_GAP, chipH, fontSize: 16, chips, bars, panel };
}

// --- Textures -----------------------------------------------------------------

const fieldCache = new Map<string, string>();

/**
 * Mask for the section's two-tone field: a soft diagonal gradient plus slow
 * sine waves, Atkinson-dithered on a coarse grid. White cells are the lighter
 * tone; the element's own background colour supplies it, so theme and hover
 * tint are pure CSS.
 */
function fieldMask(w: number, h: number, pixel: number) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const key = [w, h, pixel, dpr].join(':');
  const hit = fieldCache.get(key);
  if (hit) return hit;
  const cols = Math.ceil(w / pixel);
  const rows = Math.ceil(h / pixel);
  const rand = seeded(23);
  const [p1, p2, p3] = [rand() * 6.28, rand() * 6.28, rand() * 6.28];
  const cells = atkinsonField(cols, rows, (x, y) => {
    const u = x / cols;
    const v = y / rows;
    const diagonal = 0.5 * (u + (1 - v));
    const waves = 0.5 * Math.sin(u * 5.1 + v * 2.3 + p1) + 0.35 * Math.sin(v * 7.7 - u * 1.9 + p2) + 0.25 * Math.sin((u + v) * 3.3 + p3);
    // Mostly the base tone, with light cells drifting in soft bands.
    return Math.min(1, Math.max(0, 0.05 + 0.2 * diagonal + 0.06 * waves));
  });
  const canvas = document.createElement('canvas');
  const cell = pixel * dpr;
  canvas.width = Math.ceil(cols * cell);
  canvas.height = Math.ceil(rows * cell);
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.fillStyle = '#fff';
  for (let i = 0; i < cells.length; i++) {
    if (cells[i]) ctx.fillRect((i % cols) * cell, Math.floor(i / cols) * cell, cell, cell);
  }
  const url = canvas.toDataURL('image/png');
  fieldCache.set(key, url);
  return url;
}

const swatchCache = new Map<string, string>();

/** A seeded dithered square in one service's ink and paper. */
function swatch(seed: number, ink: string, paper: string) {
  const key = [seed, ink, paper].join(':');
  const hit = swatchCache.get(key);
  if (hit) return hit;
  const n = SWATCH / 3;
  const rand = seeded(seed);
  const [a, b, c] = [rand() * 6.28, rand() * 6.28, 2 + rand() * 3];
  const cells = atkinsonField(n, n, (x, y) => {
    const u = x / n;
    const v = y / n;
    return 0.5 + 0.28 * Math.sin(u * c + a) * Math.cos(v * (c - 0.7) + b) + 0.18 * (u - v);
  });
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = n;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.fillStyle = ink;
  ctx.fillRect(0, 0, n, n);
  ctx.fillStyle = paper;
  for (let i = 0; i < cells.length; i++) {
    if (cells[i]) ctx.fillRect(i % n, Math.floor(i / n), 1, 1);
  }
  const url = canvas.toDataURL('image/png');
  swatchCache.set(key, url);
  return url;
}

// --- Component ----------------------------------------------------------------

export function ServicesDiagram({ services, duotones }: ServicesDiagramProps) {
  const fieldRef = React.useRef<HTMLDivElement>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(0);
  const [mobile, setMobile] = React.useState(false);
  const [fontsReady, setFontsReady] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const [hovered, setHovered] = React.useState<number | null>(null);
  const [open, setOpen] = React.useState<number | null>(null);
  const [panelH, setPanelH] = React.useState(0);
  const [mask, setMask] = React.useState('');

  React.useEffect(() => {
    let live = true;
    document.fonts.ready.then(() => live && setFontsReady(true));
    return () => {
      live = false;
    };
  }, []);

  // Width of the content column, and the section size for the field.
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    const field = fieldRef.current;
    const section = field?.parentElement;
    if (!root || !section) return;
    const update = () => {
      setWidth(Math.min(MAX_WIDTH, root.offsetWidth));
      setMobile(window.innerWidth <= MOBILE_MAX);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const labels = React.useMemo(() => services.map((s) => s.title), [services]);

  const layout = React.useMemo(() => {
    if (!width) return null;
    const widths = measure(labels, mobile ? 16 : 19);
    return mobile ? layoutMobile(width, widths, open, panelH) : layoutDesktop(width, widths);
    // fontsReady: re-measure once the real font has loaded.
  }, [width, mobile, labels, open, panelH, fontsReady]);

  // Measure the inline panel so the chips below it make room.
  React.useLayoutEffect(() => {
    const el = panelRef.current;
    if (!mobile || open === null || !el) return;
    const update = () => setPanelH(el.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [mobile, open]);

  // The dithered field covers the whole section; rebuilt only when its size changes.
  React.useEffect(() => {
    const section = fieldRef.current?.parentElement;
    if (!section || !layout) return;
    const w = section.offsetWidth;
    const h = section.offsetHeight;
    if (w && h) setMask(fieldMask(w, h, mobile ? 2 : 3));
  }, [layout, mobile]);

  const tint = hovered !== null ? duotones[hovered].ink : null;
  const shown = mobile ? open : active;
  const detail = shown !== null ? services[shown] : null;

  const detailBody = (i: number) => (
    <>
      <img
        className="svd-swatch"
        src={swatch(101 + i * 17, duotones[i].ink, duotones[i].paper)}
        alt=""
        aria-hidden="true"
      />
      <span className="svd-detail-text">
        <span className="svd-detail-name font-cal">{services[i].title}</span>
        <span className="svd-detail-desc">{services[i].description}</span>
      </span>
    </>
  );

  return (
    <>
      <div
        ref={fieldRef}
        className="svd-field"
        aria-hidden="true"
        style={{
          ...(mask ? { WebkitMaskImage: `url("${mask}")`, maskImage: `url("${mask}")` } : null),
          ...(tint ? { '--svd-tint': tint } : null),
        } as React.CSSProperties}
        data-tinted={tint ? '' : undefined}
      />

      <div ref={rootRef} className={`svd${mobile ? ' is-mobile' : ''}`}>
        <ul className="sr-only">
          {services.map((s) => (
            <li key={s.title}>
              {s.title}: {s.description}
            </li>
          ))}
        </ul>

        {layout && (
          <div className="svd-stage" style={{ height: layout.height }}>
            <svg
              className="svd-svg"
              width={layout.width}
              height={layout.height}
              viewBox={`0 0 ${layout.width} ${layout.height}`}
              aria-hidden="true"
            >
              <defs>
                {/* Goo: blur, then a hard alpha threshold, so bars and chips melt
                    together with smooth fillets. Then faint toner specks (~4%). */}
                <filter id="svd-goo" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
                  <feGaussianBlur in="SourceGraphic" stdDeviation={layout.chipH * 0.1} result="blur" />
                  <feColorMatrix in="blur" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8" result="goo" />
                  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={5} result="noise" />
                  <feColorMatrix in="noise" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  40 0 0 0 -26.4" result="specks" />
                  <feFlood floodColor="#000" floodOpacity="0.16" result="toner" />
                  <feComposite in="toner" in2="specks" operator="in" result="tonerSpecks" />
                  <feComposite in="tonerSpecks" in2="goo" operator="in" result="chipSpecks" />
                  <feMerge>
                    <feMergeNode in="goo" />
                    <feMergeNode in="chipSpecks" />
                  </feMerge>
                </filter>
              </defs>

              <g filter="url(#svd-goo)">
                {layout.bars.map((b, i) => (
                  <rect key={`b${i}`} className="svd-shape" x={b.x} y={b.y} width={b.w} height={b.h} />
                ))}
                {layout.chips.map((c, i) => (
                  <rect
                    key={`c${i}`}
                    className="svd-shape"
                    x={c.x}
                    y={c.y}
                    width={c.w}
                    height={c.h}
                    rx={c.h * 0.2}
                    style={shown === i ? { fill: duotones[i].paper } : undefined}
                  />
                ))}
              </g>

              <g>
                {layout.chips.map((c, i) => (
                  <text
                    key={`t${i}`}
                    className="svd-label"
                    x={c.x + c.w / 2}
                    y={c.y + c.h / 2}
                    fontSize={layout.fontSize}
                    style={shown === i ? { fill: `color-mix(in srgb, ${duotones[i].ink} 72%, #000)` } : undefined}
                  >
                    {labels[i]}
                  </text>
                ))}
              </g>
            </svg>

            {services.map((s, i) => {
              const c = layout.chips[i];
              return (
                <button
                  key={s.title}
                  type="button"
                  className="svd-hit"
                  style={{ left: c.x, top: c.y, width: c.w, height: c.h }}
                  aria-label={s.title}
                  aria-controls={mobile ? `svd-inline` : 'svd-detail'}
                  aria-expanded={mobile ? open === i : undefined}
                  onPointerEnter={(e) => {
                    if (e.pointerType !== 'mouse') return;
                    setHovered(i);
                    if (!mobile) setActive(i);
                  }}
                  onPointerLeave={() => setHovered(null)}
                  onFocus={() => {
                    if (!mobile) setActive(i);
                  }}
                  onClick={() => {
                    if (mobile) setOpen((o) => (o === i ? null : i));
                    else setActive(i);
                  }}
                />
              );
            })}

            {mobile && open !== null && layout.panel && (
              <div
                ref={panelRef}
                id="svd-inline"
                className="svd-detail is-inline"
                style={{ top: layout.panel.y, width: layout.panel.w }}
              >
                {detailBody(open)}
              </div>
            )}
          </div>
        )}

        {!mobile && detail && shown !== null && (
          <div id="svd-detail" className="svd-detail" aria-live="polite">
            {detailBody(shown)}
          </div>
        )}
      </div>
    </>
  );
}
