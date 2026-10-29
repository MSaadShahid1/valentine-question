/** Classic heart drawn in a 100×100 box, used for SVG artwork and canvas particles alike. */
export const HEART_PATH =
  'M50 89 C50 89 6 61 6 33 C6 18 17 8 30.5 8 C39.5 8 46.5 13 50 21 C53.5 13 60.5 8 69.5 8 C83 8 94 18 94 33 C94 61 50 89 50 89 Z';

let cached: Path2D | null = null;

/** Heart path for canvas drawing, centred on the origin and spanning roughly -50…50. */
export function heartPath2D(): Path2D {
  if (!cached) {
    const base = new Path2D(HEART_PATH);
    cached = new Path2D();
    cached.addPath(base, new DOMMatrix().translate(-50, -50));
  }
  return cached;
}

/** Points along a heart outline (parametric), normalised to roughly -1…1. */
export function heartCurvePoint(t: number) {
  const x = 16 * Math.sin(t) ** 3;
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return { x: x / 17, y: -y / 17 };
}
