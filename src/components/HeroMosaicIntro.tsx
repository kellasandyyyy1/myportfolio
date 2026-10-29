import * as React from 'react';
import { seeded } from '../lib/seeded';
import { play } from '../lib/sound';

/**
 * Opening curtain for the hero: the whole section starts covered by paper
 * tiles in the theme's ink colour, which flip away in a choppy 30fps
 * stop-motion rhythm to reveal the live hero underneath. Tiles boil on every
 * frame; a few revealed tiles briefly flash a stray fragment of the portrait
 * (a mismatched collage piece) before vanishing; the tiles over the photo go
 * last, the eyes last of all. Then the overlay is removed entirely.
 *
 * Per-frame work mutates tile classes and styles directly inside one rAF loop
 * gated to 30fps, so React never re-renders during the animation.
 *
 * It covers its parent element, so render it inside the section to cover.
 */
export interface HeroMosaicIntroProps {
  /**
   * The portrait box: its tiles reveal last. Render the curtain after it, as
   * the section's last child: React attaches refs child-first and in order,
   * so an earlier sibling's ref is set by the time the curtain measures.
   */
  photoRef: React.RefObject<HTMLElement | null>;
  /** The processed portrait, for mismatched fragments; null until ready. */
  portraitUrl: string | null;
  /** Eye region as [x0, y0, x1, y1] fractions of the portrait box. */
  eyeBox?: [number, number, number, number];
  seed?: number;
  onDone: () => void;
}

const FPS = 30;
const FRAME_MS = 1000 / FPS;

// Sequence, in frames at 30fps (~2s in all).
const REVEAL_START = 7;
const REVEAL_END = 36;
const SWAP_START = 14;
const SWAP_END = 40;
const PHOTO_START = 37;
const EYES_START = 46;
const PHOTO_END = 50;
const LAST_FRAME = 57;
const SOUND_FRAMES = new Set([7, 18, 30, 38, 47]);

interface Tile {
  col: number;
  row: number;
  photo: boolean;
  eye: boolean;
  restRot: number;
  restX: number;
  restY: number;
  revealed: boolean;
  /** Frame until which a stray portrait fragment shows, else -1. */
  fragUntil: number;
}

export function HeroMosaicIntro({
  photoRef,
  portraitUrl,
  eyeBox = [0.3, 0.36, 0.7, 0.5],
  seed = 11,
  onDone,
}: HeroMosaicIntroProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const tileEls = React.useRef<(HTMLDivElement | null)[]>([]);
  const [grid, setGrid] = React.useState<{ tiles: Tile[]; cols: number; rows: number; tw: number; th: number } | null>(null);
  const photoBox = React.useRef({ x: 0, y: 0, w: 0, h: 0 });

  // Cut the cover into square-ish tiles before the first paint. The cover is
  // the curtain's own parent: a parent's ref isn't attached yet while a
  // child's layout effect runs, but the curtain's own element is.
  React.useLayoutEffect(() => {
    const cover = rootRef.current?.parentElement;
    const photo = photoRef.current;
    if (!cover) return;
    const W = cover.offsetWidth;
    const H = cover.offsetHeight;
    const target = W < 640 ? 52 : 68;
    const cols = Math.max(4, Math.round(W / target));
    const rows = Math.max(3, Math.round(H / target));
    const tw = W / cols;
    const th = H / rows;

    const c = cover.getBoundingClientRect();
    const p = photo?.getBoundingClientRect();
    const box = p ? { x: p.left - c.left, y: p.top - c.top, w: p.width, h: p.height } : { x: -1, y: -1, w: 0, h: 0 };
    photoBox.current = box;
    const inside = (x: number, y: number, x0: number, y0: number, x1: number, y1: number) =>
      x >= x0 && x <= x1 && y >= y0 && y <= y1;

    const rand = seeded(seed);
    const tiles: Tile[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cx = (col + 0.5) * tw;
        const cy = (row + 0.5) * th;
        tiles.push({
          col,
          row,
          photo: inside(cx, cy, box.x, box.y, box.x + box.w, box.y + box.h),
          eye: inside(
            cx, cy,
            box.x + eyeBox[0] * box.w, box.y + eyeBox[1] * box.h,
            box.x + eyeBox[2] * box.w, box.y + eyeBox[3] * box.h,
          ),
          restRot: (rand() * 2 - 1) * 1.5,
          restX: (rand() * 2 - 1) * 1,
          restY: (rand() * 2 - 1) * 1,
          revealed: false,
          fragUntil: -1,
        });
      }
    }
    setGrid({ tiles, cols, rows, tw, th });
  }, [photoRef, seed, eyeBox.join()]);

  // Decode the portrait before any fragment uses it, so a fragment is never blank.
  const [portrait, setPortrait] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!portraitUrl) return;
    const img = new Image();
    img.src = portraitUrl;
    let live = true;
    img
      .decode()
      .catch(() => {})
      .then(() => {
        if (live) setPortrait(portraitUrl);
      });
    return () => {
      live = false;
    };
  }, [portraitUrl]);

  // The curtain starts the moment it's laid out; it never waits on the
  // portrait. The portrait is read through a ref, so arriving mid-way just
  // enables the stray fragments without restarting anything.
  const portraitRef = React.useRef(portrait);
  portraitRef.current = portrait;

  const onDoneRef = React.useRef(onDone);
  onDoneRef.current = onDone;

  React.useEffect(() => {
    if (!grid) return;
    const { tiles, cols, rows } = grid;
    const rand = seeded(seed * 31 + 7);
    const index = (col: number, row: number) =>
      col < 0 || row < 0 || col >= cols || row >= rows ? -1 : row * cols + col;
    const neighbours = (i: number) =>
      [index(tiles[i].col - 1, tiles[i].row), index(tiles[i].col + 1, tiles[i].row),
        index(tiles[i].col, tiles[i].row - 1), index(tiles[i].col, tiles[i].row + 1)].filter((n) => n >= 0);
    const pickFrom = <T,>(list: T[]) => list[Math.floor(rand() * list.length)];
    const all = tiles.map((_, i) => i);
    const body = all.filter((i) => !tiles[i].photo);
    const photoOnly = all.filter((i) => tiles[i].photo && !tiles[i].eye);
    const eyes = all.filter((i) => tiles[i].eye);

    /** Reveals `count` tiles from `pool`, ~60% grown from revealed neighbours, in patches. */
    const revealBatch = (pool: number[], count: number) => {
      for (let k = 0; k < count; k++) {
        const hidden = pool.filter((i) => !tiles[i].revealed);
        if (!hidden.length) return;
        const frontier = hidden.filter((i) => neighbours(i).some((n) => tiles[n].revealed));
        const i = frontier.length && rand() < 0.6 ? pickFrom(frontier) : pickFrom(hidden);
        tiles[i].revealed = true;
      }
    };
    /** Spreads what's left of a pool over the frames remaining in its window. */
    const paced = (pool: number[], frame: number, end: number) => {
      const left = pool.filter((i) => !tiles[i].revealed).length;
      const even = left / Math.max(1, end - frame + 1);
      return Math.max(1, Math.round(even * (0.6 + rand() * 0.8)));
    };
    const revealAll = (pool: number[]) => pool.forEach((i) => (tiles[i].revealed = true));

    const { w: pw, h: ph } = photoBox.current;

    const paint = (frame: number, settled: boolean) => {
      tiles.forEach((t, i) => {
        const el = tileEls.current[i];
        if (!el) return;
        const frag = portraitRef.current && t.fragUntil > frame;
        el.classList.toggle('is-accent', !t.revealed);
        el.classList.toggle('is-frag', Boolean(frag) && t.revealed);
        el.style.transform = settled
          ? `translate(${t.restX}px, ${t.restY}px) rotate(${t.restRot}deg)`
          : `translate(${(rand() * 2 - 1).toFixed(2)}px, ${(rand() * 2 - 1).toFixed(2)}px) rotate(${((rand() * 2 - 1) * 1.5).toFixed(2)}deg)`;
        if (frag && el.dataset.frag !== String(t.fragUntil)) {
          // A wrong piece: some random patch of the portrait, at its true scale.
          el.dataset.frag = String(t.fragUntil);
          el.style.backgroundSize = `${pw}px ${ph}px`;
          el.style.backgroundPosition = `${-(rand() * Math.max(0, pw - grid.tw))}px ${-(rand() * Math.max(0, ph - grid.th))}px`;
        }
      });
    };

    const step = (frame: number) => {
      if (frame === REVEAL_START) {
        // Two or three seed patches, all away from the portrait.
        revealBatch(body, 2 + Math.floor(rand() * 2));
      } else if (frame > REVEAL_START && frame < REVEAL_END) {
        revealBatch(body, paced(body, frame, REVEAL_END));
      } else if (frame === REVEAL_END) {
        revealAll(body);
      }

      if (frame >= PHOTO_START && frame < EYES_START) {
        revealBatch(photoOnly, paced(photoOnly, frame, EYES_START - 1));
      } else if (frame === EYES_START) {
        revealAll(photoOnly);
      }
      if (frame >= EYES_START && frame < PHOTO_END) {
        revealBatch(eyes, paced(eyes, frame, PHOTO_END));
      } else if (frame === PHOTO_END) {
        revealAll(eyes);
      }

      // Mismatched collage: a stray portrait fragment on a revealed tile, gone in a few frames.
      if (portraitRef.current && frame >= SWAP_START && frame <= SWAP_END && rand() < 0.35) {
        const shown = body.filter((i) => tiles[i].revealed && tiles[i].fragUntil <= frame);
        const n = 1 + Math.floor(rand() * 3);
        for (let k = 0; k < n && shown.length; k++) {
          tiles[pickFrom(shown)].fragUntil = frame + 3 + Math.floor(rand() * 3);
        }
      }

      if (SOUND_FRAMES.has(frame)) play('tick');
    };

    // Clock-driven: the frame index comes from elapsed time, so the sequence
    // always runs ~2s. If the browser drops frames, the skipped steps still
    // run (state only) and the tiles are painted once for the latest frame.
    // A real stall (the main thread busy for a while) pauses the clock
    // instead, so the curtain never jumps from covered to gone unseen.
    let raf = 0;
    let frame = -1;
    let startedAt = -1;
    let lastNow = -1;
    const loop = (now: number) => {
      if (startedAt < 0) startedAt = now;
      if (lastNow >= 0 && now - lastNow > FRAME_MS * 3) startedAt += now - lastNow - FRAME_MS;
      lastNow = now;
      const target = Math.min(LAST_FRAME, Math.floor((now - startedAt) / FRAME_MS));
      if (target > frame) {
        while (frame < target) step(++frame);
        paint(frame, frame > PHOTO_END);
      }
      if (frame >= LAST_FRAME) {
        onDoneRef.current();
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      // Back to the opening state, so a re-run (StrictMode in dev) starts clean.
      tiles.forEach((t) => {
        t.revealed = false;
        t.fragUntil = -1;
      });
    };
  }, [grid, seed]);

  return (
    <div
      ref={rootRef}
      className="hxm"
      aria-hidden="true"
      style={portrait ? ({ '--hxm-img': `url("${portrait}")` } as React.CSSProperties) : undefined}
    >
      {grid?.tiles.map((t, i) => (
        <div
          key={i}
          ref={(el) => {
            tileEls.current[i] = el;
          }}
          className="hxm-tile is-accent"
          style={{
            left: t.col * grid.tw,
            top: t.row * grid.th,
            width: grid.tw,
            height: grid.th,
            transform: `translate(${t.restX}px, ${t.restY}px) rotate(${t.restRot}deg)`,
          }}
        />
      ))}
    </div>
  );
}
