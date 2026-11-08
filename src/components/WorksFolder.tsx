import * as React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, type Transition } from 'motion/react';
import { ArrowUpRight } from '@phosphor-icons/react';
import { WORKS, workPath } from '../data/projects';

/**
 * "my works" as an iOS-style folder in the hero (desktop only). It's a
 * shortcut to /work; hovering or focusing it tips the front flap open and
 * fans the latest projects up out of the folder, one after another, each a
 * link to its own page. Moving onto the cards keeps it open; it closes a
 * beat after the pointer leaves.
 */

const SHOWN = 5;

/** Fanned positions, left to right: an arc rising out of the folder. */
const FAN = [
  { x: -150, y: -150, rotate: -16 },
  { x: -76, y: -182, rotate: -8 },
  { x: 0, y: -196, rotate: 0 },
  { x: 76, y: -182, rotate: 8 },
  { x: 150, y: -150, rotate: 16 },
];

/** Tucked inside the folder: a loose stack peeking over the back. */
const TUCKED = [
  { x: -22, y: -6, rotate: -5 },
  { x: -10, y: -10, rotate: -2 },
  { x: 0, y: -14, rotate: 1 },
  { x: 12, y: -10, rotate: 3 },
  { x: 24, y: -6, rotate: 6 },
];

const OPEN: Transition = { type: 'spring', visualDuration: 0.5, bounce: 0.22 };
const CLOSE: Transition = { type: 'spring', visualDuration: 0.38, bounce: 0 };

export function WorksFolder() {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = React.useState(false);
  const closeTimer = React.useRef<number | undefined>(undefined);
  const projects = WORKS.slice(0, SHOWN);

  const show = () => {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hide = (delay = 220) => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), delay);
  };
  React.useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  return (
    <div
      className={`wf${open ? ' is-open' : ''}`}
      onPointerEnter={show}
      onPointerLeave={() => hide()}
      onFocus={show}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) hide(0);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setOpen(false);
      }}
    >
      <div className="wf-stage">
        <div className="wf-back" aria-hidden="true">
          <span className="wf-tab" />
        </div>

        {/* Cards: tucked behind the flap, fanned out on open. Outer cards
            sit lower in the stack so the middle one reads on top. */}
        <div className="wf-cards">
          {projects.map((p, i) => {
            const center = (SHOWN - 1) / 2;
            const depth = SHOWN - Math.abs(i - center);
            const to = open ? FAN[i] : TUCKED[i];
            return (
              <motion.div
                key={p.slug}
                className="wf-card"
                style={{ zIndex: Math.round(depth) }}
                initial={false}
                animate={
                  reduceMotion
                    ? { opacity: open ? 1 : 0, x: FAN[i].x, y: FAN[i].y, rotate: FAN[i].rotate }
                    : { ...to, scale: open ? 1 : 0.82, opacity: 1 }
                }
                transition={
                  reduceMotion
                    ? { duration: 0.15 }
                    : open
                      ? { ...OPEN, delay: Math.abs(i - center) * 0.035 }
                      : { ...CLOSE, delay: (center - Math.abs(i - center)) * 0.02 }
                }
                whileHover={reduceMotion || !open ? undefined : { y: to.y - 10, scale: 1.06, rotate: to.rotate * 0.6, zIndex: 20 }}
              >
                <Link
                  to={workPath(p)}
                  className="wf-card-link"
                  tabIndex={open ? 0 : -1}
                  aria-hidden={!open}
                  aria-label={p.title}
                >
                  <span className="wf-card-img">
                    <img src={p.cover} alt="" loading="lazy" draggable={false} />
                  </span>
                  <span className="wf-card-title">{p.title}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <span className="wf-paper" aria-hidden="true" />

        {/* Front flap: the folder's face, and the link to every project. */}
        <motion.div
          className="wf-front"
          initial={false}
          animate={reduceMotion ? undefined : { rotateX: open ? -16 : 0, y: open ? 4 : 0 }}
          transition={open ? OPEN : CLOSE}
        >
          <Link to="/work" className="wf-front-link" aria-label={`My works, ${WORKS.length} projects`}>
            <span className="wf-head">
              <span className="wf-title">my works ✦</span>
              <span className="wf-open" aria-hidden="true">
                <ArrowUpRight size={15} weight="bold" />
              </span>
            </span>
            <span className="wf-sub">Projects &amp; experiments</span>
            <span className="wf-count">{WORKS.length} projects</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
