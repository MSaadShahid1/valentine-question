import { forwardRef, type ReactNode } from 'react';
import { motion, type Variants } from 'motion/react';
import { personalize, personalizeLines } from '../utils/personalize';
import { HeartShape } from './HeartShape';
import './love-letter.css';

interface LoveLetterProps {
  greeting: string;
  paragraphs: string[];
  signOff?: string;
  signature?: string;
  headingId: string;
  headingLevel?: 'h1' | 'h2';
  /** `mount`: reveal immediately. `view`: reveal when scrolled into view. */
  reveal?: 'mount' | 'view';
  delay?: number;
  children?: ReactNode;
}

const container: Variants = {
  hidden: {},
  visible: (delay: number) => ({ transition: { delayChildren: delay, staggerChildren: 0.32 } }),
};

const line: Variants = {
  hidden: { opacity: 0, y: 14, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};

/** An ivory paper letter with a wax-seal heart; lines appear one after another like they're being written. */
export const LoveLetter = forwardRef<HTMLHeadingElement, LoveLetterProps>(function LoveLetter(
  { greeting, paragraphs, signOff, signature, headingId, headingLevel = 'h2', reveal = 'mount', delay = 0.4, children },
  headingRef,
) {
  const Heading = headingLevel === 'h1' ? motion.h1 : motion.h2;
  const lines = personalizeLines(paragraphs);
  const sign = signature ? personalize(signature) : '';
  const revealProps =
    reveal === 'view'
      ? { initial: 'hidden', whileInView: 'visible', viewport: { once: true, amount: 0.35 } }
      : { initial: 'hidden', animate: 'visible' };

  return (
    <motion.article className="letter" variants={container} custom={delay} {...revealProps}>
      <div className="letter__paper">
        <span className="letter__seal" aria-hidden="true">
          <HeartShape colors={['#FF7FA0', '#B8124A']} />
        </span>
        <span className="letter__corner letter__corner--tl" aria-hidden="true" />
        <span className="letter__corner letter__corner--br" aria-hidden="true" />

        <Heading ref={headingRef} id={headingId} className="letter__greeting" tabIndex={-1} variants={line}>
          {personalize(greeting)}
        </Heading>

        {lines.map((text, i) => (
          <motion.p key={i} className="letter__line" variants={line}>
            {text.split('\n').map((part, j, all) => (
              <span key={j}>
                {part}
                {j < all.length - 1 && <br />}
              </span>
            ))}
          </motion.p>
        ))}

        {(signOff || sign) && (
          <motion.p className="letter__sign" variants={line}>
            {signOff && <span>{personalize(signOff)}</span>}
            {sign && <span className="letter__signature">{sign}</span>}
          </motion.p>
        )}

        {children && (
          <motion.div className="letter__actions" variants={line}>
            {children}
          </motion.div>
        )}
      </div>
    </motion.article>
  );
});
