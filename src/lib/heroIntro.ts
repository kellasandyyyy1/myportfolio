/**
 * Hand-off between the hero portrait's intro animation and the intro tour, so
 * the tour never starts over a portrait that's still assembling.
 *
 * The mosaic calls beginHeroIntro() while rendering (before any effect runs,
 * so the tour can't check too early) and endHeroIntro() when it settles or is
 * skipped. With no intro on the page, whenHeroIntroDone() resolves at once.
 */

let running = false;
let waiters: Array<() => void> = [];

/** Longest the tour will wait, in case the intro never reports back. */
const MAX_WAIT_MS = 4000;

export function beginHeroIntro() {
  running = true;
}

export function endHeroIntro() {
  running = false;
  waiters.forEach((resolve) => resolve());
  waiters = [];
}

export function whenHeroIntroDone(): Promise<void> {
  if (!running) return Promise.resolve();
  return new Promise((resolve) => {
    waiters.push(resolve);
    window.setTimeout(resolve, MAX_WAIT_MS);
  });
}
