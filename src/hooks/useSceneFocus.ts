import { useEffect, type RefObject } from 'react';

/**
 * Moves focus to a scene's heading when it appears so screen-reader and
 * keyboard users land in the new scene instead of on a removed element.
 */
export function useSceneFocus(ref: RefObject<HTMLElement | null>, delay = 120) {
  useEffect(() => {
    const id = window.setTimeout(() => ref.current?.focus({ preventScroll: true }), delay);
    return () => window.clearTimeout(id);
  }, [ref, delay]);
}
