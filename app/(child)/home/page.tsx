'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameProgress } from '@/context/game-progress-context';
import { SkeletonScreen } from '@/components/ui/skeleton-screen';
import { HomeScreen } from '@/components/screens/home-screen';
import { ParentGate } from '@/components/parent/parent-gate';
import type { MascotColor } from '@/lib/types/common';
import { STICKER_DEFS } from '@/src/data/game-config/sticker-defs';

interface ProgressData {
  weekDays: boolean[];
}

export default function HomePage() {
  const { state, isHydrated } = useGameProgress();
  const router = useRouter();
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [weekDays, setWeekDays] = useState<boolean[]>(Array(7).fill(false));
  const [stickerCount, setStickerCount] = useState(0);
  const [showGate, setShowGate] = useState(false);
  const stickerTotal = STICKER_DEFS.length;

  const childId = state.childId;

  useEffect(() => {
    if (!childId) return;

    // Fetch streak
    fetch(`/api/streaks/${childId}`)
      .then((r) => r.json())
      .then((d: { currentStreak?: number; longestStreak?: number }) => {
        setStreak(d.currentStreak ?? 0);
        setLongestStreak(d.longestStreak ?? 0);
      })
      .catch(() => undefined);

    // Fetch progress (for weekDays)
    fetch(`/api/progress/${childId}`)
      .then((r) => r.json())
      .then((d: ProgressData) => { if (d.weekDays) setWeekDays(d.weekDays); })
      .catch(() => undefined);

    // Fetch sticker count
    fetch(`/api/children/${childId}/stickers`)
      .then((r) => r.json())
      .then((d: { collected?: number }) => setStickerCount(d.collected ?? 0))
      .catch(() => undefined);
  }, [childId]);

  if (!isHydrated) return <SkeletonScreen />;
  if (!state.childId || !state.profile) {
    router.replace('/');
    return null;
  }

  const profile = state.profile;

  return (
    <>
      <HomeScreen
        profile={{ name: profile.name, color: profile.color as MascotColor }}
        streak={streak}
        longestStreak={longestStreak}
        weekDays={weekDays}
        stickerCount={stickerCount}
        stickerTotal={stickerTotal}
        onPlay={() => router.push('/worlds')}
        onMap={() => router.push('/worlds')}
        onStickers={() => router.push('/stickers')}
        onParent={() => setShowGate(true)}
      />
      {showGate && (
        <ParentGate
          onPass={() => { setShowGate(false); router.push('/dashboard'); }}
          onCancel={() => setShowGate(false)}
        />
      )}
    </>
  );
}
