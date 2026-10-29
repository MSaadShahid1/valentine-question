import type { CSSProperties } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FLASH_DURATION, useFlashes, type Flash } from '../context/EffectsContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { HeartShape } from './HeartShape';
import './transition-flash.css';

const RING = Array.from({ length: 10 }, (_, i) => (i / 10) * Math.PI * 2);

function FlashLayer({ flash, reduced }: { flash: Flash; reduced: boolean }) {
  const seconds = FLASH_DURATION[flash.kind] / 1000;
  const isYes = flash.kind === 'yes';
  const origin = `${flash.origin.x}px ${flash.origin.y}px`;

  if (reduced) {
    return (
      <motion.div
        className={`flash__glow flash__glow--${flash.kind}`}
        style={{ '--origin': origin } as CSSProperties}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.7, 0] }}
        transition={{ duration: seconds, times: [0, 0.4, 1] }}
      />
    );
  }

  return (
    <>
      <motion.div
        className={`flash__glow flash__glow--${flash.kind}`}
        style={{ '--origin': origin } as CSSProperties}
        initial={{ opacity: 0 }}
        animate={{ opacity: isYes ? [0, 0.35, 1, 0] : [0, 0.85, 0] }}
        transition={{ duration: seconds, times: isYes ? [0, 0.25, 0.5, 1] : [0, 0.4, 1], ease: 'easeInOut' }}
      />
      {isYes && (
        <motion.div
          className="flash__rays"
          style={{ left: flash.origin.x, top: flash.origin.y }}
          initial={{ opacity: 0, scale: 0.4, rotate: 0 }}
          animate={{ opacity: [0, 0.9, 0], scale: [0.4, 1.4, 1.8], rotate: 40 }}
          transition={{ duration: seconds, ease: 'easeOut' }}
        />
      )}
      <motion.div
        className="flash__heart"
        style={{ left: flash.origin.x, top: flash.origin.y }}
        initial={{ scale: 0.1, opacity: 0 }}
        animate={{ scale: isYes ? [0.1, 1, 22] : [0.1, 14], opacity: isYes ? [0, 1, 0] : [0.95, 0] }}
        transition={{ duration: seconds * 0.85, times: isYes ? [0, 0.35, 1] : [0, 1], ease: [0.7, 0, 0.84, 0] }}
      >
        <HeartShape colors={isYes ? ['#FFE1EA', '#FF5C8A'] : ['#FFB3CF', '#F04468']} />
      </motion.div>
      {RING.map((angle, i) => (
        <motion.div
          key={i}
          className="flash__mini"
          style={{ left: flash.origin.x, top: flash.origin.y }}
          initial={{ x: 0, y: 0, scale: 0.2, opacity: 0 }}
          animate={{
            x: Math.cos(angle) * (isYes ? 420 : 300),
            y: Math.sin(angle) * (isYes ? 420 : 300),
            scale: [0.2, 1.2, 0.6],
            opacity: [0, 1, 0],
            rotate: (angle * 180) / Math.PI + 90,
          }}
          transition={{ duration: seconds * 0.8, ease: [0.22, 1, 0.36, 1], delay: isYes ? 0.15 : 0 }}
        >
          <HeartShape colors={i % 2 ? ['#FFE5A0', '#FF82B2'] : ['#FFB3CF', '#F04468']} />
        </motion.div>
      ))}
    </>
  );
}

/** Full-screen cinematic flash used between scenes. Rendered above everything, never interactive. */
export function TransitionFlash() {
  const flashes = useFlashes();
  const reduced = useReducedMotion();
  return (
    <div className="flash" aria-hidden="true">
      <AnimatePresence>
        {flashes.map((flash) => (
          <motion.div key={flash.id} className="flash__item" exit={{ opacity: 0, transition: { duration: 0.3 } }}>
            <FlashLayer flash={flash} reduced={reduced} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
