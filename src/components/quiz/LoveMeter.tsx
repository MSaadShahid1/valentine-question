import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'motion/react';
import { valentineConfig } from '../../config/valentine';
import { useEffects } from '../../context/EffectsContext';
import { useSound } from '../../context/SoundContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useSvgId } from '../../hooks/useSvgId';
import { HEART_PATH } from '../../utils/heart';
import { personalize } from '../../utils/personalize';
import { PrimaryButton } from '../PrimaryButton';

type Phase = 'measuring' | 'overload' | 'final';

const WAVE = 'M-100 0 Q-87.5 -5 -75 0 T-50 0 T-25 0 T0 0 T25 0 T50 0 T75 0 T100 0 T125 0 T150 0 T175 0 T200 0 V130 H-100 Z';

/**
 * The quiz finale: a heart fills with liquid to 100%, overloads, and breaks
 * the scale entirely — "∞%" — in a burst of hearts.
 */
export function LoveMeter({ onContinue }: { onContinue: () => void }) {
  const { meter } = valentineConfig.quiz;
  const id = useSvgId('meter');
  const [phase, setPhase] = useState<Phase>('measuring');
  const [value, setValue] = useState('0');
  const fill = useMotionValue(0);
  const liquidY = useTransform(fill, (f) => 94 - f * 90);
  const heartRef = useRef<HTMLDivElement>(null);
  const effects = useEffects();
  const sound = useSound();
  const reduced = useReducedMotion();
  // Read sound through a ref so toggling it mid-count doesn't restart the meter.
  const soundRef = useRef(sound);
  soundRef.current = sound;

  useEffect(() => {
    const sound = soundRef.current;
    let cancelled = false;
    const climb = animate(0, 100, {
      duration: reduced ? 0.6 : 3,
      ease: [0.35, 0, 0.15, 1],
      onUpdate: (v) => {
        setValue(String(Math.round(v)));
        fill.set(v / 100);
      },
    });
    let overload: ReturnType<typeof animate> | null = null;
    climb.then(() => {
      if (cancelled) return;
      setPhase('overload');
      sound.play('boop');
      overload = animate(100, 999, {
        duration: reduced ? 0.3 : 1.3,
        ease: 'easeIn',
        onUpdate: (v) => setValue(String(Math.round(v))),
      });
      overload.then(() => {
        if (cancelled) return;
        setPhase('final');
        setValue('∞');
        animate(fill, 1.12, { duration: 0.6 });
        effects.burst('celebration', heartRef.current);
        effects.burst('emoji', heartRef.current, { emoji: ['💘', '💖', '💯', '✨'] });
        effects.flash('hearts', heartRef.current);
        effects.shake();
        sound.play('confetti');
      });
    });
    return () => {
      cancelled = true;
      climb.stop();
      overload?.stop();
    };
  }, [effects, fill, reduced]);

  const title = phase === 'measuring' ? meter.title : phase === 'overload' ? meter.overloadTitle : meter.finalTitle;

  return (
    <motion.section
      className="meter"
      aria-labelledby="meter-title"
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="eyebrow">The results are in</p>
      <AnimatePresence mode="wait">
        <motion.h2
          key={phase}
          id="meter-title"
          className="meter__title display"
          aria-live="polite"
          initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.45 }}
        >
          {personalize(title)}
        </motion.h2>
      </AnimatePresence>

      <div ref={heartRef} className={`meter__heart meter__heart--${phase}`}>
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <defs>
            <clipPath id={`${id}-clip`}>
              <path d={HEART_PATH} />
            </clipPath>
            <linearGradient id={`${id}-liquid`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FF9CC2" />
              <stop offset="0.5" stopColor="#F04468" />
              <stop offset="1" stopColor="#B8124A" />
            </linearGradient>
            <radialGradient id={`${id}-gloss`} cx="0.3" cy="0.25" r="0.45">
              <stop offset="0" stopColor="#fff" stopOpacity="0.7" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path d={HEART_PATH} className="meter__shell" />
          <g clipPath={`url(#${id}-clip)`}>
            <motion.g style={{ y: liquidY }}>
              <path className="meter__wave meter__wave--back" d={WAVE} fill="#FFB3CF" opacity="0.55" />
              <path className="meter__wave" d={WAVE} fill={`url(#${id}-liquid)`} />
            </motion.g>
          </g>
          <path d={HEART_PATH} fill={`url(#${id}-gloss)`} />
          <path d={HEART_PATH} className="meter__outline" />
        </svg>
        <span className="meter__value" aria-hidden="true">
          {value}
          <small>%</small>
        </span>
        <span className="sr-only">{phase === 'final' ? 'Compatibility: infinite' : `Compatibility: ${value} percent`}</span>
      </div>

      <AnimatePresence>
        {phase === 'final' && (
          <motion.div
            className="meter__final"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="meter__message">{personalize(meter.message)}</p>
            <PrimaryButton onClick={onContinue}>{personalize(meter.continueLabel)}</PrimaryButton>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
