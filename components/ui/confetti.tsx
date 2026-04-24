'use client';

export interface ConfettiProps {
  count?: number;
}

interface ConfettiPiece {
  left: number;
  color: string;
  size: number;
  dur: number;
  delay: number;
  shape: string;
}

const COLORS = ['#FFD36E', '#FFA48C', '#A8D5A2', '#B8DEEF', '#D9C7F0', '#E6779E'];

// Pre-generate deterministic pieces at module level — purely decorative, stable positions are fine
function makePieces(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    left: (i * 3.45 + 7) % 100,
    color: COLORS[i % COLORS.length],
    size: 8 + (i % 5) * 1.6,
    dur: 2 + (i % 4) * 0.5,
    delay: (i % 6) * 0.083,
    shape: i % 2 === 0 ? '50%' : '4px',
  }));
}

const DEFAULT_PIECES = makePieces(30);
const PIECE_CACHE: Record<number, ConfettiPiece[]> = { 30: DEFAULT_PIECES };

function getPieces(count: number): ConfettiPiece[] {
  if (!PIECE_CACHE[count]) PIECE_CACHE[count] = makePieces(count);
  return PIECE_CACHE[count];
}

/** Confetti burst for reward screens — pointer-events: none */
export function Confetti({ count = 30 }: ConfettiProps) {
  const pieces = getPieces(count);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {pieces.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: '-20px',
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.shape,
            animation: `confetti-fall ${p.dur}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}
