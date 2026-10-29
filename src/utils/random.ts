export const rand = (min: number, max: number) => min + Math.random() * (max - min);

export const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1));

export const pick = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Deterministic pseudo-random generator so decorative layouts stay stable across renders. */
export function seeded(seed: number) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

/**
 * Picks items from a pool without repeating until the pool is exhausted,
 * and never repeats the previous item across a reshuffle.
 */
export function createRotation<T>(items: readonly T[]) {
  let queue: T[] = [];
  let previous: T | undefined;
  return () => {
    if (queue.length === 0) {
      queue = [...items].sort(() => Math.random() - 0.5);
      if (queue.length > 1 && queue[0] === previous) queue.push(queue.shift() as T);
    }
    previous = queue.shift() as T;
    return previous;
  };
}
