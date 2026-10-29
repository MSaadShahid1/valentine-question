import { useEffect, useRef, type PointerEvent } from 'react';
import { motion } from 'motion/react';
import { ArrowDown } from 'lucide-react';
import { valentineConfig } from '../config/valentine';
import { useEffects } from '../context/EffectsContext';
import { useSound } from '../context/SoundContext';
import { Coupons } from '../components/Coupons';
import { FinaleActions } from '../components/FinaleActions';
import { PinkyPromise } from '../components/PinkyPromise';
import { Gallery } from '../components/Gallery';
import { HeartShape } from '../components/HeartShape';
import { LoveLetter } from '../components/LoveLetter';
import { SceneTransition } from '../components/SceneTransition';
import { SplitText } from '../components/SplitText';
import { TeddyCharacter } from '../components/TeddyCharacter';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useSceneFocus } from '../hooks/useSceneFocus';
import { useTimers } from '../hooks/useTimers';
import { personalize } from '../utils/personalize';

/**
 * After YES: a sunrise celebration, then the final letter, a toolkit of
 * little interactions, and the optional gallery. Everything stays beautiful
 * after the confetti settles — nothing depends on the burst.
 */
export function CelebrationScene({ onReplay }: { onReplay: () => void }) {
  const { celebration, finalLetter, features, endingMessage } = valentineConfig;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const letterRef = useRef<HTMLElement>(null);
  const effects = useEffects();
  const sound = useSound();
  const reduced = useReducedMotion();
  const later = useTimers();
  useSceneFocus(headingRef, 600);

  // The arrival show — runs once when the scene appears (sound is read through a ref
  // so toggling it mid-show doesn't restart the fireworks).
  const soundRef = useRef(sound);
  soundRef.current = sound;
  useEffect(() => {
    later(() => effects.burst('heartRain', null), reduced ? 0 : 250);
    later(() => effects.burst('cannons', null), reduced ? 0 : 450);
    later(() => soundRef.current.play('sparkle'), 700);
    if (!reduced) later(() => effects.burst('fireworks', null), 1300);
  }, [effects, later, reduced]);

  const getTeddy = () => heroRef.current?.querySelector<SVGSVGElement>('svg[data-teddy-svg]') ?? null;

  // Tap or click anywhere that isn't a control and hearts pop out of it.
  const popHearts = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest('button, a, [role="dialog"], input')) return;
    effects.burst('heartPop', { x: event.clientX, y: event.clientY });
    soundRef.current.play('pop');
  };

  return (
    <SceneTransition className="scene--celebration" labelledBy="celebration-heading" style="bloom">
      <div className="celebration" onPointerDown={popHearts}>
        <section className="celebration-hero" ref={heroRef} aria-labelledby="celebration-heading">
          <motion.div
            className="celebration-hero__halo"
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 50, damping: 12, delay: 0.2 }}
          >
            <span className="celebration-hero__rays" />
            <HeartShape className="celebration-hero__big-heart" colors={['#FFF8F5', '#FF82B2']} />
          </motion.div>

          <motion.div
            className="celebration-hero__teddy"
            initial={{ opacity: 0, scale: 0.5, y: 60 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 11, delay: 0.35 }}
          >
            <TeddyCharacter mood="celebrate" label="The teddy bear is doing a happy dance" className="teddy--on-light" />
          </motion.div>

          <h1 id="celebration-heading" ref={headingRef} tabIndex={-1} className="celebration-hero__title display">
            <SplitText text={celebration.headline} delay={0.7} stagger={0.14} />
          </h1>

          <motion.p
            className="celebration-hero__sub"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: reduced ? 0.2 : 1.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {personalize(celebration.subheading)}
          </motion.p>

          <motion.p
            className="celebration-hero__status"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 14, delay: reduced ? 0.3 : 2.1 }}
          >
            {personalize(celebration.status)}
          </motion.p>

          <motion.button
            type="button"
            className="scroll-cue"
            onClick={() => letterRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: reduced ? 0.4 : 2.8 }}
          >
            Read your letter
            <ArrowDown size={18} aria-hidden="true" className="scroll-cue__arrow" />
          </motion.button>
        </section>

        <section className="celebration-letter" ref={letterRef} aria-labelledby="final-letter-heading">
          <LoveLetter
            headingId="final-letter-heading"
            greeting={finalLetter.greeting}
            paragraphs={[...finalLetter.paragraphs, ...finalLetter.relationshipMessages]}
            signOff={finalLetter.signOff}
            signature={finalLetter.signature}
            reveal="view"
            delay={0.2}
          />
        </section>

        <FinaleActions onReplay={onReplay} getTeddy={getTeddy} />

        <PinkyPromise />

        <Coupons />

        {features.gallery && <Gallery />}

        <footer className="celebration__footer">
          <HeartShape className="celebration__footer-heart" colors={['#FF9CC2', '#E0306A']} />
          <p>{personalize(endingMessage)}</p>
        </footer>
      </div>
    </SceneTransition>
  );
}
