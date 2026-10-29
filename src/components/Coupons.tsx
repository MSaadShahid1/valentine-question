import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { valentineConfig } from '../config/valentine';
import { useEffects } from '../context/EffectsContext';
import { useSound } from '../context/SoundContext';
import { personalize } from '../utils/personalize';
import { RichText } from './RichText';
import './coupons.css';

/** Tear-off Valentine coupons. Claiming one slams a "CLAIMED" stamp onto it. */
export function Coupons() {
  const { coupons } = valentineConfig;
  const [claimed, setClaimed] = useState<number[]>([]);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const effects = useEffects();
  const sound = useSound();

  const claim = (index: number) => {
    const element = refs.current[index];
    if (claimed.includes(index)) {
      effects.burst('heartPop', element);
      return;
    }
    setClaimed((list) => [...list, index]);
    effects.burst('emoji', element, { emoji: [coupons.items[index].emoji, '💘', '🎟️'] });
    sound.play('pop');
  };

  return (
    <section className="coupons" aria-labelledby="coupons-title">
      <motion.div
        className="coupons__intro"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 id="coupons-title" className="coupons__title display">
          <RichText text={coupons.title} />
        </h2>
        <p className="coupons__subtitle">{personalize(coupons.subtitle)}</p>
      </motion.div>

      <ul className="coupons__list">
        {coupons.items.map((coupon, i) => {
          const isClaimed = claimed.includes(i);
          return (
            <motion.li
              key={coupon.title}
              initial={{ opacity: 0, y: 40, rotate: i % 2 ? 4 : -4 }}
              whileInView={{ opacity: 1, y: 0, rotate: i % 2 ? 1.2 : -1.2 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ type: 'spring', stiffness: 120, damping: 14, delay: (i % 2) * 0.12 }}
            >
              <motion.button
                ref={(el) => {
                  refs.current[i] = el;
                }}
                type="button"
                className={`coupon coupon--${i % 4} ${isClaimed ? 'is-claimed' : ''}`}
                aria-pressed={isClaimed}
                onClick={() => claim(i)}
                whileHover={{ y: -6, rotate: 0, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                animate={isClaimed ? { x: [0, -8, 7, -4, 2, 0] } : undefined}
                transition={{ duration: 0.45 }}
              >
                <span className="coupon__stub" aria-hidden="true">
                  <span className="coupon__emoji">{coupon.emoji}</span>
                </span>
                <span className="coupon__body">
                  <span className="coupon__kicker">Valentine coupon · No. {String(i + 1).padStart(3, '0')}</span>
                  <span className="coupon__title">{personalize(coupon.title)}</span>
                  <span className="coupon__detail">{personalize(coupon.detail)}</span>
                </span>
                <AnimatePresence>
                  {isClaimed && (
                    <motion.span
                      className="coupon__stamp"
                      aria-hidden="true"
                      initial={{ opacity: 0, scale: 3, rotate: -40 }}
                      animate={{ opacity: 1, scale: 1, rotate: -14 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                    >
                      Claimed 💘
                    </motion.span>
                  )}
                </AnimatePresence>
                <span className="sr-only">{isClaimed ? ' (claimed)' : ' (tap to claim)'}</span>
              </motion.button>
            </motion.li>
          );
        })}
      </ul>

      <p className="coupons__count" aria-live="polite">
        {claimed.length === 0
          ? 'All coupons are waiting for you.'
          : claimed.length === coupons.items.length
            ? 'Every coupon claimed. Excellent life choices. 💘'
            : `${claimed.length} of ${coupons.items.length} claimed`}
      </p>
    </section>
  );
}
