import * as React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedinIn } from 'react-icons/fa6';
import { playExternalLink, playNavTick } from '../lib/sound';

const TZ = 'Asia/Manila';
const menuTime = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short', hour: 'numeric', minute: '2-digit' });
const clockParts = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
const calDay = new Intl.DateTimeFormat('en-US', { timeZone: TZ, day: 'numeric' });
const calWeekday = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'long' });

/** One shared ticking clock for the menu bar and the clock sticker. */
function useNow(intervalMs = 1000) {
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

/** Mac OS X–style menu bar. Menu items are real section links. */
function MenuBar({ now }: { now: Date }) {
  return (
    <div className="sk-menubar">
      <div className="sk-menubar-left">
        <span className="sk-menubar-mark" aria-hidden="true">✦</span>
        <nav className="sk-menubar-menus" aria-label="Sections">
          <a href="#about">About</a>
          <a href="#projects">Work</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
        </nav>
      </div>
      <div className="sk-menubar-right">
        <span>Manila, PH</span>
        <time dateTime={now.toISOString()}>{menuTime.format(now)}</time>
      </div>
    </div>
  );
}

/** Analog clock sticker showing Manila time. */
function ClockSticker({ now }: { now: Date }) {
  const [h, m, s] = clockParts.format(now).split(':').map(Number);
  const hourDeg = (h % 12) * 30 + m * 0.5;
  const minDeg = m * 6 + s * 0.1;
  const secDeg = s * 6;
  return (
    <div className="sk-sticker sk-clock" role="img" aria-label={`Local time in Manila ${clockParts.format(now)}`}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="46" className="sk-clock-face" />
        {Array.from({ length: 12 }, (_, i) => (
          <line
            key={i}
            x1="50" y1="9" x2="50" y2={i % 3 === 0 ? 17 : 14}
            className="sk-clock-tick"
            transform={`rotate(${i * 30} 50 50)`}
          />
        ))}
        <line x1="50" y1="50" x2="50" y2="28" className="sk-clock-hour" transform={`rotate(${hourDeg} 50 50)`} />
        <line x1="50" y1="54" x2="50" y2="17" className="sk-clock-min" transform={`rotate(${minDeg} 50 50)`} />
        <line x1="50" y1="58" x2="50" y2="14" className="sk-clock-sec" transform={`rotate(${secDeg} 50 50)`} />
        <circle cx="50" cy="50" r="3" className="sk-clock-pin" />
      </svg>
      <span className="sk-clock-label">GMT+8</span>
    </div>
  );
}

/* --- Early-iPhone-era app icons: base gradient, glossy dome, letterpress glyph --- */

function NotesIcon() {
  return (
    <span className="sk-icon sk-icon-notes" aria-hidden="true">
      <span className="sk-notes-binding" />
      <span className="sk-notes-text">blog</span>
    </span>
  );
}

function CalendarIcon({ now }: { now: Date }) {
  return (
    <span className="sk-icon sk-icon-cal" aria-hidden="true">
      <span className="sk-cal-weekday">{calWeekday.format(now)}</span>
      <span className="sk-cal-day">{calDay.format(now)}</span>
    </span>
  );
}

/** Editorial scrapbook hero: pieces pinned to a page under a Mac menu bar. */
export function Hero({ onBookCall }: { onBookCall: () => void }) {
  const now = useNow();

  return (
    <section className="section sk">
      <MenuBar now={now} />

      <div className="sk-board">
        {/* The name is already in the site nav; keep it as the page's h1 for
            screen readers and search without repeating it visually. */}
        <h1 className="sr-only">Kellas Andrei</h1>
        <div className="sk-labels">
          <p className="sk-dymo sk-dymo-accent">Fullstack web developer</p>
        </div>

        <div className="sk-window">
          <div className="sk-titlebar">
            <span className="sk-lights" aria-hidden="true">
              <i className="sk-light-close" />
              <i className="sk-light-min" />
              <i className="sk-light-max" />
            </span>
            <span className="sk-title">manifesto.txt</span>
          </div>
          <div className="sk-window-body">
            <p className="sk-headline">
              i just do it for the <mark className="sk-hl">love of the game</mark>
            </p>
            <p className="sk-copy">
              I care more about whether something works under real load than whether it looks good in a demo.
            </p>
          </div>
        </div>

        <figure className="sk-polaroid">
          <span className="sk-tape sk-tape-top" aria-hidden="true" />
          <img
            src="/img/drei.jpg"
            alt="Kellas Andrei"
            onError={(e) => {
              (e.target as HTMLElement).style.visibility = 'hidden';
            }}
          />
          <figcaption>that's me — Manila, PH</figcaption>
        </figure>

        <aside className="sk-note">
          <span className="sk-tape sk-tape-note" aria-hidden="true" />
          <span className="sk-note-kicker">currently obsessed with</span>
          <span className="sk-note-main">agentic dev workflows</span>
          <span className="sk-note-sub">&amp; what they change about how software gets built</span>
        </aside>

        <ul className="sk-stickers" aria-label="At a glance">
          <li className="sk-sticker sk-sticker-round">
            <b>1+</b>
            <span>yrs shipping</span>
          </li>
          <li className="sk-sticker sk-sticker-burst">
            <b>15+</b>
            <span>projects built</span>
          </li>
          <li className="sk-sticker sk-sticker-ticket">
            <b>12+</b>
            <span>technologies</span>
          </li>
          <li className="sk-sticker-slot">
            <ClockSticker now={now} />
          </li>
        </ul>

        <div className="sk-dock-wrap">
          <p className="sk-scribble" aria-hidden="true">
            find me here
            <svg viewBox="0 0 80 40" className="sk-scribble-arrow">
              <path d="M4 6 C 30 4, 52 12, 70 32" />
              <path d="M58 30 L 71 33 L 68 20" />
            </svg>
          </p>

          <nav className="sk-dock" aria-label="Links">
            {/* Blog lives on its own route and is intentionally absent from the nav. */}
            <Link to="/blog" onClick={playNavTick} className="sk-app">
              <NotesIcon />
              <span className="sk-app-label">Blog</span>
            </Link>
            <a
              href="https://github.com/kellasandyyyy1"
              target="_blank"
              rel="noopener noreferrer"
              onClick={playExternalLink}
              className="sk-app"
            >
              <span className="sk-icon sk-icon-github" aria-hidden="true"><FaGithub /></span>
              <span className="sk-app-label">GitHub</span>
            </a>
            <a
              href="https://www.linkedin.com/in/andrei-wayne-kellas-03a6153a4"
              target="_blank"
              rel="noopener noreferrer"
              onClick={playExternalLink}
              className="sk-app"
            >
              <span className="sk-icon sk-icon-linkedin" aria-hidden="true"><FaLinkedinIn /></span>
              <span className="sk-app-label">LinkedIn</span>
            </a>
            <button
              type="button"
              onClick={() => { playExternalLink(); onBookCall(); }}
              className="sk-app"
            >
              <CalendarIcon now={now} />
              <span className="sk-app-label">Book a call</span>
            </button>
            <span className="sk-dock-shelf" aria-hidden="true" />
          </nav>
        </div>
      </div>
    </section>
  );
}
