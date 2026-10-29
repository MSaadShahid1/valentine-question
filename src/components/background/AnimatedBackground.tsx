import { motion, useTransform } from 'motion/react';
import { usePointer } from '../../context/PointerContext';
import { FloatingHearts } from './FloatingHearts';
import { StarField } from './StarField';
import './background.css';

export type BackgroundMood = 'night' | 'dusk' | 'dawn';

interface AnimatedBackgroundProps {
  mood: BackgroundMood;
  /** Freeze ambient motion for a beat (the moment right after YES). */
  frozen?: boolean;
  revealStars: boolean;
  reduced: boolean;
  compact: boolean;
}

/**
 * The persistent sky behind every scene. Moods cross-fade between stacked
 * gradient layers so the whole universe can shift from midnight to sunrise.
 */
export function AnimatedBackground({ mood, frozen = false, revealStars, reduced, compact }: AnimatedBackgroundProps) {
  const pointer = usePointer();
  const lightX = useTransform(pointer.x, (v) => v * -18);
  const lightY = useTransform(pointer.y, (v) => v * -12);

  return (
    <div className="bg" data-mood={mood} data-frozen={frozen || undefined} aria-hidden="true">
      <div className="bg__base bg__base--night" />
      <div className="bg__base bg__base--dusk" />
      <div className="bg__base bg__base--dawn" />

      <motion.div className="bg__lights" style={{ x: lightX, y: lightY }}>
        <div className="bg__lights-set bg__lights-set--night">
          <span className="bg__blob bg__blob--pink" />
          <span className="bg__blob bg__blob--lavender" />
          <span className="bg__blob bg__blob--crimson" />
          <span className="bg__blob bg__blob--core" />
        </div>
        <div className="bg__lights-set bg__lights-set--dawn">
          <span className="bg__blob bg__blob--sun" />
          <span className="bg__blob bg__blob--peach" />
          <span className="bg__blob bg__blob--rose" />
          <span className="bg__rays" />
        </div>
      </motion.div>

      <StarField reveal={revealStars} reduced={reduced} compact={compact} />

      <div className="bg__haze">
        <span className="bg__cloud bg__cloud--1" />
        <span className="bg__cloud bg__cloud--2" />
        <span className="bg__cloud bg__cloud--3" />
      </div>

      <FloatingHearts reduced={reduced} compact={compact} />

      <div className="bg__grain" />
      <div className="bg__vignette" />
    </div>
  );
}
