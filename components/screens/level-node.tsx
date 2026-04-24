'use client';

import type { TileColor } from '@/lib/types/common';

export interface LevelNodeData {
  n: number;
  stars: number;
  locked: boolean;
  isBoss: boolean;
}

export interface LevelNodeProps {
  level: LevelNodeData;
  worldColor: TileColor;
}

const WORLD_COLORS: Record<string, { bg: string; sh: string }> = {
  sage:     { bg: '#7FC089', sh: '#4D8B58' },
  sky:      { bg: '#8AC4DE', sh: '#5A96B1' },
  lavender: { bg: '#B9A4E0', sh: '#8872B4' },
  coral:    { bg: '#FF8F74', sh: '#C8614A' },
  sun:      { bg: '#FFC94A', sh: '#C89220' },
};

/** Circular level node on the winding world path */
export function LevelNode({ level, worldColor }: LevelNodeProps) {
  const c = WORLD_COLORS[worldColor] ?? WORLD_COLORS.sage;

  if (level.locked) {
    return (
      <div style={{
        width: 84, height: 84, borderRadius: '50%',
        background: '#E8DFCE', border: '3px solid rgba(46,90,58,0.3)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', boxShadow: '0 3px 0 rgba(46,90,58,0.15)',
        fontSize: 30, color: 'rgba(46,90,58,0.4)',
      }}>🔒</div>
    );
  }

  return (
    <div style={{
      width: 84, height: 84, borderRadius: '50%',
      background: level.isBoss ? '#FFD36E' : c.bg,
      border: '3px solid #2D3A2E',
      boxShadow: `0 5px 0 ${level.isBoss ? '#C89220' : c.sh}, 0 10px 18px rgba(46,90,58,0.15)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', position: 'relative', color: '#2D3A2E', fontWeight: 700,
    }}>
      {level.isBoss ? (
        <div style={{ fontSize: 38 }}>👑</div>
      ) : (
        <div style={{ fontSize: 32, lineHeight: 1, fontFamily: 'var(--font-num)' }}>{level.n}</div>
      )}
      <div style={{ position: 'absolute', bottom: -14, display: 'flex', gap: 2 }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{
            fontSize: 14,
            filter: i < level.stars ? 'drop-shadow(0 1px 0 #B87C0E)' : 'none',
            opacity: i < level.stars ? 1 : 0.3,
          }}>
            {i < level.stars ? '⭐' : '☆'}
          </span>
        ))}
      </div>
    </div>
  );
}
