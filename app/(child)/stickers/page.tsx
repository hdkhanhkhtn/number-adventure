'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameProgress } from '@/context/game-progress-context';
import { SkeletonScreen } from '@/components/ui/skeleton-screen';
import { GardenBg } from '@/components/ui/garden-bg';
import { IconBtn } from '@/components/ui/icon-btn';
import { ProgressBar } from '@/components/ui/progress-bar';
import { StickerDetailSheet } from '@/components/ui/sticker-detail-sheet';

interface StickerEntry {
  id: string;
  emoji: string;
  name: string;
  earned: boolean;
}

export default function StickersPage() {
  const { state, isHydrated } = useGameProgress();
  const router = useRouter();
  const [stickers, setStickers] = useState<StickerEntry[]>([]);
  const [total, setTotal] = useState(40);
  const [selectedSticker, setSelectedSticker] = useState<StickerEntry | null>(null);

  // All hooks before early returns
  useEffect(() => {
    if (!state.childId) return;
    fetch(`/api/children/${state.childId}/stickers`)
      .then((r) => r.json())
      .then((d: { stickers?: StickerEntry[]; total?: number }) => {
        if (d.stickers) setStickers(d.stickers);
        if (d.total) setTotal(d.total);
      })
      .catch(() => undefined);
  }, [state.childId]);

  // Guards: after all hooks
  if (!isHydrated) return <SkeletonScreen />;
  if (!state.childId || !state.profile) {
    router.replace('/');
    return null;
  }

  const collected = stickers.filter((s) => s.earned).length;

  return (
    <>
    <div style={{ position: 'absolute', inset: 0 }}>
      <GardenBg variant="lavender" />
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '56px 20px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <IconBtn color="cream" size={48} onClick={() => router.back()}>‹</IconBtn>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#2D3A2E' }}>Sticker Book</div>
            <div style={{ fontSize: 13, color: '#6B7A6C', fontWeight: 600 }}>{collected} of {total} collected</div>
          </div>
          <div style={{ fontSize: 36 }}>📓</div>
        </div>

        <div style={{ padding: '0 20px 12px' }}>
          <ProgressBar value={collected} max={total} color="#B9A4E0" height={12} />
        </div>

        <div className="scroll" style={{ flex: 1, padding: '12px 20px 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {stickers.map((s, i) => (
              <div
                key={s.id}
                onClick={() => s.earned && setSelectedSticker(s)}
                style={{
                  aspectRatio: '1', borderRadius: 18,
                  background: s.earned ? '#FFF8EC' : 'rgba(255,255,255,0.3)',
                  border: '2px dashed ' + (s.earned ? 'transparent' : 'rgba(46,90,58,0.25)'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: s.earned ? 40 : 28,
                  color: s.earned ? 'inherit' : 'rgba(46,90,58,0.3)',
                  boxShadow: s.earned ? '0 3px 0 rgba(46,90,58,0.12)' : 'none',
                  animation: s.earned ? `pop-in 0.4s ease-out ${i * 0.02}s both` : 'none',
                  cursor: s.earned ? 'pointer' : 'default',
                }}
              >
                {s.earned ? s.emoji : '?'}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    <StickerDetailSheet
      sticker={selectedSticker ? { emoji: selectedSticker.emoji, name: selectedSticker.name } : null}
      onClose={() => setSelectedSticker(null)}
    />
    </>
  );
}
