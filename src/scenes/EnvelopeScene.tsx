import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { valentineConfig } from '../config/valentine';
import { useEffects } from '../context/EffectsContext';
import { useSound } from '../context/SoundContext';
import { Envelope, type EnvelopeState } from '../components/Envelope';
import { SceneTransition } from '../components/SceneTransition';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useSceneFocus } from '../hooks/useSceneFocus';
import { useTimers } from '../hooks/useTimers';
import { personalize } from '../utils/personalize';

/** Scene 2 — a floating envelope that opens with a burst of paper hearts and a camera push-in. */
export function EnvelopeScene({ onOpened }: { onOpened: () => void }) {
  const { intro } = valentineConfig;
  const [state, setState] = useState<EnvelopeState>('closed');
  const [bright, setBright] = useState(false);
  const [pushIn, setPushIn] = useState(false);
  const envelopeRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const effects = useEffects();
  const sound = useSound();
  const reduced = useReducedMotion();
  const later = useTimers();
  useSceneFocus(headingRef);

  const open = () => {
    if (state !== 'closed') return;
    setState('opening');
    sound.play('open');
    later(() => {
      setBright(true);
      effects.burst('paperHearts', envelopeRef.current);
      effects.burst('emoji', envelopeRef.current, { emoji: ['💌', '💗', '✨', '💕'] });
    }, reduced ? 50 : 800);
    later(() => setPushIn(true), reduced ? 250 : 1800);
    later(onOpened, reduced ? 650 : 2350);
  };

  return (
    <SceneTransition className="scene--envelope" labelledBy="envelope-heading" style="zoom">
      <motion.div
        className={`scene__center envelope-scene ${bright ? 'is-bright' : ''}`}
        animate={pushIn ? { scale: 1.45, y: '-4%', opacity: 0 } : { scale: 1, y: '0%', opacity: 1 }}
        transition={{ duration: 0.85, ease: [0.55, 0, 0.75, 0.2] }}
      >
        <span className="envelope-scene__light" aria-hidden="true" />
        <h1 id="envelope-heading" ref={headingRef} tabIndex={-1} className="sr-only">
          A little envelope, just for you
        </h1>

        <div className="envelope-scene__stack">
          <motion.div
            className="envelope-scene__stage"
            initial={{ y: 90, opacity: 0, rotate: -8, scale: 0.85 }}
            animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 60, damping: 13, delay: 0.25 }}
          >
            <Envelope ref={envelopeRef} state={state} onOpen={open} letterLabel={personalize(intro.envelopeLabel)} />
          </motion.div>

          <motion.p
            className="envelope-scene__prompt display"
            initial={{ opacity: 0, y: 16 }}
            animate={state === 'closed' ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.8, delay: state === 'closed' ? 1.1 : 0, ease: [0.22, 1, 0.36, 1] }}
          >
            {personalize(intro.envelopePrompt)}
          </motion.p>
          <motion.p
            className="envelope-scene__hint"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: state === 'closed' ? 1 : 0 }}
            transition={{ duration: 0.8, delay: state === 'closed' ? 1.8 : 0 }}
          >
            {personalize(intro.envelopeHint)}
          </motion.p>
        </div>
      </motion.div>
    </SceneTransition>
  );
}
