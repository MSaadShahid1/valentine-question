import { useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useTransform, type AnimationPlaybackControls } from 'motion/react';
import { valentineConfig } from '../config/valentine';
import { useEffects } from '../context/EffectsContext';
import { useSound } from '../context/SoundContext';
import { useSvgId } from '../hooks/useSvgId';
import { HEART_PATH } from '../utils/heart';
import { personalize } from '../utils/personalize';
import { RichText } from './RichText';
import './pinky-promise.css';

const HOLD_SECONDS = 1.8;

/**
 * Press and hold the heart until it fills to seal a pinky promise. Keyboard
 * users can press Enter/Space once and it fills by itself.
 */
export function PinkyPromise() {
  const { promise } = valentineConfig;
  const id = useSvgId('promise');
  const [sealed, setSealed] = useState(false);
  const [holding, setHolding] = useState(false);
  const progress = useMotionValue(0);
  const fillY = useTransform(progress, (p) => 92 - p * 86);
  const glow = useTransform(progress, (p) => `drop-shadow(0 0 ${10 + p * 40}px rgba(255, 130, 178, ${0.35 + p * 0.6}))`);
  const controls = useRef<AnimationPlaybackControls | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const effects = useEffects();
  const sound = useSound();

  const seal = () => {
    setSealed(true);
    setHolding(false);
    effects.burst('fireworks', null);
    effects.burst('emoji', buttonRef.current, { emoji: ['🤞', '💗', '💍', '✨'] });
    effects.shake();
    sound.play('chime');
    navigator.vibrate?.(60);
  };

  const start = () => {
    if (sealed) return;
    setHolding(true);
    controls.current?.stop();
    controls.current = animate(progress, 1, {
      duration: HOLD_SECONDS * (1 - progress.get()),
      ease: 'linear',
      onComplete: seal,
    });
  };

  const release = () => {
    if (sealed || !holding) return;
    setHolding(false);
    controls.current?.stop();
    controls.current = animate(progress, 0, { duration: 0.45, ease: 'easeOut' });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) {
      event.preventDefault();
      if (sealed) return;
      setHolding(true);
      controls.current?.stop();
      controls.current = animate(progress, 1, { duration: HOLD_SECONDS, ease: 'easeInOut', onComplete: seal });
    }
  };

  return (
    <section className="promise" aria-labelledby="promise-title">
      <motion.div
        className="promise__intro"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="eyebrow finale__eyebrow">{personalize(promise.eyebrow)}</p>
        <h2 id="promise-title" className="promise__title display">
          <RichText text={promise.title} />
        </h2>
        <p className="promise__hint">{personalize(promise.hint)}</p>
      </motion.div>

      <motion.button
        ref={buttonRef}
        type="button"
        className={`promise__button ${holding ? 'is-holding' : ''} ${sealed ? 'is-sealed' : ''}`}
        aria-label={sealed ? 'Pinky promise sealed' : 'Press and hold to seal the pinky promise'}
        aria-pressed={sealed}
        onPointerDown={start}
        onPointerUp={release}
        onPointerLeave={release}
        onPointerCancel={release}
        onKeyDown={onKeyDown}
        onContextMenu={(event) => event.preventDefault()}
        style={{ filter: glow }}
        animate={sealed ? { scale: [1, 1.25, 1.05] } : holding ? { scale: 0.94, rotate: [0, -2, 2, -2, 0] } : { scale: 1, rotate: 0 }}
        transition={holding ? { rotate: { repeat: Infinity, duration: 0.3 }, scale: { duration: 0.3 } } : { duration: 0.6 }}
      >
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <defs>
            <clipPath id={`${id}-clip`}>
              <path d={HEART_PATH} />
            </clipPath>
            <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#FFB3CF" />
              <stop offset="0.5" stopColor="#F04468" />
              <stop offset="1" stopColor="#B8124A" />
            </linearGradient>
          </defs>
          <path d={HEART_PATH} fill="rgba(255, 255, 255, 0.55)" />
          <g clipPath={`url(#${id}-clip)`}>
            <motion.rect x="-10" width="120" height="120" fill={`url(#${id}-fill)`} style={{ y: fillY }} />
          </g>
          <path d={HEART_PATH} fill="none" stroke="#fff" strokeWidth="2" />
        </svg>
        <span className="promise__emoji" aria-hidden="true">
          {sealed ? '💗' : '🤞'}
        </span>
        <span className="promise__label" aria-hidden="true">
          {sealed ? 'Sealed!' : personalize(promise.holdLabel)}
        </span>
      </motion.button>

      <AnimatePresence>
        {sealed && (
          <motion.div
            className="promise__sealed"
            role="status"
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 14 }}
          >
            <p className="promise__sealed-title display">{personalize(promise.sealedTitle)}</p>
            <p className="promise__sealed-text">{personalize(promise.sealedMessage)}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
