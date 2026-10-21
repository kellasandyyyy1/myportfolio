/**
 * The light-theme palette as hex, mirroring the CSS tokens in index.css :root.
 * Use the CSS variables wherever CSS applies; this exists only for places that
 * cannot resolve var(): canvas drawing and SVG attributes set from JS.
 * Keep the two in step.
 */
export const PALETTE_HEX = {
  cream: '#F7F2E7',
  sand: '#EFE7D6',
  sandDeep: '#E2D8C0',
  sageSoft: '#DCE4CC',
  sage: '#8FA67E',
  moss: '#3F5D3A',
  limeSoft: '#D9E589',
  ink: '#2F3A2B',
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
