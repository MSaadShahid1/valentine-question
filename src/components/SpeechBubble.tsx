import { AnimatePresence, motion } from 'motion/react';
import './speech-bubble.css';

export interface BubblePlacement {
  vertical: 'above' | 'below';
  align: 'start' | 'center' | 'end';
}

interface SpeechBubbleProps {
  message: string | null;
  placement: BubblePlacement;
}

/** A little comic-style bubble. Decorative: messages are announced via a separate live region. */
export function SpeechBubble({ message, placement }: SpeechBubbleProps) {
  return (
    <AnimatePresence mode="popLayout">
      {message && (
        <motion.div
          key={message}
          className={`speech speech--${placement.vertical} speech--${placement.align}`}
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.5, y: placement.vertical === 'above' ? 10 : -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
