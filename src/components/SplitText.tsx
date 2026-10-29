import { motion, type Variants } from 'motion/react';
import { parseEmphasis, personalize, type TextSegment } from '../utils/personalize';
import './split-text.css';

interface SplitTextProps {
  text: string;
  /** `words`: masked slide-up per word. `chars`: soft letter-by-letter fade. */
  mode?: 'words' | 'chars';
  delay?: number;
  stagger?: number;
  className?: string;
}

const wordVariants: Variants = {
  hidden: { y: '110%', rotate: 4 },
  visible: { y: '0%', rotate: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};

const charVariants: Variants = {
  hidden: { opacity: 0, y: 8, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

type Token = { space: true } | { space: false; pieces: TextSegment[] };

/**
 * Splits text into words while keeping anything not separated by whitespace
 * together ("question...", "Valentine?"), so punctuation never wraps alone.
 */
function tokenize(segments: TextSegment[]): Token[] {
  const tokens: Token[] = [];
  for (const segment of segments) {
    for (const part of segment.text.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        tokens.push({ space: true });
        continue;
      }
      const last = tokens[tokens.length - 1];
      const piece = { text: part, emphasis: segment.emphasis };
      if (last && !last.space) last.pieces.push(piece);
      else tokens.push({ space: false, pieces: [piece] });
    }
  }
  return tokens;
}

/**
 * Animated text reveal. Screen readers get the plain sentence once; the split
 * pieces are hidden from assistive tech so they are never read letter by letter.
 */
export function SplitText({ text, mode = 'words', delay = 0, stagger, className = '' }: SplitTextProps) {
  const segments = parseEmphasis(personalize(text));
  const plain = segments.map((s) => s.text).join('');
  const step = stagger ?? (mode === 'words' ? 0.08 : 0.035);
  const tokens = tokenize(segments);

  return (
    <span className={`split ${className}`}>
      <span className="sr-only">{plain} </span>
      <motion.span aria-hidden="true" initial="hidden" animate="visible" transition={{ delayChildren: delay, staggerChildren: step }}>
        {tokens.map((token, ti) => {
          if (token.space) return ' ';
          return (
            <span key={ti} className="split__word">
              {token.pieces.map((piece, pi) =>
                mode === 'chars' ? (
                  <span key={pi} className={piece.emphasis ? 'accent' : undefined}>
                    {Array.from(piece.text).map((char, ci) => (
                      <motion.span key={ci} className="split__char" variants={charVariants}>
                        {char}
                      </motion.span>
                    ))}
                  </span>
                ) : (
                  <span key={pi} className="split__mask">
                    <motion.span className={`split__inner ${piece.emphasis ? 'accent' : ''}`} variants={wordVariants}>
                      {piece.text}
                    </motion.span>
                  </span>
                ),
              )}
            </span>
          );
        })}
      </motion.span>
    </span>
  );
}
