import { forwardRef } from 'react';
import { useSvgId } from '../hooks/useSvgId';
import { HEART_PATH } from '../utils/heart';
import { HeartShape } from './HeartShape';
import './envelope.css';

export type EnvelopeState = 'closed' | 'opening';

interface EnvelopeProps {
  state: EnvelopeState;
  letterLabel: string;
  onOpen: () => void;
}

const SPARKLES = [
  { left: '-7%', top: '8%', size: 18, delay: '0s' },
  { left: '102%', top: '16%', size: 14, delay: '0.6s' },
  { left: '96%', top: '94%', size: 20, delay: '1.2s' },
  { left: '-3%', top: '84%', size: 12, delay: '0.3s' },
  { left: '48%', top: '-18%', size: 16, delay: '0.9s' },
  { left: '18%', top: '108%', size: 11, delay: '1.5s' },
];

function Sparkle({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 0 Q11 9 20 10 Q11 11 10 20 Q9 11 0 10 Q9 9 10 0 Z" fill="currentColor" />
    </svg>
  );
}

/**
 * A layered paper envelope. Opening is choreographed in CSS (driven by
 * `data-state`): the seal glows and breaks, the flap hinges open in 3D,
 * a glowing heart escapes and the letter slides out.
 */
export const Envelope = forwardRef<HTMLButtonElement, EnvelopeProps>(function Envelope({ state, letterLabel, onOpen }, ref) {
  const id = useSvgId('envelope');
  const url = (name: string) => `url(#${id}-${name})`;

  return (
    <button
      ref={ref}
      type="button"
      className="envelope"
      data-state={state}
      onClick={onOpen}
      disabled={state !== 'closed'}
      aria-label="Open the envelope"
    >
      <span className="envelope__sparkles" aria-hidden="true">
        {SPARKLES.map((s, i) => (
          <span key={i} className="envelope__sparkle" style={{ left: s.left, top: s.top, animationDelay: s.delay }}>
            <Sparkle size={s.size} />
          </span>
        ))}
      </span>

      <span className="envelope__body" aria-hidden="true">
        <svg className="envelope__defs" width="0" height="0">
          <defs>
            <linearGradient id={`${id}-left`} x1="0" y1="0" x2="1" y2="0.6">
              <stop offset="0" stopColor="#FFE0EA" />
              <stop offset="1" stopColor="#F6B2C8" />
            </linearGradient>
            <linearGradient id={`${id}-right`} x1="1" y1="0" x2="0" y2="0.6">
              <stop offset="0" stopColor="#FBCBDA" />
              <stop offset="1" stopColor="#EC9DB8" />
            </linearGradient>
            <linearGradient id={`${id}-bottom`} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#F7B9CD" />
              <stop offset="1" stopColor="#FFE3EC" />
            </linearGradient>
            <linearGradient id={`${id}-flap`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FFD9E5" />
              <stop offset="1" stopColor="#F3A3BE" />
            </linearGradient>
            <linearGradient id={`${id}-inside`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8E1E48" />
              <stop offset="1" stopColor="#C2416C" />
            </linearGradient>
            <radialGradient id={`${id}-wax`} cx="0.38" cy="0.32" r="0.75">
              <stop offset="0" stopColor="#FF6F92" />
              <stop offset="0.55" stopColor="#D41E4F" />
              <stop offset="1" stopColor="#8E1538" />
            </radialGradient>
          </defs>
        </svg>

        <span className="envelope__back" />

        <span className="envelope__letter">
          <span className="envelope__letter-label">{letterLabel}</span>
          <span className="envelope__letter-line" />
          <span className="envelope__letter-line" />
          <span className="envelope__letter-line envelope__letter-line--short" />
        </span>

        <span className="envelope__glow-heart">
          <HeartShape colors={['#FFF8F5', '#FF82B2']} />
        </span>

        <svg className="envelope__pocket" viewBox="0 0 300 196" preserveAspectRatio="none">
          <path d="M0 8 Q0 0 8 0 L158 110 L8 196 Q0 196 0 188 Z" fill={url('left')} />
          <path d="M300 8 Q300 0 292 0 L142 110 L292 196 Q300 196 300 188 Z" fill={url('right')} />
          <path d="M0 188 L138 96 Q150 88 162 96 L300 188 Q300 196 292 196 L8 196 Q0 196 0 188 Z" fill={url('bottom')} />
          <path
            d="M2 190 L138 96 Q150 88 162 96 L298 190"
            fill="none"
            stroke="rgba(142, 21, 56, 0.18)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <span className="envelope__flap">
          <svg className="envelope__flap-face" viewBox="0 0 300 124" preserveAspectRatio="none">
            <path d="M0 8 Q0 0 8 0 H292 Q300 0 300 8 L164 114 Q150 124 136 114 Z" fill={url('flap')} />
            <path
              d="M1 6 L136 114 Q150 124 164 114 L299 6"
              fill="none"
              stroke="rgba(142, 21, 56, 0.22)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <svg className="envelope__flap-face envelope__flap-face--inside" viewBox="0 0 300 124" preserveAspectRatio="none">
            <path d="M0 8 Q0 0 8 0 H292 Q300 0 300 8 L164 114 Q150 124 136 114 Z" fill={url('inside')} />
          </svg>
        </span>

        <span className="envelope__seal">
          <svg viewBox="0 0 100 100">
            <path
              d="M50 4 C62 3 70 10 79 14 C88 19 95 28 96 40 C98 52 93 60 94 70 C93 82 83 90 71 94 C60 98 52 95 41 97 C29 98 18 91 11 82 C4 73 6 62 4 51 C3 39 6 28 14 19 C23 10 37 5 50 4 Z"
              fill={url('wax')}
            />
            <circle cx="50" cy="51" r="31" fill="none" stroke="rgba(92, 16, 45, 0.45)" strokeWidth="3" />
            <circle cx="50" cy="51" r="31" fill="none" stroke="rgba(255, 190, 210, 0.35)" strokeWidth="1" transform="translate(-1 -1)" />
            <g transform="translate(29 31) scale(0.42)">
              <path d={HEART_PATH} fill="#A3163F" transform="translate(2 3)" opacity="0.6" />
              <path d={HEART_PATH} fill="#FF7FA0" />
            </g>
            <ellipse cx="34" cy="26" rx="12" ry="6" fill="#fff" opacity="0.35" transform="rotate(-30 34 26)" />
          </svg>
        </span>
      </span>

      <span className="envelope__shadow" aria-hidden="true" />
    </button>
  );
});
