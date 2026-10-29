import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { valentineConfig } from '../config/valentine';
import { useEffects } from '../context/EffectsContext';
import { useSound } from '../context/SoundContext';
import { HeartShape } from '../components/HeartShape';
import { PrimaryButton } from '../components/PrimaryButton';
import { RichText } from '../components/RichText';
import { SceneTransition } from '../components/SceneTransition';
import { TeddyCharacter } from '../components/TeddyCharacter';
import { LoveMeter } from '../components/quiz/LoveMeter';
import { QuizCard } from '../components/quiz/QuizCard';
import { useSceneFocus } from '../hooks/useSceneFocus';
import { useTimers } from '../hooks/useTimers';
import { personalize, plainText } from '../utils/personalize';
import '../components/quiz/quiz.css';

/**
 * The love quiz between the letter and the big question. Every answer gets
 * its own pop-up reaction; the finale is a compatibility meter that breaks.
 * Step -1 is the intro, 0…n-1 are questions, n is the meter.
 */
export function QuizScene({ onDone }: { onDone: () => void }) {
  const { quiz } = valentineConfig;
  const total = quiz.questions.length;
  const [step, setStep] = useState(-1);
  const [picked, setPicked] = useState<number | null>(null);
  const [answered, setAnswered] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const effects = useEffects();
  const sound = useSound();
  const later = useTimers();
  useSceneFocus(headingRef, 600);

  const pick = (option: number, element: HTMLElement) => {
    if (picked !== null) return;
    const choice = quiz.questions[step].options[option];
    setPicked(option);
    setAnswered((n) => n + 1);
    effects.burst('emoji', element, { emoji: [choice.emoji, choice.emoji, '💗', '✨'] });
    sound.play('pop');
    later(() => sound.play('sparkle'), 160);
  };

  const next = () => {
    setPicked(null);
    setStep((s) => s + 1);
    sound.play('whoosh');
  };

  const inQuestions = step >= 0 && step < total;

  return (
    <SceneTransition className="scene--quiz" labelledBy="quiz-heading" style="rise">
      <div className="scene__center quiz">
        <h1 id="quiz-heading" ref={headingRef} tabIndex={-1} className="sr-only">
          {plainText(quiz.title)}
        </h1>

        <div className="quiz__frame">
          {inQuestions && (
            <div className="quiz-progress" aria-hidden="true">
              {quiz.questions.map((_, i) => {
                const done = i < answered;
                return (
                  <motion.span
                    key={i}
                    className={`quiz-progress__heart ${done ? 'is-done' : ''} ${i === step && !done ? 'is-current' : ''}`}
                    animate={done ? { scale: [1, 1.7, 1], rotate: [0, -15, 0] } : { scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <HeartShape colors={done ? ['#FF9CC2', '#F04468'] : ['rgba(255,225,234,0.35)', 'rgba(255,225,234,0.15)']} gloss={done} />
                  </motion.span>
                );
              })}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === -1 && (
              <motion.section
                key="intro"
                className="quiz-intro"
                aria-labelledby="quiz-intro-title"
                initial={{ opacity: 0, y: 40, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.95, filter: 'blur(6px)' }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="quiz-intro__teddy">
                  <TeddyCharacter mood="hopeful" label="The teddy bear is holding a quiz card, very excited" />
                </div>
                <p className="eyebrow">{personalize(quiz.eyebrow)}</p>
                <h2 id="quiz-intro-title" className="quiz-intro__title display">
                  <RichText text={quiz.title} />
                </h2>
                <p className="quiz-intro__text">{personalize(quiz.intro)}</p>
                <PrimaryButton onClick={next}>{personalize(quiz.startLabel)}</PrimaryButton>
              </motion.section>
            )}

            {inQuestions && (
              <QuizCard key={step} question={quiz.questions[step]} index={step} total={total} picked={picked} onPick={pick} onNext={next} />
            )}

            {step === total && <LoveMeter key="meter" onContinue={onDone} />}
          </AnimatePresence>

          {step < total && (
            <button type="button" className="text-button quiz__skip" onClick={onDone}>
              {personalize(quiz.skipLabel)} →
            </button>
          )}
        </div>
      </div>
    </SceneTransition>
  );
}
