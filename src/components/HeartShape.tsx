import type { SVGProps } from 'react';
import { useSvgId } from '../hooks/useSvgId';
import { HEART_PATH } from '../utils/heart';

interface HeartShapeProps extends SVGProps<SVGSVGElement> {
  /** Gradient stops from top-left to bottom-right. */
  colors?: [string, string];
  gloss?: boolean;
}

/** A glossy vector heart used across the site (decorative — always aria-hidden). */
export function HeartShape({ colors = ['#FF9CC2', '#F04468'], gloss = true, ...props }: HeartShapeProps) {
  const id = useSvgId('heart');
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" {...props}>
      <defs>
        <linearGradient id={`${id}-fill`} x1="0.15" y1="0.05" x2="0.85" y2="0.95">
          <stop offset="0" stopColor={colors[0]} />
          <stop offset="1" stopColor={colors[1]} />
        </linearGradient>
        <radialGradient id={`${id}-gloss`} cx="0.32" cy="0.28" r="0.4">
          <stop offset="0" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d={HEART_PATH} fill={`url(#${id}-fill)`} />
      {gloss && <path d={HEART_PATH} fill={`url(#${id}-gloss)`} />}
    </svg>
  );
}
