import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { valentineConfig } from '../config/valentine';
import { SceneTransition } from '../components/SceneTransition';
import { SplitText } from '../components/SplitText';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useSceneFocus } from '../hooks/useSceneFocus';
import { useTimers } from '../hooks/useTimers';

/** Scene 1 — the universe awakens: stars, a forming constellation, and a whispered line. */
export function IntroScene({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();
  const later = useTimers();
  const headingRef = useRef<HTMLHeadingElement>(null);
  useSceneFocus(headingRef);

  useEffect(() => {
    later(onDone, reduced ? 2600 : 5800);
  }, [later, onDone, reduced]);

  return (
    <SceneTransition className="scene--intro" labelledBy="intro-heading" style="fade">
      <div className="scene__center intro">
        <motion.div
          className="intro__glow"
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduced ? 0.3 : 3.2, delay: reduced ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
        <h1 id="intro-heading" ref={headingRef} tabIndex={-1} className="intro__teaser display">
          <SplitText text={valentineConfig.intro.teaser} mode="chars" delay={reduced ? 0 : 1.9} stagger={reduced ? 0 : 0.045} />
        </h1>
        <motion.span
          className="intro__line"
          aria-hidden="true"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: reduced ? 0 : 1.6, delay: reduced ? 0 : 3.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </SceneTransition>
  );
}
