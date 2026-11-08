import * as React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion, type Transition } from 'motion/react';
import { ArrowUpRight, DotsThree, Moon, MusicNotes, Sun } from '@phosphor-icons/react';
import { NavIcon3D, type NavIcon3DName } from './NavIcon3D';
import { EqBars, NowPlaying, TRACK } from './NowPlaying';
import { useYouTubeAudio } from './useYouTubeAudio';

/**
 * Desktop navigation as a floating "Dynamic Island" at the top of the page.
 *
 * - At the top of a page it's expanded: every section as a text link, with a
 *   lighter capsule gliding to the active one.
 * - Scrolled down it shrinks to a compact island (avatar + current section),
 *   so it stays out of the way of the content. While music plays, the compact
 *   island becomes a live activity: artwork on the left, bars on the right.
 * - Hovering or tabbing into it expands it again with a soft spring; it
 *   shrinks back shortly after the pointer leaves.
 * - The music button pops an Apple Music style Now Playing card out of the
 *   island; "more" pops contact links and settings. Music never starts on its
 *   own: YouTube's player only loads on the first press of play.
 *
 * Tour hooks (data-tour) match the old sidebar, so the intro tour still
 * walks the sections and the theme control.
 */

export interface IslandLink {
  id: string;
  name: string;
  icon: NavIcon3DName;
}

export interface DesktopIslandProps {
  groups: IslandLink[][];
  /** Section the router (or scroll spy) says is current; 'home' on the landing page. */
  activeSection: string;
  onHome: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  soundMuted: boolean;
  onToggleSound: () => void;
  onReplayTour: () => void;
}

const SOCIALS = [
  { label: 'GitHub', icon: 'github' as const, href: 'https://github.com/kellasandyyyy1', external: true },
  { label: 'LinkedIn', icon: 'linkedin' as const, href: 'https://www.linkedin.com/in/andrei-wayne-kellas-03a6153a4', external: true },
  { label: 'Email', icon: 'contact' as const, href: 'mailto:kellasandrei00@gmail.com', external: false },
];

/** The island's morph: a soft, settled spring with just a hint of give. */
const MORPH: Transition = { type: 'spring', visualDuration: 0.55, bounce: 0.14 };
/** Panels grow out of the island a touch livelier. */
const POP: Transition = { type: 'spring', visualDuration: 0.45, bounce: 0.18 };
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
/** Scroll distance before the island compacts. */
const COMPACT_AFTER = 140;

type Panel = 'music' | 'more' | null;

const tourKey = (id: string) =>
  id === 'work' ? 'sb-work' : ['services', 'resources', 'contact'].includes(id) ? 'sb-more' : 'sb-top';

export function DesktopIsland({
  groups,
  activeSection,
  onHome,
  theme,
  toggleTheme,
  soundMuted,
  onToggleSound,
  onReplayTour,
}: DesktopIslandProps) {
  const reduceMotion = useReducedMotion();
  const audio = useYouTubeAudio(TRACK.id);
  const [scrolled, setScrolled] = React.useState(false);
  const [hovering, setHovering] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [panel, setPanel] = React.useState<Panel>(null);
  const [hoveredLink, setHoveredLink] = React.useState<string | null>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const leaveTimer = React.useRef<number | undefined>(undefined);

  const expanded = !scrolled || hovering || focused || panel !== null;
  const playing = audio.status === 'playing';
  const morph: Transition = reduceMotion ? { duration: 0 } : MORPH;
  const links = groups.flat();
  const current = links.find((l) => l.id === activeSection);

  // Compact once the page has scrolled past the top.
  React.useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrolled(window.scrollY > COMPACT_AFTER));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // A focused control inside a panel that just closed never reports blur;
  // re-check where focus actually is.
  React.useEffect(() => {
    if (!rootRef.current?.contains(document.activeElement)) setFocused(false);
  }, [panel]);

  // Panels close on Escape or a click anywhere outside the island.
  React.useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPanel(null);
    };
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setPanel(null);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [panel]);

  // Hover in expands at once; hover out waits a beat so a pointer grazing
  // the edge doesn't make it flicker.
  const onEnter = () => {
    window.clearTimeout(leaveTimer.current);
    setHovering(true);
  };
  const onLeave = () => {
    window.clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(() => setHovering(false), 320);
    setHoveredLink(null);
  };
  React.useEffect(() => () => window.clearTimeout(leaveTimer.current), []);

  const togglePanel = (p: Exclude<Panel, null>) => setPanel((open) => (open === p ? null : p));

  // Content swaps: the old content leaves quickly, the new one fades in
  // while the island is still widening, links one after another.
  const swap = {
    initial: reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: reduceMotion
        ? { duration: 0 }
        : { duration: 0.32, ease: EASE_OUT, delay: 0.06, when: 'beforeChildren' as const, staggerChildren: 0.018 },
    },
    exit: { opacity: 0, scale: 0.97, transition: { duration: reduceMotion ? 0 : 0.12, ease: 'easeIn' as const } },
  };
  const linkIn = {
    initial: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 3 },
    animate: { opacity: 1, y: 0, transition: { duration: reduceMotion ? 0 : 0.26, ease: EASE_OUT } },
  };

  return (
    <div
      ref={rootRef}
      className="di-wrap hidden lg:flex"
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      // Keyboard focus keeps it open; a mouse click shouldn't pin it open.
      onFocus={(e) => setFocused(e.target.matches(':focus-visible'))}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      <div className="di-anchor">
        <LayoutGroup id="di">
          <motion.header
            layout
            className={`di${expanded ? ' is-expanded' : ' is-compact'}`}
            style={{ borderRadius: 999 }}
            transition={morph}
            aria-label="Site"
          >
            <motion.div layout="position" transition={morph} className="di-lead">
              <Link
                to="/"
                onClick={onHome}
                className="di-home"
                aria-label="Kellas Andrei, home"
                aria-current={activeSection === 'home' ? 'page' : undefined}
              >
                <img src="/img/drei.png" alt="" className="di-avatar" />
              </Link>
            </motion.div>

            <AnimatePresence mode="popLayout" initial={false}>
              {expanded ? (
                <motion.nav
                  key="full"
                  layout="position"
                  className="di-nav"
                  aria-label="Sections"
                  variants={swap}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  onPointerLeave={() => setHoveredLink(null)}
                >
                  {groups.map((group, gi) => (
                    <React.Fragment key={gi}>
                      {gi > 0 && <motion.span variants={linkIn} className="di-sep" aria-hidden="true" />}
                      {group.map((link) => {
                        const on = link.id === activeSection;
                        return (
                          <motion.span key={link.id} variants={linkIn} className="di-link-slot">
                            <NavLink
                              to={`/${link.id}`}
                              data-tour={tourKey(link.id)}
                              className={`di-link${on ? ' is-active' : ''}`}
                              aria-current={on ? 'page' : undefined}
                              onPointerEnter={() => setHoveredLink(link.id)}
                            >
                              {hoveredLink === link.id && !on && (
                                <motion.span
                                  layoutId="di-hover"
                                  className="di-hover"
                                  style={{ borderRadius: 999 }}
                                  transition={reduceMotion ? { duration: 0 } : { type: 'spring', visualDuration: 0.25, bounce: 0.1 }}
                                />
                              )}
                              {on && (
                                <motion.span
                                  layoutId="di-active"
                                  className="di-active"
                                  style={{ borderRadius: 999 }}
                                  transition={morph}
                                />
                              )}
                              <span className="di-link-text">{link.name}</span>
                            </NavLink>
                          </motion.span>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </motion.nav>
              ) : (
                <motion.div
                  key={playing ? 'live' : 'compact'}
                  layout="position"
                  className="di-now"
                  variants={swap}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  aria-live="polite"
                >
                  {playing ? (
                    <>
                      <img src={TRACK.art} alt="" className="di-now-art" />
                      <span className="di-now-text">{TRACK.title}</span>
                    </>
                  ) : (
                    <>
                      {current && (
                        <span className="di-now-icon" aria-hidden="true">
                          <NavIcon3D name={current.icon} size={18} />
                        </span>
                      )}
                      <span className="di-now-text">{current ? current.name : 'Kellas Andrei'}</span>
                      <span className="di-now-dot" aria-hidden="true" />
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div layout="position" transition={morph} className="di-trail">
              <AnimatePresence initial={false} mode="popLayout">
                {expanded && (
                  <motion.button
                    key="theme"
                    type="button"
                    className="di-icon"
                    data-tour="theme"
                    data-sound="switch"
                    onClick={toggleTheme}
                    aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                    title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1, transition: { duration: 0.28, ease: EASE_OUT, delay: 0.1 } }}
                    exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.1 } }}
                    whileTap={reduceMotion ? undefined : { scale: 0.9 }}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={theme}
                        className="di-icon-glyph"
                        initial={reduceMotion ? false : { rotate: -70, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 70, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {theme === 'dark' ? <Sun size={16} weight="bold" /> : <Moon size={16} weight="bold" />}
                      </motion.span>
                    </AnimatePresence>
                  </motion.button>
                )}
              </AnimatePresence>

              <motion.button
                layout="position"
                transition={morph}
                type="button"
                className={`di-icon${panel === 'music' ? ' is-on' : ''}${playing ? ' is-playing' : ''}`}
                aria-label={playing ? `Now playing: ${TRACK.title}` : 'Music'}
                aria-expanded={panel === 'music'}
                aria-controls="di-panel"
                onClick={() => togglePanel('music')}
                whileTap={reduceMotion ? undefined : { scale: 0.9 }}
              >
                {audio.started && audio.status !== 'error' ? (
                  <EqBars playing={playing} className="di-icon-eq" />
                ) : (
                  <MusicNotes size={17} weight="bold" />
                )}
              </motion.button>

              <motion.button
                layout="position"
                transition={morph}
                type="button"
                className={`di-icon${panel === 'more' ? ' is-on' : ''}`}
                aria-label="More"
                aria-expanded={panel === 'more'}
                aria-controls="di-panel"
                onClick={() => togglePanel('more')}
                whileTap={reduceMotion ? undefined : { scale: 0.9 }}
              >
                <motion.span className="di-icon-glyph" animate={{ rotate: panel === 'more' ? 90 : 0 }} transition={morph}>
                  <DotsThree size={20} weight="bold" />
                </motion.span>
              </motion.button>
            </motion.div>
          </motion.header>

          {/* Panels grow out of the island's right end. */}
          <AnimatePresence mode="popLayout">
            {panel && (
              <motion.div
                key={panel}
                id="di-panel"
                className={`di-panel di-panel-${panel}`}
                role="dialog"
                aria-label={panel === 'music' ? 'Now playing' : 'Links and settings'}
                style={{ transformOrigin: 'top right' }}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.82, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0, transition: reduceMotion ? { duration: 0 } : { ...POP, opacity: { duration: 0.2 } } }}
                exit={{ opacity: 0, scale: 0.9, y: -6, transition: { duration: reduceMotion ? 0 : 0.16, ease: 'easeIn' } }}
              >
                {panel === 'music' ? (
                  <NowPlaying
                    status={audio.status}
                    current={audio.current}
                    duration={audio.duration}
                    loop={audio.loop}
                    onToggle={audio.toggle}
                    onSeek={audio.seek}
                    onSkip={audio.skip}
                    onToggleLoop={audio.toggleLoop}
                  />
                ) : (
                  <>
                    <span className="di-panel-label">Connect</span>
                    <ul className="di-panel-list">
                      {SOCIALS.map((s) => (
                        <li key={s.label}>
                          <a
                            href={s.href}
                            {...(s.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                            className="di-row"
                            data-tour="sb-social"
                          >
                            <NavIcon3D name={s.icon} size={18} />
                            <span>{s.label}</span>
                            <ArrowUpRight size={12} weight="bold" className="di-row-arrow" aria-hidden="true" />
                          </a>
                        </li>
                      ))}
                    </ul>

                    <span className="di-panel-label">Preferences</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={!soundMuted}
                      data-sound="mute-toggle"
                      className="di-row"
                      onClick={onToggleSound}
                    >
                      <NavIcon3D name={soundMuted ? 'mute' : 'sound'} size={18} />
                      <span>Sound</span>
                      <span className="di-switch" aria-hidden="true">
                        <i />
                      </span>
                    </button>

                    <div className="di-seg" role="group" aria-label="Theme" data-mode-choice={theme}>
                      <span className="di-seg-thumb" aria-hidden="true" />
                      <button
                        type="button"
                        aria-pressed={theme === 'light'}
                        onClick={() => theme !== 'light' && toggleTheme()}
                        data-sound="switch"
                      >
                        <Sun size={14} weight="bold" /> Light
                      </button>
                      <button
                        type="button"
                        aria-pressed={theme === 'dark'}
                        onClick={() => theme !== 'dark' && toggleTheme()}
                        data-sound="switch"
                      >
                        <Moon size={14} weight="bold" /> Dark
                      </button>
                    </div>

                    <button
                      type="button"
                      className="di-replay"
                      onClick={() => {
                        setPanel(null);
                        onReplayTour();
                      }}
                    >
                      Replay intro
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </LayoutGroup>
      </div>
    </div>
  );
}
