import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

/**
 * Monochrome visor-orb mascot for the "how i think" section.
 *
 * Everything that moves per frame (gaze, breathing, blink, satellite, scanline)
 * is written straight to SVG attributes from one rAF loop, so React only
 * re-renders on coarse state changes: step, sleep, and the label override.
 */

/** Step order matches PROCESS_NODES: understand, plan, build, test, refine, done. */
const STEP = { understand: 0, plan: 1, build: 2, test: 3, refine: 4, done: 5 } as const;

const EYE_HEIGHT = [16, 16, 8, 16, 13, 16];
const SAT_SPEED = [0.8, 0.9, 2.8, 1.2, 1.0, 1.5];
const SLEEP_AFTER_MS = 8000;
const TRACK_WINDOW_MS = 2500;
const STARTLE_MS = 380;
const BLINK_MS = 140;
const RING_TILT = (-12 * Math.PI) / 180;

// Baymax-style figure. The orb is drawn in its original 300x260 coordinates and
// scaled down onto the body, so all head maths (eyes, ring, satellite) is unchanged.
const VIEW_W = 300;
const VIEW_H = 360;
const HEAD_X = 150;
const HEAD_Y = 96;
const HEAD_SCALE = 0.66;
const SHOULDER_L = { x: 102, y: 164 };
const SHOULDER_R = { x: 198, y: 164 };
const FEET_Y = 318;

/**
 * Arm pose per step as [shoulder, elbow bend] in degrees. Shoulder is outward
 * from hanging straight down; bend curls the forearm back toward the body.
 * Separate left/right tables so plan can bring one hand up to the chin.
 */
const ARM_POSE_L: [number, number][] = [[14, 16], [12, 14], [18, 70], [14, 16], [16, 24], [150, -20]];
const ARM_POSE_R: [number, number][] = [[14, 16], [-40, 134], [18, 70], [26, 40], [16, 24], [150, -20]];
const UPPER_ARM = 52;
const FOREARM = 46;
const ARM_SAMPLES = 14;

type Pt = [number, number];

/** Catmull-Rom through open points, as cubic segments (no leading M). */
const smoothThrough = (p: Pt[]) => {
  let d = '';
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[Math.max(i - 1, 0)];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[Math.min(i + 2, p.length - 1)];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(2)} ${c1[1].toFixed(2)} ${c2[0].toFixed(2)} ${c2[1].toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
};

interface TubeSample {
  p: Pt;
  t: Pt;
  n: Pt;
  r: number;
}

const fmt = (p: Pt) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;

/** Samples a centreline into a closed, round-capped tube outline. */
const tube = (at: (t: number) => TubeSample) => {
  const outer: Pt[] = [];
  const inner: Pt[] = [];
  const samples: TubeSample[] = [];
  for (let i = 0; i <= ARM_SAMPLES; i++) {
    const s = at(i / ARM_SAMPLES);
    samples.push(s);
    outer.push([s.p[0] + s.n[0] * s.r, s.p[1] + s.n[1] * s.r]);
    inner.push([s.p[0] - s.n[0] * s.r, s.p[1] - s.n[1] * s.r]);
  }
  const first = samples[0];
  const last = samples[ARM_SAMPLES];
  const k = 4 / 3; // one cubic per cap approximates a half circle
  const endCap = ` C${fmt([outer[ARM_SAMPLES][0] + last.t[0] * last.r * k, outer[ARM_SAMPLES][1] + last.t[1] * last.r * k])} ${fmt([inner[ARM_SAMPLES][0] + last.t[0] * last.r * k, inner[ARM_SAMPLES][1] + last.t[1] * last.r * k])} ${fmt(inner[ARM_SAMPLES])}`;
  const startCap = ` C${fmt([inner[0][0] - first.t[0] * first.r * k, inner[0][1] - first.t[1] * first.r * k])} ${fmt([outer[0][0] - first.t[0] * first.r * k, outer[0][1] - first.t[1] * first.r * k])} ${fmt(outer[0])}`;
  const d = `M${fmt(outer[0])}${smoothThrough(outer)}${endCap}${smoothThrough([...inner].reverse())}${startCap}Z`;
  return { d, samples };
};

/** Straight tube sample from A to B with radius easing from rA to rB (slight mid bulge). */
const straightAt = (A: Pt, B: Pt, rA: number, rB: number) => {
  const len = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1;
  const tv: Pt = [(B[0] - A[0]) / len, (B[1] - A[1]) / len];
  return (t: number): TubeSample => ({
    p: [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t],
    t: tv,
    n: [-tv[1], tv[0]],
    r: rA + (rB - rA) * t + 1 * Math.sin(Math.PI * t),
  });
};

/** Above this elbow bend a single tube pinches into itself, so the arm splits. */
const FOLD_BEND = 95;

/**
 * Builds a soft, puffy arm in shoulder-local space (+y down, -x outward).
 * Relaxed poses are one tube along a quadratic through shoulder, elbow and
 * wrist, so they bend with no visible joint. Tight folds (hand to chin) draw the
 * forearm as its own tube over the upper arm, as a real folded arm overlaps;
 * its rounded end reads as a soft elbow crease.
 */
const buildArm = (shoulderDeg: number, bendDeg: number, litSign: 1 | -1) => {
  const a = (shoulderDeg * Math.PI) / 180;
  const a2 = ((shoulderDeg - bendDeg) * Math.PI) / 180;
  const E: Pt = [-Math.sin(a) * UPPER_ARM, Math.cos(a) * UPPER_ARM];
  const W: Pt = [E[0] - Math.sin(a2) * FOREARM, E[1] + Math.cos(a2) * FOREARM];

  let d: string;
  let hiSamples: TubeSample[];
  let last: TubeSample;
  let seam = 'M0 0';

  if (bendDeg > FOLD_BEND) {
    const upper = tube(straightAt([0, 0], E, 15.5, 13.5));
    const fore = tube(straightAt(E, W, 12.5, 10));
    d = `${upper.d} ${fore.d}`;
    hiSamples = upper.samples.slice(1, 10);
    last = fore.samples[ARM_SAMPLES];
  } else {
    // Control point chosen so the curve passes through the elbow at t = 0.5.
    const C: Pt = [2 * E[0] - W[0] / 2, 2 * E[1] - W[1] / 2];
    const at = (t: number): TubeSample => {
      const u = 1 - t;
      const p: Pt = [2 * u * t * C[0] + t * t * W[0], 2 * u * t * C[1] + t * t * W[1]];
      let tx = 2 * u * C[0] + 2 * t * (W[0] - C[0]);
      let ty = 2 * u * C[1] + 2 * t * (W[1] - C[1]);
      const len = Math.hypot(tx, ty) || 1;
      tx /= len;
      ty /= len;
      // Normal points to the arm's outer (-x at rest) side.
      const r = 15.5 - 2 * t - 3.5 * t * t + 1.2 * Math.sin(Math.PI * t);
      return { p, t: [tx, ty], n: [-ty, tx], r };
    };
    const single = tube(at);
    d = single.d;
    hiSamples = single.samples.slice(1, 9);
    last = single.samples[ARM_SAMPLES];

    // Soft seam across the elbow, bowing toward the hand.
    const e = at(0.5);
    seam = `M${fmt([e.p[0] + e.n[0] * e.r * 0.85, e.p[1] + e.n[1] * e.r * 0.85])} Q${fmt([e.p[0] + e.t[0] * 4, e.p[1] + e.t[1] * 4])} ${fmt([e.p[0] - e.n[0] * e.r * 0.85, e.p[1] - e.n[1] * e.r * 0.85])}`;
  }

  // Soft highlight running down the lit edge of the upper arm.
  const hiPts: Pt[] = hiSamples.map((s) => [
    s.p[0] + s.n[0] * s.r * 0.55 * litSign,
    s.p[1] + s.n[1] * s.r * 0.55 * litSign,
  ]);
  const hi = `M${fmt(hiPts[0])}${smoothThrough(hiPts)}`;

  // Hand frame: +y along the wrist direction, rotated from straight down.
  const handDeg = (Math.atan2(-last.t[0], last.t[1]) * 180) / Math.PI;
  const hand = `translate(${last.p[0].toFixed(2)} ${last.p[1].toFixed(2)}) rotate(${handDeg.toFixed(2)})`;

  return { d, hi, seam, hand };
};

const BODY_PATH =
  'M150 120 C118 120 104 140 99 168 C90 212 80 250 93 279 C105 302 130 308 150 308 C170 308 195 302 207 279 C220 250 210 212 201 168 C196 140 182 120 150 120 Z';

const PALETTE = {
  dark: {
    ring: '#f2f2f2',
    satBack: '#8a8a90',
    satFront: '#f2f2f2',
    shadowOpacity: 0.6,
    thoughtSmall: '#2a2a2e',
    thoughtFill: '#161618',
    thoughtStroke: '#303034',
    thoughtDot: '#f2f2f2',
    sparkles: ['#ffffff', '#9a9aa0', '#d4d4d8'],
    zzz: '#6b6b70',
    particles: ['#ffffff', '#bdbdc2', '#7a7a80'],
    hint: '#44444a',
    // Cartoon line: soft gray so overlaps read without a harsh ink outline.
    outline: '#8a8a90',
    // Arms overlap the pale belly, so they need an edge in both themes.
    armOutline: '#8a8a90',
  },
  // Same grayscale family, flipped so the ring and effects stay visible on white.
  light: {
    ring: '#1a1a1a',
    satBack: '#8a8a90',
    satFront: '#3a3a3e',
    shadowOpacity: 0.22,
    thoughtSmall: '#d4d4d8',
    thoughtFill: '#f0f0f2',
    thoughtStroke: '#d4d4d8',
    thoughtDot: '#3a3a3e',
    sparkles: ['#3a3a3e', '#9a9aa0', '#6b6b70'],
    zzz: '#8a8a85',
    particles: ['#3a3a3e', '#7a7a80', '#bdbdc2'],
    hint: '#a0a0a0',
    // The pale body would dissolve into a white page without a hairline edge.
    outline: '#a0a0a6',
    armOutline: '#a0a0a6',
  },
};

const VERBS = ['understanding', 'planning', 'building', 'testing', 'refining', 'done'];

const rand = (min: number, max: number) => min + Math.random() * (max - min);

interface VisorOrbMascotProps {
  /** Active step index, 0-5. */
  step: number;
  /** Label colour for the active step, taken from the git log. */
  accent: string;
  /** Bumped on every log hover/focus/click; counts as activity for sleep/wake. */
  activity: number;
  theme: 'dark' | 'light';
}

export const VisorOrbMascot: React.FC<VisorOrbMascotProps> = ({ step, accent, activity, theme }) => {
  // Colons from useId break url(#...) references in some browsers.
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const ids = {
    grad: `orbGrad-${uid}`,
    sphere: `sphereClip-${uid}`,
    ringFront: `ringFrontClip-${uid}`,
    bodyGrad: `bodyGrad-${uid}`,
    armGrad: `armGrad-${uid}`,
    armGradL: `armGradL-${uid}`,
    armGradR: `armGradR-${uid}`,
    legGrad: `legGrad-${uid}`,
    softShade: `softShade-${uid}`,
    bodyClip: `bodyClip-${uid}`,
  };
  const palette = PALETTE[theme];

  const [sleeping, setSleeping] = useState(false);
  const [override, setOverride] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const rootRef = useRef<SVGGElement>(null);
  const shadowRef = useRef<SVGEllipseElement>(null);
  const bodyRef = useRef<SVGGElement>(null);
  const highlightRef = useRef<SVGEllipseElement>(null);
  const eyesRef = useRef<SVGGElement>(null);
  const eyeLRef = useRef<SVGRectElement>(null);
  const eyeRRef = useRef<SVGRectElement>(null);
  const happyRef = useRef<SVGGElement>(null);
  const pokeRef = useRef<SVGGElement>(null);
  const scanRef = useRef<SVGRectElement>(null);
  const satBackRef = useRef<SVGCircleElement>(null);
  const satFrontRef = useRef<SVGCircleElement>(null);
  const fxRef = useRef<SVGGElement>(null);
  const figureRef = useRef<SVGGElement>(null);
  const bellyRef = useRef<SVGGElement>(null);
  const armLRef = useRef<SVGGElement>(null);
  const armRRef = useRef<SVGGElement>(null);
  // Per-arm parts rewritten each frame: [outline, highlight, elbow seam, hand group].
  const armParts = useRef<{ path: SVGPathElement | null; hi: SVGPathElement | null; seam: SVGPathElement | null; hand: SVGGElement | null }[]>(
    [0, 1].map(() => ({ path: null, hi: null, seam: null, hand: null }))
  );

  // Mutable loop state. Kept out of React so per-frame updates never re-render.
  const s = useRef({
    step,
    sleeping: false,
    reduced: false,
    theme,
    t: 0,
    ex: 0,
    ey: 0,
    hL: 16,
    hR: 16,
    satAngle: Math.PI / 2,
    boost: 0,
    armL: [...ARM_POSE_L[1]] as [number, number],
    armR: [...ARM_POSE_R[1]] as [number, number],
    hovering: false,
    pointerX: 0,
    pointerY: 0,
    lastPointerMove: -Infinity,
    lastActivity: 0,
    startleUntil: 0,
    pokeAt: -Infinity,
    nextBlinkAt: 0,
    blinks: [] as number[],
  });
  s.current.step = step;
  s.current.theme = theme;

  const overrideTimer = useRef<number | undefined>(undefined);
  const showOverride = React.useCallback((text: string, ms: number) => {
    window.clearTimeout(overrideTimer.current);
    setOverride(text);
    overrideTimer.current = window.setTimeout(() => setOverride(null), ms);
  }, []);

  const burst = React.useCallback((count: number, kind: 'poke' | 'confetti') => {
    const fx = fxRef.current;
    if (!fx || s.current.reduced) return;
    const colors = PALETTE[s.current.theme].particles;
    const NS = 'http://www.w3.org/2000/svg';
    for (let i = 0; i < count; i++) {
      let el: SVGElement;
      if (kind === 'poke') {
        el = document.createElementNS(NS, 'circle');
        el.setAttribute('cx', String(HEAD_X));
        el.setAttribute('cy', String(HEAD_Y));
        el.setAttribute('r', rand(2, 4).toFixed(1));
      } else {
        el = document.createElementNS(NS, 'rect');
        el.setAttribute('x', String(HEAD_X - 2));
        el.setAttribute('y', String(HEAD_Y - 3.5));
        el.setAttribute('width', '4');
        el.setAttribute('height', '7');
        el.setAttribute('rx', '1');
      }
      el.setAttribute('fill', colors[i % colors.length]);
      el.style.transformBox = 'fill-box';
      el.style.transformOrigin = 'center';
      fx.appendChild(el);

      const angle = rand(0, Math.PI * 2);
      const dist = rand(50, 100);
      const spin = rand(-360, 360);
      const anim = el.animate(
        [
          { transform: 'translate(0px, 0px) rotate(0deg)', opacity: 1 },
          {
            transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) rotate(${spin}deg)`,
            opacity: 0,
          },
        ],
        { duration: rand(700, 1100), easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' }
      );
      anim.onfinish = () => el.remove();
    }
  }, []);

  /** Any activity resets the sleep timer; waking from sleep plays the startle. */
  const wake = React.useCallback(() => {
    const st = s.current;
    const now = performance.now();
    st.lastActivity = now;
    if (!st.sleeping) return;
    st.sleeping = false;
    st.startleUntil = now + STARTLE_MS;
    st.nextBlinkAt = now + rand(2200, 5700);
    setSleeping(false);
    showOverride('oh! hi', 700);
  }, [showOverride]);

  const poke = () => {
    const st = s.current;
    wake();
    st.pokeAt = performance.now();
    showOverride('hey!', 900);
    if (st.reduced) return;
    st.boost = 6;
    burst(10, 'poke');
    figureRef.current?.animate(
      [
        { transform: 'scale(1, 1)' },
        { transform: 'scale(1.14, 0.86)' },
        { transform: 'scale(0.93, 1.08)' },
        { transform: 'scale(1.03, 0.98)' },
        { transform: 'scale(1, 1)' },
      ],
      { duration: 560, easing: 'ease-out' }
    );
  };

  // Log interaction counts as activity (skips the initial mount value).
  const firstActivity = useRef(true);
  useEffect(() => {
    if (firstActivity.current) {
      firstActivity.current = false;
      return;
    }
    wake();
  }, [activity, wake]);

  // Confetti only when *entering* done from another step.
  const prevStep = useRef(step);
  useEffect(() => {
    if (step === STEP.done && prevStep.current !== STEP.done) burst(18, 'confetti');
    prevStep.current = step;
  }, [step, burst]);

  // Main loop, listeners, and pause/resume. Mounted once.
  useEffect(() => {
    const st = s.current;
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    st.reduced = motionQuery.matches;
    const onMotionChange = () => { st.reduced = motionQuery.matches; };
    motionQuery.addEventListener('change', onMotionChange);

    const start = performance.now();
    st.lastActivity = start;
    st.nextBlinkAt = start + rand(2200, 5700);

    const onPointerMove = (e: PointerEvent) => {
      // Touch "moves" are drags, not a cursor to follow — activity only.
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
        st.pointerX = e.clientX;
        st.pointerY = e.clientY;
        st.lastPointerMove = performance.now();
      }
      wake();
    };
    const onTouchStart = () => wake();
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });

    let rafId = 0;
    let last = 0;
    let onScreen = false;

    const frame = (now: number) => {
      const dt = Math.min(now - last, 50) / 1000;
      last = now;
      st.t += dt;
      const t = st.t;
      const reduced = st.reduced;
      const stepIdx = st.step;

      // --- Sleep ---
      if (!st.sleeping && now - st.lastActivity > SLEEP_AFTER_MS) {
        st.sleeping = true;
        st.blinks = [];
        setSleeping(true);
      }
      const sleeping = st.sleeping;

      // --- Gaze target ---
      let tx = 0;
      let ty = 0;
      if (sleeping) {
        tx = 0;
        ty = 3;
      } else if (now - st.lastPointerMove < TRACK_WINDOW_MS && svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        const cx = rect.left + (HEAD_X / VIEW_W) * rect.width;
        const cy = rect.top + (HEAD_Y / VIEW_H) * rect.height;
        const dx = st.pointerX - cx;
        const dy = st.pointerY - cy;
        const dist = Math.hypot(dx, dy) || 1;
        const f = Math.min(dist / 180, 1);
        tx = (dx / dist) * 9 * f;
        ty = (dy / dist) * 5 * f;
      } else if (stepIdx === STEP.understand) {
        tx = reduced ? 0 : Math.sin(t * 1.8) * 8;
      } else if (stepIdx === STEP.plan) {
        tx = 4;
        ty = -5;
      } else if (stepIdx === STEP.build) {
        ty = 2;
      } else {
        tx = reduced ? 0 : Math.sin(t * 0.6) * 3;
      }
      st.ex += (tx - st.ex) * 0.12;
      st.ey += (ty - st.ey) * 0.12;
      const { ex, ey } = st;

      // --- Breathing + lean ---
      const b = reduced ? 0 : sleeping ? Math.sin(t * 1.1) * 2.5 : Math.sin(t * 2.1) * 4;
      // The head leans toward the gaze and rides the breath; the body stays planted.
      rootRef.current?.setAttribute('transform', `translate(${ex * 0.6} ${ey * 0.6 + b * 0.6})`);
      // Breathing inflates the belly from the feet up rather than bobbing the body.
      bellyRef.current?.setAttribute(
        'transform',
        `translate(150 ${FEET_Y}) scale(${1 + b * 0.005} ${1 + b * 0.008}) translate(-150 -${FEET_Y})`
      );
      if (shadowRef.current) {
        shadowRef.current.setAttribute(
          'transform',
          `translate(150 ${FEET_Y + 4}) scale(${1 - b * 0.03} 1) translate(-150 -${FEET_Y + 4})`
        );
        const base = PALETTE[st.theme].shadowOpacity;
        shadowRef.current.setAttribute('opacity', String(base - b * 0.03 * (base / 0.6)));
      }
      highlightRef.current?.setAttribute(
        'transform',
        `translate(${-ex * 0.7} ${-ey * 0.7}) rotate(-30 128 104)`
      );

      // --- Eye heights ---
      let targetL: number;
      let targetR: number;
      if (sleeping) {
        targetL = targetR = 2.5;
      } else if (now < st.startleUntil) {
        targetL = targetR = 22;
      } else {
        const hover = st.hovering ? 1.18 : 1;
        targetL = EYE_HEIGHT[stepIdx] * hover;
        targetR = (stepIdx === STEP.test ? 6 : EYE_HEIGHT[stepIdx]) * hover;
      }
      st.hL += (targetL - st.hL) * 0.18;
      st.hR += (targetR - st.hR) * 0.18;

      // --- Blink (triangular close, 25% doubles) ---
      if (!sleeping && now >= st.nextBlinkAt) {
        st.blinks = [now];
        if (Math.random() < 0.25) st.blinks.push(now + 224);
        st.nextBlinkAt = now + rand(2200, 5700);
      }
      let close = 0;
      for (const startAt of st.blinks) {
        const p = (now - startAt) / BLINK_MS;
        if (p >= 0 && p <= 1) close = Math.max(close, 1 - Math.abs(2 * p - 1));
      }
      const hL = st.hL * (1 - 0.9 * close);
      const hR = st.hR * (1 - 0.9 * close);

      const setEye = (el: SVGRectElement | null, x: number, h: number) => {
        if (!el) return;
        el.setAttribute('x', String(x + ex));
        el.setAttribute('y', String(131 - h / 2 + ey));
        el.setAttribute('height', String(h));
        el.setAttribute('rx', String(Math.min(4.5, h / 2)));
      };
      setEye(eyeLRef.current, 131, hL);
      setEye(eyeRRef.current, 160, hR);

      // --- Eye mode: poke > happy (poke tail or done) > normal ---
      const sincePoke = now - st.pokeAt;
      const mode =
        sincePoke < 450 ? 'poke'
          : sincePoke < 1300 || (stepIdx === STEP.done && !sleeping) ? 'happy'
            : 'normal';
      eyesRef.current?.setAttribute('opacity', mode === 'normal' ? '1' : '0');
      happyRef.current?.setAttribute('opacity', mode === 'happy' ? '1' : '0');
      pokeRef.current?.setAttribute('opacity', mode === 'poke' ? '1' : '0');
      happyRef.current?.setAttribute('transform', `translate(${ex} ${ey})`);
      pokeRef.current?.setAttribute('transform', `translate(${ex} ${ey})`);

      // --- Arms: [shoulder, bend] per side, bending at the elbow ---
      const tL: [number, number] = [...ARM_POSE_L[stepIdx]];
      const tR: [number, number] = [...ARM_POSE_R[stepIdx]];
      if (sleeping) {
        tL[0] = tR[0] = 6;
        tL[1] = tR[1] = 8;
      } else if (sincePoke < 1100) {
        // Right arm goes up and waves from the elbow; left relaxes (or stays up on done).
        if (stepIdx !== STEP.done) {
          tL[0] = 12;
          tL[1] = 14;
        }
        tR[0] = 128;
        tR[1] = 20 + (reduced ? 0 : Math.sin(sincePoke / 70) * 32);
      } else {
        if (!reduced) {
          if (stepIdx === STEP.build) {
            // Forearms working in front of the belly, alternating.
            tL[1] += Math.sin(t * 9) * 10;
            tR[1] += Math.sin(t * 9 + Math.PI) * 10;
          } else if (stepIdx === STEP.done) {
            tL[0] += Math.sin(t * 5) * 8;
            tR[0] += Math.sin(t * 5 + Math.PI) * 8;
            tL[1] += Math.sin(t * 5) * 10;
            tR[1] += Math.sin(t * 5 + Math.PI) * 10;
          } else if (stepIdx === STEP.refine) {
            tL[1] += Math.sin(t * 2) * 8;
            tR[1] += Math.sin(t * 2 + 1) * 8;
          } else if (stepIdx === STEP.plan) {
            // Idle "hmm" tap of the hand under the chin.
            tR[1] += Math.sin(t * 3) * 4;
          }
        }
        if (st.hovering) {
          tL[0] += 6;
          tR[0] += 6;
        }
      }
      // Arms drift slightly out on each inhale.
      const breathArm = b * 0.8;
      for (let i = 0; i < 2; i++) {
        st.armL[i] += (tL[i] - st.armL[i]) * 0.12;
        st.armR[i] += (tR[i] - st.armR[i]) * 0.12;
      }
      [st.armL, st.armR].forEach(([shoulderDeg, bendDeg], side) => {
        const parts = armParts.current[side];
        // Light is top-left in world space: the left arm's outer edge, the right arm's inner edge.
        const arm = buildArm(shoulderDeg + breathArm, bendDeg, side === 0 ? 1 : -1);
        parts.path?.setAttribute('d', arm.d);
        parts.hi?.setAttribute('d', arm.hi);
        parts.seam?.setAttribute('d', arm.seam);
        parts.hand?.setAttribute('transform', arm.hand);
      });

      // --- Satellite ---
      if (reduced) {
        st.satAngle = Math.PI / 2; // parked on the front of the ring
        st.boost = 0;
      } else {
        const speed = sleeping ? 0.3 : SAT_SPEED[stepIdx];
        st.satAngle += (speed + st.boost) * dt;
        st.boost *= 0.95;
      }
      const a = st.satAngle;
      const x0 = 92 * Math.cos(a);
      const y0 = 20 * Math.sin(a);
      const satX = 150 + x0 * Math.cos(RING_TILT) - y0 * Math.sin(RING_TILT);
      const satY = 130 + x0 * Math.sin(RING_TILT) + y0 * Math.cos(RING_TILT);
      const satR = String(4 + Math.sin(a) * 1.3);
      const front = Math.sin(a) > 0;
      for (const [el, visible] of [[satFrontRef.current, front], [satBackRef.current, !front]] as const) {
        if (!el) continue;
        el.setAttribute('cx', String(satX));
        el.setAttribute('cy', String(satY));
        el.setAttribute('r', satR);
        el.setAttribute('opacity', visible ? '0.8' : '0');
      }

      // --- Test scanline ---
      if (scanRef.current) {
        if (stepIdx === STEP.test && !sleeping) {
          scanRef.current.setAttribute('opacity', '0.6');
          scanRef.current.setAttribute('y', String(reduced ? 129 : 72 + ((t * 70) % 120)));
        } else {
          scanRef.current.setAttribute('opacity', '0');
        }
      }

      rafId = requestAnimationFrame(frame);
    };

    const run = () => {
      if (rafId || !onScreen || document.hidden) return;
      last = performance.now();
      rafId = requestAnimationFrame(frame);
    };
    const pause = () => {
      cancelAnimationFrame(rafId);
      rafId = 0;
    };
    const sync = () => (onScreen && !document.hidden ? run() : pause());

    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    if (containerRef.current) observer.observe(containerRef.current);
    document.addEventListener('visibilitychange', sync);

    return () => {
      pause();
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('touchstart', onTouchStart);
      motionQuery.removeEventListener('change', onMotionChange);
      window.clearTimeout(overrideTimer.current);
    };
  }, [wake]);

  // Shared by every part's gradient: white body, one light gray shade at the edge.
  const cartoonStops = (
    <>
      <stop offset="0" stopColor="#ffffff" />
      <stop offset=".6" stopColor="#f4f4f6" />
      <stop offset="1" stopColor="#d6d6db" />
    </>
  );

  // One arm in shoulder-local space; the right arm is mirrored by its group.
  // The outline, highlight, seam and hand transform are rewritten every frame.
  const renderArm = (side: 0 | 1) => {
    const [shoulderDeg, bendDeg] = side === 0 ? ARM_POSE_L[STEP.plan] : ARM_POSE_R[STEP.plan];
    const initial = buildArm(shoulderDeg, bendDeg, side === 0 ? 1 : -1);
    const parts = armParts.current[side];
    const grad = side === 0 ? ids.armGradL : ids.armGradR;
    return (
      <>
        <path ref={(el) => { parts.path = el; }} d={initial.d} fill={`url(#${grad})`} stroke={palette.armOutline} strokeWidth="1.3" />
        <path ref={(el) => { parts.seam = el; }} d={initial.seam} fill="none" stroke="#000" strokeOpacity=".2" strokeWidth="1" />
        {/* Mitten hand: +y runs along the wrist, +x faces the body */}
        <g ref={(el) => { parts.hand = el; }} transform={initial.hand}>
          <ellipse cx="10" cy="8" rx="4.5" ry="8" transform="rotate(-28 10 8)" fill={`url(#${ids.armGrad})`} stroke={palette.armOutline} strokeWidth="1.3" />
          <path
            d="M-10 -3 C-13 7 -13 19 -6 25 C-1 29 5 28 8.5 24 C12 19 12 6 10 -3 Z"
            fill={`url(#${ids.armGrad})`}
            stroke={palette.armOutline}
            strokeWidth="1.3"
          />
          {/* Curled fingers */}
          <path d="M-7 19 Q-4 23 -0.5 20.5" fill="none" stroke="#000" strokeOpacity=".25" strokeWidth="1" />
          <path d="M-0.5 21 Q3 25 6 20.5" fill="none" stroke="#000" strokeOpacity=".25" strokeWidth="1" />
        </g>
      </>
    );
  };

  const label = override ?? (sleeping ? 'zz…' : VERBS[step]);
  const labelColor = !override && sleeping ? '#6b6b70' : accent;

  return (
    <div ref={containerRef} className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-[320px]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          aria-hidden="true"
          className="block w-full h-auto"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Cartoon shading: every part is white with one gentle gray falloff
                toward the lower right, like Baymax's soft vinyl. */}
            <radialGradient id={ids.grad} cx="36%" cy="30%" r="80%">
              {cartoonStops}
            </radialGradient>
            <radialGradient id={ids.bodyGrad} cx="36%" cy="26%" r="82%">
              {cartoonStops}
            </radialGradient>
            {/* Arm light is fixed in each arm's shoulder space, so the shade stays
                lower-right in world space as the arm bends. The right arm's space
                is mirrored, so its light sits on the local +x (inner) side. */}
            {[
              { id: ids.armGradL, cx: -14 },
              { id: ids.armGradR, cx: 10 },
            ].map(({ id, cx }) => (
              <radialGradient key={id} id={id} gradientUnits="userSpaceOnUse" cx={cx} cy="-6" r="150">
                {cartoonStops}
              </radialGradient>
            ))}
            {/* Hands are small, so they get their own bounding-box shade. */}
            <radialGradient id={ids.armGrad} cx="34%" cy="30%" r="90%">
              {cartoonStops}
            </radialGradient>
            <radialGradient id={ids.legGrad} cx="36%" cy="24%" r="90%">
              {cartoonStops}
            </radialGradient>
            <radialGradient id={ids.softShade}>
              <stop offset="0" stopColor="#000000" stopOpacity=".16" />
              <stop offset="1" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
            <clipPath id={ids.bodyClip}>
              <path d={BODY_PATH} />
            </clipPath>
            <clipPath id={ids.sphere}>
              <circle cx="150" cy="130" r="60" />
            </clipPath>
            <clipPath id={ids.ringFront}>
              <rect x="-50" y="130" width="400" height="200" transform="rotate(-12 150 130)" />
            </clipPath>
          </defs>

          <ellipse ref={shadowRef} cx="150" cy={FEET_Y + 4} rx="66" ry="8" fill="#000" opacity={palette.shadowOpacity} />

          {/* Whole figure; the poke squash scales it from the feet. */}
          <g ref={figureRef} style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}>
            {/* Stubby legs, tucked under the belly */}
            {[116, 156].map((x) => (
              <rect key={x} x={x} y="280" width="28" height={FEET_Y - 280} rx="13" fill={`url(#${ids.legGrad})`} stroke={palette.outline} strokeWidth="1.3" />
            ))}

            {/* Belly: a soft pear, widest near the bottom like Baymax */}
            <g ref={bellyRef}>
              <path d={BODY_PATH} fill={`url(#${ids.bodyGrad})`} stroke={palette.outline} strokeWidth="1.3" />

              <g clipPath={`url(#${ids.bodyClip})`}>
                {/* Faint contact shade where the head rests on the body */}
                <ellipse cx="150" cy="128" rx="36" ry="10" fill={`url(#${ids.softShade})`} />
                {/* Soft seams: across the chest and the hip fold */}
                <path d="M100 196 Q150 204 200 196" fill="none" stroke={palette.outline} strokeOpacity=".45" strokeWidth="1" />
                <path d="M92 272 Q150 292 208 272" fill="none" stroke={palette.outline} strokeOpacity=".55" strokeWidth="1" />
              </g>

              {/* Chest port, on Baymax's left: outlined disc with the notch line */}
              <circle cx="174" cy="166" r="9" fill="none" stroke={palette.outline} strokeWidth="1.1" />
              <path d="M165.5 168 L169.5 168 L171.5 164.5 L176.5 164.5 L178.5 168 L182.5 168" fill="none" stroke={palette.outline} strokeWidth="1.1" strokeLinejoin="round" />
            </g>

            {/* Arms start at the shoulder (local 0,0) and hang down +y, in front of
                the belly. Their shape is rebuilt per frame, so they bend rather than pivot. */}
            <g ref={armLRef} transform={`translate(${SHOULDER_L.x} ${SHOULDER_L.y})`}>
              {renderArm(0)}
            </g>
            <g ref={armRRef} transform={`translate(${SHOULDER_R.x} ${SHOULDER_R.y}) scale(-1 1)`}>
              {renderArm(1)}
            </g>

            {/* Head: lean + bob in figure space, then the original orb scaled onto the body */}
            <g ref={rootRef}>
              <g transform={`translate(${HEAD_X} ${HEAD_Y}) scale(${HEAD_SCALE}) translate(-150 -130)`}>
                {/* ring back half */}
                <ellipse cx="150" cy="130" rx="92" ry="20" transform="rotate(-12 150 130)" fill="none" stroke={palette.ring} strokeWidth="1.2" opacity=".2" />
                <circle ref={satBackRef} r="4" fill={palette.satBack} />

                <g ref={bodyRef}>
                  <circle cx="150" cy="130" r="60" fill={`url(#${ids.grad})`} stroke={palette.outline} strokeWidth="2" />
                  <ellipse ref={highlightRef} cx="128" cy="104" rx="16" ry="9" fill="#fff" opacity=".55" transform="rotate(-30 128 104)" />
                  <rect x="116" y="116" width="68" height="30" rx="15" fill="#0a0a0b" opacity=".92" />
                  <g ref={eyesRef}>
                    <rect ref={eyeLRef} x="131" y="123" width="9" height="16" rx="4.5" fill="#f2f2f2" />
                    <rect ref={eyeRRef} x="160" y="123" width="9" height="16" rx="4.5" fill="#f2f2f2" />
                  </g>
                  <g ref={happyRef} opacity="0" fill="none" stroke="#f2f2f2" strokeWidth="3" strokeLinecap="round">
                    <path d="M130 134 q5.5 -8 11 0" />
                    <path d="M159 134 q5.5 -8 11 0" />
                  </g>
                  <g ref={pokeRef} opacity="0" fill="none" stroke="#f2f2f2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M131 125 l8 6 l-8 6" />
                    <path d="M169 125 l-8 6 l8 6" />
                  </g>
                  <g clipPath={`url(#${ids.sphere})`}>
                    <rect ref={scanRef} x="85" y="80" width="130" height="2" fill="#6b6b70" opacity="0" />
                  </g>
                </g>

                {/* ring front half */}
                <ellipse cx="150" cy="130" rx="92" ry="20" transform="rotate(-12 150 130)" fill="none" stroke={palette.ring} strokeWidth="1.2" opacity=".6" clipPath={`url(#${ids.ringFront})`} />
                <circle ref={satFrontRef} r="4" fill={palette.satFront} />
              </g>

              {/* plan: thought bubble, off the top-right of the head */}
              <g className="orb-fx" opacity={!sleeping && step === STEP.plan ? 1 : 0}>
                <circle cx="190" cy="60" r="3" fill={palette.thoughtSmall} />
                <circle cx="200" cy="48" r="5" fill={palette.thoughtSmall} />
                <ellipse cx="226" cy="28" rx="24" ry="14" fill={palette.thoughtFill} stroke={palette.thoughtStroke} />
                <circle className="orb-dot-pulse" cx="216" cy="28" r="2.5" fill={palette.thoughtDot} />
                <circle className="orb-dot-pulse" cx="226" cy="28" r="2.5" fill={palette.thoughtDot} style={{ animationDelay: '.2s' }} />
                <circle className="orb-dot-pulse" cx="236" cy="28" r="2.5" fill={palette.thoughtDot} style={{ animationDelay: '.4s' }} />
              </g>

              {/* sleeping: zzz */}
              <g className="orb-fx orb-fx-slow" opacity={sleeping ? 1 : 0} fontFamily="monospace" fontWeight="700" fill={palette.zzz}>
                <text className="orb-z-float" x="188" y="66" fontSize="13">z</text>
                <text className="orb-z-float" x="196" y="56" fontSize="16" style={{ animationDelay: '.9s' }}>z</text>
                <text className="orb-z-float" x="204" y="46" fontSize="19" style={{ animationDelay: '1.8s' }}>Z</text>
              </g>
            </g>
          </g>

          {/* refine: sparkles around the figure */}
          <g className="orb-fx" opacity={!sleeping && step === STEP.refine ? 1 : 0}>
            <path className="orb-twinkle" d="M204 52 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3z" fill={palette.sparkles[0]} />
            <path className="orb-twinkle" style={{ animationDelay: '.5s' }} d="M66 150 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 l6 -2z" fill={palette.sparkles[1]} />
            <path className="orb-twinkle" style={{ animationDelay: '.9s' }} d="M238 218 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2z" fill={palette.sparkles[2]} />
          </g>

          <g ref={fxRef} />
        </svg>

        {/* Keyboard- and touch-operable hit area over the whole figure. */}
        <button
          type="button"
          aria-label="Poke the mascot"
          onClick={poke}
          onPointerEnter={(e) => { if (e.pointerType === 'mouse') s.current.hovering = true; }}
          onPointerLeave={() => { s.current.hovering = false; }}
          className="orb-hit absolute rounded-[45%] cursor-pointer"
          style={{ left: '29.33%', top: '15%', width: '41.33%', height: '74.4%' }}
        />
      </div>

      <span className="mt-1 font-mono text-[12px] text-center lowercase" style={{ color: labelColor }}>
        {label}
      </span>
      <span className="mt-1 font-mono text-[10px] text-center" style={{ color: palette.hint }}>
       
      </span>
    </div>
  );
};
