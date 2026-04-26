'use client';

import { useEffect } from 'react';
import { BapMascot } from '@/components/ui/bap-mascot';
import { Confetti } from '@/components/ui/confetti';
import { Sparkles } from '@/components/ui/sparkles';

interface WorldUnlockOverlayProps {
  worldName: string;
  worldEmoji: string;
  onDismiss: () => void;
}

export function WorldUnlockOverlay({ worldName, worldEmoji, onDismiss }: WorldUnlockOverlayProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 2500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fade-in 0.3s ease-out',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#FFF8EC', borderRadius: 28, padding: '32px 24px',
          maxWidth: 300, width: '85%', textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          border: '3px solid #2D3A2E',
          position: 'relative', overflow: 'hidden',
          animation: 'pop-in 0.4s ease-out',
        }}
      >
        <Confetti count={24} />
        <Sparkles count={5} color="#FFD36E" />
        <div style={{ fontSize: 56, marginBottom: 8 }}>{worldEmoji}</div>
        <div className="bobble">
          <BapMascot size={80} mood="celebrate" />
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#2D3A2E', marginTop: 12, marginBottom: 4 }}>
          🔓 Unlocked!
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#5E3A00' }}>
          {worldName}
        </div>
        <div style={{ fontSize: 12, color: '#9AA69A', marginTop: 12 }}>Tap to continue</div>
      </div>
    </div>
  );
}
