import * as React from 'react';

/**
 * Plays a YouTube video as background audio through the official IFrame
 * Player API. Nothing loads until the visitor presses play: the first
 * toggle() fetches YouTube's script and builds an offscreen player, so the
 * page never makes YouTube requests (or sound) on its own.
 */

type YTPlayer = {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
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

export function useYouTubeAudio(videoId: string) {
  const [status, setStatus] = React.useState<AudioStatus>('idle');
  const [current, setCurrent] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolumeState] = React.useState(70);
  const [loop, setLoop] = React.useState(false);
  const loopRef = React.useRef(loop);
  loopRef.current = loop;
  const playerRef = React.useRef<YTPlayer | null>(null);
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const volumeRef = React.useRef(volume);
  volumeRef.current = volume;

  const create = React.useCallback(async () => {
    setStatus('loading');
    try {
      const YT = await loadApi();
      // Offscreen host for the iframe; the visible UI is our own.
      const host = document.createElement('div');
      host.className = 'yt-audio-host';
      host.setAttribute('aria-hidden', 'true');
      const mount = document.createElement('div');
      host.appendChild(mount);
      document.body.appendChild(host);
      hostRef.current = host;
      playerRef.current = new YT.Player(mount, {
        videoId,
        width: 200,
        height: 200,
        playerVars: { autoplay: 1, controls: 0, disablekb: 1, playsinline: 1, rel: 0, fs: 0, iv_load_policy: 3 },
        events: {
          onReady: (e) => {
            e.target.setVolume(volumeRef.current);
            e.target.playVideo();
            setDuration(e.target.getDuration() || 0);
          },
          onStateChange: (e) => {
            // -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued
            if (e.data === 1) setStatus('playing');
            else if (e.data === 2) setStatus('paused');
            else if (e.data === 0) {
              // Repeat: straight back to the top instead of stopping.
              if (loopRef.current) {
                e.target.seekTo(0, true);
                e.target.playVideo();
              } else {
                setStatus('ended');
              }
            }
            else if (e.data === 3) setStatus((s) => (s === 'playing' ? s : 'loading'));
            setDuration(e.target.getDuration() || 0);
          },
          onError: () => setStatus('error'),
        },
      });
    } catch {
      setStatus('error');
    }
  }, [videoId]);

  const toggle = React.useCallback(() => {
    const player = playerRef.current;
    if (!player) {
      void create();
      return;
    }
    if (status === 'playing') {
      player.pauseVideo();
    } else {
      if (status === 'ended') player.seekTo(0, true);
      player.playVideo();
    }
  }, [create, status]);

  const seek = React.useCallback((seconds: number) => {
    const player = playerRef.current;
    if (!player) return;
    player.seekTo(seconds, true);
    setCurrent(seconds);
  }, []);

  const skip = React.useCallback(
    (delta: number) => {
      const player = playerRef.current;
      if (!player) return;
      const to = Math.max(0, Math.min(player.getCurrentTime() + delta, (player.getDuration() || 0) - 0.5));
      seek(to);
    },
    [seek],
  );

  const setVolume = React.useCallback((v: number) => {
    setVolumeState(v);
    playerRef.current?.setVolume(v);
  }, []);

  // Progress while playing.
  React.useEffect(() => {
    if (status !== 'playing') return;
    const id = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      setCurrent(player.getCurrentTime() || 0);
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

  const toggleLoop = React.useCallback(() => setLoop((l) => !l), []);

  return {
    status,
    current,
    duration,
    volume,
    loop,
    toggle,
    seek,
    skip,
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
