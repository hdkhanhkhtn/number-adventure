'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { GameContainer } from '@/components/game/game-container';
import { GameHud } from '@/components/game/game-hud';
import { NumTile } from '@/components/ui/num-tile';
import { Sparkles } from '@/components/ui/sparkles';
import { useGame } from '@/lib/hooks/use-game';
import { useSoundEffects } from '@/lib/hooks/use-sound-effects';
import type { CountObjectsQuestion, AnyQuestion, GameResult } from '@/lib/game-engine/types';

interface Props {
  questions: AnyQuestion[];
  onComplete: (result: GameResult) => void;
  onExit: () => void;
  onAttempt: (answer: string, correct: boolean) => void;
}

export function CountObjectsGame({ questions, onComplete, onExit, onAttempt }: Props) {
  const [correctPicked, setCorrectPicked] = useState(false);
  const [wrongPick, setWrongPick] = useState<number | null>(null);
  const [shuffledChoices, setShuffledChoices] = useState<number[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { playCorrect, playWrong, playLevelComplete } = useSoundEffects();
  const { round, hearts, question, totalRounds, handleCorrect, handleWrong } =
    useGame<AnyQuestion>(questions, onComplete);
  const q = question as CountObjectsQuestion | null;

  // Reset state + shuffle choices on new round
  useEffect(() => {
    setCorrectPicked(false);
    setWrongPick(null);
    if (q) setShuffledChoices([...q.choices].sort(() => Math.random() - 0.5));
  }, [round]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  const onPick = useCallback((n: number) => {
    if (!q || correctPicked) return;
    if (n === q.answer) {
      setCorrectPicked(true);
      playCorrect();
      onAttempt(String(n), true);
      timeoutRef.current = setTimeout(() => { playLevelComplete(); handleCorrect(); }, 900);
    } else {
      setWrongPick(n);
      playWrong();
      onAttempt(String(n), false);
      handleWrong();
      timeoutRef.current = setTimeout(() => {
        setWrongPick(null);
        setShuffledChoices((prev) => [...prev].sort(() => Math.random() - 0.5));
      }, 500);
    }
  }, [q, correctPicked, handleCorrect, handleWrong, onAttempt, playCorrect, playWrong, playLevelComplete]);

  if (!q) return null;

  return (
    <GameContainer variant="sun">
      <Sparkles count={6} color="#FFD36E" />
      <GameHud hearts={hearts} progress={round} total={totalRounds} onClose={onExit} />

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 20px', gap: 24,
      }}>
        <div style={{ fontSize: 14, color: '#2F6A3C', fontWeight: 700, letterSpacing: 0.5 }}>
          HOW MANY DO YOU SEE?
        </div>

        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
          gap: 8, maxWidth: 280, padding: 16,
          background: 'rgba(255,255,255,0.6)', borderRadius: 20,
          border: '3px solid #2D3A2E',
        }}>
          {q.items.map((emoji, i) => (
            <span key={i} style={{
              fontSize: 36, width: 48, height: 48,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {emoji}
            </span>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {shuffledChoices.map((n) => (
            <NumTile
              key={`${round}-${n}`}
              n={n}
              size="lg"
              color={n === q.answer && correctPicked ? 'sage' : 'cream'}
              state={
                correctPicked && n === q.answer ? 'correct'
                : wrongPick === n ? 'wrong'
                : 'idle'
              }
              onClick={() => onPick(n)}
            />
          ))}
        </div>
      </div>
    </GameContainer>
  );
}
