import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { QuizOption, QuizQuestion } from '../../config/valentine';
import { personalize } from '../../utils/personalize';
import { PrimaryButton } from '../PrimaryButton';
import { TeddyCharacter, type TeddyMood } from '../TeddyCharacter';

interface QuizCardProps {
  question: QuizQuestion;
  index: number;
  total: number;
  picked: number | null;
  onPick: (option: number, element: HTMLElement) => void;
  onNext: () => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;
const REACTION_MOODS: TeddyMood[] = ['celebrate', 'amazed', 'hopeful'];

function QuizReaction({ option, mood, isLast, onNext }: { option: QuizOption; mood: TeddyMood; isLast: boolean; onNext: () => void }) {
  const nextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const id = window.setTimeout(() => nextRef.current?.focus({ preventScroll: true }), 420);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <motion.div
      className="quiz-reaction"
      initial={{ opacity: 0, scale: 0.4, rotate: -10, y: 30 }}
      animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 260, damping: 14 }}
    >
      <div className="quiz-reaction__art" aria-hidden="true">
        <motion.span
          className="quiz-reaction__emoji"
          animate={{ y: [0, -16, 0], rotate: [0, -12, 12, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {option.emoji}
        </motion.span>
        <div className="quiz-reaction__teddy">
          <TeddyCharacter mood={mood} label="" />
        </div>
      </div>
      <p className="quiz-reaction__text" role="status">
        {personalize(option.reaction)}
      </p>
      <PrimaryButton ref={nextRef} onClick={onNext}>
        {isLast ? 'See our results 💘' : 'Next question →'}
      </PrimaryButton>
    </motion.div>
  );
}

/** One quiz question: answer cards that pop a personal reaction when picked. */
export function QuizCard({ question, index, total, picked, onPick, onNext }: QuizCardProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const id = window.setTimeout(() => headingRef.current?.focus({ preventScroll: true }), 650);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <motion.section
      className="quiz-card"
      aria-labelledby={`quiz-q-${index}`}
      initial={{ opacity: 0, x: 90, rotateY: -22, scale: 0.94 }}
      animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
      exit={{ opacity: 0, x: -90, rotateY: 22, scale: 0.94 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <p className="quiz-card__count">
        Question {index + 1} of {total}
      </p>
      <h2 id={`quiz-q-${index}`} ref={headingRef} tabIndex={-1} className="quiz-card__question display">
        {personalize(question.question)}
      </h2>

      <div className="quiz-card__stage">
        <div className={`quiz-card__options ${question.options.length === 2 ? 'is-pair' : ''}`} role="group" aria-label="Answers">
          {question.options.map((option, i) => {
            const isPicked = picked === i;
            const dimmed = picked !== null && !isPicked;
            return (
              <motion.button
                key={option.label}
                type="button"
                className={`quiz-option ${isPicked ? 'is-picked' : ''}`}
                aria-pressed={isPicked}
                disabled={picked !== null}
                onClick={(event) => onPick(i, event.currentTarget)}
                initial={{ opacity: 0, y: 40, scale: 0.85 }}
                // Once an answer is picked the reaction card takes over this space, so every tile bows out.
                animate={{ opacity: picked === null ? 1 : 0, y: 0, scale: isPicked ? 1.08 : dimmed ? 0.9 : 1 }}
                transition={picked === null ? { type: 'spring', stiffness: 190, damping: 15, delay: 0.25 + i * 0.09 } : { duration: 0.35 }}
                whileHover={picked === null ? { y: -7, rotate: i % 2 ? 1.6 : -1.6, scale: 1.03 } : undefined}
                whileTap={picked === null ? { scale: 0.94 } : undefined}
              >
                <span className="quiz-option__emoji" aria-hidden="true">
                  {option.emoji}
                </span>
                <span className="quiz-option__label">{personalize(option.label)}</span>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {picked !== null && (
            <QuizReaction
              key="reaction"
              option={question.options[picked]}
              mood={REACTION_MOODS[index % REACTION_MOODS.length]}
              isLast={index === total - 1}
              onNext={onNext}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
