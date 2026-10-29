import { useSvgId } from '../hooks/useSvgId';
import { HEART_PATH } from '../utils/heart';

export type ArtName = 'mugs' | 'moon' | 'gift' | 'letter';

const Heart = ({ x, y, s, fill, opacity = 1 }: { x: number; y: number; s: number; fill: string; opacity?: number }) => (
  <path d={HEART_PATH} transform={`translate(${x - 50 * s} ${y - 50 * s}) scale(${s})`} fill={fill} opacity={opacity} />
);

const Star = ({ x, y, r, fill = '#FFE5A0' }: { x: number; y: number; r: number; fill?: string }) => (
  <path d={`M${x} ${y - r} Q${x + r * 0.15} ${y - r * 0.15} ${x + r} ${y} Q${x + r * 0.15} ${y + r * 0.15} ${x} ${y + r} Q${x - r * 0.15} ${y + r * 0.15} ${x - r} ${y} Q${x - r * 0.15} ${y - r * 0.15} ${x} ${y - r} Z`} fill={fill} />
);

/**
 * Original decorative illustrations for the gallery, shown until real photos
 * are added in the config. They depict moods, never invented memories.
 */
export function GalleryArt({ name }: { name: ArtName }) {
  const id = useSvgId('art');
  const g = (n: string) => `url(#${id}-${n})`;

  return (
    <svg viewBox="0 0 300 360" className="gallery-art" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`${id}-peach`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE9DA" />
          <stop offset="1" stopColor="#FFB7B0" />
        </linearGradient>
        <linearGradient id={`${id}-night`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1E0A26" />
          <stop offset="1" stopColor="#6A1538" />
        </linearGradient>
        <linearGradient id={`${id}-pink`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD6E4" />
          <stop offset="1" stopColor="#FF8FB5" />
        </linearGradient>
        <linearGradient id={`${id}-lavender`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F1E7FF" />
          <stop offset="1" stopColor="#BFA0FF" />
        </linearGradient>
        <linearGradient id={`${id}-crimson`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FF7FA0" />
          <stop offset="1" stopColor="#C8174A" />
        </linearGradient>
        <linearGradient id={`${id}-violet`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#D9C2FF" />
          <stop offset="1" stopColor="#8F62E8" />
        </linearGradient>
        <radialGradient id={`${id}-moon`} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#FFF8E1" />
          <stop offset="1" stopColor="#FFD98A" />
        </radialGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {name === 'mugs' && (
        <g>
          <rect width="300" height="360" fill={g('peach')} />
          <circle cx="150" cy="140" r="130" fill={g('glow')} />
          <Heart x={118} y={92} s={0.22} fill="#FF82B2" opacity={0.7} />
          <Heart x={186} y={70} s={0.3} fill="#F04468" opacity={0.75} />
          <Heart x={150} y={40} s={0.16} fill="#FF82B2" opacity={0.5} />
          <path d="M112 150 q-10 -18 4 -34 q12 -14 2 -30" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
          <path d="M188 150 q10 -18 -4 -34 q-12 -14 -2 -30" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
          <rect x="0" y="262" width="300" height="98" fill="#F3A08F" opacity="0.55" />
          <ellipse cx="108" cy="262" rx="58" ry="10" fill="#E07F7F" opacity="0.6" />
          <ellipse cx="192" cy="262" rx="58" ry="10" fill="#E07F7F" opacity="0.6" />
          <path d="M70 168 h72 v70 q0 22 -22 22 h-28 q-22 0 -22 -22 z" fill={g('crimson')} />
          <path d="M142 186 q24 0 24 22 q0 22 -24 22" fill="none" stroke="#C8174A" strokeWidth="9" />
          <Heart x={106} y={214} s={0.22} fill="#FFE1EA" />
          <path d="M158 168 h72 v70 q0 22 -22 22 h-28 q-22 0 -22 -22 z" fill={g('violet')} />
          <path d="M158 186 q-24 0 -24 22 q0 22 24 22" fill="none" stroke="#8F62E8" strokeWidth="9" />
          <Heart x={194} y={214} s={0.22} fill="#FFF8F5" />
          <ellipse cx="106" cy="170" rx="36" ry="6" fill="#7A3B2A" opacity="0.85" />
          <ellipse cx="194" cy="170" rx="36" ry="6" fill="#7A3B2A" opacity="0.85" />
        </g>
      )}

      {name === 'moon' && (
        <g>
          <rect width="300" height="360" fill={g('night')} />
          {[
            [40, 50, 5], [250, 40, 7], [270, 140, 4], [30, 190, 4], [80, 300, 5], [230, 290, 6], [150, 30, 3], [200, 210, 3],
          ].map(([x, y, r], i) => (
            <Star key={i} x={x} y={y} r={r} fill={i % 3 === 0 ? '#FFB3CF' : '#FFE5A0'} />
          ))}
          <circle cx="150" cy="170" r="110" fill={g('glow')} opacity="0.35" />
          <path d="M190 90 a84 84 0 1 0 0 160 a68 68 0 1 1 0 -160 z" fill={g('moon')} />
          <path d="M128 150 q8 -8 16 0" fill="none" stroke="#5C102D" strokeWidth="4" strokeLinecap="round" />
          <circle cx="124" cy="182" r="7" fill="#5C102D" />
          <circle cx="122" cy="180" r="2.2" fill="#fff" />
          <ellipse cx="112" cy="198" rx="10" ry="6" fill="#FF82B2" opacity="0.6" />
          <path d="M128 214 q14 14 30 2" fill="none" stroke="#5C102D" strokeWidth="4" strokeLinecap="round" />
          <Heart x={232} y={118} s={0.2} fill="#FF82B2" />
          <path d="M60 330 q90 -60 180 0" fill="none" stroke="#FFE5A0" strokeWidth="1.5" strokeDasharray="2 6" opacity="0.6" />
        </g>
      )}

      {name === 'gift' && (
        <g>
          <rect width="300" height="360" fill={g('pink')} />
          <circle cx="150" cy="120" r="120" fill={g('glow')} opacity="0.7" />
          {[[40, 60, '#FFE5A0'], [260, 90, '#C9A7FF'], [60, 170, '#F04468'], [250, 200, '#FFE5A0'], [90, 40, '#FFF8F5'], [220, 40, '#F04468']].map(([x, y, c], i) => (
            <rect key={i} x={x as number} y={y as number} width="8" height="14" rx="2" fill={c as string} transform={`rotate(${i * 37} ${x} ${y})`} />
          ))}
          <path d="M150 196 C 146 160 162 140 152 112" fill="none" stroke="#fff" strokeWidth="2" />
          <path d={HEART_PATH} transform="translate(121 53) scale(0.62)" fill={g('crimson')} />
          <ellipse cx="136" cy="70" rx="7" ry="4" fill="#fff" opacity="0.6" transform="rotate(-30 136 70)" />
          <rect x="84" y="214" width="132" height="104" rx="10" fill={g('crimson')} />
          <rect x="74" y="190" width="152" height="32" rx="8" fill="#E0306A" transform="rotate(-8 150 206)" />
          <rect x="140" y="214" width="20" height="104" fill="#FFE5A0" />
          <rect x="138" y="186" width="20" height="36" fill="#FFE5A0" transform="rotate(-8 150 206)" />
          <path d="M150 190 q-34 -26 -30 -2 q2 12 30 4 q28 8 30 -4 q4 -24 -30 2 z" fill="#FFD27A" transform="rotate(-8 150 206)" />
        </g>
      )}

      {name === 'letter' && (
        <g>
          <rect width="300" height="360" fill={g('lavender')} />
          <circle cx="150" cy="180" r="130" fill={g('glow')} opacity="0.6" />
          {[[60, 80, 20], [240, 70, -30], [250, 280, 50], [50, 290, -10], [150, 50, 70]].map(([x, y, r], i) => (
            <ellipse key={i} cx={x} cy={y} rx="12" ry="7" fill={i % 2 ? '#FF82B2' : '#F04468'} opacity="0.8" transform={`rotate(${r} ${x} ${y})`} />
          ))}
          <g transform="rotate(-6 150 190)">
            <rect x="62" y="130" width="176" height="118" rx="8" fill="#FFF8F5" />
            <path d="M62 138 L150 200 L238 138" fill="none" stroke="#E7C9D6" strokeWidth="3" />
            <path d="M62 248 L130 190 M238 248 L170 190" stroke="#EFD8E2" strokeWidth="2" />
            <circle cx="150" cy="200" r="22" fill={g('crimson')} />
            <path d={HEART_PATH} transform="translate(139 189) scale(0.22)" fill="#FFE1EA" />
          </g>
          <path d="M196 268 q20 -30 52 -36" fill="none" stroke="#6E9E6A" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="226" cy="248" rx="9" ry="4.5" fill="#86B57F" transform="rotate(-35 226 248)" />
          <ellipse cx="212" cy="258" rx="8" ry="4" fill="#86B57F" transform="rotate(20 212 258)" />
          <circle cx="250" cy="232" r="9" fill="#FF82B2" />
          <circle cx="250" cy="232" r="4" fill="#FFE5A0" />
        </g>
      )}
    </svg>
  );
}
