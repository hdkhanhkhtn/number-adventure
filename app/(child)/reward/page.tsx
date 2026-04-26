'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGameProgress } from '@/context/game-progress-context';
import { RewardContent } from '@/components/screens/reward-content';
import { useSessionTimer } from '@/lib/hooks/use-session-timer';
import { DailyGoalOverlay } from '@/components/screens/daily-goal-overlay';
import type { MascotColor } from '@/lib/types/common';

interface SessionResult {
  session: { stars: number };
  sticker?: { emoji: string; name: string } | null;
  streak?: { currentStreak: number; longestStreak: number } | null;
  correct?: number;
  total?: number;
}

function RewardInner() {
  const { state } = useGameProgress();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<SessionResult | null>(null);

  // Result can come from sessionStorage (set by game page on complete)
  useEffect(() => {
    const cached = sessionStorage.getItem('lastGameResult');
    if (cached) {
      setResult(JSON.parse(cached) as SessionResult);
      sessionStorage.removeItem('lastGameResult');
    } else {
      // Fallback: minimal result
      setResult({ session: { stars: 1 } });
    }
  }, []);

  const dailyMin = state.settings?.dailyMin ?? 15;
  const { elapsedMin } = useSessionTimer(dailyMin);
  const todayStr = new Date().toLocaleDateString('en-CA');
  const dailyGoalKey = `bap-daily-goal-${todayStr}`;
  const [showDailyGoal, setShowDailyGoal] = useState(false);

  useEffect(() => {
    if (elapsedMin >= dailyMin && !localStorage.getItem(dailyGoalKey)) {
      setShowDailyGoal(true);
    }
  }, [elapsedMin, dailyMin, dailyGoalKey]);

  const profile = state.profile;
  if (!result || !profile) return null;

  const stars = result.session.stars;
  const total = result.total ?? 5;
  const correct = result.correct ?? total;

  return (
    <>
      <RewardContent
        stars={stars}
        correct={correct}
        total={total}
        sticker={result.sticker ?? null}
        streak={result.streak ?? null}
        profileName={profile.name}
        profileColor={profile.color as MascotColor}
        onContinue={() => {
          const worldId = searchParams.get('worldId');
          if (worldId) router.push(`/worlds/${worldId}`);
          else router.push('/worlds');
        }}
      />
      {showDailyGoal && (
        <DailyGoalOverlay
          elapsedMin={elapsedMin}
          dailyMin={dailyMin}
          onContinue={() => {
            localStorage.setItem(dailyGoalKey, '1');
            router.push('/home');
          }}
        />
      )}
    </>
  );
}

export default function RewardPage() {
  return (
    <Suspense>
      <RewardInner />
    </Suspense>
  );
}
