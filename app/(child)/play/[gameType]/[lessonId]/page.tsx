'use client';

import { use, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameProgress } from '@/context/game-progress-context';
import { useGameSession } from '@/lib/hooks/use-game-session';
import { loadQuestions } from '@/lib/game-engine/question-loader';
import { GAME_REGISTRY } from '@/lib/game-engine/registry';
import type { AnyQuestion, GameType } from '@/lib/game-engine/types';
import type { GameResult } from '@/lib/game-engine/types';
import { LESSON_TEMPLATES } from '@/src/data/game-config/lesson-templates';
import { HearTapGame } from './hear-tap-game';
import { BuildNumberGame } from './build-number-game';
import { EvenOddGame } from './even-odd-game';
import { NumberOrderGame } from './number-order-game';
import { AddTakeGame } from './add-take-game';
import { CountObjectsGame } from './count-objects-game';
import { NumberWritingGame } from './number-writing-game';
import { useSessionTimer } from '@/lib/hooks/use-session-timer';
import { TimeUpOverlay } from '@/components/screens/time-up-overlay';
import { ExitConfirmModal } from '@/components/game/exit-confirm-modal';
import { SkeletonScreen } from '@/components/ui/skeleton-screen';

const VALID_GAME_TYPES = Object.keys(GAME_REGISTRY) as GameType[];

type GameProps = {
  questions: AnyQuestion[];
  onComplete: (result: GameResult) => void;
  onExit: () => void;
  onAttempt: (answer: string, correct: boolean) => void;
};

const GAME_MAP: Record<GameType, React.ComponentType<GameProps>> = {
  'hear-tap':       HearTapGame as React.ComponentType<GameProps>,
  'build-number':   BuildNumberGame as React.ComponentType<GameProps>,
  'even-odd':       EvenOddGame as React.ComponentType<GameProps>,
  'number-order':   NumberOrderGame as React.ComponentType<GameProps>,
  'add-take':       AddTakeGame as React.ComponentType<GameProps>,
  'count-objects':  CountObjectsGame as React.ComponentType<GameProps>,
  'number-writing': NumberWritingGame as React.ComponentType<GameProps>,
};

export default function PlayPage({ params }: { params: Promise<{ gameType: string; lessonId: string }> }) {
  const { gameType, lessonId } = use(params);
  const { state, isHydrated } = useGameProgress();
  const router = useRouter();
  const [questions, setQuestions] = useState<AnyQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTimeUp, setShowTimeUp] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const dailyMin = state.settings?.dailyMin ?? 15;
  const { timeUp } = useSessionTimer(dailyMin);

  const childId = state.childId ?? 'guest';
  const { startSession, submitAttempt, completeSession } = useGameSession(childId, lessonId);

  const lesson = LESSON_TEMPLATES.find((l) => l.id === lessonId);
  const validGameType = VALID_GAME_TYPES.includes(gameType as GameType) ? (gameType as GameType) : null;

  // Guard against React Strict Mode double-invocation creating duplicate sessions
  const hasStarted = useRef(false);

  // Redirect immediately if today's limit already reached before game loads
  useEffect(() => {
    if (timeUp && loading) {
      router.replace('/home');
    }
  }, [timeUp, loading, router]);

  useEffect(() => {
    if (!validGameType) return;
    if (hasStarted.current) return;
    hasStarted.current = true;
    let cancelled = false;
    (async () => {
      await startSession();
      const qs = await loadQuestions(
        lessonId, validGameType, lesson?.questionCount ?? 5, lesson?.difficulty ?? 'easy',
      );
      if (!cancelled) { setQuestions(qs); setLoading(false); }
    })();
    return () => { cancelled = true; };
  // Intentionally runs once on mount only. hasStarted ref guards against
  // React Strict Mode double-invocation creating duplicate game sessions.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleComplete = async (result: GameResult) => {
    const sessionResult = await completeSession(result.stars);
    // Cache result for reward page — include correct count from GameResult
    const payload = sessionResult
      ? { ...sessionResult, correct: result.correct, total: result.total }
      : { session: { stars: result.stars }, correct: result.correct, total: result.total };
    sessionStorage.setItem('lastGameResult', JSON.stringify(payload));

    if (timeUp) {
      setShowTimeUp(true);
      return;
    }
    const worldId = lesson?.worldId ?? '';
    router.replace(`/reward?worldId=${worldId}`);
  };

  const handleAttempt = (answer: string, correct: boolean) => {
    void submitAttempt({ answer, correct });
  };

  if (!isHydrated) return <SkeletonScreen />;
  if (!state.childId) { router.replace('/'); return null; }
  if (!validGameType) return <div style={{ padding: 40 }}>Unknown game type.</div>;
  if (loading) {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF8EC' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#2D3A2E' }}>Loading questions… 🌱</div>
      </div>
    );
  }

  const GameComponent = GAME_MAP[validGameType];
  return (
    <>
      <GameComponent
        questions={questions}
        onComplete={handleComplete}
        onExit={() => setShowExitConfirm(true)}
        onAttempt={handleAttempt}
      />
      {showTimeUp && <TimeUpOverlay />}
      {showExitConfirm && (
        <ExitConfirmModal
          onStay={() => setShowExitConfirm(false)}
          onQuit={async () => {
            await completeSession(0);
            router.push(`/worlds/${lesson?.worldId ?? ''}`);
          }}
        />
      )}
    </>
  );
}
