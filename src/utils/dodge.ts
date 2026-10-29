import { rand } from './random';

export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface Point {
  x: number;
  y: number;
}

interface DodgeInput {
  /** Where the button sits with a zero offset (its natural layout slot). */
  home: Box;
  /** The button's current offset from home. */
  offset: Point;
  /** Area the button must stay inside (already inset for safety margins). */
  bounds: Box;
  /** Areas the button must never cover (e.g. the YES button). */
  avoid: Box[];
  /** Pointer position to run away from, if known. */
  pointer?: Point;
  minDistance: number;
  maxDistance: number;
}

const intersects = (a: Box, b: Box) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

const inside = (a: Box, b: Box) => a.left >= b.left && a.right <= b.right && a.top >= b.top && a.bottom <= b.bottom;

export const inflate = (box: Box, by: number): Box => ({
  left: box.left - by,
  top: box.top - by,
  right: box.right + by,
  bottom: box.bottom + by,
});

export const intersectBoxes = (a: Box, b: Box): Box => ({
  left: Math.max(a.left, b.left),
  top: Math.max(a.top, b.top),
  right: Math.min(a.right, b.right),
  bottom: Math.min(a.bottom, b.bottom),
});

/** Distance from a point to the nearest edge of a box (0 when inside). */
export function distanceToBox(point: Point, box: Box) {
  const dx = Math.max(box.left - point.x, 0, point.x - box.right);
  const dy = Math.max(box.top - point.y, 0, point.y - box.bottom);
  return Math.hypot(dx, dy);
}

/**
 * Finds a new, nearby offset for the runaway button. Candidates are sampled
 * around the current position, biased away from the pointer, and rejected if
 * they leave the safe bounds or overlap anything in `avoid`. Falls back to the
 * home slot (or staying put) so the button can never be lost.
 */
export function findDodgeOffset({ home, offset, bounds, avoid, pointer, minDistance, maxDistance }: DodgeInput): Point {
  const width = home.right - home.left;
  const height = home.bottom - home.top;
  const homeCenter = { x: home.left + width / 2, y: home.top + height / 2 };
  const current = { x: homeCenter.x + offset.x, y: homeCenter.y + offset.y };
  // A finger resting on the button gives no useful direction, so pick one at random.
  const pointerOnButton = pointer && Math.abs(pointer.x - current.x) <= width / 2 && Math.abs(pointer.y - current.y) <= height / 2;
  const awayAngle = pointer && !pointerOnButton ? Math.atan2(current.y - pointer.y, current.x - pointer.x) : rand(0, Math.PI * 2);

  const boxAt = (center: Point): Box => ({
    left: center.x - width / 2,
    top: center.y - height / 2,
    right: center.x + width / 2,
    bottom: center.y + height / 2,
  });
  const isSafe = (box: Box) => inside(box, bounds) && !avoid.some((zone) => intersects(box, zone));

  const candidates: Array<{ angle: number; distance: number }> = [];
  // Random jumps, mostly away from the pointer...
  for (let i = 0; i < 32; i += 1) {
    const spread = i < 20 ? Math.PI * 0.55 : Math.PI;
    candidates.push({ angle: awayAngle + rand(-spread, spread), distance: rand(minDistance, maxDistance) });
  }
  // ...plus a fixed ring of directions so cramped layouts (narrow phones) always find the free side.
  for (let k = 0; k < 16; k += 1) {
    for (const factor of [1, 0.7, 0.45]) {
      candidates.push({ angle: (k / 16) * Math.PI * 2, distance: ((minDistance + maxDistance) / 2) * factor });
    }
  }

  let best: { center: Point; score: number } | null = null;
  for (const { angle, distance } of candidates) {
    const center = { x: current.x + Math.cos(angle) * distance, y: current.y + Math.sin(angle) * distance };
    if (distance < 24 || !isSafe(boxAt(center))) continue;

    const fromPointer = pointer ? Math.hypot(center.x - pointer.x, center.y - pointer.y) : distance;
    const fromHome = Math.hypot(center.x - homeCenter.x, center.y - homeCenter.y);
    const score = fromPointer - fromHome * 0.35 + rand(0, 18);
    if (!best || score > best.score) best = { center, score };
  }

  if (best) return { x: best.center.x - homeCenter.x, y: best.center.y - homeCenter.y };

  // Nothing safe nearby: go home unless the pointer is sitting right on it.
  const homeBusy = pointer ? distanceToBox(pointer, inflate(home, 12)) === 0 : false;
  if (!homeBusy && isSafe(home)) return { x: 0, y: 0 };
  return offset;
}
