'use client';

import { BapMascot } from '@/components/ui/bap-mascot';
import { Confetti } from '@/components/ui/confetti';
import { Sparkles } from '@/components/ui/sparkles';

interface StickerEarnOverlayProps {
  emoji: string;
  name: string;
  onDismiss: () => void;
}

/** Full-screen overlay shown the moment a new sticker is earned */
export function StickerEarnOverlay({ emoji, name, onDismiss }: StickerEarnOverlayProps) {
  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(93,63,148,0.75)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        animation: 'fade-in 0.3s ease-out',
      }}
    >
      <Sparkles count={14} color="#FFB84A" />
      <Confetti count={40} />
      <div className="bobble" style={{ marginBottom: 16 }}>
        <BapMascot size={90} mood="celebrate" />
      </div>
      <div style={{ fontSize: 80, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}>{emoji}</div>
      <div style={{ marginTop: 12, fontSize: 13, fontWeight: 700, color: '#FFE6A8', letterSpacing: 1 }}>
        NEW STICKER!
      </div>
      <div style={{
        marginTop: 4, fontSize: 22, fontWeight: 700, color: '#fff',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
      }}>
        {name}
      </div>
      <div style={{ marginTop: 24, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
        Tap anywhere to continue
      </div>
    </div>
  );
}
