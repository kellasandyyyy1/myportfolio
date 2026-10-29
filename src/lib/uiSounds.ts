import { play, SOUND_NAMES, syncWithVisibility, unlockAudio, type SoundName } from './sound';

/**
 * Delegated UI sounds: one listener set on document covers every link, button
 * and card, so components don't wire sounds themselves.
 *
 * Per element, `data-sound` overrides the automatic choice:
 *   tick | wood | glock | bell | switch | primary | none | mute-toggle
 * "primary" is the wood click with a glockenspiel ping layered under it.
 * "mute-toggle" marks the sound on/off control: it still ticks on hover, but
 * its click is played by its own handler (a clack only once sound is on),
 * since at pointerdown the state hasn't flipped yet.
 */

const INTERACTIVE = 'a[href], button, [role="button"], [data-sound]';

const HOVER_ELEMENT_GAP = 80;
const HOVER_GLOBAL_GAP = 40;

const lastHoverByElement = new WeakMap<Element, number>();
let lastHoverAt = 0;

const interactiveFrom = (node: EventTarget | null) =>
  node instanceof Element ? (node.closest(INTERACTIVE) as HTMLElement | null) : null;

const isDisabled = (el: HTMLElement) =>
  (el as HTMLButtonElement).disabled === true || el.getAttribute('aria-disabled') === 'true';

function isExternal(el: HTMLElement) {
  if (!(el instanceof HTMLAnchorElement)) return false;
  if (el.target === '_blank') return true;
  try {
    return new URL(el.href, window.location.href).origin !== window.location.origin;
  } catch {
    return false;
  }
}

/** The click sound for an element, or null for none. */
function clickSoundFor(el: HTMLElement): SoundName | null {
  const override = el.dataset.sound;
  if (override === 'none' || override === 'mute-toggle') return null;
  if (override && (SOUND_NAMES as string[]).includes(override)) return override as SoundName;
  if (isExternal(el)) return 'bell';
  return 'wood';
}

function onPointerOver(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return;
  const el = interactiveFrom(e.target);
  // Moving between an element's own children re-fires pointerover; only the
  // crossing into the element itself counts.
  if (!el || el === interactiveFrom(e.relatedTarget)) return;
  if (isDisabled(el) || el.dataset.sound === 'none') return;

  const now = performance.now();
  if (now - lastHoverAt < HOVER_GLOBAL_GAP) return;
  if (now - (lastHoverByElement.get(el) ?? -Infinity) < HOVER_ELEMENT_GAP) return;
  lastHoverAt = now;
  lastHoverByElement.set(el, now);
  play('tick');
}

function onPointerDown(e: PointerEvent) {
  unlockAudio();
  if (e.button !== 0) return;
  const el = interactiveFrom(e.target);
  if (!el || isDisabled(el)) return;
  const sound = clickSoundFor(el);
  if (sound) play(sound);
}

function onKeyDown(e: KeyboardEvent) {
  unlockAudio();
  if (e.repeat || (e.key !== 'Enter' && e.key !== ' ')) return;
  const el = interactiveFrom(document.activeElement);
  if (!el || el !== document.activeElement || isDisabled(el)) return;
  // Space activates buttons, not links; Enter activates both.
  const isLink = el instanceof HTMLAnchorElement;
  if (e.key === ' ' && isLink) return;
  const sound = clickSoundFor(el);
  if (sound) play(sound);
}

/** Wires the delegated listeners once. Returns a cleanup for the app root. */
export function initUiSounds() {
  const opts = { capture: true, passive: true } as const;
  document.addEventListener('pointerover', onPointerOver, opts);
  document.addEventListener('pointerdown', onPointerDown, opts);
  document.addEventListener('keydown', onKeyDown, opts);
  document.addEventListener('visibilitychange', syncWithVisibility);
  return () => {
    document.removeEventListener('pointerover', onPointerOver, opts);
    document.removeEventListener('pointerdown', onPointerDown, opts);
    document.removeEventListener('keydown', onKeyDown, opts);
    document.removeEventListener('visibilitychange', syncWithVisibility);
  };
}
