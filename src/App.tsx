import { Suspense, lazy, useCallback, useEffect, useReducer, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { SkipForward } from 'lucide-react';
import { valentineConfig } from './config/valentine';
import { EffectsProvider, useEffects } from './context/EffectsContext';
import { PointerProvider } from './context/PointerContext';
import { SoundProvider, useSound } from './context/SoundContext';
import { AnimatedBackground, type BackgroundMood } from './components/background/AnimatedBackground';
import { Constellation } from './components/background/Constellation';
import { AudioToggle } from './components/AudioToggle';
import { CursorGlow } from './components/CursorGlow';
import { ParticleCanvas } from './components/ParticleCanvas';
import { useMotionPreferences } from './hooks/useReducedMotion';
import { usePageVisibility } from './hooks/usePageVisibility';
import { EnvelopeScene } from './scenes/EnvelopeScene';
import { IntroScene } from './scenes/IntroScene';
import { LetterScene } from './scenes/LetterScene';
import { QuestionScene } from './scenes/QuestionScene';
import { QuizScene } from './scenes/QuizScene';
import { INTRO_STAGES, afterLetter, experienceReducer, initialExperience, type Stage } from './state/experience';
import './styles/chrome.css';
import './scenes/scenes.css';

// The post-YES finale (letter, toolkit, coupons, gallery, keepsake) is its own chunk.
const loadCelebration = () => import('./scenes/CelebrationScene');
const CelebrationScene = lazy(() => loadCelebration().then((module) => ({ default: module.CelebrationScene })));

const MOOD: Record<Stage, BackgroundMood> = {
  intro: 'night',
  envelope: 'night',
  letter: 'dusk',
  quiz: 'dusk',
  question: 'dusk',
  celebration: 'dawn',
};

function Experience() {
  const [{ stage, run }, dispatch] = useReducer(experienceReducer, initialExperience);
  const [frozen, setFrozen] = useState(false);
  const { reduced, compact, finePointer } = useMotionPreferences();
  const visible = usePageVisibility();
  const effects = useEffects();
  const sound = useSound();

  useEffect(() => {
    document.documentElement.toggleAttribute('data-page-hidden', !visible);
  }, [visible]);

  useEffect(() => {
    setFrozen(false);
    document.documentElement.classList.toggle('is-celebrating', stage === 'celebration');
    // Fetch the finale while the visitor reads the question, so YES never waits on the network.
    if (stage === 'question') void loadCelebration();
  }, [stage]);

  const go = useCallback((to: Stage) => dispatch({ type: 'go', to }), []);
  const toEnvelope = useCallback(() => go('envelope'), [go]);
  const toLetter = useCallback(() => go('letter'), [go]);
  const fromLetter = useCallback(() => go(afterLetter), [go]);
  const toQuestion = useCallback(() => go('question'), [go]);
  const toCelebration = useCallback(() => go('celebration'), [go]);

  const skipIntro = () => {
    sound.play('whoosh');
    go('question');
  };

  const replay = useCallback(() => {
    effects.clear();
    sound.play('whoosh');
    dispatch({ type: 'replay' });
  }, [effects, sound]);

  const key = `${stage}-${run}`;
  let scene;
  switch (stage) {
    case 'intro':
      scene = <IntroScene key={key} onDone={toEnvelope} />;
      break;
    case 'envelope':
      scene = <EnvelopeScene key={key} onOpened={toLetter} />;
      break;
    case 'letter':
      scene = <LetterScene key={key} onContinue={fromLetter} />;
      break;
    case 'quiz':
      scene = <QuizScene key={key} onDone={toQuestion} />;
      break;
    case 'question':
      scene = <QuestionScene key={key} onAccept={toCelebration} onFreeze={setFrozen} />;
      break;
    case 'celebration':
      scene = (
        <Suspense key={key} fallback={null}>
          <CelebrationScene onReplay={replay} />
        </Suspense>
      );
      break;
  }

  const inIntro = INTRO_STAGES.includes(stage);

  return (
    <>
      <AnimatedBackground mood={MOOD[stage]} frozen={frozen} revealStars={stage === 'intro'} reduced={reduced} compact={compact} />

      <AnimatePresence>
        {(stage === 'intro' || stage === 'envelope') && (
          <Constellation key={`constellation-${run}`} phase={stage === 'intro' ? 'forming' : 'resting'} reduced={reduced} />
        )}
      </AnimatePresence>

      <main className="experience">
        <AnimatePresence>{scene}</AnimatePresence>
      </main>

      <div className="chrome">
        <AnimatePresence>
          {inIntro && (
            <motion.button
              key="skip"
              type="button"
              className="btn btn--ghost btn--small chrome__skip"
              onClick={skipIntro}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 1.2, duration: 0.6 } }}
              exit={{ opacity: 0, y: -10 }}
            >
              Skip intro
              <SkipForward size={16} aria-hidden="true" />
            </motion.button>
          )}
        </AnimatePresence>
        <AudioToggle promptAllowed={stage === 'intro' || stage === 'envelope' || !valentineConfig.features.intro} />
      </div>

      {finePointer && !reduced && valentineConfig.features.cursorEffects && <CursorGlow />}
      <ParticleCanvas reduced={reduced} compact={compact} />
    </>
  );
}

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <SoundProvider available={valentineConfig.features.audio}>
        <EffectsProvider>
          <PointerProvider>
            <Experience />
          </PointerProvider>
        </EffectsProvider>
      </SoundProvider>
    </MotionConfig>
  );
}
