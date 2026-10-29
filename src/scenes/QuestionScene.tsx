import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowDown, Heart } from 'lucide-react';
import { valentineConfig } from '../config/valentine';
import { useEffects } from '../context/EffectsContext';
import { useSound } from '../context/SoundContext';
import { MiniGame } from '../components/MiniGame';
import { NoButton } from '../components/NoButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { SceneTransition } from '../components/SceneTransition';
import { SplitText } from '../components/SplitText';
import { TeddyCharacter, type TeddyMood } from '../components/TeddyCharacter';
import { useMotionPreferences } from '../hooks/useReducedMotion';
import { useSceneFocus } from '../hooks/useSceneFocus';
import { useTimers } from '../hooks/useTimers';
import { personalize, plainText } from '../utils/personalize';

type Phase = 'ask' | 'moment' | 'burst';

interface QuestionSceneProps {
  onAccept: () => void;
  /** Pauses the ambient background during the "WAIT... YES?!" beat. */
  onFreeze: (frozen: boolean) => void;
}

const MOOD_LABEL: Record<TeddyMood, string> = {
  idle: 'A teddy bear hugging a big glowing heart, waiting hopefully',
  hopeful: 'The teddy bear is beaming with hope',
  nervous: 'The teddy bear looks nervous',
  dramatic: 'The teddy bear is being very dramatic, with teary eyes',
  amazed: 'The teddy bear’s eyes go wide with joy',
  celebrate: 'The teddy bear is dancing',
  sad: 'The teddy bear is pleading with big sad eyes',
};

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as const },
});

/** The big question: teddy, headline, an ever-growing YES and an uncatchable NO. */
export function QuestionScene({ onAccept, onFreeze }: QuestionSceneProps) {
  const { question, noButton, celebration, features } = valentineConfig;
  const [mood, setMood] = useState<TeddyMood>('idle');
  const [phase, setPhase] = useState<Phase>('ask');
  const [noAttempts, setNoAttempts] = useState(0);
  const accepted = useRef(false);
  const moodTimer = useRef(0);
  const lastHoverBurst = useRef(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const yesRef = useRef<HTMLButtonElement>(null);
  const cueRef = useRef<HTMLButtonElement>(null);
  const yesZoneRef = useRef<HTMLSpanElement>(null);
  const heartRef = useRef<SVGGElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const effects = useEffects();
  const sound = useSound();
  const { reduced, compact } = useMotionPreferences();
  const later = useTimers();
  useSceneFocus(headingRef, 400);

  const react = (next: TeddyMood, holdMs = 2600) => {
    if (accepted.current) return;
    setMood(next);
    window.clearTimeout(moodTimer.current);
    moodTimer.current = later(() => !accepted.current && setMood('idle'), holdMs);
  };

  const handleNoEscape = (attempts: number) => {
    setNoAttempts(attempts);
    if (attempts <= 2) react('nervous');
    else if (attempts <= 6) react('dramatic', 3000);
    else react(attempts % 2 ? 'sad' : 'dramatic', 3000);
  };

  // Every failed NO makes the YES button a little more irresistible.
  const yesScale = Math.min(1 + noAttempts * 0.07, compact ? 1.32 : 1.6);

  const handleYesHover = () => {
    react('hopeful', 1800);
    const now = performance.now();
    if (now - lastHoverBurst.current > 900 && yesRef.current) {
      lastHoverBurst.current = now;
      const rect = yesRef.current.getBoundingClientRect();
      for (let i = 0; i < 3; i += 1) {
        effects.burst('trail', { x: rect.left + rect.width * (0.2 + i * 0.3), y: rect.top + 4 });
      }
    }
  };

  const handleYes = () => {
    if (accepted.current) return;
    accepted.current = true;
    window.clearTimeout(moodTimer.current);
    setMood('amazed');
    setPhase('moment');
    onFreeze(true);
    sound.play('chime');

    later(() => {
      setPhase('burst');
      onFreeze(false);
      effects.burst('celebration', heartRef.current);
      effects.burst('cannons', null);
      effects.flash('yes', heartRef.current);
      effects.shake();
      sound.play('confetti');
    }, reduced ? 700 : 1500);
    later(onAccept, reduced ? 1100 : 2300);
  };

  const scrollTo = (target: HTMLElement | null) => target?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });

  const backToQuestion = () => {
    scrollTo(heroRef.current);
    later(() => yesRef.current?.focus({ preventScroll: true }), reduced ? 50 : 650);
  };

  const asking = phase === 'ask';

  return (
    <SceneTransition className="scene--question" labelledBy="question-heading" style="bloom">
      <div className={`question ${asking ? '' : 'is-answered'}`}>
        <div className="question-hero" ref={heroRef}>
          <motion.div
            className="question-hero__art"
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: asking ? 1 : 1.08, y: 0 }}
            transition={{ type: 'spring', stiffness: 90, damping: 14, delay: asking ? 0.35 : 0 }}
          >
            <span className="question-hero__halo" aria-hidden="true" />
            <TeddyCharacter ref={heartRef} mood={mood} label={MOOD_LABEL[mood]} />
          </motion.div>

          <div className="question-hero__copy">
            <div className="question-hero__content">
              <motion.p className="eyebrow question__eyebrow" {...fadeUp(0.3)}>
                {personalize(question.eyebrow)}
              </motion.p>

              <h1 id="question-heading" ref={headingRef} tabIndex={-1} className="question__title display">
                <span className="question__line question__line--small">
                  <SplitText text={question.headlineLines[0]} delay={0.55} />
                </span>
                <span className="question__line question__line--big">
                  <SplitText text={question.headlineLines[1]} delay={0.85} />
                </span>
                <span className="question__line question__line--ask">
                  <SplitText text={question.question} delay={reduced ? 0.2 : 1.85} stagger={0.1} />
                </span>
              </h1>

              <motion.p className="question__support" {...fadeUp(reduced ? 0.3 : 2.55)}>
                {personalize(question.supporting)}
              </motion.p>

              <motion.div className="question__choices" {...fadeUp(reduced ? 0.4 : 2.85)}>
                <div className="question__yes-slot">
                  {/* Invisible footprint of YES at its largest, so NO never parks where YES will grow. */}
                  <span ref={yesZoneRef} className="question__yes-zone" aria-hidden="true" />
                  <motion.div
                    className="question__yes-wrap"
                    animate={{ scale: yesScale }}
                    transition={{ type: 'spring', stiffness: 220, damping: 11 }}
                    style={{ originX: 0, originY: 0.5 }}
                  >
                    <PrimaryButton
                      ref={yesRef}
                      className="question__yes"
                      icon={<Heart size={20} fill="currentColor" aria-hidden="true" />}
                      onClick={handleYes}
                      onHoverStart={handleYesHover}
                      onFocus={() => react('hopeful', 1800)}
                      disabled={!asking}
                      aria-label="Yes"
                    >
                      {personalize(question.yesLabel)}
                    </PrimaryButton>
                  </motion.div>
                </div>
                <NoButton
                  labels={noButton.labels.map(personalize)}
                  messages={noButton.messages.map(personalize)}
                  boundsRef={heroRef}
                  avoidRefs={[yesZoneRef, cueRef]}
                  disabled={!asking}
                  onEscape={handleNoEscape}
                />
              </motion.div>

              {features.miniGame && (
                <motion.button
                  type="button"
                  ref={cueRef}
                  className="text-button question__cue"
                  onClick={() => scrollTo(document.getElementById('mini-game'))}
                  {...fadeUp(reduced ? 0.5 : 3.4)}
                >
                  ✨ {personalize(question.challengeCue)}
                  <ArrowDown size={16} className="question__cue-arrow" aria-hidden="true" />
                </motion.button>
              )}
            </div>

            <AnimatePresence>
              {phase === 'moment' && (
                <motion.p
                  className="yes-moment display"
                  role="status"
                  initial={{ opacity: 0, scale: 0.6, rotate: -4 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 1.3, filter: 'blur(8px)' }}
                  transition={{ type: 'spring', stiffness: 260, damping: 14 }}
                >
                  {plainText(celebration.moment)}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {features.miniGame && <MiniGame onReturn={backToQuestion} />}
      </div>
    </SceneTransition>
  );
}
