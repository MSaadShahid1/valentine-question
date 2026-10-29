import { useRef, useState } from 'react';
import { Gift, RotateCcw } from 'lucide-react';
import { useEffects } from '../context/EffectsContext';
import { useSound } from '../context/SoundContext';
import { useTimers } from '../hooks/useTimers';
import { personalize } from '../utils/personalize';
import { HeartShape } from './HeartShape';
import './surprise-card.css';

/** "One last little surprise..." — a gift card that flips over in 3D to reveal a message. */
export function SurpriseCard({ label, message }: { label: string; message: string }) {
  const [open, setOpen] = useState(false);
  const frontRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const effects = useEffects();
  const sound = useSound();
  const later = useTimers();

  const reveal = () => {
    if (open) return;
    setOpen(true);
    effects.burst('heartPop', frontRef.current);
    sound.play('chime');
    later(() => backRef.current?.focus({ preventScroll: true }), 450);
  };

  const hide = () => {
    setOpen(false);
    later(() => frontRef.current?.focus({ preventScroll: true }), 450);
  };

  return (
    <div className={`surprise ${open ? 'is-open' : ''}`}>
      <div className="surprise__inner">
        <button ref={frontRef} type="button" className="surprise__face surprise__front" onClick={reveal} aria-expanded={open} inert={open}>
          <span className="surprise__ribbon surprise__ribbon--v" aria-hidden="true" />
          <span className="surprise__ribbon surprise__ribbon--h" aria-hidden="true" />
          <span className="surprise__badge" aria-hidden="true">
            <Gift size={30} strokeWidth={1.8} />
          </span>
          <span className="surprise__label">{personalize(label)}</span>
          <span className="surprise__hint">tap to unwrap</span>
        </button>

        <div ref={backRef} className="surprise__face surprise__back" tabIndex={-1} inert={!open} role="region" aria-label="Your surprise">
          <HeartShape className="surprise__heart" colors={['#FF9CC2', '#D81F5A']} />
          <p className="surprise__message">{personalize(message)}</p>
          <button type="button" className="text-button surprise__close" onClick={hide}>
            <RotateCcw size={16} aria-hidden="true" />
            Wrap it back up
          </button>
        </div>
      </div>
    </div>
  );
}
