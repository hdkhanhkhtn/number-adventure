import type { TagColor } from '@/lib/types/common';

export interface TagProps {
  children: React.ReactNode;
  color?: TagColor;
  style?: React.CSSProperties;
}

const COLOR_MAP: Record<TagColor, { bg: string; ink: string }> = {
  cream: { bg: '#FFF4DE', ink: '#7A4E0E' },
  sage:  { bg: '#C4E5BE', ink: '#2F6A3C' },
  sky:   { bg: '#D2E9F3', ink: '#2E6F93' },
  sun:   { bg: '#FFE6A8', ink: '#7A4E0E' },
  coral: { bg: '#FFCBBA', ink: '#A33A1D' },
};

/** Pill-shaped label tag */
export function Tag({ children, color = 'cream', style }: TagProps) {
  const c = COLOR_MAP[color];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 999,
        background: c.bg,
        color: c.ink,
        fontWeight: 600,
        fontSize: 13,
        border: '1.5px solid rgba(46,90,58,0.15)',
        ...style,
      }}
    >
      {children}
    </span>
  );
}
