import { useRef, useState } from 'react';
import { valentineConfig } from '../config/valentine';
import { useEffects } from '../context/EffectsContext';
import { useSound } from '../context/SoundContext';
import { LoveLetter } from '../components/LoveLetter';
import { PrimaryButton } from '../components/PrimaryButton';
import { SceneTransition } from '../components/SceneTransition';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useSceneFocus } from '../hooks/useSceneFocus';
import { useTimers } from '../hooks/useTimers';
import { personalize } from '../utils/personalize';

/** Scene 3 — the love letter that sets up the big question. */
export function LetterScene({ onContinue }: { onContinue: () => void }) {
  const { letter } = valentineConfig.intro;
  const [leaving, setLeaving] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const effects = useEffects();
  const sound = useSound();
  const reduced = useReducedMotion();
  const later = useTimers();
  useSceneFocus(headingRef, 700);

  const reveal = () => {
    if (leaving) return;
    setLeaving(true);
    effects.flash('hearts', buttonRef.current);
    effects.burst('heartPop', buttonRef.current);
    sound.play('whoosh');
    sound.play('sparkle');
    later(onContinue, reduced ? 150 : 480);
  };

  return (
    <SceneTransition className="scene--letter" labelledBy="letter-heading" style="rise">
      <div className="scene__center">
        <LoveLetter ref={headingRef} headingLevel="h1" headingId="letter-heading" greeting={letter.greeting} paragraphs={letter.paragraphs} delay={0.9}>
          <PrimaryButton ref={buttonRef} onClick={reveal} disabled={leaving}>
            {personalize(letter.cta)}
          </PrimaryButton>
        </LoveLetter>
      </div>
    </SceneTransition>
  );
}
