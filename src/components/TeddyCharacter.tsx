import { forwardRef, type ReactNode } from 'react';
import { motion, useTransform } from 'motion/react';
import { usePointer } from '../context/PointerContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useSvgId } from '../hooks/useSvgId';
import { HEART_PATH } from '../utils/heart';
import './teddy.css';

export type TeddyMood = 'idle' | 'hopeful' | 'nervous' | 'dramatic' | 'amazed' | 'celebrate' | 'sad';

interface TeddyCharacterProps {
  mood: TeddyMood;
  label: string;
  className?: string;
}

const EYE_LEFT = { x: 150, y: 158 };
const EYE_RIGHT = { x: 250, y: 158 };
const INK = '#2B1219';

const BROWS: Record<TeddyMood, { rotate: number; y: number }> = {
  idle: { rotate: 0, y: 0 },
  hopeful: { rotate: -4, y: -5 },
  nervous: { rotate: -14, y: -2 },
  dramatic: { rotate: -24, y: -6 },
  amazed: { rotate: -6, y: -12 },
  celebrate: { rotate: 0, y: -8 },
  sad: { rotate: -18, y: 0 },
};

function Eye({ mood, x, y, side }: { mood: TeddyMood; x: number; y: number; side: 1 | -1 }) {
  if (mood === 'celebrate') {
    return (
      <path
        d={`M${x - 15} ${y + 5} Q${x} ${y - 13} ${x + 15} ${y + 5}`}
        fill="none"
        stroke={INK}
        strokeWidth="5.5"
        strokeLinecap="round"
      />
    );
  }

  if (mood === 'amazed') {
    return (
      <g>
        <circle cx={x} cy={y} r="20" fill="#FFF8F5" />
        <circle cx={x} cy={y + 1} r="12" fill={INK} />
        <circle cx={x - 4} cy={y - 4} r="5" fill="#fff" />
        <circle cx={x + 5} cy={y + 6} r="2.4" fill="#fff" opacity="0.85" />
        <path d={`M${x + 18 * side} ${y - 22} l2 -6 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 z`} fill="#FFE5A0" className="teddy__twinkle" />
      </g>
    );
  }

  const size = { idle: [13, 15], hopeful: [15, 17.5], nervous: [11, 13], dramatic: [16, 18.5], sad: [11.5, 12.5] }[mood];
  const offsetY = mood === 'sad' ? 4 : 0;
  return (
    <g className="teddy__eye">
      <ellipse cx={x} cy={y + offsetY} rx={size[0]} ry={size[1]} fill={INK} />
      <circle cx={x - size[0] * 0.32} cy={y + offsetY - size[1] * 0.38} r={size[0] * (mood === 'hopeful' || mood === 'dramatic' ? 0.46 : 0.38)} fill="#fff" />
      <circle cx={x + size[0] * 0.38} cy={y + offsetY + size[1] * 0.34} r={size[0] * 0.17} fill="#fff" opacity="0.85" />
      {mood === 'dramatic' && (
        <path d={`M${x - 13} ${y + 13} Q${x} ${y + 21} ${x + 13} ${y + 13}`} fill="none" stroke="#BFE4FF" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
      )}
    </g>
  );
}

function Mouth({ mood }: { mood: TeddyMood }) {
  const tongue = (cy: number, rx = 8) => <ellipse cx="200" cy={cy} rx={rx} ry="5" fill="#FF7FA3" />;
  const open = (d: string, children?: ReactNode) => (
    <g>
      <path d={d} fill="#6B1E33" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      {children}
    </g>
  );
  const stroke = { fill: 'none', stroke: INK, strokeWidth: 3.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  switch (mood) {
    case 'hopeful':
      return open('M182 207 Q200 236 218 207 Q200 214 182 207 Z', tongue(224));
    case 'amazed':
      return open('M175 205 Q200 248 225 205 Q200 215 175 205 Z', tongue(232, 10));
    case 'celebrate':
      return open('M171 203 Q200 254 229 203 Q200 216 171 203 Z', tongue(236, 11));
    case 'nervous':
      return <path {...stroke} d="M181 216 q4.75 -6 9.5 0 t9.5 0 t9.5 0 t9.5 0" />;
    case 'dramatic':
      return open('M180 228 Q200 196 220 228 Q200 236 180 228 Z');
    case 'sad':
      return <path {...stroke} d="M185 222 Q200 208 215 222" />;
    default:
      return <path {...stroke} d="M200 197 V207 M183 207 Q191.5 218 200 207 Q208.5 218 217 207" />;
  }
}

/**
 * The hand-built SVG teddy bear. Expressions are composed from eye, brow,
 * mouth and accessory variants; ambient life (breathing, blinking, floating,
 * heartbeat) runs in CSS while the head tilt and gaze follow the pointer.
 */
export const TeddyCharacter = forwardRef<SVGGElement, TeddyCharacterProps>(function TeddyCharacter(
  { mood, label, className = '' },
  heartRef,
) {
  const id = useSvgId('teddy');
  const pointer = usePointer();
  const reduced = useReducedMotion();
  const tilt = useTransform(pointer.x, (v) => (reduced ? 0 : v * 7));
  const gazeX = useTransform(pointer.x, (v) => (reduced ? 0 : v * 4.5));
  const gazeY = useTransform(pointer.y, (v) => (reduced ? 0 : v * 3.5));
  const brow = BROWS[mood];
  const url = (name: string) => `url(#${id}-${name})`;

  return (
    <div className={`teddy teddy--${mood} ${className}`} role="img" aria-label={label}>
      <div className="teddy__float">
        <svg viewBox="0 0 400 460" data-teddy-svg="" overflow="visible">
          <defs>
            <radialGradient id={`${id}-fur`} cx="0.42" cy="0.32" r="0.78">
              <stop offset="0" stopColor="#F0C08F" />
              <stop offset="0.55" stopColor="#D69866" />
              <stop offset="1" stopColor="#A5643C" />
            </radialGradient>
            <radialGradient id={`${id}-fur-dark`} cx="0.45" cy="0.35" r="0.75">
              <stop offset="0" stopColor="#DDA472" />
              <stop offset="1" stopColor="#94552F" />
            </radialGradient>
            <radialGradient id={`${id}-cream`} cx="0.45" cy="0.35" r="0.8">
              <stop offset="0" stopColor="#FFF4E6" />
              <stop offset="1" stopColor="#F0C79E" />
            </radialGradient>
            <radialGradient id={`${id}-inner-ear`} cx="0.5" cy="0.45" r="0.6">
              <stop offset="0" stopColor="#FFC9C4" />
              <stop offset="1" stopColor="#E8A08E" />
            </radialGradient>
            {/* Pink rim light — the bear is lit by the heart it holds and the romantic sky. */}
            <radialGradient id={`${id}-rim`} cx="0.5" cy="0.55" r="0.55">
              <stop offset="0.72" stopColor="#FF82B2" stopOpacity="0" />
              <stop offset="1" stopColor="#FF82B2" stopOpacity="0.5" />
            </radialGradient>
            <linearGradient id={`${id}-heart`} x1="0.2" y1="0" x2="0.8" y2="1">
              <stop offset="0" stopColor="#FFB3CF" />
              <stop offset="0.45" stopColor="#FF5C8A" />
              <stop offset="1" stopColor="#D81F5A" />
            </linearGradient>
            <radialGradient id={`${id}-heart-gloss`} cx="0.3" cy="0.25" r="0.45">
              <stop offset="0" stopColor="#fff" stopOpacity="0.85" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`${id}-glow`}>
              <stop offset="0" stopColor="#FF82B2" stopOpacity="0.75" />
              <stop offset="0.45" stopColor="#FF82B2" stopOpacity="0.25" />
              <stop offset="1" stopColor="#FF82B2" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`${id}-cheek`}>
              <stop offset="0" stopColor="#FF6E96" stopOpacity="0.8" />
              <stop offset="1" stopColor="#FF6E96" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`${id}-nose`} cx="0.4" cy="0.3" r="0.7">
              <stop offset="0" stopColor="#7A4450" />
              <stop offset="1" stopColor={INK} />
            </radialGradient>
            <linearGradient id={`${id}-drop`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#E6F5FF" />
              <stop offset="1" stopColor="#8CC8FF" />
            </linearGradient>
          </defs>

          {/* Fills live in attributes (not CSS) so the SVG can also be drawn onto the keepsake canvas. */}
          <ellipse className="teddy__shadow" cx="200" cy="446" rx="122" ry="11" fill="rgba(5, 0, 10, 0.35)" />
          <circle className="teddy__glow" cx="200" cy="330" r="175" fill={url('glow')} />

          {/* ── Body ─────────────────────────────────────────── */}
          <g className="teddy__body">
            <ellipse cx="200" cy="330" rx="108" ry="98" fill={url('fur')} />
            <ellipse cx="200" cy="345" rx="70" ry="64" fill={url('cream')} />
            <ellipse cx="200" cy="330" rx="108" ry="98" fill={url('rim')} />

            {[-1, 1].map((side) => {
              const cx = 200 + side * 72;
              return (
                <g key={side} transform={`rotate(${side * 12} ${cx} 414)`}>
                  <ellipse cx={cx} cy="414" rx="45" ry="31" fill={url('fur-dark')} />
                  <ellipse cx={cx} cy="419" rx="25" ry="17" fill={url('cream')} />
                  {[-14, 0, 14].map((dx) => (
                    <ellipse key={dx} cx={cx + dx} cy={dx === 0 ? 397 : 400} rx="6" ry="5" fill="#F6C1B4" />
                  ))}
                </g>
              );
            })}

            <ellipse cx="102" cy="312" rx="30" ry="50" transform="rotate(28 102 312)" fill={url('fur-dark')} />
            <ellipse cx="298" cy="312" rx="30" ry="50" transform="rotate(-28 298 312)" fill={url('fur-dark')} />

            <g className="teddy__heart" ref={heartRef}>
              <g transform="translate(108 252) scale(1.84)">
                <path d={HEART_PATH} fill={url('heart')} stroke="#B8124A" strokeOpacity="0.35" strokeWidth="1" />
                <path d={HEART_PATH} fill={url('heart-gloss')} />
                <path d="M24 26 q4 -10 14 -10" fill="none" stroke="#fff" strokeOpacity="0.8" strokeWidth="3.4" strokeLinecap="round" />
                <path className="teddy__twinkle" d="M72 24 l1.6 -5 l1.6 5 l5 1.6 l-5 1.6 l-1.6 5 l-1.6 -5 l-5 -1.6 z" fill="#FFF8F5" />
              </g>
            </g>

            {[-1, 1].map((side) => {
              const cx = 200 + side * 76;
              return (
                <g key={side} transform={`rotate(${side * -20} ${cx} 330)`}>
                  <ellipse cx={cx} cy="330" rx="26" ry="23" fill={url('fur')} />
                  <path
                    d={`M${cx - 9} ${side < 0 ? 344 : 344} q4 5 8 0 M${cx + 1} 345 q4 5 8 0`}
                    fill="none"
                    stroke="#8A4A2A"
                    strokeOpacity="0.55"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </g>
              );
            })}
          </g>

          {/* ── Head ─────────────────────────────────────────── */}
          <motion.g style={{ rotate: tilt, originX: 0.5, originY: 0.95 }}>
            <g className="teddy__head">
              {[-1, 1].map((side) => (
                <g key={side}>
                  <circle cx={200 + side * 88} cy="82" r="40" fill={url('fur-dark')} />
                  <circle cx={200 + side * 84} cy="86" r="23" fill={url('inner-ear')} />
                </g>
              ))}

              <ellipse cx="200" cy="160" rx="116" ry="100" fill={url('fur')} />
              <ellipse cx="200" cy="160" rx="116" ry="100" fill={url('rim')} />
              <path d="M186 66 q6 -18 15 -5 q7 -13 13 3" fill="none" stroke="#B7774A" strokeWidth="5" strokeLinecap="round" />

              <ellipse cx="200" cy="202" rx="52" ry="38" fill={url('cream')} />

              <g className="teddy__cheeks">
                <ellipse cx="122" cy="198" rx="24" ry="15" fill={url('cheek')} />
                <ellipse cx="278" cy="198" rx="24" ry="15" fill={url('cheek')} />
              </g>

              <Mouth mood={mood} />
              <path d="M185 183 q15 -9 30 0 q2 9 -9 15 q-6 4 -12 0 q-11 -6 -9 -15 z" fill={url('nose')} />
              <ellipse cx="195" cy="185" rx="5.5" ry="2.8" fill="#fff" opacity="0.7" />

              <motion.g style={{ x: gazeX, y: gazeY }}>
                <Eye mood={mood} x={EYE_LEFT.x} y={EYE_LEFT.y} side={-1} />
                <Eye mood={mood} x={EYE_RIGHT.x} y={EYE_RIGHT.y} side={1} />
              </motion.g>

              {[-1, 1].map((side) => (
                <motion.path
                  key={side}
                  d={`M${200 + side * 50 - 16} 124 q16 -10 32 0`}
                  fill="none"
                  stroke="#6A3420"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  animate={{ rotate: brow.rotate * side * -1, y: brow.y }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                />
              ))}

              {mood === 'nervous' && (
                <path
                  className="teddy__sweat"
                  d="M312 104 c7 9 10 15 10 19 a10 10 0 0 1 -20 0 c0 -4 3 -10 10 -19 z"
                  fill={url('drop')}
                  stroke="#7DB8F0"
                  strokeWidth="1"
                />
              )}

              {mood === 'dramatic' && (
                <g className="teddy__tears" fill={url('drop')}>
                  {[EYE_LEFT.x - 14, EYE_RIGHT.x + 14].map((x, i) => (
                    <path key={x} className={`teddy__tear teddy__tear--${i}`} d={`M${x} 172 c5 7 7 11 7 14 a7 7 0 0 1 -14 0 c0 -3 2 -7 7 -14 z`} />
                  ))}
                </g>
              )}

              {(mood === 'celebrate' || mood === 'amazed' || mood === 'hopeful') && (
                <g className="teddy__sparkles" fill="#FFE5A0">
                  <path className="teddy__twinkle" d="M62 70 l3 -10 l3 10 l10 3 l-10 3 l-3 10 l-3 -10 l-10 -3 z" />
                  <path className="teddy__twinkle" style={{ animationDelay: '0.5s' }} d="M336 50 l2.4 -8 l2.4 8 l8 2.4 l-8 2.4 l-2.4 8 l-2.4 -8 l-8 -2.4 z" />
                  {mood !== 'hopeful' && (
                    <path className="teddy__twinkle" style={{ animationDelay: '1s' }} d="M352 178 l2 -7 l2 7 l7 2 l-7 2 l-2 7 l-2 -7 l-7 -2 z" />
                  )}
                </g>
              )}
            </g>
          </motion.g>
        </svg>
      </div>
    </div>
  );
});
