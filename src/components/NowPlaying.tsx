import * as React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowSquareOut, FastForward, Pause, Play, Repeat, Rewind } from '@phosphor-icons/react';
import { fmtTime, type AudioStatus } from './useYouTubeAudio';

export const TRACK = {
  id: '6da5__GEito',
  title: 'Thinking About You',
  artist: 'Calvin Harris ft. Ayah Marar',
  art: 'https://i.ytimg.com/vi/6da5__GEito/mqdefault.jpg',
  url: 'https://youtu.be/6da5__GEito',
};

/** Apple Music's playing indicator: four bars bouncing out of step. */
export function EqBars({ playing, className = '' }: { playing: boolean; className?: string }) {
  return (
    <span className={`eq${playing ? ' is-playing' : ''} ${className}`} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

export interface NowPlayingProps {
  status: AudioStatus;
  current: number;
  duration: number;
  loop: boolean;
  onToggle: () => void;
  onSeek: (seconds: number) => void;
  onSkip: (delta: number) => void;
  onToggleLoop: () => void;
}

/**
 * Compact Now Playing, like the expanded Dynamic Island / lock-screen
 * player: small artwork with title and artist beside it, a thin scrubber
 * with times, and one row of controls.
 */
export function NowPlaying({ status, current, duration, loop, onToggle, onSeek, onSkip, onToggleLoop }: NowPlayingProps) {
  const reduceMotion = useReducedMotion();
  const playing = status === 'playing';
  const loading = status === 'loading';
  // While dragging, show the dragged time instead of the player's.
  const [scrub, setScrub] = React.useState<number | null>(null);
  const shown = scrub ?? current;
  const ready = duration > 0;
  const pct = ready ? Math.min(100, (shown / duration) * 100) : 0;
  const tap = reduceMotion ? undefined : { scale: 0.82 };
  const commit = () => {
    if (scrub !== null) onSeek(scrub);
    setScrub(null);
  };

  return (
    <div className="np">
      <div className="np-head">
        <motion.img
          src={TRACK.art}
          alt=""
          className="np-art"
          draggable={false}
          initial={false}
          animate={{ scale: playing || reduceMotion ? 1 : 0.9 }}
          transition={{ type: 'spring', visualDuration: 0.4, bounce: 0.3 }}
        />
        <div className="np-meta">
          <p className="np-title">{TRACK.title}</p>
          <p className="np-artist">{TRACK.artist}</p>
        </div>
        <EqBars playing={playing} className="np-eq" />
      </div>

      {status === 'error' ? (
        <p className="np-error">
          Can't play here right now.{' '}
          <a href={TRACK.url} target="_blank" rel="noopener noreferrer">
            Open on YouTube
          </a>
        </p>
      ) : (
        <>
          <div className="np-scrub">
            <span className="np-time">{fmtTime(shown)}</span>
            <input
              type="range"
              min={0}
              max={ready ? duration : 1}
              step={0.1}
              value={ready ? shown : 0}
              disabled={!ready}
              aria-label="Playback position"
              aria-valuetext={`${fmtTime(shown)} of ${fmtTime(duration)}`}
              style={{ '--p': `${pct}%` } as React.CSSProperties}
              onChange={(e) => setScrub(Number(e.target.value))}
              onPointerUp={commit}
              onKeyUp={commit}
            />
            <span className="np-time">{ready ? `-${fmtTime(duration - shown)}` : '--:--'}</span>
          </div>

          <div className="np-controls">
            <motion.button
              type="button"
              className={`np-btn np-side${loop ? ' is-on' : ''}`}
              onClick={onToggleLoop}
              aria-pressed={loop}
              aria-label="Repeat"
              whileTap={tap}
            >
              <Repeat size={15} weight="bold" />
            </motion.button>
            <motion.button
              type="button"
              className="np-btn"
              onClick={() => onSkip(-10)}
              disabled={!ready}
              aria-label="Back 10 seconds"
              whileTap={tap}
            >
              <Rewind size={20} weight="fill" />
            </motion.button>
            <motion.button
              type="button"
              className="np-btn np-play"
              onClick={onToggle}
              aria-label={playing ? 'Pause' : 'Play'}
              whileTap={tap}
            >
              {loading ? (
                <span className="np-spinner" aria-hidden="true" />
              ) : playing ? (
                <Pause size={24} weight="fill" />
              ) : (
                <Play size={24} weight="fill" />
              )}
            </motion.button>
            <motion.button
              type="button"
              className="np-btn"
              onClick={() => onSkip(10)}
              disabled={!ready}
              aria-label="Forward 10 seconds"
              whileTap={tap}
            >
              <FastForward size={20} weight="fill" />
            </motion.button>
            <a
              className="np-btn np-side"
              href={TRACK.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open on YouTube"
              title="Open on YouTube"
            >
              <ArrowSquareOut size={15} weight="bold" />
            </a>
          </div>
        </>
      )}
    </div>
  );
}
