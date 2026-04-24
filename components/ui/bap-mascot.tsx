import type { MascotMood, MascotColor } from '@/lib/types/common';

export interface BapMascotProps {
  size?: number;
  mood?: MascotMood;
  color?: MascotColor;
}

const BODY_COLOR: Record<MascotColor, string> = {
  sun:      '#FFD36E',
  sage:     '#A8D5A2',
  coral:    '#FFA48C',
  lavender: '#D9C7F0',
  sky:      '#B8DEEF',
};

const BODY_DARK: Record<MascotColor, string> = {
  sun:      '#E8B23F',
  sage:     '#7FB983',
  coral:    '#E2815E',
  lavender: '#B39DD1',
  sky:      '#88BED4',
};

type EyeMap = Record<MascotMood, React.ReactElement>;
type MouthMap = Record<MascotMood, React.ReactElement>;

const EYE_OPEN = <><ellipse cx="0" cy="0" rx="6" ry="7" fill="#2D3A2E"/><ellipse cx="-1.5" cy="-2" rx="2" ry="2.5" fill="#fff"/></>;
const EYE_WINK_CLOSED = <path d="M -6 0 Q 0 4 6 0" stroke="#2D3A2E" strokeWidth="3" fill="none" strokeLinecap="round"/>;

// Left eye (translate 42,66) — stays open during wink
const LEFT_EYES: EyeMap = {
  happy:     EYE_OPEN,
  wink:      EYE_OPEN,
  think:     <ellipse cx="0" cy="0" rx="5" ry="5" fill="#2D3A2E"/>,
  sleep:     <path d="M -6 0 Q 0 4 6 0" stroke="#2D3A2E" strokeWidth="3" fill="none" strokeLinecap="round"/>,
  celebrate: <path d="M -6 2 Q 0 -6 6 2" stroke="#2D3A2E" strokeWidth="3" fill="none" strokeLinecap="round"/>,
};

// Right eye (translate 78,66) — closes during wink
const RIGHT_EYES: EyeMap = {
  happy:     EYE_OPEN,
  wink:      EYE_WINK_CLOSED,
  think:     <ellipse cx="0" cy="0" rx="5" ry="5" fill="#2D3A2E"/>,
  sleep:     <path d="M -6 0 Q 0 4 6 0" stroke="#2D3A2E" strokeWidth="3" fill="none" strokeLinecap="round"/>,
  celebrate: <path d="M -6 2 Q 0 -6 6 2" stroke="#2D3A2E" strokeWidth="3" fill="none" strokeLinecap="round"/>,
};

const MOUTHS: MouthMap = {
  happy:     <path d="M 35 85 Q 50 98 65 85" stroke="#2D3A2E" strokeWidth="3.5" fill="#C14A2A" strokeLinecap="round" strokeLinejoin="round"/>,
  wink:      <path d="M 40 85 Q 50 92 60 85" stroke="#2D3A2E" strokeWidth="3.5" fill="#C14A2A" strokeLinecap="round"/>,
  think:     <ellipse cx="50" cy="88" rx="5" ry="3" fill="#2D3A2E"/>,
  sleep:     <path d="M 42 88 Q 50 92 58 88" stroke="#2D3A2E" strokeWidth="3" fill="none" strokeLinecap="round"/>,
  celebrate: <path d="M 32 82 Q 50 105 68 82 Q 50 95 32 82" fill="#C14A2A" stroke="#2D3A2E" strokeWidth="3" strokeLinejoin="round"/>,
};

/**
 * Bắp — original friendly sprout/corn-kernel mascot (pure SVG, 5 moods, 5 colors).
 * Not reproducing any copyrighted character — fully original flat illustration.
 */
export function BapMascot({ size = 120, mood = 'happy', color = 'sun' }: BapMascotProps) {
  const bodyColor = BODY_COLOR[color];
  const bodyDark  = BODY_DARK[color];

  return (
    <svg
      viewBox="0 0 120 140"
      width={size}
      height={(size * 140) / 120}
      style={{ display: 'block' }}
      aria-label={`Bắp mascot — ${mood}`}
    >
      {/* Leaves (sprout) */}
      <g>
        <ellipse cx="38" cy="18" rx="14" ry="20" fill="#7FB983" transform="rotate(-30 38 18)"/>
        <ellipse cx="38" cy="18" rx="7"  ry="16" fill="#A8D5A2" transform="rotate(-30 38 18)"/>
        <ellipse cx="76" cy="14" rx="16" ry="22" fill="#5FA36A" transform="rotate(25 76 14)"/>
        <ellipse cx="76" cy="14" rx="8"  ry="18" fill="#A8D5A2" transform="rotate(25 76 14)"/>
      </g>

      {/* Body shadow */}
      <ellipse cx="60" cy="126" rx="38" ry="6" fill="rgba(46,90,58,0.18)"/>

      {/* Body — kernel-like rounded shape */}
      <path
        d="M 60 28 C 92 28 100 56 100 82 C 100 110 82 126 60 126 C 38 126 20 110 20 82 C 20 56 28 28 60 28 Z"
        fill={bodyColor}
        stroke="#2D3A2E"
        strokeWidth="3.5"
      />

      {/* Kernel row lines (subtle texture) */}
      <g opacity="0.35" stroke={bodyDark} strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M 30 62 Q 60 56 90 62"/>
        <path d="M 28 80 Q 60 74 92 80"/>
        <path d="M 30 98 Q 60 104 90 98"/>
      </g>

      {/* Cheeks */}
      <circle cx="30" cy="82" r="7" fill="#FFA48C" opacity="0.7"/>
      <circle cx="90" cy="82" r="7" fill="#FFA48C" opacity="0.7"/>

      {/* Eyes */}
      <g transform="translate(42 66)">{LEFT_EYES[mood]}</g>
      <g transform="translate(78 66)">{RIGHT_EYES[mood]}</g>

      {/* Mouth */}
      {MOUTHS[mood]}
    </svg>
  );
}

/** Tiny mascot avatar for chips and avatars */
export function BapMini({ size = 36, color = 'sun' }: { size?: number; color?: MascotColor }) {
  return <BapMascot size={size} mood="happy" color={color} />;
}
