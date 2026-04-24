'use client';

export interface StarRowProps {
  value?: number; // 0–3
  size?: number;
  gap?: number;
}

/** Star rating display 0–3 stars */
export function StarRow({ value = 0, size = 28, gap = 6 }: StarRowProps) {
  return (
    <div style={{ display: 'flex', gap }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            fontSize: size,
            filter: i < value ? 'drop-shadow(0 2px 0 #B87C0E)' : 'none',
            opacity: i < value ? 1 : 0.25,
            transition: 'all 0.3s',
            animation: i < value ? `pop-in 0.4s ease-out ${i * 0.15}s both` : 'none',
          }}
        >
          {i < value ? '⭐' : '☆'}
        </div>
      ))}
    </div>
  );
}
