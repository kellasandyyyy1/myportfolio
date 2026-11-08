import * as React from 'react';
import { Link } from 'react-router-dom';
import { NavIcon3D } from './NavIcon3D';
import { XeroxPortrait } from './XeroxPortrait';
import { WorksFolder } from './WorksFolder';

/**
 * Classic pixel arrow pointer, as on early Apple screens: white with a one-pixel
 * black outline. B = outline, W = fill, anything else is transparent.
 */
const ARROW_PIXELS = [
  'B',
  'BB',
  'BWB',
  'BWWB',
  'BWWWB',
  'BWWWWB',
  'BWWWWWB',
  'BWWWWWWB',
  'BWWWWWWWB',
  'BWWWWWWWWB',
  'BWWWWWBBBBB',
  'BWWBWWB',
  'BWB.BWWB',
  'BB..BWWB',
  'B....BWWB',
  '.....BWWB',
  '......BB',
];

function PixelArrow() {
  return (
    <span className="hx-pointer" aria-hidden="true">
      <svg viewBox="0 0 11 17" width="16.5" height="25.5" shapeRendering="crispEdges">
        {ARROW_PIXELS.flatMap((row, y) =>
          [...row].map((p, x) =>
            p === 'B' || p === 'W' ? (
              <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={p === 'B' ? '#000' : '#fff'} />
            ) : null,
          ),
        )}
      </svg>
    </span>
  );
}

/** A word or phrase in the intro set as a pastel tag, like a prompt builder's tokens. */
type ChipColour = 'pink' | 'green' | 'yellow' | 'grey' | 'lilac' | 'blue' | 'red' | 'dashed';
function Chip({ c, pointer, children }: { c: ChipColour; pointer?: boolean; children: React.ReactNode }) {
  return (
    <span className={`hx-chip${pointer ? ' has-pointer' : ''}`} data-c={c}>
      {children}
      {pointer && <PixelArrow />}
    </span>
  );
}

/** The 3D object beside each hero link; it lifts and tips when the link is hovered. */
function Key({ children }: { children: React.ReactNode }) {
  return (
    <span className="hx-obj" aria-hidden="true">
      {children}
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
      {/* Soft halftone over the corner glow (the glow itself is .hx::before/::after). */}
      <span className="hx-dots" aria-hidden="true" />
      <div className="hx-top">
        <figure className="hx-window">
          <div className="hx-titlebar" aria-hidden="true">
            <span className="hx-closebox" />
            <span className="hx-stripes" />
          </div>
          <div className="hx-photo">
            {/* Two-colour photocopy of the portrait in the site's moss and sand,
                tuned so the face reads at a glance. With only two colours, noise
                plus a random threshold is what carries the in-between tones: a
                wide noise/threshold band makes ink density track the photo's
                real shading (so cheeks, nose and jaw keep their form), fine
                grain lets that dither blend into tone at display size, and the
                sharpen pass keeps eyes, brows and mouth crisp. A narrow band
                would posterise the face into a stencil. Focus matches the old
                object-position. */}
            <XeroxPortrait
              src="/img/drei.png"
              alt="Kellas Andrei"
              focus={[0.5, 0.2]}
              inkColor="#2F4A2B"
              paperColor="#F1EBDC"
              contrast={[20, 235]}
              noiseAmount={32}
              thresholdRange={[70, 185]}
              grainSize={1}
              sharpen={2}
              speckRate={0.0012}
            />
          </div>
        </figure>

        <div className="hx-intro">
          <h1 className="hx-name hx-in" data-tour="hero-name" style={{ '--d': '120ms' } as React.CSSProperties}>Kellas Andrei</h1>
          <p className="hx-copy hx-in" style={{ '--d': '190ms' } as React.CSSProperties}>
            I'm a <Chip c="pink" pointer>designer</Chip> and <Chip c="green" pointer>fullstack web developer</Chip>, so
            the <Chip c="dashed">thing you see</Chip> and the <Chip c="dashed">thing that runs it</Chip> come
            from the same head. I build things meant to survive <Chip c="yellow">real traffic</Chip>, not
            just the screenshot that ends up in the <Chip c="grey">pitch deck</Chip>.
          </p>
          <p className="hx-copy hx-in" style={{ '--d': '260ms' } as React.CSSProperties}>
            I work across the whole stack, from <Chip c="lilac">the database</Chip> to{' '}
            <Chip c="blue">the interface</Chip>, and I leave every codebase{' '}
            <Chip c="green">a little cleaner</Chip> than I found it. Fewer surprises,
            fewer <Chip c="red">2am fixes</Chip>, <Chip c="lilac">more sleep</Chip> for everyone.
          </p>
          <nav className="hx-links hx-in" aria-label="Links" style={{ '--d': '330ms' } as React.CSSProperties}>
            <a href="https://github.com/kellasandyyyy1" target="_blank" rel="noopener noreferrer" data-tour="hero-social">
              <Key><NavIcon3D name="github" size={24} /></Key>
              github <span className="hx-arrow" aria-hidden="true">↗</span>
            </a>
            <a
              href="https://www.linkedin.com/in/andrei-wayne-kellas-03a6153a4"
              data-tour="hero-social"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Key><NavIcon3D name="linkedin" size={24} /></Key>
              linkedin <span className="hx-arrow" aria-hidden="true">↗</span>
            </a>
            {/* Blog lives on its own route and is intentionally absent from the nav. */}
            <Link to="/blog">
              <Key><NavIcon3D name="blog" size={24} /></Key>
              blog <span className="hx-arrow" aria-hidden="true">↗</span>
            </Link>
            <button type="button" data-tour="hero-book" data-sound="primary" onClick={onBookCall}>
              <Key><NavIcon3D name="calendar" size={24} /></Key>
              book a call <span className="hx-arrow" aria-hidden="true">↗</span>
            </button>
          </nav>
        </div>

        {/* Desktop only: a folder shortcut to the works, fanning projects on hover. */}
        <div className="hx-folder hx-in hidden lg:flex" style={{ '--d': '380ms' } as React.CSSProperties}>
          <WorksFolder />
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
