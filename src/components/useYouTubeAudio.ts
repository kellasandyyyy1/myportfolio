import * as React from 'react';

/**
 * Plays a playlist of YouTube videos as background audio through the
 * official IFrame Player API. Nothing loads until the visitor presses play:
 * the first toggle() fetches YouTube's script and builds an offscreen player,
 * so the page never makes YouTube requests (or sound) on its own.
 *
 * Tracks play in order and move on when one ends; repeat loops the list.
 * A track can start part-way in (`start`, in seconds).
 */

export interface Track {
  id: string;
  title: string;
  artist: string;
  /** Seconds into the video where the track begins. */
  start?: number;
}

export const trackArt = (t: Track) => `https://i.ytimg.com/vi/${t.id}/mqdefault.jpg`;
export const trackUrl = (t: Track) => `https://youtu.be/${t.id}${t.start ? `?t=${t.start}` : ''}`;

type YTPlayer = {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  loadVideoById(opts: { videoId: string; startSeconds?: number }): void;
  setVolume(volume: number): void;
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
};

type YTNamespace = {
  Player: new (
    el: HTMLElement,
    opts: {
      videoId: string;
      width?: number;
      height?: number;
      playerVars?: Record<string, number | string>;
      events?: {
        onReady?: (e: { target: YTPlayer }) => void;
        onStateChange?: (e: { data: number; target: YTPlayer }) => void;
        onError?: (e: { data: number }) => void;
      };
    },
  ) => YTPlayer;
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YTNamespace> | null = null;

function loadApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT) resolve(window.YT);
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = () => {
      apiPromise = null;
      reject(new Error('YouTube player failed to load'));
    };
    document.head.appendChild(script);
  });
  return apiPromise;
}

export type AudioStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error';

export function useYouTubeAudio(tracks: Track[]) {
  const [status, setStatus] = React.useState<AudioStatus>('idle');
  const [index, setIndex] = React.useState(0);
  const [current, setCurrent] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolumeState] = React.useState(70);
  const [loop, setLoop] = React.useState(false);
  const playerRef = React.useRef<YTPlayer | null>(null);
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  // The player's callbacks are bound once; they read live values from refs.
  const live = React.useRef({ index, loop, volume, tracks });
  live.current = { index, loop, volume, tracks };

  const track = tracks[index];

  /** Switch the player to a track and play it from the track's start. */
  const load = React.useCallback((i: number) => {
    const t = live.current.tracks[i];
    setIndex(i);
    setCurrent(t.start ?? 0);
    setDuration(0);
    const player = playerRef.current;
    if (!player) return;
    setStatus('loading');
    player.loadVideoById({ videoId: t.id, startSeconds: t.start ?? 0 });
  }, []);

  const create = React.useCallback(async () => {
    setStatus('loading');
    try {
      const YT = await loadApi();
      const t = live.current.tracks[live.current.index];
      // Offscreen host for the iframe; the visible UI is our own.
      const host = document.createElement('div');
      host.className = 'yt-audio-host';
      host.setAttribute('aria-hidden', 'true');
      const mount = document.createElement('div');
      host.appendChild(mount);
      document.body.appendChild(host);
      hostRef.current = host;
      playerRef.current = new YT.Player(mount, {
        videoId: t.id,
        width: 200,
        height: 200,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          playsinline: 1,
          rel: 0,
          fs: 0,
          iv_load_policy: 3,
          start: t.start ?? 0,
        },
        events: {
          onReady: (e) => {
            e.target.setVolume(live.current.volume);
            e.target.playVideo();
            setDuration(e.target.getDuration() || 0);
          },
          onStateChange: (e) => {
            // -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued
            if (e.data === 1) setStatus('playing');
            else if (e.data === 2) setStatus('paused');
            else if (e.data === 3) setStatus((s) => (s === 'playing' ? s : 'loading'));
            else if (e.data === 0) {
              // Next track; at the end of the list, loop or stop.
              const { index: i, loop: repeat, tracks: list } = live.current;
              if (i < list.length - 1) load(i + 1);
              else if (repeat) load(0);
              else setStatus('ended');
            }
            setDuration(e.target.getDuration() || 0);
          },
          onError: () => setStatus('error'),
        },
      });
    } catch {
      setStatus('error');
    }
  }, [load]);

  const toggle = React.useCallback(() => {
    const player = playerRef.current;
    if (!player) {
      void create();
      return;
    }
    if (status === 'playing') {
      player.pauseVideo();
    } else if (status === 'ended') {
      load(0);
    } else {
      player.playVideo();
    }
  }, [create, load, status]);

  /** Next track (wrapping), like Apple Music's skip. */
  const next = React.useCallback(() => {
    const { index: i, tracks: list } = live.current;
    const to = (i + 1) % list.length;
    if (playerRef.current) load(to);
    else setIndex(to);
  }, [load]);

  /** Back: restart the track if it's a few seconds in, otherwise the previous one. */
  const previous = React.useCallback(() => {
    const { index: i, tracks: list } = live.current;
    const t = list[i];
    const player = playerRef.current;
    if (player && player.getCurrentTime() - (t.start ?? 0) > 3) {
      player.seekTo(t.start ?? 0, true);
      setCurrent(t.start ?? 0);
      return;
    }
    const to = (i - 1 + list.length) % list.length;
    if (player) load(to);
    else setIndex(to);
  }, [load]);

  const seek = React.useCallback((seconds: number) => {
    const player = playerRef.current;
    if (!player) return;
    player.seekTo(seconds, true);
    setCurrent(seconds);
  }, []);

  const setVolume = React.useCallback((v: number) => {
    setVolumeState(v);
    playerRef.current?.setVolume(v);
  }, []);

  const toggleLoop = React.useCallback(() => setLoop((l) => !l), []);

  // Progress while playing.
  React.useEffect(() => {
    if (status !== 'playing') return;
    const id = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      setCurrent(player.getCurrentTime() || 0);
      setDuration(player.getDuration() || 0);
    }, 250);
    return () => window.clearInterval(id);
  }, [status]);

  // Tear down with the component.
  React.useEffect(
    () => () => {
      playerRef.current?.destroy();
      hostRef.current?.remove();
    },
    [],
  );

  return {
    status,
    track,
    index,
    count: tracks.length,
    current,
    duration,
    volume,
    loop,
    toggle,
    next,
    previous,
    seek,
    setVolume,
    toggleLoop,
    started: status !== 'idle',
  };
}

export const fmtTime = (s: number) => {
  if (!Number.isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
};
