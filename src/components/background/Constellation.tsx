import { useMemo } from 'react';
import { useSvgId } from '../../hooks/useSvgId';
import { motion } from 'motion/react';
import { heartCurvePoint } from '../../utils/heart';
import { seeded } from '../../utils/random';
import './constellation.css';

export type ConstellationPhase = 'forming' | 'resting' | 'opening';

const POINTS = 15;

/** A distant heart drawn in stars that forms during the opening scene. */
export function Constellation({ phase, reduced }: { phase: ConstellationPhase; reduced: boolean }) {
  const id = useSvgId('constellation');
  const stars = useMemo(() => {
    const random = seeded(14);
    return Array.from({ length: POINTS }, (_, i) => {
      const t = (i / POINTS) * Math.PI * 2;
      const p = heartCurvePoint(t);
      return {
        x: 100 + p.x * 82 + (random() - 0.5) * 7,
        y: 96 + p.y * 82 + (random() - 0.5) * 7,
        r: 1.6 + random() * 2.2,
      };
    });
  }, []);

  const outline = `M ${stars.map((s) => `${s.x.toFixed(1)} ${s.y.toFixed(1)}`).join(' L ')} Z`;
  const draw = { duration: reduced ? 0 : 2.6, delay: reduced ? 0 : 1.1, ease: [0.65, 0, 0.35, 1] as const };

  const placement = {
    forming: { opacity: 1, scale: 1, y: '0%' },
    resting: { opacity: 0.55, scale: 0.82, y: '-16%' },
    opening: { opacity: 0, scale: 1.5, y: '-20%' },
  }[phase];

  return (
    <motion.div
      className="constellation"
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={placement}
      exit={{ opacity: 0, scale: 1.3, transition: { duration: 0.9 } }}
      transition={{ duration: reduced ? 0.2 : 1.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <svg viewBox="0 0 200 200">
        <defs>
          <radialGradient id={`${id}-star`}>
            <stop offset="0" stopColor="#FFF8F5" />
            <stop offset="0.35" stopColor="#FFB3CF" stopOpacity="0.9" />
            <stop offset="1" stopColor="#FF82B2" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-halo`}>
            <stop offset="0" stopColor="#FF82B2" stopOpacity="0.32" />
            <stop offset="1" stopColor="#FF82B2" stopOpacity="0" />
          </radialGradient>
        </defs>

        <motion.circle
          cx="100"
          cy="96"
          r="96"
          fill={`url(#${id}-halo)`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 3, delay: reduced ? 0 : 0.6 }}
        />

        <motion.path
          d={outline}
          fill="none"
          stroke="rgba(255, 210, 228, 0.42)"
          strokeWidth="0.6"
          strokeLinejoin="round"
          strokeDasharray="0.5 2.4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={draw}
        />

        {stars.map((star, i) => (
          <motion.g
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : draw.delay + (i / POINTS) * draw.duration, ease: 'backOut' }}
          >
            <circle className="constellation__star" cx={star.x} cy={star.y} r={star.r * 3} fill={`url(#${id}-star)`} style={{ animationDelay: `${(i % 5) * 0.7}s` }} />
          </motion.g>
        ))}
      </svg>
    </motion.div>
  );
}
