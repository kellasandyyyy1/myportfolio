import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { whenHeroIntroDone } from '../lib/heroIntro';

/**
 * First-visit intro tour. A simulated macOS cursor (or, on touch, a soft tap
 * indicator) glides between real elements tagged with data-tour="…", a
 * spotlight morphs around each one, and a short caption says what it is.
 *
 * - Plays once on the first visit to "/", after the hero has loaded in.
 * - Any real input (click, key, scroll, wheel, touch) or "Skip" ends it.
 * - Simulated hovers only set data-tour-active; nothing is ever clicked for
 *   real except opening and closing the mobile menu, which is the point.
 * - Reduced motion: no tour, just a single static tip.
 */

const SEEN_KEY = 'introTourSeen';
const REPLAY_EVENT = 'intro-tour:replay';

/** Restart the tour from anywhere (sidebar and mobile-menu "replay intro"). */
export const replayIntroTour = () => window.dispatchEvent(new Event(REPLAY_EVENT));

const readSeen = () => {
  try { return localStorage.getItem(SEEN_KEY) === 'true'; } catch { return false; }
};
const markSeen = () => {
  try { localStorage.setItem(SEEN_KEY, 'true'); } catch { /* storage blocked: fine */ }
};

// TODO: owner to finalize copy
const COPY = {
  name: 'Hi — this is my corner of the web.',
  about: 'Who I am and how I work.',
  work: 'Projects live here.',
  more: 'What I offer, and how to reach me.',
  social: 'Find me on GitHub and LinkedIn.',
  socialAll: 'GitHub, LinkedIn, or just email me.',
  book: 'Fastest way to work together.',
  theme: 'Light or dark — your call.',
  menu: 'Everything lives in this menu.',
  nav: 'Jump to any section from here.',
  done: 'Enjoy exploring ✦',
  reduced: 'Tip: every section is in the menu ✦',
};

/** cubic-bezier(x1, y1, x2, y2) as a function of progress. */
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dsx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const d = sx(t) - x;
      const dd = dsx(t);
      if (Math.abs(d) < 1e-5 || Math.abs(dd) < 1e-6) break;
      t -= d / dd;
    }
    return sy(Math.min(1, Math.max(0, t)));
  };
}
const EASE = cubicBezier(0.22, 0.8, 0.24, 1);
const EASE_OUT = (t: number) => 1 - (1 - t) * (1 - t);
/** Short hops between neighbouring items: a soft start and a soft landing. */
const EASE_IN_OUT = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

type Pt = { x: number; y: number };
type Box = { x: number; y: number; w: number; h: number; r: number };
type Mode = 'desktop' | 'touch';

const CANCEL = Symbol('tour-cancel');

const visible = (el: Element) => {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
};
const targets = (key: string) =>
  Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${key}"]`)).filter(visible);

const unionRect = (els: HTMLElement[]) => {
  const rs = els.map((e) => e.getBoundingClientRect());
  const left = Math.min(...rs.map((r) => r.left));
  const top = Math.min(...rs.map((r) => r.top));
  const right = Math.max(...rs.map((r) => r.right));
  const bottom = Math.max(...rs.map((r) => r.bottom));
  return { left, top, right, bottom, width: right - left, height: bottom - top };
};

const spotFor = (els: HTMLElement[]): Box => {
  const r = unionRect(els);
  const radius = parseFloat(getComputedStyle(els[0]).borderTopLeftRadius) || 0;
  return { x: r.left - 8, y: r.top - 8, w: r.width + 16, h: r.height + 16, r: radius + 4 };
};

/** Where the pointer rests on an element: over its start, vertically centred. */
const aimAt = (el: HTMLElement): Pt => {
  const r = el.getBoundingClientRect();
  return { x: r.left + Math.min(r.width / 2, 28), y: r.top + r.height / 2 };
};

const isInteractive = (el: HTMLElement) => Boolean(el.closest('a, button'));

type CaptionState = { text: string; n: number; total: number; shown: boolean };

export function IntroTour() {
  const location = useLocation();
  const navigate = useNavigate();

  const [phase, setPhase] = React.useState<'idle' | 'running' | 'leaving'>('idle');
  const [mode, setMode] = React.useState<Mode>('desktop');
  const [entered, setEntered] = React.useState(false);
  const [caption, setCaption] = React.useState<CaptionState>({ text: '', n: 0, total: 0, shown: false });
  const [toast, setToast] = React.useState<string | null>(null);
  const [hand, setHand] = React.useState(false);

  const cursorRef = React.useRef<HTMLDivElement>(null);
  const pointerRef = React.useRef<HTMLDivElement>(null);
  const holeRef = React.useRef<SVGRectElement>(null);
  const captionRef = React.useRef<HTMLDivElement>(null);
  const skipRef = React.useRef<HTMLButtonElement>(null);

  // Live tour state, outside React so the per-frame work never re-renders.
  const run = React.useRef({
    cancelled: true,
    raf: 0,
    timers: [] as number[],
    cur: { x: 0, y: 0 } as Pt,
    spot: { x: 0, y: 0, w: 0, h: 0, r: 0 } as Box,
    current: [] as HTMLElement[],
    active: new Set<HTMLElement>(),
    flipped: null as HTMLElement | null,
    menuOpen: false,
    bend: 1,
    mode: 'desktop' as Mode,
  });

  /* ---------- low-level drawing ---------- */

  const drawCursor = (p: Pt) => {
    run.current.cur = p;
    const el = cursorRef.current;
    if (!el) return;
    const off = run.current.mode === 'touch' ? 14 : 0;
    el.style.transform = `translate3d(${p.x - off}px, ${p.y - off}px, 0)`;
  };

  const drawSpot = (b: Box) => {
    run.current.spot = b;
    const h = holeRef.current;
    if (!h) return;
    h.setAttribute('x', String(b.x));
    h.setAttribute('y', String(b.y));
    h.setAttribute('width', String(Math.max(0, b.w)));
    h.setAttribute('height', String(Math.max(0, b.h)));
    h.setAttribute('rx', String(b.r));
  };

  const placeCaption = React.useCallback(() => {
    const card = captionRef.current;
    const els = run.current.current;
    if (!card || !els.length) return;
    const r = unionRect(els);
    const vw = innerWidth, vh = innerHeight, m = 12, gap = 16;

    if (run.current.mode === 'touch') {
      // Compact card at the bottom edge, or the top if only that leaves the
      // target uncovered.
      const h = card.offsetHeight;
      const freeBelow = vh - r.bottom;
      const freeAbove = r.top - 64; // below the top bar
      const top = freeBelow < h + 32 && freeAbove > freeBelow;
      card.dataset.edge = top ? 'top' : 'bottom';
      card.style.left = '';
      card.style.top = '';
      return;
    }

    const w = card.offsetWidth, h = card.offsetHeight;
    const space = { right: vw - r.right, left: r.left, bottom: vh - r.bottom, top: r.top };
    const fits = {
      right: space.right >= w + gap + m, left: space.left >= w + gap + m,
      bottom: space.bottom >= h + gap + m, top: space.top >= h + gap + m,
    };
    const order = (Object.keys(space) as (keyof typeof space)[]).sort((a, b) => space[b] - space[a]);
    const side = order.find((s) => fits[s]) ?? order[0];

    let x = 0, y = 0;
    if (side === 'right') { x = r.right + gap; y = r.top + r.height / 2 - h / 2; }
    if (side === 'left') { x = r.left - gap - w; y = r.top + r.height / 2 - h / 2; }
    if (side === 'bottom') { x = r.left; y = r.bottom + gap; }
    if (side === 'top') { x = r.left; y = r.top - gap - h; }
    x = Math.min(Math.max(m, x), vw - w - m);
    y = Math.min(Math.max(m, y), vh - h - m);
    card.style.left = `${x}px`;
    card.style.top = `${y}px`;
  }, []);

  React.useLayoutEffect(() => {
    if (caption.shown) placeCaption();
  }, [caption, placeCaption]);

  /* ---------- timeline primitives ---------- */

  const guard = async <T,>(p: Promise<T>) => {
    const v = await p;
    if (run.current.cancelled) throw CANCEL;
    return v;
  };

  const wait = (ms: number) =>
    guard(new Promise<void>((resolve) => {
      run.current.timers.push(window.setTimeout(resolve, ms));
    }));

  /** One rAF loop per tween; every visual change in the tour goes through here. */
  const tween = (ms: number, frame: (e: number) => void, ease = EASE) =>
    guard(new Promise<void>((resolve) => {
      const start = performance.now();
      const tick = (now: number) => {
        if (run.current.cancelled) return resolve();
        const t = Math.min(1, (now - start) / ms);
        frame(ease(t));
        if (t < 1) run.current.raf = requestAnimationFrame(tick);
        else resolve();
      };
      run.current.raf = requestAnimationFrame(tick);
    }));

  const lerp = (a: number, b: number, e: number) => a + (b - a) * e;
  const lerpBox = (a: Box, b: Box, e: number): Box => ({
    x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e), w: lerp(a.w, b.w, e), h: lerp(a.h, b.h, e), r: lerp(a.r, b.r, e),
  });

  /**
   * Glide to a point along a slightly bent quadratic path, decelerating into
   * it with a 1.5px overshoot that settles. The spotlight morphs in sync.
   */
  const glide = async (to: Pt, spot?: Box, quick?: number) => {
    const from = { ...run.current.cur };
    const dx = to.x - from.x, dy = to.y - from.y;
    const dist = Math.hypot(dx, dy) || 1;
    const dur = quick ?? Math.min(900, Math.max(500, 420 + dist * 0.55));
    // Long moves alternate their bend; short hops keep one gentle bend so a run
    // down a list reads as one smooth sweep rather than a zig-zag.
    if (!quick) run.current.bend *= -1;
    const bend = quick ? 0.06 : 0.15;
    const nx = -dy / dist, ny = dx / dist;
    const c = {
      x: from.x + dx / 2 + nx * dist * bend * run.current.bend,
      y: from.y + dy / 2 + ny * dist * bend * run.current.bend,
    };
    const over = quick ? to : { x: to.x + (dx / dist) * 1.5, y: to.y + (dy / dist) * 1.5 };
    const s0 = { ...run.current.spot };

    await tween(dur, (e) => {
      const u = 1 - e;
      drawCursor({
        x: u * u * from.x + 2 * u * e * c.x + e * e * over.x,
        y: u * u * from.y + 2 * u * e * c.y + e * e * over.y,
      });
      if (spot) drawSpot(lerpBox(s0, spot, e));
    }, quick ? EASE_IN_OUT : EASE);
    if (!quick) await tween(130, (e) => drawCursor({ x: lerp(over.x, to.x, e), y: lerp(over.y, to.y, e) }), EASE_OUT);
  };

  const ripple = () => {
    const layer = cursorRef.current?.parentElement;
    if (!layer) return;
    const dot = document.createElement('span');
    dot.className = 'it-ripple';
    dot.style.transform = `translate3d(${run.current.cur.x - 18}px, ${run.current.cur.y - 18}px, 0)`;
    layer.appendChild(dot);
    const a = dot.animate(
      [{ transform: `${dot.style.transform} scale(0.333)`, opacity: 0.5 }, { transform: `${dot.style.transform} scale(1)`, opacity: 0 }],
      { duration: 450, easing: 'cubic-bezier(.22,.8,.24,1)' },
    );
    a.onfinish = () => dot.remove();
  };

  /** A "click": a short human pause, the pointer dips, a ripple spreads. Never a real click. */
  const press = async () => {
    await wait(250 + Math.random() * 150);
    pointerRef.current?.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(0.88)' }, { transform: 'scale(1)' }],
      { duration: 160, easing: 'ease-out' },
    );
    ripple();
    await wait(170);
  };

  const setActive = (el: HTMLElement | null) => {
    run.current.active.forEach((e) => e.removeAttribute('data-tour-active'));
    run.current.active.clear();
    if (el) {
      el.setAttribute('data-tour-active', '');
      run.current.active.add(el);
    }
  };

  const say = async (text: string, n: number, total: number) => {
    setCaption({ text, n, total, shown: true });
    await wait(40);
  };
  const unsay = async () => {
    setCaption((c) => ({ ...c, shown: false }));
    await wait(120);
  };

  /** Move onto a target group: spotlight morphs there, cursor glides to `aim`. */
  const visit = async (els: HTMLElement[], aim: HTMLElement) => {
    run.current.current = els;
    setHand(isInteractive(aim));
    await glide(aimAt(aim), spotFor(els));
  };

  /* ---------- sequences ---------- */

  type Step = { key: string; play: (els: HTMLElement[], n: number, total: number) => Promise<void> };

  const desktopSteps: Step[] = [
    {
      key: 'hero-name',
      play: async (els, n, t) => {
        await visit(els, els[0]);
        await say(COPY.name, n, t);
        await wait(850);
      },
    },
    {
      key: 'sb-top',
      play: async (els, n, t) => {
        await unsay();
        await visit(els, els[0]);
        await say(COPY.about, n, t);
        for (const el of els) {
          setActive(el);
          await glide(aimAt(el), undefined, 240);
          await wait(150);
        }
        setActive(null);
        await wait(300);
      },
    },
    {
      key: 'sb-work',
      play: async (els, n, t) => {
        await unsay();
        await visit(els, els[0]);
        setActive(els[0]);
        await say(COPY.work, n, t);
        await press();
        await wait(500);
        setActive(null);
      },
    },
    {
      key: 'sb-more',
      play: async (els, n, t) => {
        await unsay();
        await visit(els, els[0]);
        await say(COPY.more, n, t);
        for (const el of els) {
          setActive(el);
          await glide(aimAt(el), undefined, 230);
          await wait(130);
        }
        setActive(null);
        await wait(400);
      },
    },
    {
      key: 'sb-social',
      play: async (els, n, t) => {
        await unsay();
        await visit(els, els[0]);
        await say(COPY.socialAll, n, t);
        for (const el of els) {
          setActive(el);
          await glide(aimAt(el), undefined, 240);
          await wait(220);
        }
        setActive(null);
        await wait(350);
      },
    },
    {
      key: 'hero-book',
      play: async (els, n, t) => {
        await unsay();
        await visit(els, els[0]);
        setActive(els[0]);
        await say(COPY.book, n, t);
        await wait(850);
        setActive(null);
      },
    },
    {
      key: 'theme',
      play: async (els, n, t) => {
        await unsay();
        const other = els[0].querySelector<HTMLElement>('[aria-pressed="false"]') ?? els[0];
        await visit(els, other);
        await say(COPY.theme, n, t);
        await press();
        // Preview only: slide the thumb across and back; the theme never changes.
        run.current.flipped = els[0];
        els[0].setAttribute('data-tour-flip', '');
        await wait(600);
        els[0].removeAttribute('data-tour-flip');
        run.current.flipped = null;
        await wait(350);
      },
    },
  ];

  const touchSteps: Step[] = [
    {
      key: 'hero-name',
      play: async (els, n, t) => {
        await visit(els, els[0]);
        await say(COPY.name, n, t);
        await wait(1100);
      },
    },
    {
      key: 'hero-social',
      play: async (els, n, t) => {
        await unsay();
        await visit(els, els[0]);
        await say(COPY.social, n, t);
        for (const el of els) {
          setActive(el);
          await glide(aimAt(el), undefined, 260);
          await wait(260);
        }
        setActive(null);
        await wait(300);
      },
    },
    {
      // Tablet header (no hamburger at this width).
      key: 'tab-nav',
      play: async (els, n, t) => {
        await unsay();
        await visit(els, els[0]);
        await say(COPY.nav, n, t);
        await wait(1100);
      },
    },
    {
      key: 'm-menu',
      play: async (els, n, t) => {
        await unsay();
        await visit(els, els[0]);
        await say(COPY.menu, n, t);
        await press();
        els[0].click(); // the one real action: open the menu
        run.current.menuOpen = true;
        await wait(450);
      },
    },
    {
      key: 'm-nav',
      play: async (els, n, t) => {
        await unsay();
        await visit(els, els[0]);
        await say(COPY.nav, n, t);
        await wait(850);
      },
    },
    {
      key: 'm-book',
      play: async (els, n, t) => {
        await unsay();
        await visit(els, els[0]);
        await say(COPY.book, n, t);
        await press();
        await wait(450);
      },
    },
    {
      key: 'hero-book',
      play: async (els, n, t) => {
        await unsay();
        await visit(els, els[0]);
        await say(COPY.book, n, t);
        await wait(1000);
      },
    },
  ];

  /* ---------- lifecycle ---------- */

  const closeMenuIfOpened = () => {
    if (!run.current.menuOpen) return;
    run.current.menuOpen = false;
    document.querySelector<HTMLElement>('[data-tour="m-close"]')?.click();
  };

  const removeListeners = React.useRef<() => void>(() => {});

  const finish = React.useCallback((completed: boolean) => {
    const r = run.current;
    if (r.cancelled) return;
    r.cancelled = true;
    cancelAnimationFrame(r.raf);
    r.timers.forEach(clearTimeout);
    r.timers = [];
    removeListeners.current();
    setActive(null);
    r.flipped?.removeAttribute('data-tour-flip');
    r.flipped = null;
    closeMenuIfOpened();
    markSeen();

    setPhase('leaving');
    // Let the last hover fade out before real hover timing comes back.
    window.setTimeout(() => document.documentElement.classList.remove('it-tour-on'), 400);
    setCaption((c) => ({ ...c, shown: false }));
    window.setTimeout(() => {
      setPhase('idle');
      setEntered(false);
      if (completed) {
        setToast(COPY.done);
        window.setTimeout(() => setToast(null), 1800);
      }
    }, completed ? 300 : 200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = React.useCallback(async () => {
    if (!run.current.cancelled) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      markSeen();
      setToast(COPY.reduced);
      window.setTimeout(() => setToast(null), 3200);
      return;
    }

    const desktop = window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches;
    const m: Mode = desktop ? 'desktop' : 'touch';
    // Phones: the menu sequence when there's a hamburger (its in-menu targets only
    // appear once it opens, so they can't be checked up front); tablets: header + book.
    const IN_MENU = ['m-nav', 'm-book'];
    const hasMenu = targets('m-menu').length > 0;
    const touchPlan = touchSteps.filter((s) =>
      hasMenu ? ['hero-name', 'hero-social', 'm-menu', ...IN_MENU].includes(s.key) : ['hero-name', 'hero-social', 'tab-nav', 'hero-book'].includes(s.key));
    const steps = (desktop ? desktopSteps : touchPlan).filter((s) => IN_MENU.includes(s.key) || targets(s.key).length > 0);
    if (!steps.length) return;

    const r = run.current;
    r.cancelled = false;
    r.mode = m;
    r.current = targets(steps[0].key);
    r.cur = { x: innerWidth + 30, y: innerHeight + 30 };
    setMode(m);
    setHand(false);
    setPhase('running');
    document.documentElement.classList.add('it-tour-on');
    markSeen();

    // Wait a frame for the overlay to mount, then fade it in.
    await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
    drawSpot(spotFor(r.current));
    drawCursor(r.cur);
    setEntered(true);
    skipRef.current?.focus({ preventScroll: true });

    // Real input ends the tour immediately; synthetic events never do.
    const stop = (e: Event) => { if (e.isTrusted) finish(false); };
    const opts = { capture: true, passive: true } as const;
    const evs = ['pointerdown', 'keydown', 'wheel', 'touchmove', 'scroll'] as const;
    evs.forEach((ev) => window.addEventListener(ev, stop, opts));
    const onResize = () => {
      const els = r.current.filter((e) => e.isConnected);
      if (!els.length) return;
      drawSpot(spotFor(els));
      placeCaption();
    };
    window.addEventListener('resize', onResize);
    removeListeners.current = () => {
      evs.forEach((ev) => window.removeEventListener(ev, stop, opts));
      window.removeEventListener('resize', onResize);
    };

    try {
      await wait(300);
      let n = 0;
      for (const step of steps) {
        const els = targets(step.key);
        if (!els.length) continue; // skipped gracefully if it vanished
        n += 1;
        await step.play(els, n, steps.length);
      }
      if (r.menuOpen) {
        // Tap the menu's close button, then finish.
        const close = targets('m-close');
        await unsay();
        if (close.length) {
          setHand(true);
          await glide(aimAt(close[0]));
          await press();
        }
        closeMenuIfOpened();
        await wait(300);
      }
      await unsay();
      finish(true);
    } catch (err) {
      if (err !== CANCEL) throw err;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finish, placeCaption]);

  // Auto-play once: first visit, home page, no anchor, after the hero has loaded in.
  React.useEffect(() => {
    if (readSeen()) return;
    if (location.pathname !== '/' || location.hash) return;
    let cancelled = false;
    const mountedAt = performance.now();
    const go = async () => {
      // The hero portrait assembles itself first; the tour never starts over it.
      await whenHeroIntroDone();
      if (cancelled) return;
      const heroDone = Math.max(0, 1100 - (performance.now() - mountedAt));
      const id = window.setTimeout(() => {
        if (cancelled || window.scrollY > 40) return; // the visitor is already exploring
        void start();
      }, heroDone + 600);
      run.current.timers.push(id);
    };
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener('load', go);
    };
    // Only on first mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // "replay intro": back to the top of the home page, then start.
  React.useEffect(() => {
    const onReplay = () => {
      finish(false);
      if (window.location.pathname !== '/') navigate('/');
      window.setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
        window.setTimeout(() => void start(), 450);
      }, 350);
    };
    window.addEventListener(REPLAY_EVENT, onReplay);
    return () => window.removeEventListener(REPLAY_EVENT, onReplay);
  }, [finish, navigate, start]);

  // Clean up everything if the page unmounts mid-tour.
  React.useEffect(() => () => {
    const r = run.current;
    r.cancelled = true;
    cancelAnimationFrame(r.raf);
    r.timers.forEach(clearTimeout);
    removeListeners.current();
    document.documentElement.classList.remove('it-tour-on');
  }, []);

  return (
    <>
      {phase !== 'idle' && (
        <div className={`it-root ${entered ? 'is-in' : ''} ${phase === 'leaving' ? 'is-leaving' : ''}`} data-mode={mode}>
          <svg className="it-overlay" aria-hidden="true">
            <defs>
              <mask id="it-mask">
                <rect width="100%" height="100%" fill="#fff" />
                <rect ref={holeRef} fill="#000" />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="rgba(10,10,9,.55)" mask="url(#it-mask)" />
          </svg>

          <div className="it-layer" aria-hidden="true">
            <div ref={cursorRef} className="it-cursor">
              <div ref={pointerRef} className="it-pointer">
                {mode === 'desktop' ? (
                  <>
                    <svg className={`it-arrow ${hand ? '' : 'is-on'}`} width="22" height="22" viewBox="0 0 22 22">
                      <path d="M3 2v16l4.2-3.8 2.8 6.3 2.6-1.1-2.7-6.2h5.6z" />
                    </svg>
                    <svg className={`it-hand ${hand ? 'is-on' : ''}`} width="22" height="22" viewBox="0 0 22 22">
                      <path d="M8.6 2.6c-.9 0-1.6.7-1.6 1.6v8.1l-1.3-1.4c-.6-.7-1.7-.7-2.3-.1-.6.6-.6 1.6 0 2.3l4.4 5.2c.9 1.1 2.2 1.7 3.6 1.7h3.1c2.5 0 4.5-2 4.5-4.5v-4.6c0-.9-.7-1.6-1.6-1.6-.4 0-.7.1-1 .3-.2-.7-.8-1.2-1.6-1.2-.4 0-.8.1-1 .4-.2-.7-.9-1.2-1.6-1.2-.3 0-.6.1-.9.2V4.2c0-.9-.7-1.6-1.6-1.6z" />
                    </svg>
                  </>
                ) : (
                  <span className="it-touch" />
                )}
              </div>
            </div>
          </div>

          <div
            ref={captionRef}
            className={`it-caption ${caption.shown ? 'is-shown' : ''}`}
            aria-hidden="true"
          >
            <span className="it-step">{caption.n} / {caption.total}</span>
            <span className="it-text">{caption.text}</span>
          </div>

          <button ref={skipRef} type="button" className="it-skip" onClick={() => finish(false)}>
            Skip intro
          </button>

          <div className="sr-only" aria-live="polite">{caption.shown ? caption.text : ''}</div>
        </div>
      )}

      {toast && (
        <div className="it-toast" role="status">{toast}</div>
      )}
    </>
  );
}
