'use client';

import { useState, useEffect, useCallback } from 'react';
import { GameContainer } from '@/components/game/game-container';
import { GameHud } from '@/components/game/game-hud';
import { NumTile } from '@/components/ui/num-tile';
import { useGame } from '@/lib/hooks/use-game';
import type { NumberOrderQuestion, AnyQuestion, GameResult } from '@/lib/game-engine/types';

interface Props {
  questions: AnyQuestion[];
  onComplete: (result: GameResult) => void;
  onExit: () => void;
  onAttempt: (answer: string, correct: boolean) => void;
}

export function NumberOrderGame({ questions, onComplete, onExit, onAttempt }: Props) {
  const [picked, setPicked] = useState<number | null>(null);

  const { round, hearts, question, totalRounds, handleCorrect, handleWrong } = useGame<AnyQuestion>(questions, onComplete);
  const q = question as NumberOrderQuestion | null;

  useEffect(() => { setPicked(null); }, [round]);

  const pick = useCallback((n: number) => {
    if (!q || picked !== null) return;
    setPicked(n);
    const correct = n === q.target;
    onAttempt(String(n), correct);
    if (correct) setTimeout(handleCorrect, 900);
    else handleWrong(); // decrements hearts and advances after 900ms internally
  }, [q, picked, handleCorrect, handleWrong, onAttempt]);

  if (!q) return null;

  return (
    <GameContainer variant="sun">
      <GameHud hearts={hearts} progress={round} total={totalRounds} onClose={onExit} />
      <div style={{ padding: '0 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: '#7A4E0E', fontWeight: 700, letterSpacing: 0.5 }}>WHAT COMES NEXT?</div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28, padding: '0 16px' }}>
        {/* Sequence row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          {q.seq.map((n, i) =>
            i === q.hideIdx ? (
              <div key={i} style={{
                width: 64, height: 76, borderRadius: 18,
                background: 'rgba(255,255,255,0.6)', border: '3px dashed rgba(46,90,58,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36, color: '#7A4E0E', fontWeight: 700,
              }}>?</div>
            ) : (
              <div key={i} style={{
                width: 56, height: 66, borderRadius: 16,
                background: '#fff', border: '2px solid #2D3A2E',
                boxShadow: '0 3px 0 rgba(46,90,58,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-num)', fontWeight: 700, fontSize: 30, color: '#2D3A2E',
              }}>{n}</div>
            )
          )}
        </div>

        {/* Options */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
          {q.options.map((n) => (
            <NumTile key={n} n={n} size="md" color="cream"
              state={picked === n ? (n === q.target ? 'correct' : 'wrong') : 'idle'}
              onClick={() => pick(n)} />
          ))}
        </div>
      </div>
    </GameContainer>
  );
}
