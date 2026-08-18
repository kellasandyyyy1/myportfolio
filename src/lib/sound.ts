/**
 * Synthesized UI sounds — no audio files, everything generated with Web Audio.
 *
 * Design constraints:
 *  - The AudioContext is created lazily on the first play call, never on import,
 *    because browsers block audio until a user gesture.
 *  - Every function is fire-and-forget and swallows its own errors. Audio must
 *    never throw into a click handler or block navigation.
 *  - Nodes are disconnected on 'ended' so rapid repeated clicks don't leak.
 */

const MUTE_STORAGE_KEY = 'portfolio-sound-muted';

type MuteListener = (muted: boolean) => void;

let audioContext: AudioContext | null = null;
let contextUnavailable = false;
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

export function setMuted(next: boolean) {
  muted = next;
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, String(next));
  } catch {
    // Preference just won't survive a reload; in-memory state still applies.
  }
  listeners.forEach((listener) => listener(next));
}

export const toggleMuted = () => {
  setMuted(!muted);
  return muted;
};

/** Subscribe to mute changes. Returns an unsubscribe function. */
export function subscribeMuted(listener: MuteListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Returns a running AudioContext, creating it on first use and resuming it if
 * the autoplay policy started it suspended. Returns null if audio is
 * unavailable for any reason, which makes every play function a no-op.
 */
function getContext(): AudioContext | null {
  if (contextUnavailable) return null;

  try {
    if (!audioContext) {
      const Ctor = window.AudioContext ?? (window as unknown as {
        webkitAudioContext?: typeof AudioContext;
      }).webkitAudioContext;
      if (!Ctor) {
        contextUnavailable = true;
        return null;
      }
      audioContext = new Ctor();
    }

    // Chrome/Safari start the context suspended until a gesture. This runs as
    // part of the first play call rather than a separate init step.
    if (audioContext.state === 'suspended') {
      void audioContext.resume().catch(() => {});
    }

    return audioContext;
  } catch {
    contextUnavailable = true;
    return null;
  }
}

interface ToneOptions {
  type: OscillatorType;
  freq: number;
  /** Optional pitch bend target, reached at the end of the tone. */
  bendTo?: number;
  duration: number;
  peak: number;
  attack: number;
  /** Delay before this tone starts, for multi-note sounds. */
  offset?: number;
}

function tone(ctx: AudioContext, opts: ToneOptions) {
  const { type, freq, bendTo, duration, peak, attack, offset = 0 } = opts;
  const start = ctx.currentTime + offset;
  const end = start + duration;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (bendTo !== undefined) {
    // exponentialRamp cannot cross or reach zero, and both endpoints are
    // audible frequencies here, so this is safe.
    osc.frequency.exponentialRampToValueAtTime(bendTo, end);
  }

  // Ramp from a tiny non-zero floor: exponential ramps to exactly 0 are a
  // no-op, which is what produces the abrupt cutoff pop.
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.addEventListener('ended', () => {
    osc.disconnect();
    gain.disconnect();
  });

  osc.start(start);
  osc.stop(end);
}

/** Wraps a sound so mute, missing context, and any audio error are all no-ops. */
function sound(render: (ctx: AudioContext) => void) {
  return () => {
    if (muted) return;
    const ctx = getContext();
    if (!ctx) return;
    try {
      render(ctx);
    } catch {
      // Never let audio break an interaction.
    }
  };
}

/** Nav link click — barely audible, felt more than heard. */
export const playNavTick = sound((ctx) =>
  tone(ctx, { type: 'square', freq: 2000, duration: 0.028, peak: 0.04, attack: 0.002 })
);

/** Active section change — soft downward pitch bend. */
export const playTransition = sound((ctx) =>
  tone(ctx, { type: 'sine', freq: 500, bendTo: 350, duration: 0.09, peak: 0.06, attack: 0.005 })
);

/** Outbound link — two-note upward chirp. */
export const playExternalLink = sound((ctx) => {
  tone(ctx, { type: 'sine', freq: 600, duration: 0.015, peak: 0.05, attack: 0.002 });
  tone(ctx, { type: 'sine', freq: 900, duration: 0.015, peak: 0.05, attack: 0.002, offset: 0.016 });
});

/** Command palette open — crisper than the nav tick so the two are distinct. */
export const playPaletteOpen = sound((ctx) =>
  tone(ctx, { type: 'square', freq: 2400, duration: 0.015, peak: 0.05, attack: 0.001 })
);
