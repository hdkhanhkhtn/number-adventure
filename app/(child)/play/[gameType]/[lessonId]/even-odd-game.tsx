'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameContainer } from '@/components/game/game-container';
import { GameHud } from '@/components/game/game-hud';
import { Basket } from '@/components/game/basket';
import { useGame } from '@/lib/hooks/use-game';
import { useSoundEffects } from '@/lib/hooks/use-sound-effects';
import type { EvenOddQuestion, AnyQuestion, GameResult } from '@/lib/game-engine/types';

interface Props {
  questions: AnyQuestion[];
  onComplete: (result: GameResult) => void;
  onExit: () => void;
  onAttempt: (answer: string, correct: boolean) => void;
}

export function EvenOddGame({ questions, onComplete, onExit, onAttempt }: Props) {
  const [picked, setPicked] = useState<'even' | 'odd' | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { playCorrect, playWrong, playLevelComplete } = useSoundEffects();

  const { round, hearts, question, totalRounds, handleCorrect, handleWrong } = useGame<AnyQuestion>(
    questions,
    onComplete,
  );
  const q = question as EvenOddQuestion | null;

  // Reset picked when round advances
  useEffect(() => { setPicked(null); }, [round]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const drop = useCallback((choice: 'even' | 'odd') => {
    if (!q || picked) return;
    setPicked(choice);
    const correct = (choice === 'even') === q.isEven;
    onAttempt(choice, correct);
    if (correct) {
      playCorrect();
      timeoutRef.current = setTimeout(() => { playLevelComplete(); handleCorrect(); }, 900);
    } else {
      playWrong();
      handleWrong();
    }
  }, [q, picked, handleCorrect, handleWrong, onAttempt, playCorrect, playWrong, playLevelComplete]);

  if (!q) return null;

  return (
    <GameContainer variant="lavender">
      <GameHud hearts={hearts} progress={round} total={totalRounds} onClose={onExit} />
      <div style={{ padding: '0 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: '#5D3F94', fontWeight: 700, letterSpacing: 0.5 }}>EVEN or ODD?</div>
      </div>

      {/* Number with dot array */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 20px' }}>
        <div style={{
          padding: '18px 22px', borderRadius: 22, background: '#fff',
          border: '3px solid #2D3A2E', boxShadow: '0 4px 0 rgba(46,90,58,0.2)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        }}>
          <div style={{ fontSize: 54, fontWeight: 700, fontFamily: 'var(--font-num)', lineHeight: 1, color: '#2D3A2E' }}>{q.number}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 14px)', gap: 4 }}>
            {Array.from({ length: q.number }).map((_, i) => (
              <div key={i} style={{
                width: 14, height: 14, borderRadius: '50%',
                background: i % 2 === 0 ? '#FFA48C' : '#B8DEEF',
                border: '1.5px solid #2D3A2E',
              }} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'stretch' }}>
        <Basket label="EVEN" hint="pairs" color="sage"
          active={picked === 'even'} correct={picked === 'even' && q.isEven} wrong={picked === 'even' && !q.isEven}
          onClick={() => drop('even')} />
        <Basket label="ODD" hint="one left over" color="coral"
          active={picked === 'odd'} correct={picked === 'odd' && !q.isEven} wrong={picked === 'odd' && q.isEven}
          onClick={() => drop('odd')} />
      </div>
    </GameContainer>
  );
}
