'use client';

import { IconBtn } from '@/components/ui/icon-btn';
import { ProgressBar } from '@/components/ui/progress-bar';

export interface GameHudProps {
  hearts?: number;
  progress?: number;
  total?: number;
  onClose: () => void;
}

/** Top game chrome: close button, progress bar, heart counter */
export function GameHud({ hearts = 3, progress = 0, total = 5, onClose }: GameHudProps) {
  return (
    <div style={{ padding: '56px 16px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <IconBtn color="cream" size={44} onClick={onClose} aria-label="Exit game" style={{ fontSize: 20 }}>✕</IconBtn>
      <div
        style={{ flex: 1 }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`Question ${progress} of ${total}`}
      >
        <ProgressBar value={progress} max={total} color="#FFD36E" height={14} />
      </div>
      <div
        aria-label={`${hearts} ${hearts === 1 ? 'life' : 'lives'} remaining`}
        style={{
          display: 'flex', alignItems: 'center', gap: 3,
          padding: '6px 12px', borderRadius: 999, background: '#FFDDE2',
          border: '2px solid #2D3A2E', fontSize: 14, fontWeight: 700, color: '#A33A1D',
        }}
      >
        ❤️ {hearts}
      </div>
    </div>
  );
}
