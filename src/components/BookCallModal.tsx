import * as React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, ArrowSquareOut, CaretLeft, CaretRight, X } from '@phosphor-icons/react';

/**
 * Book-a-call overlay. Opens over a soft blurred mosaic of the page and asks
 * one question at a time in large type: when, name, email, topic. Borderless
 * throughout. Confirming opens a prefilled Google Calendar event at the chosen
 * time with Kellas as a guest, so saving it sends him the invite.
 *
 * Enter moves forward, Escape closes, focus lands on each question as it
 * appears and returns to the trigger on close, and the page doesn't scroll
 * behind it.
 */
export interface BookCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HOST_EMAIL = 'kellasandrei00@gmail.com';
// Kellas is in Manila: slots are Manila wall-clock times (no daylight saving).
const HOST_ZONE = 'Asia/Manila';
/** Intl only offers "GMT+8" here, so name the zone ourselves. */
const HOST_LABEL = 'PHT';
const CALL_MINUTES = 30;
const DAYS_AHEAD = 14;

/** Slots in Manila time, grouped by part of the day. */
const SLOT_GROUPS: { label: string; slots: [number, number][] }[] = [
  { label: 'morning', slots: [[10, 0], [11, 30]] },
  { label: 'afternoon', slots: [[14, 0], [15, 30]] },
  { label: 'evening', slots: [[17, 0], [20, 0]] },
];

const TOPICS = ['new website', 'web app', 'redesign', 'something else'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Local calendar day as YYYY-MM-DD (not UTC, which slips a day in the evening). */
const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** The next days, starting tomorrow. */
function upcomingDays() {
  const days: Date[] = [];
  const d = new Date();
  for (let i = 1; i <= DAYS_AHEAD; i++) {
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
    days.push(day);
  }
  return days;
}

/** Minutes a time zone is ahead of UTC at a given instant. */
function zoneOffsetMinutes(at: Date, zone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(at);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'));
  return Math.round((asUtc - at.getTime()) / 60000);
}

/** The instant a wall-clock time on a day happens in a zone (handles DST). */
function zonedInstant(day: Date, hour: number, minute: number, zone: string) {
  const guess = new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute));
  const offset = zoneOffsetMinutes(guess, zone);
  return new Date(guess.getTime() - offset * 60000);
}

const fmtTime = (at: Date, zone?: string) =>
  at.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: zone });

/** Google Calendar's compact UTC stamp: 20261030T190000Z. */
const gcalStamp = (at: Date) => at.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

/** Frames for the "booked" stamp: lands big, overshoots, settles. Hard cuts. */
const STAMP_FRAMES = [
  { scale: 1.6, rotate: -14, opacity: 0.4 },
  { scale: 0.92, rotate: -7, opacity: 1 },
  { scale: 1.04, rotate: -9, opacity: 1 },
  { scale: 1, rotate: -8, opacity: 1 },
];

/**
 * Soft mosaic over the blurred page: a tile of square cells in a neutral grey
 * at slightly different strengths, no seams, so it reads as gently tiled
 * rather than pixelated. Built once and reused.
 */
let mosaicTile: string | null = null;
function softMosaic() {
  if (mosaicTile) return mosaicTile;
  const cell = 34;
  const n = 16;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = cell * n;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  // Fixed pseudo-random strengths, so the pattern never shifts between opens.
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      ctx.fillStyle = `rgba(128, 128, 128, ${(rand() * 0.035).toFixed(3)})`;
      ctx.fillRect(x * cell, y * cell, cell, cell);
    }
  }
  mosaicTile = canvas.toDataURL('image/png');
  return mosaicTile;
}

type Step = 'when' | 'name' | 'email' | 'topic';
const STEPS: Step[] = ['when', 'name', 'email', 'topic'];

const QUESTIONS: Record<Step, string> = {
  when: 'when works for you?',
  name: "what's your name?",
  email: 'and your email?',
  topic: 'what do you want to talk about?',
};

export function BookCallModal({ isOpen, onClose }: BookCallModalProps) {
  const reduceMotion = useReducedMotion();
  const days = React.useMemo(upcomingDays, [isOpen]);
  const [day, setDay] = React.useState(0);
  const [slot, setSlot] = React.useState<[number, number]>([14, 0]);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [topic, setTopic] = React.useState('');
  const [step, setStep] = React.useState(0);
  const [error, setError] = React.useState('');
  const [booked, setBooked] = React.useState<string | null>(null);
  const [stampFrame, setStampFrame] = React.useState(0);
  const panelRef = React.useRef<HTMLDivElement>(null);
  // State, not a ref: the strip remounts as questions change, and the arrow
  // effect has to follow whichever element is on screen.
  const [strip, setStrip] = React.useState<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = React.useState(false);
  const [canNext, setCanNext] = React.useState(true);
  /** First and last day tiles in view, for the month label. */
  const [inView, setInView] = React.useState<[number, number]>([0, 6]);
  const returnFocus = React.useRef<HTMLElement | null>(null);

  const visitorZone = React.useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const sameZone = zoneOffsetMinutes(new Date(), visitorZone) === zoneOffsetMinutes(new Date(), HOST_ZONE);

  const start = zonedInstant(days[day], slot[0], slot[1], HOST_ZONE);
  const end = new Date(start.getTime() + CALL_MINUTES * 60000);
  const current = STEPS[step];

  // Escape, focus back on close, no page scroll behind.
  React.useEffect(() => {
    if (!isOpen) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      returnFocus.current?.focus?.();
    };
  }, [isOpen, onClose]);

  // A fresh conversation each time it opens.
  React.useEffect(() => {
    if (!isOpen) return;
    setStep(0);
    setError('');
    setBooked(null);
    setStampFrame(0);
  }, [isOpen]);

  /** Arrows grey out at either end of the strip. */
  const updateArrows = React.useCallback(() => {
    const el = strip;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    const tiles = el.querySelectorAll<HTMLElement>('.bk-day');
    const box = el.getBoundingClientRect();
    let first = -1;
    let last = -1;
    tiles.forEach((t, i) => {
      const r = t.getBoundingClientRect();
      if (r.right > box.left + 24 && r.left < box.right - 24) {
        if (first < 0) first = i;
        last = i;
      }
    });
    if (first >= 0) setInView([first, last]);
  }, [strip]);

  /** Page the strip by most of its visible width. */
  const scrollDays = (dir: 1 | -1) => {
    const el = strip;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  // Arrow state once the strip is on screen (and whenever it resizes).
  React.useEffect(() => {
    if (!strip) return;
    updateArrows();
    const observer = new ResizeObserver(updateArrows);
    observer.observe(strip);
    return () => observer.disconnect();
  }, [strip, updateArrows]);

  /** Focus the question on screen: its input, or the picked day. */
  const focusQuestion = React.useCallback(() => {
    const target =
      panelRef.current?.querySelector<HTMLElement>('.bk-step .bk-answer') ??
      panelRef.current?.querySelector<HTMLElement>('.bk-step .bk-day.is-on');
    target?.focus({ preventScroll: true });
  }, []);

  // On open, once the overlay has faded in. Later questions focus themselves
  // when their entrance finishes (the outgoing one must be gone first).
  React.useEffect(() => {
    if (!isOpen) return;
    const id = window.setTimeout(focusQuestion, reduceMotion ? 0 : 450);
    return () => window.clearTimeout(id);
  }, [isOpen, reduceMotion, focusQuestion]);

  // Stop-motion stamp: four held frames at 12fps once the booking lands.
  React.useEffect(() => {
    if (!booked) return;
    if (reduceMotion) {
      setStampFrame(STAMP_FRAMES.length - 1);
      return;
    }
    if (stampFrame >= STAMP_FRAMES.length - 1) return;
    const id = window.setTimeout(() => setStampFrame((f) => f + 1), 1000 / 12);
    return () => window.clearTimeout(id);
  }, [booked, stampFrame, reduceMotion]);

  const calendarUrl = () => {
    const subject = topic.trim() || 'intro call';
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${name.trim()} × Kellas Andrei: ${subject}`,
      dates: `${gcalStamp(start)}/${gcalStamp(end)}`,
      add: HOST_EMAIL,
      details: `Topic: ${subject}\nContact: ${email.trim()}\n\nBooked via kellas andrei's portfolio.`,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  /** Validates the current question, then moves on (or books, on the last). */
  const next = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (current === 'name' && !name.trim()) return setError('add your name to continue');
    if (current === 'email' && !EMAIL_RE.test(email.trim())) return setError("that email doesn't look right");
    setError('');
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    const url = calendarUrl();
    window.open(url, '_blank', 'noopener');
    setBooked(url);
  };

  const back = () => {
    setError('');
    setStep((s) => Math.max(0, s - 1));
  };

  const dayLabel = days[day].toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const hostTime = `${fmtTime(start, HOST_ZONE)} ${HOST_LABEL}`;
  const localTime = fmtTime(start);
  const when = `${dayLabel} · ${hostTime}${sameZone ? '' : ` · ${localTime} your time`}`;
  const stamp = STAMP_FRAMES[stampFrame];

  // The months the visible days fall in: "November 2026" or "Oct – Nov 2026".
  const firstShown = days[Math.min(inView[0], days.length - 1)];
  const lastShown = days[Math.min(inView[1], days.length - 1)];
  const monthLabel =
    firstShown.getMonth() === lastShown.getMonth()
      ? firstShown.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : `${firstShown.toLocaleDateString('en-US', { month: 'short' })} – ${lastShown.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;

  // Questions rise in; the page behind fades under the blur.
  const enter = reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 };
  const leave = reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 };
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="bk-overlay"
          style={{ '--bk-mosaic': `url("${softMosaic()}")` } as React.CSSProperties}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.42, ease }}
        >
          <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="bk-question" className="bk-stage">
            <div className="bk-top">
              <span className="bk-kicker">book a call</span>
              <button type="button" className="bk-close" onClick={onClose} aria-label="Close">
                <X size={20} weight="regular" />
              </button>
            </div>

            {!booked && (
              <div className="bk-progress" aria-hidden="true">
                {STEPS.map((s, i) => (
                  <span key={s} className={i <= step ? 'is-on' : ''} />
                ))}
              </div>
            )}

            <AnimatePresence mode="wait" initial={false}>
              {!booked ? (
                <motion.form
                  key={current}
                  onAnimationComplete={focusQuestion}
                  className="bk-step"
                  onSubmit={next}
                  noValidate
                  initial={enter}
                  animate={{ opacity: 1, y: 0 }}
                  exit={leave}
                  transition={{ duration: reduceMotion ? 0 : 0.32, ease }}
                >
                  {step > 0 && <p className="bk-context">{when}</p>}
                  <h2 id="bk-question" className="bk-question font-cal">
                    {QUESTIONS[current]}
                  </h2>

                  {current === 'when' && (
                    <div className="bk-when">
                      <div className="bk-days-nav">
                        <span className="bk-hint">{monthLabel}</span>
                        <span className="bk-arrows">
                          <button
                            type="button"
                            className="bk-arrow"
                            aria-label="Earlier days"
                            disabled={!canPrev}
                            onClick={() => scrollDays(-1)}
                          >
                            <CaretLeft size={16} weight="bold" />
                          </button>
                          <button
                            type="button"
                            className="bk-arrow"
                            aria-label="Later days"
                            disabled={!canNext}
                            onClick={() => scrollDays(1)}
                          >
                            <CaretRight size={16} weight="bold" />
                          </button>
                        </span>
                      </div>
                      <div
                        ref={setStrip}
                        className="bk-days"
                        role="radiogroup"
                        aria-label="Day"
                        onScroll={updateArrows}
                      >
                        {days.map((d, i) => (
                          <button
                            key={dayKey(d)}
                            type="button"
                            role="radio"
                            aria-checked={day === i}
                            className={`bk-day${day === i ? ' is-on' : ''}`}
                            onClick={() => setDay(i)}
                          >
                            <span className="bk-day-week">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                            <span className="bk-day-num">{d.getDate()}</span>
                            <span className="bk-day-month">{d.toLocaleDateString('en-US', { month: 'short' })}</span>
                          </button>
                        ))}
                      </div>
                      <p className="bk-hint">
                        times in manila{sameZone ? '' : ', yours underneath'}
                      </p>
                      <div className="bk-slots" role="radiogroup" aria-label="Time">
                        {SLOT_GROUPS.flatMap((group) => group.slots).map(([h, m]) => {
                          const at = zonedInstant(days[day], h, m, HOST_ZONE);
                          const on = slot[0] === h && slot[1] === m;
                          return (
                            <button
                              key={`${h}:${m}`}
                              type="button"
                              role="radio"
                              aria-checked={on}
                              className={`bk-slot${on ? ' is-on' : ''}`}
                              onClick={() => setSlot([h, m])}
                            >
                              <span className="bk-slot-time">{fmtTime(at, HOST_ZONE)}</span>
                              {!sameZone && <span className="bk-slot-local">{fmtTime(at)}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {current === 'name' && (
                    <input
                      className="bk-answer"
                      type="text"
                      autoComplete="name"
                      placeholder="type your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      aria-labelledby="bk-question"
                      aria-invalid={Boolean(error)}
                    />
                  )}

                  {current === 'email' && (
                    <input
                      className="bk-answer"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="you@somewhere.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-labelledby="bk-question"
                      aria-invalid={Boolean(error)}
                    />
                  )}

                  {current === 'topic' && (
                    <>
                      <input
                        className="bk-answer"
                        type="text"
                        placeholder="a sentence is plenty"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        aria-labelledby="bk-question"
                      />
                      <div className="bk-topics" role="group" aria-label="Suggestions">
                        {TOPICS.map((t) => (
                          <button
                            key={t}
                            type="button"
                            aria-pressed={topic === t}
                            className={`bk-topic${topic === t ? ' is-on' : ''}`}
                            onClick={() => setTopic(topic === t ? '' : t)}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  <p className="bk-error" role="alert">
                    {error}
                  </p>

                  <div className="bk-actions">
                    {step > 0 ? (
                      <button type="button" className="bk-back" onClick={back}>
                        back
                      </button>
                    ) : (
                      <span />
                    )}
                    <button type="submit" className="bk-next" data-sound={step === STEPS.length - 1 ? 'primary' : undefined}>
                      {step === STEPS.length - 1 ? 'book the call' : 'continue'}
                      <ArrowRight size={15} weight="bold" aria-hidden="true" />
                    </button>
                  </div>
                  {current !== 'when' && <p className="bk-enter">press enter ↵</p>}
                </motion.form>
              ) : (
                <motion.div
                  key="done"
                  className="bk-step"
                  initial={enter}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.32, ease }}
                >
                  <h2 id="bk-question" className="bk-question font-cal">
                    you're on the calendar
                    <span
                      className="bk-stamp font-cal"
                      aria-hidden="true"
                      style={{ transform: `rotate(${stamp.rotate}deg) scale(${stamp.scale})`, opacity: stamp.opacity }}
                    >
                      booked
                    </span>
                  </h2>
                  <dl className="bk-recap">
                    <div>
                      <dt>when</dt>
                      <dd>{when} · {CALL_MINUTES} min</dd>
                    </div>
                    <div>
                      <dt>with</dt>
                      <dd>
                        {name.trim()} · {email.trim()}
                      </dd>
                    </div>
                  </dl>
                  <p className="bk-note">
                    google calendar opened in a new tab with the invite filled in. save it there and it's sent.
                  </p>
                  <div className="bk-actions">
                    <a className="bk-back" href={booked} target="_blank" rel="noopener noreferrer">
                      open the invite again
                      <ArrowSquareOut size={14} aria-hidden="true" />
                    </a>
                    <button type="button" className="bk-next" onClick={onClose}>
                      done
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
