'use client';

import type { ButtonColor, ButtonSize } from '@/lib/types/common';

export interface BigButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  color?: ButtonColor;
  size?: ButtonSize;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

const COLOR_MAP: Record<ButtonColor, { bg: string; ink: string; sh: string }> = {
  sage:     { bg: '#7FC089', ink: '#1F4A28', sh: '#4D8B58' },
  sun:      { bg: '#FFC94A', ink: '#5E3A00', sh: '#C89220' },
  coral:    { bg: '#FF8F74', ink: '#6B1F0A', sh: '#C8614A' },
  sky:      { bg: '#8AC4DE', ink: '#1F4A61', sh: '#5A96B1' },
  lavender: { bg: '#B9A4E0', ink: '#3D256D', sh: '#8872B4' },
  cream:    { bg: '#FFF4DE', ink: '#4A3B1D', sh: '#D9C38A' },
};

const SIZE_MAP: Record<ButtonSize, { h: number; fs: number; px: number; rad: number }> = {
  md: { h: 52, fs: 18, px: 24, rad: 18 },
  lg: { h: 68, fs: 22, px: 28, rad: 24 },
  xl: { h: 82, fs: 28, px: 32, rad: 28 },
};

/** Big CTA button with tactile 3D press */
export function BigButton({
  children, onClick, color = 'sage', size = 'lg', icon, disabled, className,
}: BigButtonProps) {
  const c = COLOR_MAP[color];
  const s = SIZE_MAP[size];
  const baseShadow = `0 5px 0 ${c.sh}, 0 10px 20px rgba(46,90,58,0.14)`;
  const pressedShadow = `0 1px 0 ${c.sh}, 0 3px 8px rgba(46,90,58,0.1)`;

  return (
    <button
      className={`no-select${className ? ` ${className}` : ''}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-disabled={disabled}
      style={{
        height: s.h,
        padding: `0 ${s.px}px`,
        borderRadius: s.rad,
        background: c.bg,
        color: c.ink,
        fontFamily: 'var(--font-kid)',
        fontWeight: 700,
        fontSize: s.fs,
        boxShadow: baseShadow,
        border: '3px solid #2D3A2E',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        transition: 'transform 0.1s, box-shadow 0.1s',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onPointerDown={e => {
        if (disabled) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        e.currentTarget.style.transform = 'translateY(4px)';
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
      {icon && <span style={{ fontSize: s.fs * 1.1 }}>{icon}</span>}
      {children}
    </button>
  );
}
