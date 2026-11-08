import * as React from 'react';
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useDragControls,
  useReducedMotion,
  type PanInfo,
  type Transition,
} from 'motion/react';
import { ArrowSquareOut, CaretLeft, Check, X } from '@phosphor-icons/react';

/**
 * Book-a-call sheet, iOS / Airbnb style. A card springs up over a dimmed,
 * lightly blurred page (a bottom sheet on phones that drags down to close).
 * Three steps slide sideways inside it: pick a time on a two-week calendar,
 * your details, and the topic. A sticky footer keeps the chosen time and the
 * main button in reach. Confirming opens a prefilled Google Calendar event at
 * the chosen time with Kellas as a guest, so saving it sends him the invite.
 *
 * Enter moves forward, Escape or a tap on the backdrop closes, focus lands on
 * each step as it appears and returns to the trigger on close, and the page
 * doesn't scroll behind it.
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
  { label: 'Morning', slots: [[10, 0], [11, 30]] },
  { label: 'Afternoon', slots: [[14, 0], [15, 30]] },
  { label: 'Evening', slots: [[17, 0], [20, 0]] },
];

const TOPICS = ['New website', 'Web app', 'Redesign', 'Something else'];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Local calendar day as YYYY-MM-DD (not UTC, which slips a day in the evening). */
const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** The next days, starting tomorrow. */
function upcomingDays() {
  const days: Date[] = [];
  const d = new Date();
  for (let i = 1; i <= DAYS_AHEAD; i++) {
    days.push(new Date(d.getFullYear(), d.getMonth(), d.getDate() + i));
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

/** Tracks whether the viewport is phone-sized, for the bottom-sheet layout. */
function useIsSheet() {
  const query = '(max-width: 639px)';
  const [match, setMatch] = React.useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatch(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return match;
}

/** Height of an element, kept live, so the card can animate between steps. */
function useHeight<T extends HTMLElement>() {
  const [el, setEl] = React.useState<T | null>(null);
  const [height, setHeight] = React.useState<number | 'auto'>('auto');
  React.useEffect(() => {
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setHeight(entry.borderBoxSize?.[0]?.blockSize ?? el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, [el]);
  return [setEl, height] as const;
}

type Step = 'when' | 'details' | 'topic';
const STEPS: Step[] = ['when', 'details', 'topic'];

const TITLES: Record<Step, string> = {
  when: 'Pick a time',
  details: 'Your details',
  topic: "What's it about?",
};

const SUBTITLES: Record<Step, string> = {
  when: `${CALL_MINUTES}-minute video call`,
  details: 'So the invite reaches you',
  topic: 'A sentence is plenty',
};

/** iOS-feeling springs: quick, settled, no wobble. */
const SPRING: Transition = { type: 'spring', stiffness: 420, damping: 36, mass: 0.9 };
const SOFT_SPRING: Transition = { type: 'spring', stiffness: 300, damping: 32 };

export function BookCallModal({ isOpen, onClose }: BookCallModalProps) {
  const reduceMotion = useReducedMotion();
  const isSheet = useIsSheet();
  const dragControls = useDragControls();
  const days = React.useMemo(upcomingDays, [isOpen]);
  const [day, setDay] = React.useState(0);
  const [slot, setSlot] = React.useState<[number, number]>([14, 0]);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [topic, setTopic] = React.useState('');
  const [step, setStep] = React.useState(0);
  /** 1 when moving forward, -1 back: steps slide in from that side. */
  const [dir, setDir] = React.useState(1);
  const [errors, setErrors] = React.useState<{ name?: string; email?: string }>({});
  const [booked, setBooked] = React.useState<string | null>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const returnFocus = React.useRef<HTMLElement | null>(null);
  const [measureRef, bodyHeight] = useHeight<HTMLDivElement>();

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

  // A fresh booking each time it opens.
  React.useEffect(() => {
    if (!isOpen) return;
    setStep(0);
    setDir(1);
    setErrors({});
    setBooked(null);
  }, [isOpen]);

  /** Focus the step on screen: its first field, or the picked day. */
  const focusStep = React.useCallback(() => {
    const target =
      panelRef.current?.querySelector<HTMLElement>('.bk-step .bk-input') ??
      panelRef.current?.querySelector<HTMLElement>('.bk-step .bk-cal-day.is-on') ??
      panelRef.current?.querySelector<HTMLElement>('.bk-primary');
    target?.focus({ preventScroll: true });
  }, []);

  // On open, once the card has landed. Later steps focus themselves when
  // their entrance finishes.
  React.useEffect(() => {
    if (!isOpen) return;
    const id = window.setTimeout(focusStep, reduceMotion ? 0 : 380);
    return () => window.clearTimeout(id);
  }, [isOpen, reduceMotion, focusStep]);

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

  /** Validates the current step, then moves on (or books, on the last). */
  const next = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (current === 'details') {
      const found: typeof errors = {};
      if (!name.trim()) found.name = 'Add your name to continue';
      if (!EMAIL_RE.test(email.trim())) found.email = "That email doesn't look right";
      setErrors(found);
      if (found.name || found.email) {
        panelRef.current
          ?.querySelector<HTMLElement>(found.name ? '#bk-name' : '#bk-email')
          ?.focus({ preventScroll: true });
        return;
      }
    }
    if (step < STEPS.length - 1) {
      setDir(1);
      setStep(step + 1);
      return;
    }
    const url = calendarUrl();
    window.open(url, '_blank', 'noopener');
    setDir(1);
    setBooked(url);
  };

  const back = () => {
    setErrors({});
    setDir(-1);
    setStep((s) => Math.max(0, s - 1));
  };

  /** Drag the sheet down past a threshold (or flick it) to close. */
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 600) onClose();
  };

  const dayShort = days[day].toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const dayLong = days[day].toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const hostTime = `${fmtTime(start, HOST_ZONE)} ${HOST_LABEL}`;
  const localTime = fmtTime(start);

  // Calendar grid: whole weeks from the Sunday before tomorrow, with the
  // bookable 14 days live and the rest greyed out.
  const lead = days[0].getDay();
  const cellCount = Math.ceil((lead + days.length) / 7) * 7;
  const gridStart = new Date(days[0].getFullYear(), days[0].getMonth(), days[0].getDate() - lead);
  const cells = Array.from({ length: cellCount }, (_, i) => {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
    const index = i - lead;
    return { date, index: index >= 0 && index < days.length ? index : -1 };
  });
  const firstDay = days[0];
  const lastDay = days[days.length - 1];
  const monthLabel =
    firstDay.getMonth() === lastDay.getMonth()
      ? firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : `${firstDay.toLocaleDateString('en-US', { month: 'short' })} – ${lastDay.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;

  // Card: springs up from slightly below on desktop, slides up as a sheet on phones.
  const cardMotion = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : isSheet
      ? { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } }
      : {
          initial: { opacity: 0, y: 28, scale: 0.96 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: 16, scale: 0.97 },
        };

  // Steps slide in from the side they come from.
  const stepVariants = {
    enter: (d: number) => (reduceMotion ? { opacity: 0 } : { opacity: 0, x: d * 36 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => (reduceMotion ? { opacity: 0 } : { opacity: 0, x: d * -36 }),
  };
  const stepTransition: Transition = reduceMotion
    ? { duration: 0 }
    : { x: SOFT_SPRING, opacity: { duration: 0.18 } };
  const tap = reduceMotion ? undefined : { scale: 0.96 };

  const isLast = step === STEPS.length - 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="bk-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.32, 0.72, 0, 1] }}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="bk-title"
            className={`bk-card${isSheet ? ' is-sheet' : ''}`}
            {...cardMotion}
            transition={reduceMotion ? { duration: 0 } : SPRING}
            drag={isSheet && !reduceMotion ? 'y' : false}
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={onDragEnd}
          >
            {/* Header doubles as the sheet's drag handle on phones. */}
            <div className="bk-head" onPointerDown={(e) => isSheet && dragControls.start(e)}>
              {isSheet && <span className="bk-grabber" aria-hidden="true" />}
              <div className="bk-nav">
                <AnimatePresence initial={false}>
                  {step > 0 && !booked && (
                    <motion.button
                      type="button"
                      className="bk-icon-btn bk-nav-back"
                      onClick={back}
                      aria-label="Back"
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      whileTap={tap}
                    >
                      <CaretLeft size={18} weight="bold" />
                    </motion.button>
                  )}
                </AnimatePresence>
                <span className="bk-nav-title">Book a call</span>
                <motion.button
                  type="button"
                  className="bk-icon-btn bk-nav-close"
                  onClick={onClose}
                  aria-label="Close"
                  whileTap={tap}
                >
                  <X size={18} weight="bold" />
                </motion.button>
              </div>
              {!booked && (
                <div className="bk-progress" aria-hidden="true">
                  {STEPS.map((s, i) => (
                    <span key={s}>
                      <motion.i
                        initial={false}
                        animate={{ scaleX: i <= step ? 1 : 0 }}
                        transition={reduceMotion ? { duration: 0 } : SOFT_SPRING}
                      />
                    </span>
                  ))}
                </div>
              )}
            </div>

            <form className="bk-form" onSubmit={next} noValidate>
              <motion.div
                className="bk-body"
                animate={{ height: bodyHeight }}
                transition={reduceMotion ? { duration: 0 } : SOFT_SPRING}
              >
                <div ref={measureRef}>
                  <AnimatePresence mode="wait" initial={false} custom={dir}>
                    <motion.div
                      key={booked ? 'done' : current}
                      className="bk-step"
                      custom={dir}
                      variants={stepVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={stepTransition}
                      onAnimationComplete={(def) => def === 'center' && focusStep()}
                    >
                      {booked ? (
                        <div className="bk-done">
                          <motion.div
                            className="bk-check"
                            initial={reduceMotion ? false : { scale: 0.4, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.05 }}
                          >
                            <svg viewBox="0 0 52 52" aria-hidden="true">
                              <motion.path
                                d="M15 27 L23 35 L38 18"
                                fill="none"
                                strokeWidth="4.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={reduceMotion ? false : { pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.38, delay: 0.22, ease: [0.65, 0, 0.35, 1] }}
                              />
                            </svg>
                          </motion.div>
                          <h2 id="bk-title" className="bk-title">
                            You're booked
                          </h2>
                          <p className="bk-sub">Google Calendar opened in a new tab with the invite filled in. Save it there and it's sent.</p>
                          <ul className="bk-list">
                            <li>
                              <span>When</span>
                              <b>
                                {dayShort}, {hostTime}
                                {!sameZone && <small>{localTime} your time</small>}
                              </b>
                            </li>
                            <li>
                              <span>Length</span>
                              <b>{CALL_MINUTES} min</b>
                            </li>
                            <li>
                              <span>Name</span>
                              <b>{name.trim()}</b>
                            </li>
                            <li>
                              <span>Email</span>
                              <b>{email.trim()}</b>
                            </li>
                            {topic.trim() && (
                              <li>
                                <span>Topic</span>
                                <b>{topic.trim()}</b>
                              </li>
                            )}
                          </ul>
                        </div>
                      ) : (
                        <>
                          <h2 id="bk-title" className="bk-title">
                            {TITLES[current]}
                          </h2>
                          <p className="bk-sub">{SUBTITLES[current]}</p>

                          {current === 'when' && (
                            <LayoutGroup id="bk-when">
                              <div className="bk-cal">
                                <div className="bk-cal-head">
                                  <span className="bk-cal-month">{monthLabel}</span>
                                  <span className="bk-cal-zone">Times in Manila</span>
                                </div>
                                <div className="bk-cal-grid" role="radiogroup" aria-label="Day">
                                  {WEEKDAYS.map((w, i) => (
                                    <span key={`w${i}`} className="bk-cal-week" aria-hidden="true">
                                      {w}
                                    </span>
                                  ))}
                                  {cells.map(({ date, index }) => {
                                    const on = index === day;
                                    const live = index >= 0;
                                    return (
                                      <button
                                        key={dayKey(date)}
                                        type="button"
                                        role="radio"
                                        aria-checked={on}
                                        aria-label={date.toLocaleDateString('en-US', {
                                          weekday: 'long',
                                          month: 'long',
                                          day: 'numeric',
                                        })}
                                        disabled={!live}
                                        tabIndex={live ? (on ? 0 : -1) : -1}
                                        className={`bk-cal-day${on ? ' is-on' : ''}`}
                                        onClick={() => live && setDay(index)}
                                        onKeyDown={(e) => {
                                          const move = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
                                          if (move === undefined) return;
                                          e.preventDefault();
                                          const to = Math.min(days.length - 1, Math.max(0, day + move));
                                          setDay(to);
                                          requestAnimationFrame(() =>
                                            panelRef.current?.querySelector<HTMLElement>('.bk-cal-day.is-on')?.focus(),
                                          );
                                        }}
                                      >
                                        {on && (
                                          <motion.span
                                            layoutId="bk-day-pill"
                                            className="bk-pill"
                                            transition={reduceMotion ? { duration: 0 } : SPRING}
                                          />
                                        )}
                                        <span className="bk-cal-num">{date.getDate()}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="bk-slots" role="radiogroup" aria-label="Time">
                                {SLOT_GROUPS.map((group) => (
                                  <div key={group.label} className="bk-slot-col">
                                    <span className="bk-slot-label">{group.label}</span>
                                    {group.slots.map(([h, m]) => {
                                      const at = zonedInstant(days[day], h, m, HOST_ZONE);
                                      const on = slot[0] === h && slot[1] === m;
                                      return (
                                        <motion.button
                                          key={`${h}:${m}`}
                                          type="button"
                                          role="radio"
                                          aria-checked={on}
                                          className={`bk-slot${on ? ' is-on' : ''}`}
                                          onClick={() => setSlot([h, m])}
                                          whileTap={tap}
                                        >
                                          {on && (
                                            <motion.span
                                              layoutId="bk-slot-pill"
                                              className="bk-pill"
                                              transition={reduceMotion ? { duration: 0 } : SPRING}
                                            />
                                          )}
                                          <span className="bk-slot-time">{fmtTime(at, HOST_ZONE)}</span>
                                          {!sameZone && <span className="bk-slot-local">{fmtTime(at)} yours</span>}
                                        </motion.button>
                                      );
                                    })}
                                  </div>
                                ))}
                              </div>
                            </LayoutGroup>
                          )}

                          {current === 'details' && (
                            <>
                              <div className="bk-fields">
                                <label className={`bk-field${errors.name ? ' has-error' : ''}`}>
                                  <input
                                    id="bk-name"
                                    className="bk-input"
                                    type="text"
                                    autoComplete="name"
                                    placeholder=" "
                                    value={name}
                                    onChange={(e) => {
                                      setName(e.target.value);
                                      if (errors.name) setErrors((x) => ({ ...x, name: undefined }));
                                    }}
                                    aria-invalid={Boolean(errors.name)}
                                    aria-describedby={errors.name ? 'bk-name-err' : undefined}
                                  />
                                  <span className="bk-label">Name</span>
                                </label>
                                <label className={`bk-field${errors.email ? ' has-error' : ''}`}>
                                  <input
                                    id="bk-email"
                                    className="bk-input"
                                    type="email"
                                    inputMode="email"
                                    autoComplete="email"
                                    placeholder=" "
                                    value={email}
                                    onChange={(e) => {
                                      setEmail(e.target.value);
                                      if (errors.email) setErrors((x) => ({ ...x, email: undefined }));
                                    }}
                                    aria-invalid={Boolean(errors.email)}
                                    aria-describedby={errors.email ? 'bk-email-err' : undefined}
                                  />
                                  <span className="bk-label">Email</span>
                                </label>
                              </div>
                              <AnimatePresence initial={false}>
                                {(errors.name || errors.email) && (
                                  <motion.div
                                    className="bk-errors"
                                    role="alert"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                  >
                                    {errors.name && <p id="bk-name-err">{errors.name}</p>}
                                    {errors.email && <p id="bk-email-err">{errors.email}</p>}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </>
                          )}

                          {current === 'topic' && (
                            <>
                              <div className="bk-chips" role="group" aria-label="Suggestions">
                                {TOPICS.map((t) => (
                                  <motion.button
                                    key={t}
                                    type="button"
                                    aria-pressed={topic === t}
                                    className={`bk-chip${topic === t ? ' is-on' : ''}`}
                                    onClick={() => setTopic(topic === t ? '' : t)}
                                    whileTap={tap}
                                  >
                                    {t}
                                  </motion.button>
                                ))}
                              </div>
                              <div className="bk-fields">
                                <label className="bk-field">
                                  <input
                                    className="bk-input"
                                    type="text"
                                    placeholder=" "
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                  />
                                  <span className="bk-label">Or describe it (optional)</span>
                                </label>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Sticky footer: the chosen time on the left, the main action on the right. */}
              <div className="bk-foot">
                {booked ? (
                  <a className="bk-link" href={booked} target="_blank" rel="noopener noreferrer">
                    Open invite <ArrowSquareOut size={14} aria-hidden="true" />
                  </a>
                ) : (
                  <div className="bk-summary" aria-live="polite">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={`${day}-${slot.join(':')}`}
                        className="bk-summary-main"
                        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                        title={dayLong}
                      >
                        {dayShort} · {hostTime}
                      </motion.span>
                    </AnimatePresence>
                    <span className="bk-summary-sub">
                      {CALL_MINUTES} min{sameZone ? '' : ` · ${localTime} your time`}
                    </span>
                  </div>
                )}
                {booked ? (
                  <motion.button type="button" className="bk-primary" onClick={onClose} whileTap={tap}>
                    Done
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    className="bk-primary"
                    data-sound={isLast ? 'primary' : undefined}
                    whileTap={tap}
                  >
                    {isLast ? 'Book call' : 'Next'}
                    {isLast && <Check size={15} weight="bold" aria-hidden="true" />}
                  </motion.button>
                )}
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
