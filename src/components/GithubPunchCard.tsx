import * as React from 'react';
import { ArrowUpRight, GithubLogo } from '@phosphor-icons/react';

/**
 * GitHub contributions as an inked punch card: every day is a hand-stamped
 * ink dot that grows with activity, on a perforated paper card. Dots are drawn
 * on a canvas at device resolution, nudged by a seeded hand-placed jitter,
 * then given toner grain (knocked-out specks, stray specks, roughened edges),
 * all seeded so the card looks identical on every load. On first view the
 * weeks stamp in left to right on 12fps hard cuts.
 *
 * The data source, loading and failure behaviour are the widget's originals:
 * same endpoint, nothing shown on error but a quiet placeholder texture.
 */

const GITHUB_PROFILE_URL = 'https://github.com/kellasandyyyy1';
const ROWS = 7; // one row per weekday, matching GitHub's week columns
const FULL_WEEKS = 53;
const MOBILE_WEEKS = 26;
const MOBILE_MAX = 767;
const MIN_MOBILE_CELL = 11;
const TEAR_STRIP = 26; // left padding of the panel: the perforated strip
const STAMP_FPS = 12;
const WEEKS_PER_FRAME = 3;
const GRAIN_SEED = 7331;

interface ContributionDay {
  date: string;
  count: number;
}

/** Radius as a fraction of the cell, and ink strength, per contribution level. */
const LEVELS = [
  { r: 0.15, alpha: 0.45, outline: true },
  { r: 0.22, alpha: 0.55, outline: false },
  { r: 0.29, alpha: 0.72, outline: false },
  { r: 0.37, alpha: 0.88, outline: false },
  { r: 0.45, alpha: 1, outline: false },
];

const JITTER = 0.07;
const KNOCKOUT = 0.07;
const STRAY = 0.004;
const EDGE_FLIP = 0.1;

interface Cell {
  col: number;
  row: number;
  level: number;
  /** null for loading and placeholder cells, which have no real day behind them. */
  date: string | null;
  count: number;
}

/**
 * Deterministic quiet pattern shown when the API is unavailable. Uses only the
 * dimmest levels so it reads as texture rather than as fake data.
 */
const placeholderDays = (count: number): ContributionDay[] =>
  Array.from({ length: count }, (_, i) => {
    const h = (i * 2654435761) % 101;
    return { date: `placeholder-${i}`, count: h < 55 ? 0 : h < 88 ? 1 : 3 };
  });

const parseDay = (date: string) => new Date(`${date}T00:00:00`);
const longDay = (date: string) =>
  parseDay(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const plural = (n: number, word: string) => `${n.toLocaleString()} ${word}${n === 1 ? '' : 's'}`;

/** Stable 0–1 hash of an integer (and seed), for per-pixel and per-day randomness. */
function hash01(n: number, seed = 0) {
  let x = (n ^ Math.imul(seed, 0x9e3779b1)) | 0;
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

const dateSeed = (date: string | null, fallback: number) => {
  if (!date) return fallback;
  let h = 0;
  for (let i = 0; i < date.length; i++) h = Math.imul(h, 31) + date.charCodeAt(i);
  return h;
};

/** GitHub-style levels: 0 for none, then quartiles of the days that had any. */
function levelsFor(days: ContributionDay[]) {
  const active = days.map((d) => d.count).filter((c) => c > 0).sort((a, b) => a - b);
  const q = (p: number) => active[Math.min(active.length - 1, Math.floor(p * active.length))] ?? 0;
  const [q1, q2, q3] = [q(0.25), q(0.5), q(0.75)];
  return days.map((d) => (d.count <= 0 ? 0 : d.count <= q1 ? 1 : d.count <= q2 ? 2 : d.count <= q3 ? 3 : 4));
}

/** Days into week columns (Sunday on top), like GitHub's calendar. */
function layoutCells(days: ContributionDay[] | null): { cells: Cell[]; cols: number } {
  if (!days || days.length === 0) {
    const cells: Cell[] = [];
    for (let col = 0; col < FULL_WEEKS; col++) {
      for (let row = 0; row < ROWS; row++) cells.push({ col, row, level: 0, date: null, count: 0 });
    }
    return { cells, cols: FULL_WEEKS };
  }
  const real = !days[0].date.startsWith('placeholder');
  const firstDow = real ? parseDay(days[0].date).getDay() : 0;
  const levels = levelsFor(days);
  const cells = days.map((d, i) => ({
    col: Math.floor((i + firstDow) / ROWS),
    row: (i + firstDow) % ROWS,
    level: levels[i],
    date: real ? d.date : null,
    count: d.count,
  }));
  return { cells, cols: Math.ceil((days.length + firstDow) / ROWS) };
}

type RGB = [number, number, number];

/** Any CSS colour → RGB, by painting one pixel (handles color-mix, hex, rgb). */
function resolveRgb(css: string): RGB {
  const c = document.createElement('canvas');
  c.width = c.height = 1;
  const x = c.getContext('2d', { willReadFrequently: true });
  if (!x) return [38, 48, 31];
  x.fillStyle = css;
  x.fillRect(0, 0, 1, 1);
  const d = x.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2]];
}

interface DrawOptions {
  cells: Cell[];
  cell: number;
  width: number;
  height: number;
  dpr: number;
  ink: RGB;
  /** Columns stamped so far (all when not animating). */
  upToCol: number;
  /** Columns stamped this frame: drawn at 115%, pressing down. */
  popFrom: number;
  /** Grain re-seeded from this column on (the boil), else frozen. */
  boilFrom: number;
  frame: number;
}

/** Draws the stamped dots, then the toner grain pass over the pixels. */
function drawCard(canvas: HTMLCanvasElement, o: DrawOptions) {
  const W = Math.round(o.width * o.dpr);
  const H = Math.round(o.height * o.dpr);
  if (canvas.width !== W) canvas.width = W;
  if (canvas.height !== H) canvas.height = H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.setTransform(o.dpr, 0, 0, o.dpr, 0, 0);
  const [r, g, b] = o.ink;

  o.cells.forEach((c, i) => {
    if (c.col >= o.upToCol) return;
    const spec = LEVELS[c.level];
    const seed = dateSeed(c.date, i + 1);
    const jx = (hash01(seed, 11) * 2 - 1) * JITTER * o.cell;
    const jy = (hash01(seed, 23) * 2 - 1) * JITTER * o.cell;
    const pop = c.col >= o.popFrom ? 1.15 : 1;
    const cx = c.col * o.cell + o.cell / 2 + jx;
    const cy = c.row * o.cell + o.cell / 2 + jy;
    const radius = spec.r * o.cell * pop;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    if (spec.outline) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${spec.alpha})`;
      ctx.stroke();
    } else {
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${spec.alpha})`;
      ctx.fill();
    }
  });

  // Toner grain, per device pixel and seeded per pixel, so the frozen part
  // never shifts while the most recent columns boil.
  const image = ctx.getImageData(0, 0, W, H);
  const px = image.data;
  const alpha = new Uint8ClampedArray(W * H);
  for (let i = 0; i < alpha.length; i++) alpha[i] = px[i * 4 + 3];
  const boilX = o.boilFrom * o.cell * o.dpr;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const seed = x >= boilX ? GRAIN_SEED + o.frame + 1 : GRAIN_SEED;
      const a = alpha[i];
      const roll = hash01(i, seed);
      if (a > 24) {
        const edge =
          (x > 0 && alpha[i - 1] === 0) || (x < W - 1 && alpha[i + 1] === 0) ||
          (y > 0 && alpha[i - W] === 0) || (y < H - 1 && alpha[i + W] === 0);
        // Knocked-out specks inside the stamp; a ragged rim on its edge.
        if (roll < KNOCKOUT || (edge && hash01(i, seed + 3) < EDGE_FLIP)) px[i * 4 + 3] = 0;
      } else {
        const touching =
          (x > 0 && alpha[i - 1] > 24) || (x < W - 1 && alpha[i + 1] > 24) ||
          (y > 0 && alpha[i - W] > 24) || (y < H - 1 && alpha[i + W] > 24);
        const spill = touching && hash01(i, seed + 5) < EDGE_FLIP;
        if (spill || roll < STRAY) {
          px[i * 4] = r;
          px[i * 4 + 1] = g;
          px[i * 4 + 2] = b;
          px[i * 4 + 3] = spill ? 200 : 170;
        }
      }
    }
  }
  ctx.putImageData(image, 0, 0);
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** A tiny stamped dot for the legend, drawn by the same renderer. */
function LegendDot({ level, ink, dpr }: { level: number; ink: RGB | null; dpr: number }) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    if (!ref.current || !ink) return;
    drawCard(ref.current, {
      cells: [{ col: 0, row: 0, level, date: `legend-${level}`, count: 0 }],
      cell: 12,
      width: 12,
      height: 12,
      dpr,
      ink,
      upToCol: 1,
      popFrom: 1,
      boilFrom: 1,
      frame: 0,
    });
  }, [level, ink, dpr]);
  return <canvas ref={ref} className="gpc-legend-dot" aria-hidden="true" />;
}

export function GithubSection() {
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [data, setData] = React.useState<{ total: number; days: ContributionDay[] } | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [innerWidth, setInnerWidth] = React.useState(0);
  const [mobile, setMobile] = React.useState(false);
  const [dpr, setDpr] = React.useState(() => Math.min(3, window.devicePixelRatio || 1));
  const [ink, setInk] = React.useState<RGB | null>(null);
  const [stamp, setStamp] = React.useState<'waiting' | 'running' | 'done'>('waiting');
  const [frame, setFrame] = React.useState(0);
  const [active, setActive] = React.useState<number | null>(null);

  useFetchContributions(setData, setFailed);

  // Width of the panel's drawing area, debounced; and which layout applies.
  React.useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let timer = 0;
    const measure = () => {
      setInnerWidth(el.clientWidth - TEAR_STRIP - 14);
      setMobile(window.innerWidth <= MOBILE_MAX);
    };
    measure();
    const observer = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(measure, 120);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  // Redraw crisply when the screen's pixel ratio changes (zoom, monitor move).
  React.useEffect(() => {
    const mq = window.matchMedia(`(resolution: ${dpr}dppx)`);
    const onChange = () => setDpr(Math.min(3, window.devicePixelRatio || 1));
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [dpr]);

  // Ink colour from the theme; re-read when the theme flips.
  React.useEffect(() => {
    const read = () => {
      const el = scrollerRef.current;
      if (el) setInk(resolveRgb(getComputedStyle(el).color));
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', read);
    return () => {
      observer.disconnect();
      mq.removeEventListener('change', read);
    };
  }, []);

  // Memoised: a new array each render would redraw the canvas on every hover.
  const days = React.useMemo(
    () => data?.days ?? (failed ? placeholderDays(FULL_WEEKS * ROWS) : null),
    [data, failed],
  );
  const { cells, cols } = React.useMemo(() => layoutCells(days), [days]);
  const real = Boolean(data);

  // Cell size: the full year fits on desktop; phones show ~26 weeks and scroll.
  const cell = mobile
    ? Math.max(MIN_MOBILE_CELL, Math.floor(innerWidth / MOBILE_WEEKS))
    : Math.max(8, Math.min(14, innerWidth / cols));
  const width = cols * cell;
  const height = ROWS * cell;

  // Stamp in once, when the card scrolls into view with its data.
  React.useEffect(() => {
    if (stamp !== 'waiting' || !days) return;
    if (prefersReducedMotion()) {
      setStamp('done');
      return;
    }
    const el = scrollerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStamp('running');
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [stamp, days]);

  const totalFrames = Math.ceil(cols / WEEKS_PER_FRAME);
  React.useEffect(() => {
    if (stamp !== 'running') return;
    if (frame >= totalFrames) {
      setStamp('done');
      return;
    }
    const id = window.setTimeout(() => setFrame((f) => f + 1), 1000 / STAMP_FPS);
    return () => window.clearTimeout(id);
  }, [stamp, frame, totalFrames]);

  // Draw: loading shows level-0 outlines; while stamping, frame by frame;
  // when done, the frozen final grain. Hover never redraws the canvas.
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ink || !innerWidth) return;
    const loading = !days;
    const running = stamp === 'running';
    const upToCol = loading || stamp === 'done' ? cols : running ? Math.min(cols, (frame + 1) * WEEKS_PER_FRAME) : 0;
    drawCard(canvas, {
      cells,
      cell,
      width,
      height,
      dpr,
      ink,
      upToCol,
      popFrom: running ? upToCol - WEEKS_PER_FRAME : cols,
      boilFrom: running ? upToCol - WEEKS_PER_FRAME : cols,
      frame: running ? frame : 0,
    });
  }, [cells, cell, width, height, dpr, ink, stamp, frame, cols, days, innerWidth]);

  // Phones open on the most recent week.
  React.useEffect(() => {
    const el = scrollerRef.current;
    if (el && mobile) el.scrollLeft = el.scrollWidth;
  }, [mobile, width, real]);

  // Month labels under their week columns.
  const months = React.useMemo(() => {
    if (!real) return [];
    const labels: { col: number; label: string }[] = [];
    let lastCol = -1;
    let lastMonth = -1;
    // The first day of each week column decides whether a new month starts there.
    for (const c of cells) {
      if (c.col === lastCol || !c.date) continue;
      lastCol = c.col;
      const day = parseDay(c.date);
      if (day.getMonth() === lastMonth) continue;
      lastMonth = day.getMonth();
      labels.push({ col: c.col, label: day.toLocaleDateString('en-US', { month: 'short' }) });
    }
    if (labels.length > 1 && labels[1].col - labels[0].col < 3) labels.shift();
    return labels;
  }, [cells, real]);

  const summary = React.useMemo(() => {
    if (!data || data.days.length === 0) return null;
    const best = data.days.reduce((top, d) => (d.count > top.count ? d : top), data.days[0]);
    return `${plural(data.total, 'GitHub contribution')} in the last year. Busiest day: ${longDay(best.date)}, with ${plural(best.count, 'contribution')}.`;
  }, [data]);

  const activeCell = active !== null && cells[active]?.date ? cells[active] : null;
  const tip = activeCell
    ? `${longDay(activeCell.date!)} · ${activeCell.count === 0 ? 'no contributions' : plural(activeCell.count, 'contribution')}`
    : '';

  const cellAt = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const col = Math.floor((clientX - rect.left) / cell);
    const row = Math.floor((clientY - rect.top) / cell);
    const i = cells.findIndex((c) => c.col === col && c.row === row);
    return i >= 0 ? i : null;
  };

  // Arrows walk the days: left/right a week, up/down a day.
  const onKeyDown = (e: React.KeyboardEvent) => {
    const steps: Record<string, number> = { ArrowLeft: -ROWS, ArrowRight: ROWS, ArrowUp: -1, ArrowDown: 1 };
    if (!(e.key in steps) || !real) return;
    e.preventDefault();
    const from = active ?? cells.length - 1;
    const next = Math.max(0, Math.min(cells.length - 1, from + steps[e.key]));
    setActive(next);
    // Keep the focused day in view inside the scroller.
    const el = scrollerRef.current;
    const x = cells[next].col * cell;
    if (el && (x < el.scrollLeft || x > el.scrollLeft + el.clientWidth - TEAR_STRIP - cell * 2)) {
      el.scrollLeft = x - el.clientWidth / 2;
    }
  };

  return (
    <div className="gpc">
      <div className="gpc-head">
        <div className="gpc-id">
          <span className="gpc-avatar" aria-hidden="true">
            <GithubLogo weight="fill" size={20} />
          </span>
          <span className="gpc-names">
            <span className="gpc-title font-cal">github</span>
            <a className="gpc-handle" href={GITHUB_PROFILE_URL} target="_blank" rel="noopener noreferrer">
              @kellasandyyyy1 ↗
            </a>
          </span>
        </div>
        <span className="gpc-live">
          <span className="gpc-live-dot" aria-hidden="true" />
          live
        </span>
      </div>

      {summary && <p className="sr-only">{summary}</p>}

      <div
        ref={scrollerRef}
        className={`gpc-panel${mobile ? ' is-scroll' : ''}`}
        tabIndex={real ? 0 : -1}
        aria-label={real ? 'Contribution calendar. Use the arrow keys to move between days.' : undefined}
        onKeyDown={onKeyDown}
        onBlur={() => setActive(null)}
      >
        <div className="gpc-sheet" style={{ width, height: height + 22 }}>
          <canvas
            ref={canvasRef}
            className="gpc-canvas"
            style={{ width, height }}
            aria-hidden="true"
            onPointerMove={(e) => real && setActive(cellAt(e.clientX, e.clientY))}
            onPointerLeave={() => setActive(null)}
          />
          {activeCell && (
            <>
              <span
                className="gpc-ring"
                aria-hidden="true"
                style={{ left: activeCell.col * cell, top: activeCell.row * cell, width: cell, height: cell }}
              />
              <span
                className="gpc-tip"
                role="status"
                // Anchored to whichever side keeps it on the card; below the
                // dot on the top rows, above it elsewhere.
                data-align={activeCell.col < 8 ? 'start' : activeCell.col > cols - 9 ? 'end' : 'center'}
                data-below={activeCell.row < 2 ? '' : undefined}
                style={{
                  left: activeCell.col * cell + cell / 2,
                  top: activeCell.row < 2 ? (activeCell.row + 1) * cell : activeCell.row * cell,
                }}
              >
                {tip}
              </span>
            </>
          )}
          <div className="gpc-months" aria-hidden="true" style={{ top: height + 6 }}>
            {months.map((m) => (
              <span key={`${m.col}-${m.label}`} style={{ left: m.col * cell }}>
                {m.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="gpc-foot">
        <span className="gpc-legend" aria-hidden="true">
          less
          {[0, 2, 3, 4].map((level) => (
            <React.Fragment key={level}>
              <LegendDot level={level} ink={ink} dpr={dpr} />
            </React.Fragment>
          ))}
          more
        </span>
        <a className="gpc-open" href={GITHUB_PROFILE_URL} target="_blank" rel="noopener noreferrer">
          open profile ↗
        </a>
      </div>
    </div>
  );
}

/** The widget's original fetch: same endpoint, same silent failure. */
function useFetchContributions(
  setData: (d: { total: number; days: ContributionDay[] }) => void,
  setFailed: (f: boolean) => void,
) {
  React.useEffect(() => {
    let active = true;
    fetch('/api/github-contributions')
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then((payload: { total: number; days: ContributionDay[] }) => {
        if (!active) return;
        if (!Array.isArray(payload?.days)) throw new Error('bad shape');
        setData(payload);
      })
      .catch(() => {
        // Fail silently — a portfolio page should never surface an API error.
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [setData, setFailed]);
}
