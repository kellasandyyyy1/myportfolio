import * as React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowSquareOut, Pause, Play, Repeat, SkipBack, SkipForward } from '@phosphor-icons/react';
import { fmtTime, trackArt, trackUrl, type AudioStatus, type Track } from './useYouTubeAudio';

/** The playlist, in play order. `start` skips into a video (seconds). */
export const PLAYLIST: Track[] = [
  { id: '6da5__GEito', title: 'Thinking About You', artist: 'Calvin Harris ft. Ayah Marar' },
  { id: 'aWUWC21_HE8', title: 'Thinkin Bout You (Live on SNL)', artist: 'Frank Ocean', start: 81 },
  { id: '8Ee4QjCEHHc', title: 'Slide', artist: 'Calvin Harris ft. Frank Ocean & Migos' },
];

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
  track: Track;
  index: number;
  count: number;
  current: number;
  duration: number;
  loop: boolean;
  onToggle: () => void;
  onSeek: (seconds: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleLoop: () => void;
}

/**
 * Compact Now Playing, like the expanded Dynamic Island / lock-screen
 * player: small artwork with title and artist beside it, a thin scrubber
 * with times, and one row of controls. Changing track slides the artwork
 * and titles over in the direction of travel.
 */
export function NowPlaying({
  status,
  track,
  index,
  count,
  current,
  duration,
  loop,
  onToggle,
  onSeek,
  onNext,
  onPrevious,
  onToggleLoop,
}: NowPlayingProps) {
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

  // Slide direction follows the skip: forward slides left, back slides right.
  const lastIndex = React.useRef(index);
  const dir = index === lastIndex.current ? 1 : index > lastIndex.current || (lastIndex.current === count - 1 && index === 0) ? 1 : -1;
  React.useEffect(() => {
    lastIndex.current = index;
  }, [index]);
  const slide = {
    initial: (d: number) => (reduceMotion ? { opacity: 0 } : { opacity: 0, x: d * 24 }),
    animate: { opacity: 1, x: 0 },
    exit: (d: number) => (reduceMotion ? { opacity: 0 } : { opacity: 0, x: d * -24 }),
  };

  return (
    <div className="np">
      <div className="np-head">
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.div
            key={track.id}
            className="np-head-swap"
            custom={dir}
            variants={slide}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: 'spring', visualDuration: 0.35, bounce: 0.1 }}
          >
            <motion.img
              src={trackArt(track)}
              alt=""
              className="np-art"
              draggable={false}
              initial={false}
              animate={{ scale: playing || reduceMotion ? 1 : 0.9 }}
              transition={{ type: 'spring', visualDuration: 0.4, bounce: 0.3 }}
            />
            <div className="np-meta">
              <p className="np-title">{track.title}</p>
              <p className="np-artist">{track.artist}</p>
            </div>
          </motion.div>
        </AnimatePresence>
        <EqBars playing={playing} className="np-eq" />
      </div>

      {status === 'error' ? (
        <p className="np-error">
          Can't play here right now.{' '}
          <a href={trackUrl(track)} target="_blank" rel="noopener noreferrer">
            Open on YouTube
          </a>
          {count > 1 && (
            <>
              {' · '}
              <button type="button" className="np-error-next" onClick={onNext}>
                Next song
              </button>
            </>
          )}
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
              aria-label="Repeat playlist"
              title="Repeat"
              whileTap={tap}
            >
              <Repeat size={15} weight="bold" />
            </motion.button>
            <motion.button
              type="button"
              className="np-btn"
              onClick={onPrevious}
              aria-label="Previous song"
              whileTap={tap}
            >
              <SkipBack size={20} weight="fill" />
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
              onClick={onNext}
              aria-label="Next song"
              whileTap={tap}
            >
              <SkipForward size={20} weight="fill" />
            </motion.button>
            <a
              className="np-btn np-side"
              href={trackUrl(track)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open on YouTube"
              title="Open on YouTube"
            >
              <ArrowSquareOut size={15} weight="bold" />
            </a>
          </div>
          <p className="np-queue" aria-live="polite">
            {index + 1} of {count}
          </p>
        </>
      )}
    </div>
  );
}
