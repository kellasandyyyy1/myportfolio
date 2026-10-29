/**
 * Tactile UI sounds, synthesized with Web Audio — no audio files.
 *
 * Palette: a typewriter-key hover tick, a small wooden "tok" for clicks, a soft
 * glockenspiel ping under primary buttons, a brass bell for external links,
 * and a rotary-switch clack for toggles. Every recipe is a named function so
 * it can be tuned, or swapped for a CC0 sample, behind the same play(name).
 *
 * Design constraints:
 *  - One AudioContext, created on the first user gesture (pointerdown/keydown),
 *    never on import or hover: browsers block audio before a gesture, and
 *    creating it earlier logs a console warning.
 *  - All sounds run through a master gain (0.8) and a gentle 9kHz lowpass.
 *  - Every play is humanized (pitch ±3%, volume ±10%) and capped at 6 voices.
 *  - Everything is fire-and-forget and swallows its own errors. Audio must
 *    never throw into an interaction or block navigation.
 */

const MUTE_STORAGE_KEY = 'portfolio-sound-muted';

// --- Enabled state: the site's existing sound toggle --------------------------

type MuteListener = (muted: boolean) => void;
const listeners = new Set<MuteListener>();

function readStoredMute(): boolean {
  try {
    return localStorage.getItem(MUTE_STORAGE_KEY) === 'true';
  } catch {
    // Private browsing / disabled storage — default to sound on.
    return false;
  }
}

// Default is false (sound on), persisted across visits once toggled.
let muted = readStoredMute();

export const isMuted = () => muted;
export const isEnabled = () => !muted;

export function setMuted(next: boolean) {
  muted = next;
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, String(next));
  } catch {
    // Preference just won't survive a reload; in-memory state still applies.
  }
  listeners.forEach((listener) => listener(next));
}

export const setEnabled = (enabled: boolean) => setMuted(!enabled);

export const toggleMuted = () => {
  setMuted(!muted);
  return muted;
};

/** Subscribe to mute changes. Returns an unsubscribe function. */
export function subscribeMuted(listener: MuteListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// --- Audio graph --------------------------------------------------------------

let ctx: AudioContext | null = null;
let input: GainNode | null = null;
let noise: AudioBuffer | null = null;
let unavailable = false;

/**
 * Creates the shared context and master chain. Called only from a user
 * gesture; before that, getContext() returns null and every play is a no-op.
 */
function createContext() {
  if (ctx || unavailable) return;
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) {
      unavailable = true;
      return;
    }
    ctx = new Ctor();

    const master = ctx.createGain();
    master.gain.value = 0.8;
    const soften = ctx.createBiquadFilter();
    soften.type = 'lowpass';
    soften.frequency.value = 9000;
    soften.Q.value = 0.5;
    master.connect(soften).connect(ctx.destination);
    input = master;

    // One shared 50ms noise buffer; each sound plays a slice of it.
    const length = Math.ceil(ctx.sampleRate * 0.05);
    noise = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  } catch {
    unavailable = true;
    ctx = null;
  }
}

/** Unlocks audio on the first gesture; later gestures just resume if needed. */
export function unlockAudio() {
  createContext();
  if (ctx && ctx.state === 'suspended' && document.visibilityState === 'visible') {
    void ctx.resume().catch(() => {});
  }
}

/** Suspend while the tab is hidden, resume on return. */
export function syncWithVisibility() {
  if (!ctx) return;
  if (document.visibilityState === 'hidden') void ctx.suspend().catch(() => {});
  else void ctx.resume().catch(() => {});
}

// --- Voices: polyphony cap ----------------------------------------------------

const MAX_VOICES = 6;

interface Voice {
  out: GainNode;
  nodes: AudioNode[];
  sources: AudioScheduledSourceNode[];
}

const voices: Voice[] = [];

function release(voice: Voice) {
  const i = voices.indexOf(voice);
  if (i !== -1) voices.splice(i, 1);
  voice.sources.forEach((s) => {
    try {
      s.stop();
    } catch {
      // Already stopped.
    }
  });
  voice.nodes.forEach((n) => n.disconnect());
}

/** Starts a voice whose output is humanized in volume; drops the oldest past the cap. */
function startVoice(c: AudioContext, volume: number, duration: number): Voice {
  if (voices.length >= MAX_VOICES) release(voices[0]);
  const out = c.createGain();
  out.gain.value = volume * jitter(0.1);
  out.connect(input!);
  const voice: Voice = { out, nodes: [out], sources: [] };
  voices.push(voice);
  window.setTimeout(() => release(voice), (duration + 0.05) * 1000);
  return voice;
}

/** Random factor of 1 ± amount. */
const jitter = (amount: number) => 1 + (Math.random() * 2 - 1) * amount;

/** Sine partial with a short attack and an exponential decay. */
function partial(c: AudioContext, v: Voice, freq: number, gain: number, at: number, attack: number, decay: number) {
  const osc = c.createOscillator();
  const env = c.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, at);
  // Ramp from a tiny floor: exponential ramps can't start or end at exactly 0.
  env.gain.setValueAtTime(0.0001, at);
  env.gain.exponentialRampToValueAtTime(gain, at + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, at + attack + decay);
  osc.connect(env).connect(v.out);
  osc.start(at);
  osc.stop(at + attack + decay + 0.01);
  v.nodes.push(osc, env);
  v.sources.push(osc);
  return osc;
}

/** Filtered slice of the shared noise buffer. */
function noiseBurst(c: AudioContext, v: Voice, filter: BiquadFilterType, freq: number, q: number, gain: number, at: number, length: number) {
  const src = c.createBufferSource();
  src.buffer = noise;
  const bp = c.createBiquadFilter();
  bp.type = filter;
  bp.frequency.value = freq;
  bp.Q.value = q;
  const env = c.createGain();
  env.gain.setValueAtTime(gain, at);
  env.gain.exponentialRampToValueAtTime(0.0001, at + length);
  src.connect(bp).connect(env).connect(v.out);
  src.start(at, Math.random() * 0.03, length + 0.005);
  v.nodes.push(src, bp, env);
  v.sources.push(src);
}

// --- Recipes ------------------------------------------------------------------

/** Typewriter key barely touched: 6ms bandpassed noise + a 2.4kHz blip. */
function hoverTick(c: AudioContext, at: number) {
  const v = startVoice(c, 0.06, 0.03);
  const p = jitter(0.03);
  noiseBurst(c, v, 'bandpass', 3500 * p, 4, 1, at, 0.006);
  partial(c, v, 2400 * p, 0.5, at, 0.001, 0.01);
}

/** Small wooden block "tok": 950→550Hz sine sweep + a 4ms highpassed transient. */
function woodClick(c: AudioContext, at: number, pitch = 1, volume = 0.18) {
  const v = startVoice(c, volume, 0.06);
  const p = jitter(0.03) * pitch;
  const osc = partial(c, v, 950 * p, 1, at, 0.002, 0.04);
  osc.frequency.exponentialRampToValueAtTime(550 * p, at + 0.04);
  noiseBurst(c, v, 'highpass', 2000, 0.7, 0.6, at, 0.004);
}

const PENTATONIC_C6 = [1046.5, 1174.66, 1318.51, 1567.98, 1760];

/** Soft glockenspiel: a random C-major pentatonic note + an inharmonic 2.76× partial. */
function glockPing(c: AudioContext, at: number) {
  const v = startVoice(c, 0.08, 0.4);
  const f = PENTATONIC_C6[Math.floor(Math.random() * PENTATONIC_C6.length)] * jitter(0.03);
  partial(c, v, f, 1, at, 0.002, 0.35);
  partial(c, v, f * 2.76, 0.3, at, 0.002, 0.2);
}

/** Small brass bell: C7 + a 4.2× partial, 2ms attack, 450ms ring. */
function bellDing(c: AudioContext, at: number) {
  const v = startVoice(c, 0.1, 0.5);
  const f = 2093 * jitter(0.03);
  partial(c, v, f, 1, at, 0.002, 0.45);
  partial(c, v, f * 4.2, 0.2, at, 0.002, 0.25);
}

/** Rotary switch: two wood ticks 45ms apart, the second 15% lower. */
function switchClack(c: AudioContext, at: number) {
  woodClick(c, at, 1, 0.16);
  woodClick(c, at + 0.045, 0.85, 0.16);
}

const RECIPES = {
  tick: hoverTick,
  wood: (c: AudioContext, at: number) => woodClick(c, at),
  glock: glockPing,
  bell: bellDing,
  switch: switchClack,
  primary: (c: AudioContext, at: number) => {
    woodClick(c, at);
    glockPing(c, at + 0.01);
  },
} as const;

export type SoundName = keyof typeof RECIPES;
export const SOUND_NAMES = Object.keys(RECIPES) as SoundName[];

/**
 * Plays a sound if enabled and audio is unlocked; otherwise does nothing. A
 * context still resuming from the first gesture is fine: scheduled nodes start
 * as soon as it runs, so the very first click isn't lost.
 */
export function play(name: SoundName) {
  if (muted || !ctx || !input) return;
  try {
    RECIPES[name](ctx, ctx.currentTime + 0.002);
  } catch {
    // Never let audio break an interaction.
  }
}
