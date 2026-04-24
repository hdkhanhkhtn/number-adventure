'use client';

import { motion } from 'framer-motion';
import type { TileSize, TileColor, TileState } from '@/lib/types/common';

export interface NumTileProps {
  n: number | string;
  state?: TileState;
  onClick?: () => void;
  size?: TileSize;
  color?: TileColor;
}

const SIZE_MAP: Record<TileSize, { w: number; h: number; fs: number; rad: number }> = {
  sm: { w: 64,  h: 72,  fs: 34, rad: 18 },
  md: { w: 92,  h: 104, fs: 52, rad: 24 },
  lg: { w: 124, h: 140, fs: 72, rad: 30 },
  xl: { w: 160, h: 180, fs: 92, rad: 36 },
};

const COLOR_MAP: Record<TileColor, { bg: string; ink: string; sh: string }> = {
  sun:      { bg: '#FFD36E', ink: '#7A4E0E', sh: '#C79528' },
  sage:     { bg: '#A8D5A2', ink: '#2F6A3C', sh: '#6FA876' },
  sky:      { bg: '#B8DEEF', ink: '#2E6F93', sh: '#7DB0C8' },
  lavender: { bg: '#D9C7F0', ink: '#5D3F94', sh: '#A58AD0' },
  coral:    { bg: '#FFA48C', ink: '#A33A1D', sh: '#D67560' },
  berry:    { bg: '#E6779E', ink: '#852C51', sh: '#B44B7A' },
  cream:    { bg: '#FFF8EC', ink: '#3A2D15', sh: '#E2CFA7' },
};

const STATE_OVERRIDE: Partial<Record<TileState, React.CSSProperties>> = {
  correct: {
    background: '#C4EBB9',
    boxShadow: '0 4px 0 #6FB05F, 0 10px 20px rgba(95,179,106,0.35)',
    transform: 'translateY(-2px)',
  },
  wrong: {
    background: '#FFD6C6',
    boxShadow: '0 2px 0 #E88866, 0 4px 8px rgba(232,136,102,0.3)',
  },
  disabled: { opacity: 0.4, pointerEvents: 'none' },
};

/** Pop-in spring when correct, wiggle when wrong, idle has no animation */
function getMotionProps(state: TileState) {
  if (state === 'correct') {
    return {
      initial: { scale: 0.85, opacity: 0.7 },
      animate: { scale: 1, opacity: 1 },
      transition: { type: 'spring' as const, stiffness: 400, damping: 25 },
    };
  }
  if (state === 'wrong') {
    return {
      animate: { x: [0, -8, 8, -8, 8, 0] },
      transition: { duration: 0.4 },
    };
  }
  return {};
}

/** Big tappable number tile with tactile 3D press effect */
export function NumTile({ n, state = 'idle', onClick, size = 'md', color = 'sun' }: NumTileProps) {
  const s = SIZE_MAP[size];
  const c = COLOR_MAP[color];
  const stateStyle = STATE_OVERRIDE[state] ?? {};

  const baseShadow = `0 4px 0 ${c.sh}, 0 10px 18px rgba(46,90,58,0.12)`;
  const pressedShadow = `0 1px 0 ${c.sh}, 0 3px 6px rgba(46,90,58,0.1)`;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <motion.button
      className="no-select"
      onClick={onClick}
      disabled={state === 'disabled'}
      aria-disabled={state === 'disabled'}
      aria-label={`Number ${n}`}
      tabIndex={state === 'disabled' ? -1 : 0}
      onKeyDown={handleKeyDown}
      style={{
        width: s.w, height: s.h, borderRadius: s.rad,
        background: c.bg, color: c.ink,
        fontFamily: 'var(--font-num)', fontWeight: 700, fontSize: s.fs,
        lineHeight: 1, letterSpacing: -1,
        boxShadow: baseShadow,
        border: '3px solid #2D3A2E',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform 0.1s ease, box-shadow 0.1s ease',
        position: 'relative',
        ...stateStyle,
      }}
      onPointerDown={e => {
        if (state !== 'idle') return;
        e.currentTarget.setPointerCapture(e.pointerId);
        e.currentTarget.style.transform = 'translateY(3px)';
        e.currentTarget.style.boxShadow = pressedShadow;
      }}
      onPointerUp={e => {
        if (state !== 'idle') return;
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = baseShadow;
      }}
      onPointerCancel={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = baseShadow;
      }}
      {...getMotionProps(state)}
    >
      {n}
    </motion.button>
  );
}
