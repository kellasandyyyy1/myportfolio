import * as React from 'react';
import { Link } from 'react-router-dom';
import { CalendarBlank, GithubLogo, LinkedinLogo, NotePencil } from '@phosphor-icons/react';
import { playExternalLink, playNavTick } from '../lib/sound';

/** Small monochrome keycap: soft top light, darker lip underneath. */
function Key({ children }: { children: React.ReactNode }) {
  return (
    <span className="hx-key" aria-hidden="true">
      <span className="hx-key-cap">{children}</span>
    </span>
  );
}

/**
 * Hand-sketched outline of the Philippines with a pin on Manila. Points are
 * plotted from rough lon/lat (x = (lon − 116.5) × 6, y = (19 − lat) × 6), so
 * the islands sit where they should without pretending to be survey-accurate.
 */
const PH_ISLANDS = [
  // Luzon, with the Bicol tail running southeast
  'M24.6 3 L34 3 L34.8 12 L30.6 19 L30.6 28.8 L36 30 L42 31 L46 36 L45 38.4 L40.8 36 L36.6 33.6 L32.4 31 L27 32.4 L24.6 28.8 L24 26.4 L19.8 18 L22.8 14.4 L23.4 9 Z',
  // Mindoro
  'M22.8 33 L28.2 33.6 L29.4 39.6 L27 40.8 L24 37.2 Z',
  // Palawan
  'M18.6 46.2 L14.4 54 L6.6 62.4 L4.2 64.2 L5.4 61.8 L12.6 55.2 L16.8 47.4 Z',
  // Panay, Negros, Cebu
  'M33 42.6 L39.6 45 L36.6 49.8 L33 50.4 L32.4 45.6 Z',
  'M39 48.6 L42 50.4 L40.2 58.8 L38.4 57.6 L36 54 Z',
  'M45 46.8 L45.6 51 L41.4 57 L43.2 52.2 Z',
  // Samar, Leyte
  'M47.4 39 L54.6 40.2 L55.2 47.4 L51 48 L46.8 44.4 Z',
  'M47.4 45 L51 46.8 L52.2 54 L49.8 53.4 L47.4 49.2 Z',
  // Mindanao
  'M40.8 62.4 L46.2 64.8 L52.2 60 L54 55.2 L58.2 58.8 L59.4 69 L58.2 76.2 L54.6 71.4 L53.4 78 L46.2 76.8 L45 70.8 L41.4 68.4 L33.6 72.6 L35.4 68.4 L39 66 Z',
];

function PhMap() {
  return (
    <svg className="hx-map" viewBox="0 0 64 82" aria-hidden="true">
      {PH_ISLANDS.map((d) => (
        <path key={d} className="hx-map-land" d={d} />
      ))}
      <ellipse className="hx-map-land" cx="46.2" cy="55.2" rx="2.6" ry="1.6" />
      <circle className="hx-map-ring" cx="27" cy="26.4" r="5" />
      <circle className="hx-map-pin" cx="27" cy="26.4" r="1.9" />
    </svg>
  );
}

export function Hero({ onBookCall }: { onBookCall: () => void }) {

  return (
    <section className="section hx">
      <div className="hx-top">
        <figure className="hx-window hx-in" style={{ '--d': '50ms' } as React.CSSProperties}>
          <div className="hx-titlebar" aria-hidden="true">
            <span className="hx-closebox" />
            <span className="hx-stripes" />
          </div>
          <div className="hx-photo">
            {/* Soft black-and-white solarize: tones stay natural through the midtones
                (the face) and only the brightest highlights (the wall) fold back to gray. */}
            <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
              <filter id="hx-solarize" colorInterpolationFilters="sRGB">
                <feColorMatrix type="saturate" values="0" />
                <feComponentTransfer>
                  <feFuncR type="table" tableValues="0 0.12 0.25 0.38 0.5 0.62 0.72 0.62 0.34" />
                  <feFuncG type="table" tableValues="0 0.12 0.25 0.38 0.5 0.62 0.72 0.62 0.34" />
                  <feFuncB type="table" tableValues="0 0.12 0.25 0.38 0.5 0.62 0.72 0.62 0.34" />
                </feComponentTransfer>
              </filter>
            </svg>
            <img
              src="/img/drei.png"
              alt="Kellas Andrei"
              onError={(e) => {
                (e.target as HTMLElement).style.visibility = 'hidden';
              }}
            />
          </div>
        </figure>

        <div className="hx-intro">
          <h1 className="hx-name hx-in" style={{ '--d': '120ms' } as React.CSSProperties}>Kellas Andrei</h1>
          <p className="hx-copy hx-in" style={{ '--d': '190ms' } as React.CSSProperties}>
            I'm a fullstack web developer. I care more about whether something works under real load
            than whether it looks good in a demo.
          </p>
          <p className="hx-copy hx-in" style={{ '--d': '260ms' } as React.CSSProperties}>
            These days I'm obsessed with agentic dev workflows, and what they change about how
            software gets built.
          </p>
          <nav className="hx-links hx-in" aria-label="Links" style={{ '--d': '330ms' } as React.CSSProperties}>
            <a href="https://github.com/kellasandyyyy1" target="_blank" rel="noopener noreferrer" onClick={playExternalLink}>
              <Key><GithubLogo weight="fill" /></Key>
              github <span className="hx-arrow" aria-hidden="true">↗</span>
            </a>
            <a
              href="https://www.linkedin.com/in/andrei-wayne-kellas-03a6153a4"
              target="_blank"
              rel="noopener noreferrer"
              onClick={playExternalLink}
            >
              <Key><LinkedinLogo weight="fill" /></Key>
              linkedin <span className="hx-arrow" aria-hidden="true">↗</span>
            </a>
            {/* Blog lives on its own route and is intentionally absent from the nav. */}
            <Link to="/blog" onClick={playNavTick}>
              <Key><NotePencil weight="bold" /></Key>
              blog <span className="hx-arrow" aria-hidden="true">↗</span>
            </Link>
            <button type="button" onClick={() => { playExternalLink(); onBookCall(); }}>
              <Key><CalendarBlank weight="bold" /></Key>
              book a call <span className="hx-arrow" aria-hidden="true">↗</span>
            </button>
          </nav>
        </div>
      </div>

      <dl className="hx-stats hx-in" style={{ '--d': '400ms' } as React.CSSProperties}>
        <div className="hx-stat">
          <dt>yrs shipping</dt>
          <dd>1+</dd>
        </div>
        <div className="hx-stat">
          <dt>projects built</dt>
          <dd>15+</dd>
        </div>
        <div className="hx-stat">
          <dt>technologies</dt>
          <dd>12+</dd>
        </div>
        <div className="hx-stat hx-stat-place">
          <dt>based in</dt>
          <dd>
            Manila, PH
            <PhMap />
          </dd>
        </div>
      </dl>
    </section>
  );
}
