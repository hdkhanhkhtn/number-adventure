'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GameContainer } from '@/components/game/game-container';
import { GameHud } from '@/components/game/game-hud';
import { Sparkles } from '@/components/ui/sparkles';
import { useGame } from '@/lib/hooks/use-game';
import { useSoundEffects } from '@/lib/hooks/use-sound-effects';
import { DIGIT_SVG_PATHS } from '@/lib/game-engine/dot-paths';
import type { NumberWritingQuestion, AnyQuestion, GameResult, DotPoint } from '@/lib/game-engine/types';

interface Props {
  questions: AnyQuestion[];
  onComplete: (result: GameResult) => void;
  onExit: () => void;
  onAttempt: (answer: string, correct: boolean) => void;
}

const VIEWBOX_W = 200;
const VIEWBOX_H = 280;
const DOT_RADIUS = 28; // 56px diameter touch target

export function NumberWritingGame({ questions, onComplete, onExit, onAttempt }: Props) {
  const [completedDots, setCompletedDots] = useState<Set<number>>(new Set());
  const [nextLabel, setNextLabel] = useState(1);
  const [shakingDot, setShakingDot] = useState<number | null>(null);
  const [allDone, setAllDone] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { playCorrect, playWrong, playLevelComplete } = useSoundEffects();
  const { round, hearts, question, totalRounds, handleCorrect, handleWrong } =
    useGame<AnyQuestion>(questions, onComplete);
  const q = question as NumberWritingQuestion | null;

  // Reset per-round state when round changes
  useEffect(() => {
    setCompletedDots(new Set());
    setNextLabel(1);
    setShakingDot(null);
    setAllDone(false);
  }, [round]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const onDotTap = useCallback((dot: DotPoint) => {
    if (!q || allDone) return;

    if (dot.label === nextLabel) {
      playCorrect();
      onAttempt(String(dot.label), true);
      const newCompleted = new Set(completedDots);
      newCompleted.add(dot.label);
      setCompletedDots(newCompleted);

      if (newCompleted.size === q.totalDots) {
        // All dots tapped — celebrate then advance
        setAllDone(true);
        timeoutRef.current = setTimeout(() => {
          playLevelComplete();
          handleCorrect();
        }, 1200);
      } else {
        setNextLabel(dot.label + 1);
      }
    } else {
      // Wrong dot — shake it
      setShakingDot(dot.label);
      playWrong();
      onAttempt(String(dot.label), false);
      handleWrong();
      timeoutRef.current = setTimeout(() => setShakingDot(null), 500);
    }
  }, [q, allDone, nextLabel, completedDots, handleCorrect, handleWrong, onAttempt, playCorrect, playWrong, playLevelComplete]);

  if (!q) return null;

  const svgPath = DIGIT_SVG_PATHS[q.digit] ?? '';

  return (
    <GameContainer variant="lavender">
      <Sparkles count={4} color="#B9A4E0" />
      <GameHud hearts={hearts} progress={round} total={totalRounds} onClose={onExit} />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 20px',
        gap: 16,
      }}>
        <div style={{ fontSize: 14, color: '#3D256D', fontWeight: 700, letterSpacing: 0.5 }}>
          TRACE THE NUMBER
        </div>

        {/* Digit tracing board */}
        <div style={{
          position: 'relative',
          width: 200,
          height: 280,
          background: 'rgba(255,255,255,0.6)',
          borderRadius: 24,
          border: '3px solid #2D3A2E',
        }}>
          {/* SVG layer: digit outline + completed stroke lines */}
          <svg
            viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          >
            {/* Faint digit outline guide */}
            <path
              d={svgPath}
              fill="none"
              stroke="#E0D6F0"
              strokeWidth={12}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Green lines connecting tapped dots in order */}
            {q.dotPath.map((dot, i) => {
              if (i === 0) return null;
              const prev = q.dotPath[i - 1];
              if (!completedDots.has(dot.label) || !completedDots.has(prev.label)) return null;
              return (
                <line
                  key={`line-${i}`}
                  x1={(prev.x / 100) * VIEWBOX_W}
                  y1={(prev.y / 100) * VIEWBOX_H}
                  x2={(dot.x / 100) * VIEWBOX_W}
                  y2={(dot.y / 100) * VIEWBOX_H}
                  stroke="#7FC089"
                  strokeWidth={4}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>

          {/* Tap dot buttons — positioned absolutely over SVG */}
          {q.dotPath.map((dot) => {
            const isCompleted = completedDots.has(dot.label);
            const isNext = dot.label === nextLabel;
            const isShaking = shakingDot === dot.label;
            const cx = (dot.x / 100) * 200;
            const cy = (dot.y / 100) * 280;

            return (
              <motion.button
                key={`${round}-dot-${dot.label}`}
                onClick={() => onDotTap(dot)}
                disabled={isCompleted}
                aria-label={`Dot ${dot.label}`}
                animate={isShaking ? { x: [0, -6, 6, -6, 6, 0] } : {}}
                transition={isShaking ? { duration: 0.4 } : {}}
                style={{
                  position: 'absolute',
                  left: cx - DOT_RADIUS,
                  top: cy - DOT_RADIUS,
                  width: DOT_RADIUS * 2,
                  height: DOT_RADIUS * 2,
                  borderRadius: '50%',
                  border: '3px solid #2D3A2E',
                  background: isCompleted ? '#7FC089' : isNext ? '#FFD36E' : '#E8E0F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 18,
                  color: isCompleted ? '#1F4A28' : isNext ? '#5E3A00' : '#8872B4',
                  cursor: isCompleted ? 'default' : 'pointer',
                  boxShadow: isNext
                    ? '0 0 0 4px rgba(255,211,78,0.4), 0 4px 8px rgba(0,0,0,0.12)'
                    : '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'background 0.2s, box-shadow 0.2s',
                  zIndex: 2,
                  padding: 0,
                }}
              >
                {isCompleted ? '✓' : dot.label}
              </motion.button>
            );
          })}

          {/* Celebration overlay when all dots complete */}
          {allDone && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.7)',
              borderRadius: 24,
              zIndex: 3,
              fontSize: 64,
            }}>
              🎉
            </div>
          )}
        </div>

        <div style={{ fontSize: 22, fontWeight: 700, color: '#3D256D' }}>
          Write the number {q.digit}
        </div>
      </div>
    </GameContainer>
  );
}
