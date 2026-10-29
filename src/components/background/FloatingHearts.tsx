import { useMemo, type CSSProperties } from 'react';
import { motion, useTransform } from 'motion/react';
import { usePointer } from '../../context/PointerContext';
import { seeded } from '../../utils/random';
import { HeartShape } from '../HeartShape';

interface FloatingHeartsProps {
  reduced: boolean;
  compact: boolean;
}

interface HeartSpec {
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  rotation: number;
  alpha: number;
  staticTop: number;
}

// Three depth layers: far hearts are small and faint, near hearts are larger and move more with the pointer.
const LAYERS = [
  { count: 7, size: [10, 18], alpha: [0.18, 0.32], duration: [26, 36], parallax: 6, colors: ['#C9A7FF', '#FF82B2'] as [string, string] },
  { count: 6, size: [18, 30], alpha: [0.28, 0.45], duration: [20, 28], parallax: 14, colors: ['#FF9CC2', '#F04468'] as [string, string] },
  { count: 4, size: [30, 48], alpha: [0.35, 0.55], duration: [16, 22], parallax: 28, colors: ['#FFB3CF', '#E0306A'] as [string, string] },
];

function buildLayer(layerIndex: number, count: number, seed: number): HeartSpec[] {
  const random = seeded(seed);
  const layer = LAYERS[layerIndex];
  const between = ([min, max]: number[]) => min + random() * (max - min);
  return Array.from({ length: count }, (_, i) => {
    const duration = between(layer.duration);
    return {
      left: ((i + random() * 0.8) / count) * 100,
      size: between(layer.size),
      duration,
      delay: -random() * duration,
      drift: (random() - 0.5) * 160,
      rotation: (random() - 0.5) * 40,
      alpha: between(layer.alpha),
      staticTop: 10 + random() * 80,
    };
  });
}

function HeartLayer({ index, reduced, compact }: { index: number; reduced: boolean; compact: boolean }) {
  const pointer = usePointer();
  const layer = LAYERS[index];
  const x = useTransform(pointer.x, (v) => v * -layer.parallax);
  const y = useTransform(pointer.y, (v) => v * -layer.parallax * 0.6);
  const count = compact ? Math.ceil(layer.count * 0.6) : layer.count;
  const hearts = useMemo(() => buildLayer(index, count, 101 + index * 37), [index, count]);

  return (
    <motion.div className="bg__heart-layer" style={{ x, y }}>
      {hearts.map((heart, i) => (
        <span
          key={i}
          className={reduced ? 'float-heart float-heart--static' : 'float-heart'}
          style={
            {
              left: `${heart.left}%`,
              width: heart.size,
              height: heart.size,
              top: reduced ? `${heart.staticTop}%` : undefined,
              '--dur': `${heart.duration}s`,
              '--delay': `${heart.delay}s`,
              '--drift': `${heart.drift}px`,
              '--rot': `${heart.rotation}deg`,
              '--alpha': heart.alpha,
            } as CSSProperties
          }
        >
          <HeartShape colors={layer.colors} gloss={index > 0} />
        </span>
      ))}
    </motion.div>
  );
}

/** Translucent hearts rising slowly through three parallax depths. */
export function FloatingHearts({ reduced, compact }: FloatingHeartsProps) {
  return (
    <div className="bg__hearts" aria-hidden="true">
      {LAYERS.map((_, index) => (
        <HeartLayer key={index} index={index} reduced={reduced} compact={compact} />
      ))}
    </div>
  );
}
