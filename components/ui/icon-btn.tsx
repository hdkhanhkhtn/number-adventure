'use client';

import type { IconBtnColor } from '@/lib/types/common';

export interface IconBtnProps {
  children: React.ReactNode;
  onClick?: () => void;
  color?: IconBtnColor;
  size?: number;
  pulse?: boolean;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

const COLOR_MAP: Record<IconBtnColor, { bg: string; sh: string; ink: string }> = {
  cream: { bg: '#FFF8EC', sh: '#D9C38A', ink: '#2D3A2E' },
  sage:  { bg: '#A8D5A2', sh: '#6FA876', ink: '#2F6A3C' },
  sun:   { bg: '#FFD36E', sh: '#C79528', ink: '#7A4E0E' },
  coral: { bg: '#FFA48C', sh: '#D67560', ink: '#A33A1D' },
  sky:   { bg: '#B8DEEF', sh: '#7DB0C8', ink: '#2E6F93' },
};

/** Round icon button (speaker, heart, close, back) */
export function IconBtn({
  children, onClick, color = 'cream', size = 52, pulse, style, 'aria-label': ariaLabel,
}: IconBtnProps) {
  const c = COLOR_MAP[color];
  const baseShadow = `0 4px 0 ${c.sh}, 0 8px 14px rgba(46,90,58,0.12)`;
  const pressedShadow = `0 1px 0 ${c.sh}, 0 2px 6px rgba(46,90,58,0.1)`;

  return (
    <button
      className={`no-select${pulse ? ' pulse-soft' : ''}`}
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: c.bg,
        color: c.ink,
        boxShadow: baseShadow,
        border: '3px solid #2D3A2E',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.45,
        transition: 'transform 0.1s',
        flexShrink: 0,
        ...style,
      }}
      onPointerDown={e => {
        e.currentTarget.setPointerCapture(e.pointerId);
        e.currentTarget.style.transform = 'translateY(3px)';
        e.currentTarget.style.boxShadow = pressedShadow;
      }}
      onPointerUp={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = baseShadow;
      }}
      onPointerCancel={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = baseShadow;
      }}
    >
      {children}
    </button>
  );
}
