import { useEffect, useState } from 'react';
import { isMuted, subscribeMuted, toggleMuted } from './sound';

/**
 * Reads the module-level mute state and re-renders on change. Backed by a
 * subscription rather than a context so any component can use it without a
 * provider, and every subscriber stays in sync.
 */
export function useSoundMuted(): [boolean, () => boolean] {
  const [muted, setMuted] = useState(isMuted);

  useEffect(() => subscribeMuted(setMuted), []);

  return [muted, toggleMuted];
}
