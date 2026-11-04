import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, GameController, X } from '@phosphor-icons/react';
import { play } from '../lib/sound';
import { seeded } from '../lib/seeded';

/**
 * 404: a deep green field of square cartoon faces that drift, bounce off the
 * edges and can be flung around, with "404" in the middle. "Play a quick
 * game" swaps the field for a Flappy Bird-style game: Kellas's photo is the
 * bird, and the pipes are stacks of the same face blocks.
 */

/** Sticker and pipe colours: the project cards' print papers, plus two brights. */
const FACE_COLOURS = ['#E8C35A', '#8FC1DD', '#E25B45', '#C5DCA6', '#C9B8E3', '#F1C7B8', '#A9D9D4', '#4FAE5A', '#F2E3A0'];
type Mouth = 'smile' | 'open' | 'tongue' | 'grin' | 'o';
const MOUTHS: Mouth[] = ['smile', 'open', 'tongue', 'grin', 'o'];

const PHOTO = '/img/iss.jpg';
/** Face centre (fractions of the photo) and how much of the short side the bird shows. */
const PHOTO_CROP = { x: 0.45, y: 0.5, zoom: 0.78 };
const BEST_KEY = 'nf-flappy-best';

// --- The faces ---------------------------------------------------------------

/** One square sticker face, drawn in a 100×100 box. */
function FaceSvg({ colour, mouth, look, cheeks }: { colour: string; mouth: Mouth; look: number; cheeks: boolean }) {
  const px = look * 3;
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <rect x="0" y="0" width="100" height="100" rx="9" fill={colour} />
      {cheeks && (
        <>
          <circle cx="22" cy="64" r="6" fill="#ff7a8a" opacity="0.55" />
          <circle cx="78" cy="64" r="6" fill="#ff7a8a" opacity="0.55" />
        </>
      )}
      {[34, 64].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy="42" rx="11" ry="14" fill="#fff" stroke="#151515" strokeWidth="3.5" />
          <circle cx={cx + px} cy="46" r="5.5" fill="#151515" />
          <circle cx={cx + px + 2} cy="43.5" r="1.8" fill="#fff" />
        </g>
      ))}
      {mouth === 'smile' && <path d="M38 68 Q49 79 60 68" fill="none" stroke="#151515" strokeWidth="4" strokeLinecap="round" />}
      {mouth === 'grin' && <path d="M36 66 H62 Q61 80 49 80 Q37 80 36 66 Z" fill="#151515" />}
      {mouth === 'open' && <ellipse cx="49" cy="71" rx="7" ry="8" fill="#151515" />}
      {mouth === 'o' && <circle cx="49" cy="70" r="4.5" fill="#151515" />}
      {mouth === 'tongue' && (
        <>
          <path d="M38 66 Q49 78 60 66 Z" fill="#151515" />
          <path d="M44 70 Q49 80 55 70 Z" fill="#e24c63" />
        </>
      )}
    </svg>
  );
}

/** The same face on a canvas, for the game's pipe blocks. */
function drawFace(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, colour: string, mouth: Mouth) {
  const s = size / 100;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.roundRect(0, 0, 100, 100, 9);
  ctx.fill();
  for (const cx of [34, 64]) {
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#151515';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(cx, 42, 11, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#151515';
    ctx.beginPath();
    ctx.arc(cx, 46, 5.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#151515';
  ctx.strokeStyle = '#151515';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (mouth === 'smile' || mouth === 'tongue') {
    ctx.moveTo(38, 68);
    ctx.quadraticCurveTo(49, 79, 60, 68);
    ctx.stroke();
  } else if (mouth === 'grin') {
    ctx.moveTo(36, 66);
    ctx.lineTo(62, 66);
    ctx.quadraticCurveTo(61, 80, 49, 80);
    ctx.quadraticCurveTo(37, 80, 36, 66);
    ctx.fill();
  } else {
    ctx.ellipse(49, 71, mouth === 'o' ? 4.5 : 7, mouth === 'o' ? 4.5 : 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// --- The floating field --------------------------------------------------------

interface Sticker {
  colour: string;
  mouth: Mouth;
  look: number;
  cheeks: boolean;
  size: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
}

/** Seeded, so the field opens the same way every visit. Phones get fewer, smaller faces. */
function makeStickers(): Sticker[] {
  const small = typeof window !== 'undefined' && window.innerWidth < 640;
  const count = small ? 7 : 11;
  const scale = small ? 0.72 : 1;
  const rand = seeded(404);
  return Array.from({ length: count }, (_, i) => ({
    colour: FACE_COLOURS[i % FACE_COLOURS.length],
    mouth: MOUTHS[i % MOUTHS.length],
    look: rand() * 2 - 1,
    cheeks: rand() < 0.4,
    size: Math.round((64 + rand() * 44) * scale),
    x: rand(),
    y: rand(),
    vx: (rand() * 2 - 1) * 26,
    vy: (rand() * 2 - 1) * 26,
    rot: (rand() * 2 - 1) * 18,
    vr: (rand() * 2 - 1) * 8,
  }));
}

function FaceField({ paused }: { paused: boolean }) {
  const fieldRef = React.useRef<HTMLDivElement>(null);
  const els = React.useRef<(HTMLDivElement | null)[]>([]);
  const [initial] = React.useState(makeStickers);
  const stickers = React.useRef<Sticker[]>(initial);
  const placed = React.useRef(false);
  const drag = React.useRef<{ i: number; dx: number; dy: number; lastX: number; lastY: number; lastT: number } | null>(null);

  React.useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const w = field.clientWidth;
      const h = field.clientHeight;
      stickers.current.forEach((s, i) => {
        // Seeded fractions become pixels on the first frame that has a size.
        if (!placed.current) {
          s.x = s.x * Math.max(0, w - s.size);
          s.y = s.y * Math.max(0, h - s.size);
          // Start clear of the 404 and its buttons; they drift across later.
          const cx = s.x + s.size / 2 - w / 2;
          const cy = s.y + s.size / 2 - h / 2;
          if (Math.abs(cx) < Math.min(260, w * 0.3) && Math.abs(cy) < 190) {
            s.y = cy < 0 ? Math.max(0, h / 2 - 190 - s.size) : Math.min(h - s.size, h / 2 + 190);
          }
        }
        // Under the glass during the game they hold still, so nothing moves behind the pipes.
        if (drag.current?.i !== i && !still) {
          const slow = paused ? 0 : 1;
          s.x += s.vx * dt * slow;
          s.y += s.vy * dt * slow;
          s.rot += s.vr * dt * slow;
          // Bounce off the edges; flung stickers slow back down to a drift.
          if (s.x < 0) { s.x = 0; s.vx = Math.abs(s.vx); }
          if (s.x > w - s.size) { s.x = w - s.size; s.vx = -Math.abs(s.vx); }
          if (s.y < 0) { s.y = 0; s.vy = Math.abs(s.vy); }
          if (s.y > h - s.size) { s.y = h - s.size; s.vy = -Math.abs(s.vy); }
          const speed = Math.hypot(s.vx, s.vy);
          if (speed > 40) {
            s.vx *= 0.985;
            s.vy *= 0.985;
          }
        }
        const el = els.current[i];
        if (el) el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0) rotate(${s.rot.toFixed(1)}deg)`;
      });
      if (w && h) placed.current = true;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  const onPointerDown = (i: number) => (e: React.PointerEvent<HTMLDivElement>) => {
    const s = stickers.current[i];
    const rect = fieldRef.current!.getBoundingClientRect();
    drag.current = { i, dx: e.clientX - rect.left - s.x, dy: e.clientY - rect.top - s.y, lastX: e.clientX, lastY: e.clientY, lastT: performance.now() };
    e.currentTarget.setPointerCapture(e.pointerId);
    play('tick');
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const s = stickers.current[d.i];
    const rect = fieldRef.current!.getBoundingClientRect();
    s.x = e.clientX - rect.left - d.dx;
    s.y = e.clientY - rect.top - d.dy;
    const now = performance.now();
    const t = Math.max(0.008, (now - d.lastT) / 1000);
    // Release speed comes from the last bit of the drag: a flick flings it.
    s.vx = Math.max(-900, Math.min(900, (e.clientX - d.lastX) / t));
    s.vy = Math.max(-900, Math.min(900, (e.clientY - d.lastY) / t));
    d.lastX = e.clientX;
    d.lastY = e.clientY;
    d.lastT = now;
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  return (
    <div ref={fieldRef} className={`nf-field${paused ? ' is-paused' : ''}`} aria-hidden="true">
      {stickers.current.map((s, i) => (
        <div
          key={i}
          ref={(el) => {
            els.current[i] = el;
          }}
          className="nf-sticker"
          style={{ width: s.size, height: s.size }}
          onPointerDown={onPointerDown(i)}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <FaceSvg colour={s.colour} mouth={s.mouth} look={s.look} cheeks={s.cheeks} />
        </div>
      ))}
    </div>
  );
}

// --- The game ------------------------------------------------------------------

type Phase = 'ready' | 'playing' | 'over';

const GRAVITY = 1700;
const FLAP = -540;
const SPEED = 190;
const BIRD_R = 24;
const PIPE_W = 70;
const PIPE_GAP_MIN = 168;
const PIPE_EVERY = 270;

interface Pipe {
  x: number;
  gapY: number;
  gap: number;
  scored: boolean;
  colour: number;
}

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function FlappyGame({ onExit }: { onExit: () => void }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = React.useState<Phase>('ready');
  const [score, setScore] = React.useState(0);
  const [best, setBest] = React.useState(readBest);
  const flapRef = React.useRef<() => void>(() => {});

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const photo = new Image();
    photo.src = PHOTO;

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    // Mutable game state lives outside React; only score and phase re-render.
    let state: Phase = 'ready';
    let birdY = h * 0.45;
    let vy = 0;
    let pipes: Pipe[] = [];
    let points = 0;
    let spawn = 0;
    let t = 0;
    const birdX = () => Math.min(w * 0.3, 160);
    const gap = () => Math.max(PIPE_GAP_MIN, h * 0.3);

    const reset = () => {
      birdY = h * 0.45;
      vy = 0;
      pipes = [];
      points = 0;
      spawn = 0;
      setScore(0);
    };

    flapRef.current = () => {
      if (state === 'over') {
        reset();
        state = 'ready';
        setPhase('ready');
        return;
      }
      if (state === 'ready') {
        state = 'playing';
        setPhase('playing');
      }
      vy = FLAP;
      play('tick');
    };

    const crash = () => {
      state = 'over';
      setPhase('over');
      play('switch');
      const prev = readBest();
      if (points > prev) {
        try {
          localStorage.setItem(BEST_KEY, String(points));
        } catch {
          // Storage blocked: the best score just isn't kept.
        }
        setBest(points);
      }
    };

    const drawBird = (rotation: number) => {
      const x = birdX();
      ctx.save();
      ctx.translate(x, birdY);
      ctx.rotate(rotation);
      // Cream ring, then the photo clipped to a circle, framed on the face.
      ctx.fillStyle = '#F1EBDC';
      ctx.beginPath();
      ctx.arc(0, 0, BIRD_R + 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, BIRD_R, 0, Math.PI * 2);
      ctx.clip();
      if (photo.complete && photo.naturalWidth) {
        // A square a little tighter than the photo, centred on the face.
        const nw = photo.naturalWidth;
        const nh = photo.naturalHeight;
        const side = Math.min(nw, nh) * PHOTO_CROP.zoom;
        const sx = Math.max(0, Math.min(nw - side, nw * PHOTO_CROP.x - side / 2));
        const sy = Math.max(0, Math.min(nh - side, nh * PHOTO_CROP.y - side / 2));
        ctx.drawImage(photo, sx, sy, side, side, -BIRD_R, -BIRD_R, BIRD_R * 2, BIRD_R * 2);
      } else {
        ctx.fillStyle = '#E8C35A';
        ctx.fillRect(-BIRD_R, -BIRD_R, BIRD_R * 2, BIRD_R * 2);
      }
      ctx.restore();
    };

    /** A pipe is a column of face blocks, leaving the gap open. */
    const drawPipe = (p: Pipe) => {
      const block = PIPE_W;
      const top = p.gapY - p.gap / 2;
      const bottom = p.gapY + p.gap / 2;
      let i = 0;
      for (let y = top - block; y > -block; y -= block, i++) {
        drawFace(ctx, p.x, y, block, FACE_COLOURS[(p.colour + i) % FACE_COLOURS.length], MOUTHS[(p.colour + i) % MOUTHS.length]);
      }
      for (let y = bottom; y < h; y += block, i++) {
        drawFace(ctx, p.x, y, block, FACE_COLOURS[(p.colour + i) % FACE_COLOURS.length], MOUTHS[(p.colour + i + 2) % MOUTHS.length]);
      }
    };

    let raf = 0;
    let last = performance.now();
    let colourSeed = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      t += dt;
      ctx.clearRect(0, 0, w, h);

      if (state === 'ready') {
        // Hover in place until the first flap.
        birdY = h * 0.45 + Math.sin(t * 3) * 8;
      } else if (state === 'playing') {
        vy += GRAVITY * dt;
        birdY += vy * dt;
        spawn -= SPEED * dt;
        if (spawn <= 0) {
          const g = gap();
          const margin = 60 + g / 2;
          pipes.push({ x: w + 20, gapY: margin + Math.random() * Math.max(1, h - margin * 2), gap: g, scored: false, colour: colourSeed++ });
          spawn = PIPE_EVERY;
        }
        pipes.forEach((p) => (p.x -= SPEED * dt));
        pipes = pipes.filter((p) => p.x > -PIPE_W - 10);

        const bx = birdX();
        for (const p of pipes) {
          if (!p.scored && p.x + PIPE_W < bx - BIRD_R) {
            p.scored = true;
            points += 1;
            setScore(points);
            play('glock');
          }
          // Circle against the two blocks either side of the gap.
          const within = bx + BIRD_R - 6 > p.x && bx - BIRD_R + 6 < p.x + PIPE_W;
          if (within && (birdY - BIRD_R + 6 < p.gapY - p.gap / 2 || birdY + BIRD_R - 6 > p.gapY + p.gap / 2)) {
            crash();
            break;
          }
        }
        if (birdY > h - BIRD_R || birdY < -BIRD_R * 2) crash();
      }

      pipes.forEach(drawPipe);
      drawBird(state === 'ready' ? 0 : Math.max(-0.5, Math.min(1.2, vy / 700)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  // Space / up arrow flap; Escape leaves.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        flapRef.current();
      } else if (e.key === 'Escape') {
        onExit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onExit]);

  return (
    <div className="nf-game">
      <canvas
        ref={canvasRef}
        className="nf-canvas"
        onPointerDown={(e) => {
          e.preventDefault();
          flapRef.current();
        }}
        role="img"
        aria-label="Flappy game: tap, click or press Space to fly between the face blocks"
      />
      <div className="nf-hud" aria-live="polite">
        <span className="nf-score">{score}</span>
        <span className="nf-best">best {best}</span>
      </div>
      {phase !== 'playing' && (
        <div className="nf-prompt">
          {phase === 'over' && <p className="nf-over">ouch.</p>}
          <p>{phase === 'over' ? 'tap or press space to try again' : 'tap or press space to fly'}</p>
        </div>
      )}
      <button type="button" className="nf-exit" onClick={onExit} aria-label="Leave the game">
        <X size={18} weight="bold" />
      </button>
    </div>
  );
}

// --- The page ------------------------------------------------------------------

export function NotFound404() {
  const [playing, setPlaying] = React.useState(false);
  const exit = React.useCallback(() => setPlaying(false), []);

  React.useEffect(() => {
    const previous = document.title;
    document.title = 'Page not found — Kellas Andrei';
    window.scrollTo({ top: 0, behavior: 'auto' });
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <section className="nf" aria-labelledby="nf-title">
      <FaceField paused={playing} />
      {/* Frosted glass over the faces while the game runs; fades in and out. */}
      <div className={`nf-glass${playing ? ' is-on' : ''}`} aria-hidden="true" />
      {playing ? (
        <FlappyGame onExit={exit} />
      ) : (
        <div className="nf-centre">
          <h1 id="nf-title" className="nf-404 font-cal">404</h1>
          <p className="nf-copy">this page wandered off. these guys are looking for it.</p>
          <div className="nf-actions">
            <Link to="/" className="nf-btn is-primary">
              <ArrowLeft size={16} weight="bold" aria-hidden="true" />
              back to home
            </Link>
            <button type="button" className="nf-btn" onClick={() => setPlaying(true)} data-sound="primary">
              <GameController size={16} weight="bold" aria-hidden="true" />
              play a quick game
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
