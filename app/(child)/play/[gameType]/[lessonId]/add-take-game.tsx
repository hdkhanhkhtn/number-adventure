'use client';

import { useState, useEffect, useCallback } from 'react';
import { GameContainer } from '@/components/game/game-container';
import { GameHud } from '@/components/game/game-hud';
import { NumTile } from '@/components/ui/num-tile';
import { useGame } from '@/lib/hooks/use-game';
import { useSoundEffects } from '@/lib/hooks/use-sound-effects';
import type { AddTakeQuestion, AnyQuestion, GameResult } from '@/lib/game-engine/types';

interface Props {
  questions: AnyQuestion[];
  onComplete: (result: GameResult) => void;
  onExit: () => void;
  onAttempt: (answer: string, correct: boolean) => void;
}

function Apples({ count, crossed = 0 }: { count: number; crossed?: number }) {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 100, justifyContent: 'center' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ fontSize: 26, position: 'relative', lineHeight: 1, opacity: i < crossed ? 0.3 : 1 }}>
          🍎
          {i < crossed && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C14A2A', fontSize: 32, fontWeight: 900 }}>✕</div>
          )}
        </div>
      ))}
    </div>
  );
}

export function AddTakeGame({ questions, onComplete, onExit, onAttempt }: Props) {
  const [picked, setPicked] = useState<number | null>(null);

  const { playCorrect, playWrong, playLevelComplete } = useSoundEffects();

  const { round, hearts, question, totalRounds, handleCorrect, handleWrong } = useGame<AnyQuestion>(questions, onComplete);
  const q = question as AddTakeQuestion | null;

  useEffect(() => { setPicked(null); }, [round]);

  const pick = useCallback((n: number) => {
    if (!q || picked !== null) return;
    setPicked(n);
    const correct = n === q.target;
    onAttempt(String(n), correct);
    if (correct) { playCorrect(); setTimeout(() => { playLevelComplete(); handleCorrect(); }, 900); }
    else { playWrong(); handleWrong(); }
  }, [q, picked, handleCorrect, handleWrong, onAttempt, playCorrect, playWrong, playLevelComplete]);

  if (!q) return null;

  return (
    <GameContainer variant="cream">
      <GameHud hearts={hearts} progress={round} total={totalRounds} onClose={onExit} />
      <div style={{ padding: '0 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: '#7A4E0E', fontWeight: 700, letterSpacing: 0.5 }}>
          {q.op === '+' ? 'HOW MANY TOGETHER?' : 'HOW MANY LEFT?'}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, padding: '8px 16px', justifyContent: 'space-around' }}>
        {/* Visual */}
        <div style={{
          background: '#fff', borderRadius: 22, border: '3px solid #2D3A2E',
          boxShadow: '0 4px 0 rgba(46,90,58,0.2)', padding: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 6,
        }}>
          <Apples count={q.a} crossed={q.op === '-' ? q.b : 0} />
          <div style={{ fontSize: 44, fontWeight: 700, color: '#2D3A2E', fontFamily: 'var(--font-num)' }}>{q.op}</div>
          {q.op === '+' ? <Apples count={q.b} /> : <div style={{ fontSize: 36, fontWeight: 700, fontFamily: 'var(--font-num)' }}>{q.b}</div>}
        </div>

        {/* Equation */}
        <div style={{ textAlign: 'center', fontSize: 44, fontWeight: 700, color: '#2D3A2E', fontFamily: 'var(--font-num)' }}>
          {q.a} {q.op} {q.b} = <span style={{ color: '#C14A2A' }}>?</span>
        </div>

        {/* Options */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {q.options.map((n) => (
            <NumTile key={n} n={n} size="sm" color="cream"
              state={picked === n ? (n === q.target ? 'correct' : 'wrong') : 'idle'}
              onClick={() => pick(n)} />
          ))}
        </div>
      </div>
    </GameContainer>
  );
}
