'use client';

export interface SparklesProps {
  count?: number;
  color?: string;
}

interface SparkleItem {
  left: number;
  top: number;
  size: number;
  delay: number;
  dur: number;
}

// Pre-generate deterministic spots at module level — purely decorative, stable positions are fine
function makeSpots(count: number): SparkleItem[] {
  return Array.from({ length: count }, (_, i) => ({
    left: 5 + ((i * 17.3) % 90),
    top: 5 + ((i * 23.7) % 90),
    size: 8 + (i % 5) * 2,
    delay: (i % 5) * 0.4,
    dur: 2 + (i % 4) * 0.5,
  }));
}

const SPOT_CACHE: Record<number, SparkleItem[]> = {};

function getSpots(count: number): SparkleItem[] {
  if (!SPOT_CACHE[count]) SPOT_CACHE[count] = makeSpots(count);
  return SPOT_CACHE[count];
}

/** Decorative floating sparkles overlay — pointer-events: none */
export function Sparkles({ count = 6, color = '#FFD36E' }: SparklesProps) {
  const spots = getSpots(count);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {spots.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            color,
            animation: `sparkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        >
          <svg viewBox="0 0 20 20" width="100%" height="100%">
            <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill="currentColor" />
          </svg>
        </div>
      ))}
    </div>
  );
}
