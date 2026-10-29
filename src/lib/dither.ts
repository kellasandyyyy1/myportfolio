/**
 * Atkinson error diffusion over a generated value field, for two-tone
 * textures and swatches. `value(x, y)` returns 0 (dark) … 1 (light); the
 * result marks each cell 1 for light, 0 for dark. Threshold at 128, with 1/8
 * of the error to the six classic neighbours (right, right+2, below-left,
 * below, below-right, below+2); the dropped 2/8 keeps the texture crisp.
 */
export function atkinsonField(cols: number, rows: number, value: (x: number, y: number) => number) {
  const lum = new Float32Array(cols * rows);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) lum[y * cols + x] = value(x, y) * 255;
  }
  const out = new Uint8Array(cols * rows);
  const spread = (x: number, y: number, e: number) => {
    if (x >= 0 && x < cols && y < rows) lum[y * cols + x] += e;
  };
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      const old = lum[i];
      const light = old >= 128;
      out[i] = light ? 1 : 0;
      const e = (old - (light ? 255 : 0)) / 8;
      spread(x + 1, y, e);
      spread(x + 2, y, e);
      spread(x - 1, y + 1, e);
      spread(x, y + 1, e);
      spread(x + 1, y + 1, e);
      spread(x, y + 2, e);
    }
  }
  return out;
}
