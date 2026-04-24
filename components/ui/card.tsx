'use client';

export interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  color?: 'card' | 'cream' | 'sage' | 'sky' | 'lavender' | 'sun' | 'coral';
  padding?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

/** Soft rounded card with shadow */
export function Card({ children, onClick, color = 'card', padding = 16, className, style }: CardProps) {
  const bg = color === 'card' ? '#FFFFFF' : `var(--${color})`;

  return (
    <div
      onClick={onClick}
      className={`no-select${className ? ` ${className}` : ''}`}
      style={{
        background: bg,
        borderRadius: 'var(--r-lg)',
        border: '2px solid rgba(46,90,58,0.12)',
        boxShadow: 'var(--shadow-card)',
        padding,
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
