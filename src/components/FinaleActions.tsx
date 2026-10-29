import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Download, Rocket, Sparkles } from 'lucide-react';
import { valentineConfig } from '../config/valentine';
import { useEffects } from '../context/EffectsContext';
import { useSound } from '../context/SoundContext';
import { createKeepsake, downloadBlob } from '../utils/keepsake';
import { personalize, plainText } from '../utils/personalize';
import { HeartShape } from './HeartShape';
import { PrimaryButton } from './PrimaryButton';
import { SurpriseCard } from './SurpriseCard';
import './finale-actions.css';

type SaveState = 'idle' | 'working' | 'done' | 'error';

const SAVE_MESSAGES: Record<SaveState, string> = {
  idle: 'Downloads a little keepsake card (PNG) drawn right here in your browser.',
  working: 'Drawing your keepsake card…',
  done: 'Your keepsake card download has started — check your downloads folder. 💗',
  error: 'Your browser didn’t allow the download here — a screenshot works beautifully too. 📸',
};

interface FinaleActionsProps {
  onReplay: () => void;
  /** Supplies the live teddy SVG for the keepsake card. */
  getTeddy: () => SVGSVGElement | null;
}

/** The "toolkit" after YES: send love, sparkle, a surprise, a keepsake, and replay. */
export function FinaleActions({ onReplay, getTeddy }: FinaleActionsProps) {
  const { celebration, surprise, recipientName, senderName } = valentineConfig;
  const effects = useEffects();
  const sound = useSound();
  const loveRef = useRef<HTMLButtonElement>(null);
  const sparkleRef = useRef<HTMLButtonElement>(null);
  const [loveCount, setLoveCount] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>('idle');

  const sendLove = () => {
    setLoveCount((n) => n + 1);
    effects.burst('love', loveRef.current);
    sound.play('pop');
  };

  const sparkle = () => {
    effects.burst('sparkles', sparkleRef.current);
    sound.play('sparkle');
  };

  const launchFireworks = () => {
    effects.burst('fireworks', null);
    sound.play('whoosh');
  };

  const save = async () => {
    if (saveState === 'working') return;
    setSaveState('working');
    try {
      const names = [recipientName.trim(), senderName.trim()].filter(Boolean).join(' & ');
      const blob = await createKeepsake({
        eyebrow: 'Official Valentine status',
        status: 'Activated 💘',
        headline: plainText(celebration.headline),
        subheading: plainText(celebration.subheading),
        names,
        teddy: getTeddy(),
      });
      const started = downloadBlob(blob, 'our-valentine-moment.png');
      setSaveState(started ? 'done' : 'error');
      if (started) sound.play('chime');
    } catch {
      setSaveState('error');
    }
  };

  return (
    <section className="finale" aria-labelledby="finale-title">
      <motion.div
        className="finale__intro"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="eyebrow finale__eyebrow">Your official Valentine toolkit</p>
        <h2 id="finale-title" className="finale__title display">
          A few more <em className="accent">little</em> things
        </h2>
      </motion.div>

      <div className="finale__grid">
        <motion.div
          className="finale__love"
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        >
          <motion.button
            ref={loveRef}
            type="button"
            className="love-button"
            onClick={sendLove}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 420, damping: 12 }}
          >
            <HeartShape className="love-button__heart" colors={['#FF9CC2', '#E0306A']} />
            <span className="love-button__label">Send some love 💌</span>
          </motion.button>
          <p className="finale__note" aria-live="polite">
            {loveCount === 0 ? 'Tap the heart as many times as you like.' : `${loveCount} × love sent 💗`}
          </p>
        </motion.div>

        <motion.div
          className="finale__surprise"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          <SurpriseCard label={surprise.label} message={surprise.message} />
        </motion.div>
      </div>

      <motion.div
        className="finale__buttons"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <PrimaryButton ref={sparkleRef} variant="light" icon={<Sparkles size={18} aria-hidden="true" />} onClick={sparkle}>
          Make it sparkle ✨
        </PrimaryButton>
        <PrimaryButton variant="light" icon={<Rocket size={18} aria-hidden="true" />} onClick={launchFireworks}>
          Launch fireworks 🎆
        </PrimaryButton>
        <PrimaryButton
          variant="light"
          icon={<Download size={18} aria-hidden="true" />}
          onClick={save}
          disabled={saveState === 'working'}
          aria-describedby="save-status"
        >
          Save this moment
        </PrimaryButton>
        <PrimaryButton onClick={onReplay}>Replay our little story ↺</PrimaryButton>
      </motion.div>

      <p id="save-status" className={`finale__save finale__save--${saveState}`} aria-live="polite">
        {personalize(SAVE_MESSAGES[saveState])}
      </p>
    </section>
  );
}
