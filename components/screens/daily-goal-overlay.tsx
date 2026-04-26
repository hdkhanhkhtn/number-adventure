'use client';

import { BapMascot } from '@/components/ui/bap-mascot';

interface DailyGoalOverlayProps {
  elapsedMin: number;
  dailyMin: number;
  onContinue: () => void;
}

export function DailyGoalOverlay({ elapsedMin, dailyMin, onContinue }: DailyGoalOverlayProps) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fade-in 0.3s ease-out',
    }}>
      <div style={{
        background: '#FFF8EC', borderRadius: 28, padding: '32px 24px',
        maxWidth: 320, width: '85%', textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        border: '3px solid #2D3A2E',
      }}>
        <div className="bobble" style={{ marginBottom: 12 }}>
          <BapMascot size={90} mood="celebrate" />
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#2D3A2E', marginBottom: 8 }}>
          Daily goal reached! 🎉
        </div>
        <div style={{ fontSize: 14, color: '#6B7A6C', marginBottom: 4 }}>
          {elapsedMin} / {dailyMin} minutes played today
        </div>
        <div style={{ fontSize: 13, color: '#9AA69A', marginBottom: 24 }}>
          Tuyệt vời! Hẹn gặp lại ngày mai!
        </div>
        <button
          onClick={onContinue}
          style={{
            width: '100%', padding: '14px 24px', borderRadius: 16,
            fontSize: 16, fontWeight: 700, color: '#fff',
            background: '#2E5A3A', border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 0 #1B3A24',
          }}
        >
          Go Home 🏠
        </button>
      </div>
    </div>
  );
}
