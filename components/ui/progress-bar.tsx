'use client';

export interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  height?: number;
  showStar?: boolean;
}

/** Animated progress bar with soft ticks */
export function ProgressBar({ value, max = 1, color = '#7FC089', height = 14, showStar }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, value / max)) * 100;

  return (
    <div
      style={{
        position: 'relative',
        height,
        borderRadius: height,
        background: 'rgba(46,90,58,0.12)',
        border: '2px solid #2D3A2E',
        overflow: 'visible',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: height,
          background: `linear-gradient(180deg, ${color} 0%, ${color} 55%, rgba(0,0,0,0.08) 100%)`,
          transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)',
          boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.12), inset 0 2px 0 rgba(255,255,255,0.35)',
        }}
      />
      {showStar && pct > 5 && (
        <div
          style={{
            position: 'absolute',
            right: -6,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: height * 1.8,
            filter: 'drop-shadow(0 2px 0 rgba(46,90,58,0.25))',
          }}
        >
          ⭐
        </div>
      )}
    </div>
  );
}
