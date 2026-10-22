import * as React from 'react';

/**
 * Small "rendered object" icons for the desktop sidebar, loosely inspired by
 * Airbnb's tactile icon style: each glyph is a lit gradient face over a darker
 * extruded side, with a specular highlight and a soft contact shadow. Pure SVG,
 * no images, so they stay crisp and theme-agnostic.
 */
export type NavIcon3DName =
  | 'about'
  | 'experience'
  | 'stack'
  | 'certifications'
  | 'work'
  | 'services'
  | 'resources'
  | 'contact'
  // Services grid
  | 'portfolio'
  | 'ecommerce'
  | 'seo'
  | 'webapp'
  | 'landing'
  | 'maintenance'
  // Links and controls
  | 'github'
  | 'linkedin'
  | 'blog'
  | 'calendar'
  | 'sound'
  | 'mute'
  | 'sun'
  | 'moon';

/** GitHub's mark (Simple Icons), on a 24 grid. */
const GITHUB_MARK =
  'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12';

/** LinkedIn's "in" (Font Awesome), on a 448×512 grid. */
const LINKEDIN_IN =
  'M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z';

/**
 * Light / base / side tones per object. The site's themes recolour every part
 * through CSS (see the .ni3d rules), so these only show if those rules are absent.
 */
const PALETTE: Record<NavIcon3DName, [string, string, string]> = {
  about: ['#ffb39f', '#f07a5f', '#b8492f'],
  experience: ['#9fe6d6', '#4fb8a6', '#2a7c71'],
  stack: ['#c6bcff', '#8a78ec', '#5443b5'],
  certifications: ['#ffe39a', '#f2bb3f', '#b3801a'],
  work: ['#f4c08e', '#d48a4c', '#97582a'],
  services: ['#ffaaa8', '#e65f5c', '#a83735'],
  resources: ['#a9c8ff', '#5b8fec', '#3159a8'],
  contact: ['#fbf6ee', '#e3d8c8', '#a99a85'],
  portfolio: ['#a9c8ff', '#5b8fec', '#3159a8'],
  ecommerce: ['#f4c08e', '#d48a4c', '#97582a'],
  seo: ['#9fe6d6', '#4fb8a6', '#2a7c71'],
  webapp: ['#c6bcff', '#8a78ec', '#5443b5'],
  landing: ['#ffb39f', '#f07a5f', '#b8492f'],
  maintenance: ['#ffe39a', '#f2bb3f', '#b3801a'],
  github: ['#c6bcff', '#8a78ec', '#5443b5'],
  linkedin: ['#a9c8ff', '#5b8fec', '#3159a8'],
  blog: ['#fbf6ee', '#e3d8c8', '#a99a85'],
  calendar: ['#ffaaa8', '#e65f5c', '#a83735'],
  sound: ['#9fe6d6', '#4fb8a6', '#2a7c71'],
  mute: ['#9fe6d6', '#4fb8a6', '#2a7c71'],
  sun: ['#ffe39a', '#f2bb3f', '#b3801a'],
  moon: ['#c6bcff', '#8a78ec', '#5443b5'],
};

export const NavIcon3D: React.FC<{ name: NavIcon3DName; size?: number }> = ({ name, size = 22 }) => {
  // useId output can contain characters that break url(#...) references.
  const uid = 'ni' + React.useId().replace(/[^a-zA-Z0-9]/g, '');
  const [light, base, side] = PALETTE[name];
  const face = `url(#${uid}-face)`;
  const gloss = `url(#${uid}-gloss)`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className="ni3d"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={`${uid}-face`} x1="0" y1="0" x2="0.35" y2="1">
          <stop className="ni-light" offset="0" stopColor={light} />
          <stop className="ni-base" offset="0.55" stopColor={base} />
          <stop className="ni-base" offset="1" stopColor={base} />
        </linearGradient>
        <linearGradient id={`${uid}-gloss`} x1="0" y1="0" x2="0" y2="1">
          <stop className="ni-gloss" offset="0" stopColor="#fff" stopOpacity="0.75" />
          <stop className="ni-gloss" offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${uid}-shadow`} cx="0.5" cy="0.5" r="0.5">
          <stop className="ni-shade" offset="0" stopColor="#000" stopOpacity="0.45" />
          <stop className="ni-shade" offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Contact shadow */}
      <ellipse className="ni3d-shadow" cx="12" cy="21.6" rx="8" ry="1.7" fill={`url(#${uid}-shadow)`} />

      {name === 'about' && (
        <g>
          <path d="M4.8 20.2c0-4 3.2-6.6 7.2-6.6s7.2 2.6 7.2 6.6z" className="ni-side" fill={side} transform="translate(0 1.1)" />
          <path d="M4.8 20.2c0-4 3.2-6.6 7.2-6.6s7.2 2.6 7.2 6.6z" fill={face} />
          <circle cx="12" cy="8.4" r="4" className="ni-side" fill={side} transform="translate(0 1)" />
          <circle cx="12" cy="8.4" r="4" fill={face} />
          <ellipse cx="10.8" cy="6.6" rx="2" ry="1.2" fill={gloss} />
          <path d="M7.4 17.6c1-1.6 2.7-2.4 4.6-2.4" className="ni-hi-line" stroke="#fff" strokeOpacity="0.55" strokeWidth="1" strokeLinecap="round" fill="none" />
        </g>
      )}

      {name === 'experience' && (
        <g>
          {[7, 3.5, 0].map((dy, i) => (
            <g key={dy} transform={`translate(0 ${dy})`}>
              <path d="M12 5.2l7.8 4.2-7.8 4.2-7.8-4.2z" className="ni-side" fill={side} transform="translate(0 1.2)" />
              <path
                d="M12 5.2l7.8 4.2-7.8 4.2-7.8-4.2z"
                fill={face}
                opacity={i === 2 ? 1 : 0.92 - i * 0.04}
              />
            </g>
          ))}
          <path d="M8 7.4L12 5.2l2.6 1.4" className="ni-hi-line" stroke="#fff" strokeOpacity="0.7" strokeWidth="0.9" strokeLinecap="round" fill="none" />
        </g>
      )}

      {name === 'stack' && (
        <g>
          {[8.5, 12, 15.5].map((p) => (
            <g key={p} className="ni-pin" fill="#9a9aa3">
              <rect x={p - 0.7} y="3" width="1.4" height="3" rx="0.7" />
              <rect x={p - 0.7} y="18" width="1.4" height="3" rx="0.7" />
              <rect y={p - 0.7} x="3" height="1.4" width="3" rx="0.7" />
              <rect y={p - 0.7} x="18" height="1.4" width="3" rx="0.7" />
            </g>
          ))}
          <rect x="5.5" y="5.5" width="13" height="13" rx="3" className="ni-side" fill={side} transform="translate(0 1.2)" />
          <rect x="5.5" y="5.5" width="13" height="13" rx="3" fill={face} />
          <rect x="9" y="9" width="6" height="6" rx="1.4" className="ni-side" fill={side} opacity="0.55" />
          <rect x="6.6" y="6.4" width="10.8" height="3.4" rx="1.7" fill={gloss} />
        </g>
      )}

      {name === 'certifications' && (
        <g>
          <path d="M8.2 12.5L6.4 20.4l3-1.4 1.8 2.4 1.5-7.2z" className="ni-accent" fill="#d9534f" />
          <path d="M15.8 12.5l1.8 7.9-3-1.4-1.8 2.4-1.5-7.2z" className="ni-accent" fill="#b8403c" />
          <circle cx="12" cy="9.6" r="6" className="ni-side" fill={side} transform="translate(0 1.2)" />
          <circle cx="12" cy="9.6" r="6" fill={face} />
          <circle cx="12" cy="9.6" r="4.1" fill="none" className="ni-side-line" stroke={side} strokeOpacity="0.45" strokeWidth="0.9" />
          <path
            d="M12 6.9l.85 1.75 1.92.26-1.4 1.34.34 1.9L12 11.25l-1.71.9.34-1.9-1.4-1.34 1.92-.26z"
            className="ni-hi" fill="#fff8df"
          />
          <ellipse cx="10.2" cy="6.4" rx="2.6" ry="1.3" fill={gloss} />
        </g>
      )}

      {name === 'work' && (
        <g>
          <path d="M9 8V6.4A1.9 1.9 0 0 1 10.9 4.5h2.2A1.9 1.9 0 0 1 15 6.4V8" className="ni-side-line" stroke="#6e4220" strokeWidth="1.6" fill="none" />
          <rect x="3.5" y="8" width="17" height="11.5" rx="2.6" className="ni-side" fill={side} transform="translate(0 1.2)" />
          <rect x="3.5" y="8" width="17" height="11.5" rx="2.6" fill={face} />
          <path d="M3.6 12.6h16.8" className="ni-side-line" stroke={side} strokeOpacity="0.55" strokeWidth="0.9" />
          <rect x="10.6" y="11.4" width="2.8" height="2.4" rx="0.7" className="ni-hi" fill="#ffe4b5" />
          <rect x="5" y="8.9" width="14" height="2.4" rx="1.2" fill={gloss} />
        </g>
      )}

      {name === 'services' && (
        <g>
          {/* Gear: drawn once as the extruded side, once as the lit face. */}
          {[side, face].map((fill, layer) => (
            <g key={layer} className={layer === 0 ? 'ni-side' : undefined} fill={fill} transform={layer === 0 ? 'translate(0 1.3)' : undefined}>
              {Array.from({ length: 8 }, (_, i) => (
                <rect key={i} x="10.4" y="2.6" width="3.2" height="4" rx="0.9" transform={`rotate(${i * 45} 12 12)`} />
              ))}
              <circle cx="12" cy="12" r="6.6" />
            </g>
          ))}
          <circle cx="12" cy="12" r="2.5" className="ni-side" fill={side} />
          <circle cx="12" cy="12.5" r="1.6" className="ni-accent" fill="#2a1414" opacity="0.35" />
          <ellipse cx="10.4" cy="8.4" rx="3" ry="1.4" fill={gloss} />
        </g>
      )}

      {name === 'resources' && (
        <g>
          {/* Three books, each its own tone, the last one leaning. */}
          <rect x="4.2" y="5" width="4.6" height="15" rx="1.1" className="ni-side" fill="#3a8a63" transform="translate(0 1)" />
          <rect x="4.2" y="5" width="4.6" height="15" rx="1.1" className="ni-tone" fill="#56b685" />
          <rect x="9.4" y="3.8" width="4.6" height="16.2" rx="1.1" className="ni-side" fill={side} transform="translate(0 1)" />
          <rect x="9.4" y="3.8" width="4.6" height="16.2" rx="1.1" fill={face} />
          <g transform="rotate(14 17.5 20)">
            <rect x="15.1" y="6" width="4.4" height="14" rx="1.1" className="ni-side" fill="#b3801a" transform="translate(0 1)" />
            <rect x="15.1" y="6" width="4.4" height="14" rx="1.1" className="ni-tone-soft" fill="#f2bb3f" />
          </g>
          <path d="M4.2 8.2h4.6M9.4 7.2h4.6" className="ni-hi-line" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.8" />
          <rect x="5" y="5.6" width="1.4" height="12" rx="0.7" fill={gloss} />
          <rect x="10.2" y="4.4" width="1.4" height="13" rx="0.7" fill={gloss} />
        </g>
      )}

      {name === 'contact' && (
        <g>
          <rect x="3.2" y="6" width="17.6" height="12.8" rx="2.4" className="ni-side" fill={side} transform="translate(0 1.2)" />
          <rect x="3.2" y="6" width="17.6" height="12.8" rx="2.4" fill={face} />
          <path d="M3.8 7.2l8.2 6.2 8.2-6.2" className="ni-side-line" stroke={side} strokeWidth="1" strokeLinejoin="round" fill="none" />
          <circle cx="12" cy="13.2" r="1.7" className="ni-spark" fill="#e65f5c" />
          <rect x="4.6" y="6.7" width="14.8" height="2" rx="1" fill={gloss} opacity="0.7" />
        </g>
      )}

      {name === 'portfolio' && (
        <g>
          {/* Browser window: title bar, a picture block and two text lines. */}
          <rect x="3" y="4.4" width="18" height="15" rx="2.6" className="ni-side" fill={side} transform="translate(0 1.2)" />
          <rect x="3" y="4.4" width="18" height="15" rx="2.6" fill={face} />
          <path d="M3.2 8.6h17.6" className="ni-side-line" stroke={side} strokeOpacity="0.5" strokeWidth="0.9" />
          {[5.6, 7.4, 9.2].map((cx) => (
            <circle key={cx} cx={cx} cy="6.5" r="0.7" className="ni-hi" fill="#fff8df" />
          ))}
          <rect x="5.4" y="10.6" width="6" height="6.4" rx="1.1" className="ni-hi" fill="#fff8df" />
          <rect x="13" y="11.2" width="5.6" height="1.4" rx="0.7" className="ni-hi" fill="#fff8df" />
          <rect x="13" y="14" width="3.8" height="1.4" rx="0.7" className="ni-hi" fill="#fff8df" />
          <rect x="4.2" y="5.1" width="15.6" height="1.6" rx="0.8" fill={gloss} opacity="0.6" />
        </g>
      )}

      {name === 'ecommerce' && (
        <g>
          {/* Shopping bag with a handle and a tag. */}
          <path d="M9 8.2V6.8a3 3 0 0 1 6 0v1.4" className="ni-side-line" stroke={side} strokeWidth="1.6" strokeLinecap="round" fill="none" />
          <path d="M5 8.2h14l-1 11.6a1.6 1.6 0 0 1-1.6 1.4H7.6A1.6 1.6 0 0 1 6 19.8z" className="ni-side" fill={side} transform="translate(0 1.1)" />
          <path d="M5 8.2h14l-1 11.6a1.6 1.6 0 0 1-1.6 1.4H7.6A1.6 1.6 0 0 1 6 19.8z" fill={face} />
          <path d="M5.4 11h13.2" className="ni-side-line" stroke={side} strokeOpacity="0.45" strokeWidth="0.9" />
          <circle cx="12" cy="15.4" r="1.8" className="ni-spark" fill="#e65f5c" />
          <ellipse cx="9" cy="9.6" rx="2.8" ry="0.9" fill={gloss} />
        </g>
      )}

      {name === 'seo' && (
        <g>
          {/* Magnifier over a rising bar chart. */}
          <path d="M15.4 15.4l4.6 4.6" className="ni-side-line" stroke={side} strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="10.4" cy="10.4" r="6.8" className="ni-side" fill={side} transform="translate(0 1.1)" />
          <circle cx="10.4" cy="10.4" r="6.8" fill={face} />
          <circle cx="10.4" cy="10.4" r="4.8" className="ni-hi" fill="#fff8df" />
          <rect x="7.8" y="11" width="1.4" height="2.6" rx="0.5" className="ni-accent" fill="#d9534f" />
          <rect x="9.8" y="9.4" width="1.4" height="4.2" rx="0.5" className="ni-accent" fill="#d9534f" />
          <rect x="11.8" y="7.6" width="1.4" height="6" rx="0.5" className="ni-accent" fill="#d9534f" />
          <ellipse cx="8.4" cy="6.4" rx="2.4" ry="0.9" fill={gloss} />
        </g>
      )}

      {name === 'webapp' && (
        <g>
          {/* Two stacked app windows, a dashboard chart on the front one. */}
          <rect x="7" y="3.2" width="14" height="10.6" rx="2.2" className="ni-side" fill={side} transform="translate(0 1)" />
          <rect x="7" y="3.2" width="14" height="10.6" rx="2.2" className="ni-tone-soft" fill="#c6bcff" />
          <rect x="3" y="8.4" width="14.4" height="11.8" rx="2.4" className="ni-side" fill={side} transform="translate(0 1.2)" />
          <rect x="3" y="8.4" width="14.4" height="11.8" rx="2.4" fill={face} />
          <path d="M3.2 11.6h14" className="ni-side-line" stroke={side} strokeOpacity="0.5" strokeWidth="0.9" />
          <rect x="5.6" y="15.2" width="1.6" height="2.8" rx="0.5" className="ni-hi" fill="#fff8df" />
          <rect x="8.4" y="13.6" width="1.6" height="4.4" rx="0.5" className="ni-hi" fill="#fff8df" />
          <rect x="11.2" y="16" width="1.6" height="2" rx="0.5" className="ni-hi" fill="#fff8df" />
          <rect x="4.2" y="9.1" width="12" height="1.5" rx="0.75" fill={gloss} opacity="0.6" />
        </g>
      )}

      {name === 'landing' && (
        <g>
          {/* Rocket: body, porthole, fins and a small flame. */}
          <path d="M10.4 16.8h3.2l-1.6 4z" className="ni-spark" fill="#f2bb3f" />
          <path d="M7.6 12.6l-2.8 2.8v2.8l2.8-1.4z" className="ni-accent" fill="#b8403c" />
          <path d="M16.4 12.6l2.8 2.8v2.8l-2.8-1.4z" className="ni-accent" fill="#b8403c" />
          <path d="M12 2.8c3 2.2 4.4 5.6 4.4 9.6v4H7.6v-4C7.6 8.4 9 5 12 2.8z" className="ni-side" fill={side} transform="translate(0 1)" />
          <path d="M12 2.8c3 2.2 4.4 5.6 4.4 9.6v4H7.6v-4C7.6 8.4 9 5 12 2.8z" fill={face} />
          <circle cx="12" cy="10" r="1.9" className="ni-hi" fill="#fff8df" />
          <circle cx="12" cy="10" r="1.9" className="ni-side-line" stroke={side} strokeOpacity="0.5" strokeWidth="0.8" fill="none" />
          <ellipse cx="10.4" cy="7.4" rx="0.9" ry="2.2" fill={gloss} />
        </g>
      )}

      {name === 'maintenance' && (
        <g>
          {/* Wrench, angled, with a bolt hole in the grip. */}
          <path
            d="M15.2 3.4a4.8 4.8 0 0 0-4.6 6.2L3.9 16.3a2.1 2.1 0 0 0 0 3l.8.8a2.1 2.1 0 0 0 3 0l6.7-6.7a4.8 4.8 0 0 0 6.2-4.6l-2.9 2.9-3.1-.5-.5-3.1z"
            className="ni-side"
            fill={side}
            transform="translate(0 1.1)"
          />
          <path
            d="M15.2 3.4a4.8 4.8 0 0 0-4.6 6.2L3.9 16.3a2.1 2.1 0 0 0 0 3l.8.8a2.1 2.1 0 0 0 3 0l6.7-6.7a4.8 4.8 0 0 0 6.2-4.6l-2.9 2.9-3.1-.5-.5-3.1z"
            fill={face}
          />
          <circle cx="5.9" cy="18.1" r="1.1" className="ni-hi" fill="#fff8df" />
          <path d="M11.4 6.2c.6-1.2 1.8-2 3.1-2.2" className="ni-hi-line" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.9" strokeLinecap="round" fill="none" />
        </g>
      )}

      {name === 'github' && (
        <g>
          {/* The mark itself, extruded. */}
          <path d={GITHUB_MARK} className="ni-side" fill={side} transform="translate(3.2 3.2) scale(0.74)" />
          <path d={GITHUB_MARK} fill={face} transform="translate(3.2 2.2) scale(0.74)" />
          <ellipse cx="9.4" cy="5.2" rx="2.6" ry="1" fill={gloss} />
        </g>
      )}

      {name === 'linkedin' && (
        <g>
          {/* A rounded tile carrying "in". */}
          <rect x="3.5" y="3.5" width="17" height="16.5" rx="4" className="ni-side" fill={side} transform="translate(0 1.2)" />
          <rect x="3.5" y="3.5" width="17" height="16.5" rx="4" fill={face} />
          <path d={LINKEDIN_IN} className="ni-hi" fill="#fff8df" transform="translate(7.4 7.1) scale(0.0205)" />
          <rect x="5" y="4.4" width="14" height="1.8" rx="0.9" fill={gloss} opacity="0.6" />
        </g>
      )}

      {name === 'blog' && (
        <g>
          {/* Notebook with ruled lines, a pencil laid across it. */}
          <rect x="4" y="3.6" width="13.6" height="16.8" rx="2" className="ni-side" fill={side} transform="translate(0 1.1)" />
          <rect x="4" y="3.6" width="13.6" height="16.8" rx="2" fill={face} />
          {[6.4, 9.6, 12.8, 16].map((y) => (
            <circle key={y} cx="4" cy={y} r="0.85" className="ni-accent" fill="#b8403c" />
          ))}
          <rect x="7.2" y="7" width="7.4" height="1.2" rx="0.6" className="ni-tone" fill="#4fb8a6" />
          <rect x="7.2" y="10" width="5.6" height="1.2" rx="0.6" className="ni-tone" fill="#4fb8a6" />
          <rect x="7.2" y="13" width="6.4" height="1.2" rx="0.6" className="ni-tone" fill="#4fb8a6" />
          <g transform="rotate(42 17 14)">
            <rect x="15.6" y="7" width="2.8" height="11" rx="0.9" className="ni-side" fill={side} />
            <path d="M15.6 18l1.4 2.6 1.4-2.6z" className="ni-spark" fill="#f2bb3f" />
          </g>
          <rect x="5" y="4.4" width="11.6" height="1.5" rx="0.75" fill={gloss} opacity="0.7" />
        </g>
      )}

      {name === 'calendar' && (
        <g>
          {/* Desk calendar: header band, binder rings, one marked day. */}
          <rect x="3.5" y="5" width="17" height="15" rx="2.6" className="ni-side" fill={side} transform="translate(0 1.2)" />
          <rect x="3.5" y="5" width="17" height="15" rx="2.6" fill={face} />
          <path d="M3.5 7.6a2.6 2.6 0 0 1 2.6-2.6h11.8a2.6 2.6 0 0 1 2.6 2.6v2H3.5z" className="ni-accent" fill="#b8403c" />
          <path d="M8 3.4v3.2M16 3.4v3.2" className="ni-side-line" stroke={side} strokeWidth="1.6" strokeLinecap="round" />
          {[8, 12, 16].map((x) => [12.4, 15.8].map((y) => (
            <rect key={`${x}-${y}`} x={x - 1.1} y={y - 1} width="2.2" height="2" rx="0.6" className="ni-hi" fill="#fff8df" />
          )))}
          <rect x="14.9" y="14.8" width="2.2" height="2" rx="0.6" className="ni-spark" fill="#f2bb3f" />
          <rect x="5" y="5.6" width="14" height="1.3" rx="0.65" fill={gloss} opacity="0.6" />
        </g>
      )}

      {(name === 'sound' || name === 'mute') && (
        <g>
          {/* Speaker cone; waves when on, a cross when muted. */}
          <path d="M4 9.4h3.4L12.6 5v14l-5.2-4.4H4a1 1 0 0 1-1-1v-3.2a1 1 0 0 1 1-1z" className="ni-side" fill={side} transform="translate(0 1.1)" />
          <path d="M4 9.4h3.4L12.6 5v14l-5.2-4.4H4a1 1 0 0 1-1-1v-3.2a1 1 0 0 1 1-1z" fill={face} />
          {name === 'sound' ? (
            <>
              <path d="M15.4 9.2a4 4 0 0 1 0 5.6" className="ni-side-line" stroke={side} strokeWidth="1.6" strokeLinecap="round" fill="none" />
              <path d="M17.8 6.8a7.4 7.4 0 0 1 0 10.4" className="ni-side-line" stroke={side} strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <path d="M15.6 9.6l4.8 4.8M20.4 9.6l-4.8 4.8" className="ni-side-line" stroke={side} strokeWidth="1.6" strokeLinecap="round" />
          )}
          <ellipse cx="9.4" cy="8.4" rx="1" ry="2" fill={gloss} />
        </g>
      )}

      {name === 'sun' && (
        <g>
          {/* Sun: a lit disc inside a ring of short rays. */}
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x="11.1" y="1.8" width="1.8" height="3.4" rx="0.9" className="ni-accent" fill="#d9534f" transform={`rotate(${i * 45} 12 12)`} />
          ))}
          <circle cx="12" cy="12" r="5.4" className="ni-side" fill={side} transform="translate(0 1.1)" />
          <circle cx="12" cy="12" r="5.4" fill={face} />
          <ellipse cx="10.4" cy="9.6" rx="2.2" ry="1.1" fill={gloss} />
        </g>
      )}

      {name === 'moon' && (
        <g>
          {/* Crescent moon with two soft craters. */}
          <path d="M14.6 3.4a8.6 8.6 0 1 0 6 13.6A7 7 0 0 1 14.6 3.4z" className="ni-side" fill={side} transform="translate(0 1.1)" />
          <path d="M14.6 3.4a8.6 8.6 0 1 0 6 13.6A7 7 0 0 1 14.6 3.4z" fill={face} />
          <circle cx="8.6" cy="14.6" r="1.4" className="ni-tone-soft" fill="#c6bcff" />
          <circle cx="12.4" cy="17.4" r="0.9" className="ni-tone-soft" fill="#c6bcff" />
          <ellipse cx="7.6" cy="8.8" rx="1.1" ry="2.4" transform="rotate(30 7.6 8.8)" fill={gloss} />
        </g>
      )}
    </svg>
  );
};
