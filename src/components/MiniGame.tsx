import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUp, Check } from 'lucide-react';
import { valentineConfig } from '../config/valentine';
import { useEffects } from '../context/EffectsContext';
import { useSound } from '../context/SoundContext';
import { personalize } from '../utils/personalize';
import { Dialog } from './Dialog';
import { HeartShape } from './HeartShape';
import { PrimaryButton } from './PrimaryButton';
import { RichText } from './RichText';
import './mini-game.css';

const HEART_COLORS: Array<[string, string]> = [
  ['#FFB3CF', '#F04468'],
  ['#E3CCFF', '#B07CFF'],
  ['#FFE9B8', '#FF9E7A'],
];

/**
 * "Before you answer... one tiny challenge" — three floating hearts that each
 * hide a message. Entirely optional: the question above never waits on it.
 */
export function MiniGame({ onReturn }: { onReturn: () => void }) {
  const { miniGame } = valentineConfig;
  const effects = useEffects();
  const sound = useSound();
  const [found, setFound] = useState<number[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const heartRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const complete = found.length === miniGame.hearts.length;
  const card = active === null ? null : miniGame.hearts[active];
  const nextUnfound = miniGame.hearts.findIndex((_, i) => !found.includes(i) && i !== active);

  const open = (index: number) => {
    setActive(index);
    setFound((list) => (list.includes(index) ? list : [...list, index]));
    effects.burst('heartPop', heartRefs.current[index]);
    sound.play('pop');
  };

  const close = () => {
    if (active !== null && found.length === miniGame.hearts.length) {
      effects.burst('sparkles', heartRefs.current[active]);
      sound.play('chime');
    }
    setActive(null);
  };

  return (
    <section className="mini-game" id="mini-game" aria-labelledby="mini-game-title">
      <motion.div
        className="mini-game__intro"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="eyebrow">Optional side quest</p>
        <h2 id="mini-game-title" className="mini-game__title display">
          <RichText text={miniGame.title} />
        </h2>
        <p className="mini-game__subtitle">{personalize(miniGame.subtitle)}</p>
      </motion.div>

      <ul className="mini-game__hearts">
        {miniGame.hearts.map((heart, i) => {
          const isFound = found.includes(i);
          return (
            <motion.li
              key={heart.label}
              className="mini-game__item"
              initial={{ opacity: 0, y: 40, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ type: 'spring', stiffness: 160, damping: 16, delay: 0.15 * i }}
            >
              <span className="mini-heart__float" style={{ animationDelay: `${i * -1.3}s` }}>
                <motion.button
                  ref={(el) => {
                    heartRefs.current[i] = el;
                  }}
                  type="button"
                  className={`mini-heart ${isFound ? 'is-found' : ''}`}
                  onClick={() => open(i)}
                  aria-label={`Heart ${i + 1}: ${heart.label}${isFound ? ' (opened)' : ''}`}
                  whileHover={{ scale: 1.08, rotate: i === 1 ? 4 : -4 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <span className="mini-heart__glow" aria-hidden="true" />
                  <HeartShape className="mini-heart__shape" colors={HEART_COLORS[i]} />
                  <span className="mini-heart__number" aria-hidden="true">
                    {isFound ? <Check size={26} strokeWidth={3} /> : i + 1}
                  </span>
                </motion.button>
              </span>
              <span className="mini-heart__label" aria-hidden="true">
                {heart.label}
              </span>
            </motion.li>
          );
        })}
      </ul>

      <p className="mini-game__progress" aria-live="polite">
        {complete ? personalize(miniGame.completeMessage) : `${found.length} of ${miniGame.hearts.length} hearts discovered`}
      </p>

      <button type="button" className="text-button mini-game__return" onClick={onReturn}>
        <ArrowUp size={18} aria-hidden="true" />
        {complete ? 'Back to the big question' : 'Skip the challenge'}
      </button>

      <Dialog open={card !== null} onClose={close} labelledBy="mini-card-title" className="mini-card">
        {card && active !== null && (
          <>
            <motion.span
              className="mini-card__heart"
              aria-hidden="true"
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.1 }}
            >
              <HeartShape colors={HEART_COLORS[active]} />
            </motion.span>
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="mini-card__eyebrow">{personalize(card.title)}</p>
              <h3 id="mini-card-title" className="mini-card__message">
                {personalize(card.message)}
              </h3>
            </motion.div>
            <div className="mini-card__actions">
              {/* One persistent button (label changes) so keyboard focus is never dropped. */}
              <PrimaryButton
                size="small"
                data-autofocus
                onClick={() => {
                  if (nextUnfound !== -1) {
                    open(nextUnfound);
                  } else {
                    close();
                    onReturn();
                  }
                }}
              >
                {nextUnfound !== -1 ? `Open heart #${nextUnfound + 1}` : 'Take me to the question 💗'}
              </PrimaryButton>
              <button type="button" className="text-button mini-card__later" onClick={close}>
                Close
              </button>
            </div>
          </>
        )}
      </Dialog>
    </section>
  );
}
