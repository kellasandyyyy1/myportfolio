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
  | 'contact';

/** Light / base / side tones per object. */
const PALETTE: Record<NavIcon3DName, [string, string, string]> = {
  about: ['#ffb39f', '#f07a5f', '#b8492f'],
  experience: ['#9fe6d6', '#4fb8a6', '#2a7c71'],
  stack: ['#c6bcff', '#8a78ec', '#5443b5'],
  certifications: ['#ffe39a', '#f2bb3f', '#b3801a'],
  work: ['#f4c08e', '#d48a4c', '#97582a'],
  services: ['#ffaaa8', '#e65f5c', '#a83735'],
  resources: ['#a9c8ff', '#5b8fec', '#3159a8'],
  contact: ['#fbf6ee', '#e3d8c8', '#a99a85'],
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
    </svg>
  );
};
