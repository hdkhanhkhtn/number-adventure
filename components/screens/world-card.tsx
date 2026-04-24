'use client';

import { ProgressBar } from '@/components/ui/progress-bar';

export interface WorldCardData {
  id: string;
  name: string;
  subtitle: string;
  bg: string;
  emoji: string;
  unlocked: boolean;
  totalStars: number;
  maxStars: number;
}

export interface WorldCardProps {
  world: WorldCardData;
  index: number;
  onClick: () => void;
}

/** Scrollable world card with unlock state, star progress */
export function WorldCard({ world, index, onClick }: WorldCardProps) {
  const offset = index % 2 === 0 ? 0 : 20;
  return (
    <button
      onClick={onClick}
      disabled={!world.unlocked}
      className="no-select"
      style={{
        textAlign: 'left', width: `calc(100% - ${offset}px)`,
        marginLeft: offset, padding: '18px 20px',
        background: world.unlocked ? world.bg : '#E8DFCE',
        borderRadius: 28, border: '3px solid #2D3A2E',
        boxShadow: world.unlocked
          ? '0 5px 0 rgba(46,90,58,0.25), 0 14px 24px rgba(46,90,58,0.12)'
          : '0 3px 0 rgba(46,90,58,0.18)',
        display: 'flex', alignItems: 'center', gap: 14,
        opacity: world.unlocked ? 1 : 0.65,
        position: 'relative', overflow: 'hidden',
        cursor: world.unlocked ? 'pointer' : 'not-allowed',
      }}
    >
      <div style={{
        width: 72, height: 72, borderRadius: 22,
        background: 'rgba(255,255,255,0.6)', border: '2px solid rgba(46,90,58,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 44, flexShrink: 0,
      }}>
        {world.unlocked ? world.emoji : '🔒'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(46,90,58,0.7)', letterSpacing: 0.5 }}>
          WORLD {index + 1}
        </div>
        <div style={{ fontSize: 19, fontWeight: 700, color: '#2D3A2E', lineHeight: 1.1, marginTop: 2 }}>
          {world.name}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(46,90,58,0.75)', marginTop: 2, fontWeight: 600 }}>
          {world.subtitle}
        </div>
        {world.unlocked && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <div style={{ flex: 1 }}>
              <ProgressBar value={world.totalStars} max={world.maxStars} height={8} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#2D3A2E' }}>
              ⭐ {world.totalStars}/{world.maxStars}
            </div>
          </div>
        )}
      </div>
    </button>
  );
}
