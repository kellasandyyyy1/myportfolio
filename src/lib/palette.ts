/**
 * The light-theme palette as hex, mirroring the CSS tokens in index.css :root.
 * Use the CSS variables wherever CSS applies; this exists only for places that
 * cannot resolve var(): canvas drawing and SVG attributes set from JS.
 * Keep the two in step.
 */
export const PALETTE_HEX = {
  cream: '#FAF6EC',
  sand: '#F1EBDC',
  sandDeep: '#CBC1A7',
  sageSoft: '#DCE6CF',
  sage: '#6F8A5F',
  moss: '#2F4A2B',
  limeSoft: '#D9E589',
  ink: '#26301F',
} as const;

/** Dark theme (lamp-lit) mirror of the :root[data-theme="dark"] tokens. */
export const PALETTE_HEX_DARK = {
  cream: '#1C1A16',
  sand: '#25221C',
  sandDeep: '#3A352B',
  sageSoft: '#2C3226',
  sage: '#8FA67E',
  moss: '#A9BF96',
  limeSoft: '#D9E589',
  ink: '#F0E9D9',
} as const;
