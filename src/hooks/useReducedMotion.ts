import { useSyncExternalStore } from 'react';

function subscribeTo(query: string) {
  return (onChange: () => void) => {
    const list = window.matchMedia(query);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  };
}

const subscribers = new Map<string, (onChange: () => void) => () => void>();

export function useMediaQuery(query: string) {
  let subscribe = subscribers.get(query);
  if (!subscribe) {
    subscribe = subscribeTo(query);
    subscribers.set(query, subscribe);
  }
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** True when the visitor has asked their OS for less motion. */
export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/** Everything the animation layer needs to decide how lavish it can be. */
export function useMotionPreferences() {
  const reduced = useReducedMotion();
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)');
  const compact = useMediaQuery('(max-width: 640px), (pointer: coarse)');
  return { reduced, finePointer, compact };
}
