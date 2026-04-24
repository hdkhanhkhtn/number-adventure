'use client';

import { useState, useEffect, useCallback } from 'react';
import { GameContainer } from '@/components/game/game-container';
import { GameHud } from '@/components/game/game-hud';
import { NumTile } from '@/components/ui/num-tile';
import { SpeakerIcon } from '@/components/ui/speaker-icon';
import { Sparkles } from '@/components/ui/sparkles';
import { useGame } from '@/lib/hooks/use-game';
import type { HearTapQuestion, AnyQuestion, GameResult } from '@/lib/game-engine/types';

function speak(n: number) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(n));
    u.rate = 0.85; u.pitch = 1.1; u.lang = 'en-US';
    window.speechSynthesis.speak(u);
  } catch { /* ignore */ }
}

interface Props {
  questions: AnyQuestion[];
  onComplete: (result: GameResult) => void;
  onExit: () => void;
  onAttempt: (answer: string, correct: boolean) => void;
}

export function HearTapGame({ questions, onComplete, onExit, onAttempt }: Props) {
  const [wrongs, setWrongs] = useState(new Set<number>());
  const [correctPicked, setCorrectPicked] = useState(false);

  const { round, hearts, question, totalRounds, handleCorrect, handleWrong } = useGame<AnyQuestion>(questions, onComplete);
  const q = question as HearTapQuestion | null;

  useEffect(() => {
    setWrongs(new Set());
    setCorrectPicked(false);
    if (q) speak(q.target);
  }, [round]); // eslint-disable-line react-hooks/exhaustive-deps

  const onPick = useCallback((n: number) => {
    if (!q || correctPicked) return;
    if (n === q.target) {
      setCorrectPicked(true);
      onAttempt(String(n), true);
      setTimeout(handleCorrect, 900);
    } else {
      setWrongs((prev) => new Set([...prev, n]));
      onAttempt(String(n), false);
      handleWrong();
    }
  }, [q, correctPicked, handleCorrect, handleWrong, onAttempt]);

  if (!q) return null;

  return (
    <GameContainer variant="sage">
      <Sparkles count={6} color="#FFD36E" />
      <GameHud hearts={hearts} progress={round} total={totalRounds} onClose={onExit} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px', gap: 28 }}>
        <div style={{ fontSize: 14, color: '#2F6A3C', fontWeight: 700, letterSpacing: 0.5 }}>TAP WHAT YOU HEAR</div>
        <button onClick={() => speak(q.target)} className="no-select pulse-soft" style={{
          width: 160, height: 160, borderRadius: '50%',
          background: '#FFD36E', border: '4px solid #2D3A2E',
          boxShadow: '0 6px 0 #C79528, 0 14px 24px rgba(46,90,58,0.18)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: '#5E3A00', gap: 6, cursor: 'pointer',
        }}>
          <SpeakerIcon size={52} />
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.5 }}>TAP TO HEAR</div>
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {q.options.map((n) => (
            <NumTile
              key={n} n={n} size="lg"
              color={n === q.target && correctPicked ? 'sage' : 'cream'}
              state={correctPicked && n === q.target ? 'correct' : wrongs.has(n) ? 'wrong' : 'idle'}
              onClick={() => onPick(n)}
            />
          ))}
        </div>
      </div>
    </GameContainer>
  );
}
