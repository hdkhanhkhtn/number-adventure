'use client';

import { useEffect, useState } from 'react';
import { GardenBg } from '@/components/ui/garden-bg';
import { BapMascot } from '@/components/ui/bap-mascot';
import { BigButton } from '@/components/ui/big-button';
import { StarRow } from '@/components/ui/star-row';
import { Sparkles } from '@/components/ui/sparkles';
import { Confetti } from '@/components/ui/confetti';
import { StatDisplay } from './stat-display';
import { StreakCard } from '@/components/ui/streak-card';
import { StickerEarnOverlay } from '@/components/screens/sticker-earn-overlay';
import { StreakDetailSheet } from '@/components/ui/streak-detail-sheet';
import type { MascotColor } from '@/lib/types/common';

export interface RewardContentProps {
  stars: number;
  correct: number;
  total: number;
  sticker?: { emoji: string; name: string } | null;
  streak?: { currentStreak: number; longestStreak: number } | null;
  onContinue: () => void;
  profileName: string;
  profileColor?: MascotColor;
}

/** Celebration screen shown after completing a game */
export function RewardContent({
  stars, correct, total, sticker, streak, onContinue, profileName, profileColor = 'sun',
}: RewardContentProps) {
  const message = stars === 3 ? 'Amazing, ' : stars === 2 ? 'Great job, ' : 'Good try, ';
  const [showStickerMoment, setShowStickerMoment] = useState(false);
  const [stickerMomentDone, setStickerMomentDone] = useState(false);
  const [showStreakDetail, setShowStreakDetail] = useState(false);

  useEffect(() => {
    if (!sticker || stickerMomentDone) return;
    const timer = setTimeout(() => setShowStickerMoment(true), 800);
    return () => clearTimeout(timer);
  }, [sticker, stickerMomentDone]);

  return (
    <>
    <div style={{ position: 'absolute', inset: 0 }}>
      <GardenBg variant="sun">
        <Sparkles count={14} color="#FFB84A" />
      </GardenBg>
      <Confetti count={40} />
      <div style={{
        position: 'relative', zIndex: 1, height: '100%',
        padding: '32px 24px 28px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#5E3A00', textAlign: 'center', animation: 'pop-in 0.4s both' }}>
          {message}{profileName}!
        </div>

        <div className="bobble" style={{ marginTop: 12 }}>
          <BapMascot size={140} mood="celebrate" color={profileColor} />
        </div>

        <div style={{ marginTop: 8 }}>
          <StarRow value={stars} size={52} gap={10} />
        </div>

        <div style={{
          marginTop: 18, background: '#FFF8EC', borderRadius: 22,
          border: '3px solid #2D3A2E', boxShadow: '0 4px 0 rgba(46,90,58,0.2)',
          padding: '14px 18px', width: '100%',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <StatDisplay label="Correct" value={`${correct}/${total}`} color="#2F6A3C" />
            <div style={{ width: 1, height: 32, background: 'rgba(46,90,58,0.15)' }} />
            <StatDisplay label="Stars" value={`+${stars}`} color="#7A4E0E" icon="⭐" />
          </div>
        </div>

        {sticker && (
          <div style={{
            marginTop: 14, padding: '12px 18px', borderRadius: 20,
            background: '#D9C7F0', border: '3px solid #2D3A2E',
            boxShadow: '0 4px 0 #A58AD0',
            display: 'flex', alignItems: 'center', gap: 12,
            animation: 'pop-in 0.5s ease-out 0.5s both',
          }}>
            <div style={{ fontSize: 38 }}>{sticker.emoji}</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#5D3F94', letterSpacing: 0.5 }}>NEW STICKER!</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#2D3A2E' }}>{sticker.name}</div>
            </div>
          </div>
        )}

        {streak && streak.currentStreak > 0 && (
          <div style={{ marginTop: 14, width: '100%' }}>
            <StreakCard currentStreak={streak.currentStreak} longestStreak={streak.longestStreak} onTap={() => setShowStreakDetail(true)} />
          </div>
        )}

        <div style={{ marginTop: 'auto', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <BigButton color="sage" size="xl" onClick={onContinue} icon="▶">Next</BigButton>
        </div>
      </div>
    </div>
    {showStickerMoment && sticker && (
      <StickerEarnOverlay
        emoji={sticker.emoji}
        name={sticker.name}
        onDismiss={() => { setStickerMomentDone(true); setShowStickerMoment(false); }}
      />
    )}
    {streak && (
      <StreakDetailSheet
        visible={showStreakDetail}
        currentStreak={streak.currentStreak}
        longestStreak={streak.longestStreak}
        onClose={() => setShowStreakDetail(false)}
      />
    )}
    </>
  );
}
