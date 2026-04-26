'use client';

interface StickerDetailSheetProps {
  sticker: { emoji: string; name: string } | null;
  onClose: () => void;
}

/** Bottom sheet showing detail of a tapped sticker */
export function StickerDetailSheet({ sticker, onClose }: StickerDetailSheetProps) {
  if (!sticker) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'flex-end',
        animation: 'fade-in 0.2s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', background: '#FFF8EC',
          borderRadius: '24px 24px 0 0', padding: '28px 24px 36px',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
          textAlign: 'center',
        }}
      >
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: 'rgba(46,90,58,0.2)', margin: '0 auto 20px',
        }} />
        <div style={{ fontSize: 80, marginBottom: 12 }}>{sticker.emoji}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#2D3A2E', marginBottom: 8 }}>{sticker.name}</div>
        <div style={{
          display: 'inline-block', padding: '6px 16px',
          borderRadius: 999, background: '#EDF7EC',
          fontSize: 13, fontWeight: 700, color: '#2F6A3C',
        }}>
          Earned!
        </div>
      </div>
    </div>
  );
}
