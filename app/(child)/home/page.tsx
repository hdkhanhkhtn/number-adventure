'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameProgress } from '@/context/game-progress-context';
import { HomeScreen } from '@/components/screens/home-screen';
import type { MascotColor } from '@/lib/types/common';

interface ProgressData {
  weekDays: boolean[];
}

export default function HomePage() {
  const { state } = useGameProgress();
  const router = useRouter();
  const [streak, setStreak] = useState(0);
  const [weekDays, setWeekDays] = useState<boolean[]>(Array(7).fill(false));
  const [stickerCount, setStickerCount] = useState(0);
  const stickerTotal = 40;

  const childId = state.childId;
  const profile = state.profile;

  useEffect(() => {
    if (!childId) return;

    // Fetch streak
    fetch(`/api/streaks/${childId}`)
      .then((r) => r.json())
      .then((d: { currentStreak?: number }) => setStreak(d.currentStreak ?? 0))
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

  if (!profile) return null;

  return (
    <HomeScreen
      profile={{ name: profile.name, color: profile.color as MascotColor }}
      streak={streak}
      weekDays={weekDays}
      stickerCount={stickerCount}
      stickerTotal={stickerTotal}
      onPlay={() => router.push('/worlds')}
      onMap={() => router.push('/worlds')}
      onStickers={() => router.push('/stickers')}
      onParent={() => router.push('/parent/dashboard')}
    />
  );
}
