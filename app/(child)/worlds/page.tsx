'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameProgress } from '@/context/game-progress-context';
import { GardenBg } from '@/components/ui/garden-bg';
import { IconBtn } from '@/components/ui/icon-btn';
import { Sparkles } from '@/components/ui/sparkles';
import { WorldCard, type WorldCardData } from '@/components/screens/world-card';
import { WORLDS } from '@/src/data/game-config/worlds';

interface WorldProgress {
  worldId: string;
  unlocked: boolean;
  totalStars: number;
  maxStars: number;
}

export default function WorldsPage() {
  const { state } = useGameProgress();
  const router = useRouter();
  const [progressMap, setProgressMap] = useState<Record<string, WorldProgress>>({});

  useEffect(() => {
    if (!state.childId) return;
    fetch(`/api/progress/${state.childId}`)
      .then((r) => r.json())
      .then((d: { worldProgress?: WorldProgress[] }) => {
        if (d.worldProgress) {
          const map: Record<string, WorldProgress> = {};
          for (const wp of d.worldProgress) map[wp.worldId] = wp;
          setProgressMap(map);
        }
      })
      .catch(() => undefined);
  }, [state.childId]);

  const worldCards: WorldCardData[] = WORLDS.map((w, idx) => {
    const prog = progressMap[w.id];
    return {
      id: w.id,
      name: w.name,
      subtitle: w.subtitle,
      bg: w.bg,
      emoji: w.emoji,
      unlocked: prog ? prog.unlocked : idx === 0,
      totalStars: prog?.totalStars ?? 0,
      maxStars: prog?.maxStars ?? (w.lessonCount * 3),
    };
  });

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GardenBg variant="sky">
        <Sparkles count={10} color="#ffffff" />
      </GardenBg>
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '56px 20px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <IconBtn color="cream" size={48} onClick={() => router.back()}>‹</IconBtn>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#2D3A2E' }}>World Map</div>
        </div>
        <div className="scroll" style={{ flex: 1, padding: '4px 20px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {worldCards.map((w, i) => (
              <WorldCard
                key={w.id} world={w} index={i}
                onClick={() => w.unlocked && router.push(`/worlds/${w.id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
