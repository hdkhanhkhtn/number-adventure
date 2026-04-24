'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameProgress } from '@/context/game-progress-context';
import { useGameSession } from '@/lib/hooks/use-game-session';
import { loadQuestions } from '@/lib/game-engine/question-loader';
import type { AnyQuestion, GameType } from '@/lib/game-engine/types';
import type { GameResult } from '@/lib/game-engine/types';
import { LESSON_TEMPLATES } from '@/src/data/game-config/lesson-templates';
import { HearTapGame } from './hear-tap-game';
import { BuildNumberGame } from './build-number-game';
import { EvenOddGame } from './even-odd-game';
import { NumberOrderGame } from './number-order-game';
import { AddTakeGame } from './add-take-game';

const VALID_GAME_TYPES: GameType[] = ['hear-tap', 'build-number', 'even-odd', 'number-order', 'add-take'];

type GameProps = {
  questions: AnyQuestion[];
  onComplete: (result: GameResult) => void;
  onExit: () => void;
  onAttempt: (answer: string, correct: boolean) => void;
};

const GAME_MAP: Record<GameType, React.ComponentType<GameProps>> = {
  'hear-tap':     HearTapGame as React.ComponentType<GameProps>,
  'build-number': BuildNumberGame as React.ComponentType<GameProps>,
  'even-odd':     EvenOddGame as React.ComponentType<GameProps>,
  'number-order': NumberOrderGame as React.ComponentType<GameProps>,
  'add-take':     AddTakeGame as React.ComponentType<GameProps>,
};

export default function PlayPage({ params }: { params: Promise<{ gameType: string; lessonId: string }> }) {
  const { gameType, lessonId } = use(params);
  const { state } = useGameProgress();
  const router = useRouter();
  const [questions, setQuestions] = useState<AnyQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const childId = state.childId ?? 'guest';
  const { startSession, submitAttempt, completeSession } = useGameSession(childId, lessonId);

  const lesson = LESSON_TEMPLATES.find((l) => l.id === lessonId);
  const validGameType = VALID_GAME_TYPES.includes(gameType as GameType) ? (gameType as GameType) : null;

  useEffect(() => {
    if (!validGameType) return;
    let cancelled = false;
    (async () => {
      await startSession();
      const qs = await loadQuestions(lessonId, validGameType, lesson?.questionCount ?? 5);
      if (!cancelled) { setQuestions(qs); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [lessonId, validGameType]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleComplete = async (result: GameResult) => {
    const sessionResult = await completeSession(result.stars);
    // Cache result for reward page
    sessionStorage.setItem('lastGameResult', JSON.stringify(
      sessionResult ?? { session: { stars: result.stars } },
    ));
    const worldId = lesson?.worldId ?? '';
    router.push(`/reward?worldId=${worldId}`);
  };

  const handleAttempt = (answer: string, correct: boolean) => {
    void submitAttempt({ answer, correct });
  };

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
    <GameComponent
      questions={questions}
      onComplete={handleComplete}
      onExit={() => router.back()}
      onAttempt={handleAttempt}
    />
  );
}
