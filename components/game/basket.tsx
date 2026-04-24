'use client';

export interface BasketProps {
  label: 'EVEN' | 'ODD';
  hint: string;
  color: 'sage' | 'coral';
  active?: boolean;
  correct?: boolean;
  wrong?: boolean;
  onClick: () => void;
}

const COLORS = {
  sage:  { bg: '#A8D5A2', sh: '#6FA876', ink: '#1F4A28' },
  coral: { bg: '#FFA48C', sh: '#D67560', ink: '#7A2B15' },
};

/** Tap target basket for EvenOdd game */
export function Basket({ label, hint, color, active, correct, wrong, onClick }: BasketProps) {
  const c = COLORS[color];
  let bg = c.bg, sh = c.sh;
  if (correct) { bg = '#C4EBB9'; sh = '#6FB05F'; }
  if (wrong)   { bg = '#FFD6C6'; sh = '#E88866'; }

  return (
    <button
      onClick={onClick}
      className={`no-select${wrong ? ' wiggle' : ''}`}
      style={{
        background: bg, color: c.ink,
        border: '3px solid #2D3A2E', borderRadius: 28,
        boxShadow: `0 5px 0 ${sh}, 0 10px 18px rgba(46,90,58,0.12)`,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: 20, gap: 6,
        transform: active && !wrong ? 'scale(1.04)' : undefined,
        transition: 'transform 0.15s',
        cursor: 'pointer',
      }}
    >
      <div style={{ fontSize: 56, lineHeight: 1 }}>{label === 'EVEN' ? '🍎🍎' : '🍎'}</div>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.75 }}>{hint}</div>
    </button>
  );
}
