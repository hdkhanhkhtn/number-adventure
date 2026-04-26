'use client';
import { BapMascot } from '@/components/ui/bap-mascot';
import { BigButton } from '@/components/ui/big-button';

interface WorldIntroOverlayProps { onDismiss: () => void; }

export function WorldIntroOverlay({ onDismiss }: WorldIntroOverlayProps) {
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
          maxWidth: 320, width: '85%', textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)', border: '3px solid #2D3A2E',
        }}
      >
        <div className="bobble" style={{ marginBottom: 12 }}>
          <BapMascot size={100} mood="celebrate" />
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#2D3A2E', marginBottom: 8 }}>
          Welcome to the World Map!
        </div>
        <div style={{ fontSize: 14, color: '#6B7A6C', lineHeight: 1.5, marginBottom: 20 }}>
          Each world has fun number lessons. Complete lessons to earn stars and unlock new worlds!
        </div>
        <BigButton color="sage" size="lg" onClick={onDismiss}>
          Let&apos;s Go!
        </BigButton>
      </div>
    </div>
  );
}
