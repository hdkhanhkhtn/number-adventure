'use client';

import { useState, useEffect, useRef } from 'react';
import { GameContainer } from '@/components/game/game-container';
import { GameHud } from '@/components/game/game-hud';
import { SlotColumn } from '@/components/game/slot-column';
import { TenStick } from '@/components/game/ten-stick';
import { OneDot } from '@/components/game/one-dot';
import { BigButton } from '@/components/ui/big-button';
import { useGame } from '@/lib/hooks/use-game';
import { useSoundEffects } from '@/lib/hooks/use-sound-effects';
import type { BuildNumberQuestion, AnyQuestion, GameResult } from '@/lib/game-engine/types';

interface Props {
  questions: AnyQuestion[];
  onComplete: (result: GameResult) => void;
  onExit: () => void;
  onAttempt: (answer: string, correct: boolean) => void;
}

export function BuildNumberGame({ questions, onComplete, onExit, onAttempt }: Props) {
  const [tens, setTens] = useState(0);
  const [ones, setOnes] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { playCorrect, playWrong, playLevelComplete } = useSoundEffects();

  const { round, hearts, question, totalRounds, handleCorrect, handleWrong } = useGame<AnyQuestion>(questions, onComplete);
  const q = question as BuildNumberQuestion | null;

  useEffect(() => { setTens(0); setOnes(0); }, [round]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const current = tens * 10 + ones;
  const match = q ? current === q.target : false;

  const submit = () => {
    if (!q) return;
    const correct = current === q.target;
    onAttempt(String(current), correct);
    if (correct) { playCorrect(); timeoutRef.current = setTimeout(() => { playLevelComplete(); handleCorrect(); }, 1000); }
    else { playWrong(); handleWrong(); }
  };

  if (!q) return null;

  return (
    <GameContainer variant="sky">
      <GameHud hearts={hearts} progress={round} total={totalRounds} onClose={onExit} />
      <div style={{ padding: '0 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: '#2E6F93', fontWeight: 700, letterSpacing: 0.5 }}>BUILD THE NUMBER</div>
      </div>

      {/* Target */}
      <div style={{ padding: '16px 20px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 140, height: 96, borderRadius: 22,
          background: '#FFD36E', border: '3px solid #2D3A2E', boxShadow: '0 5px 0 #C79528',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-num)', fontWeight: 700, fontSize: 60, color: '#5E3A00',
        }}>{q.target}</div>
        <div style={{ fontSize: 13, color: '#1F4A61', fontWeight: 600 }}>Make this number</div>
      </div>

      {/* Builder */}
      <div style={{ flex: 1, padding: '0 16px 8px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: 'rgba(255,255,255,0.5)', borderRadius: 20, border: '2px dashed rgba(46,90,58,0.3)', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#2E6F93', letterSpacing: 0.5 }}>YOUR NUMBER</div>
            <div style={{ fontSize: 38, fontWeight: 700, color: match ? '#2F6A3C' : '#2D3A2E', fontFamily: 'var(--font-num)', lineHeight: 1, transition: 'color 0.2s' }}>{current}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <SlotColumn label="Tens" sub="sticks of 10" count={tens} onAdd={() => tens < 9 && setTens(tens + 1)} onSub={() => tens > 0 && setTens(tens - 1)} color="sky" element={<TenStick />} />
            <SlotColumn label="Ones" sub="single dots" count={ones} onAdd={() => ones < 9 && setOnes(ones + 1)} onSub={() => ones > 0 && setOnes(ones - 1)} color="sun" element={<OneDot />} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <BigButton color="sage" size="lg" onClick={submit} disabled={current === 0}>
            {match ? 'Yay! ✓' : 'Check'}
          </BigButton>
        </div>
      </div>
    </GameContainer>
  );
}
