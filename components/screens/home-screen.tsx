'use client';

import { GardenBg } from '@/components/ui/garden-bg';
import { BapMini, BapMascot } from '@/components/ui/bap-mascot';
import { BigButton } from '@/components/ui/big-button';
import { IconBtn } from '@/components/ui/icon-btn';
import { Tag } from '@/components/ui/tag';
import { Sparkles } from '@/components/ui/sparkles';
import { QuickTile } from './quick-tile';
import type { MascotColor } from '@/lib/types/common';

export interface HomeScreenProps {
  profile: { name: string; color: MascotColor };
  streak: number;
  weekDays: boolean[];
  stickerCount: number;
  stickerTotal: number;
  onPlay: () => void;
  onMap: () => void;
  onStickers: () => void;
  onParent: () => void;
}

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** Main child home screen */
export function HomeScreen({
  profile, streak, weekDays, stickerCount, stickerTotal,
  onPlay, onMap, onStickers, onParent,
}: HomeScreenProps) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GardenBg variant="cream">
        <Sparkles count={8} color="#FFD36E" />
      </GardenBg>
      <div style={{
        position: 'relative', zIndex: 1, height: '100%',
        padding: '60px 20px 24px', display: 'flex', flexDirection: 'column',
      }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%', background: '#FFF8EC',
            border: '3px solid #2D3A2E', display: 'flex', alignItems: 'center',
            justifyContent: 'center', boxShadow: '0 3px 0 rgba(46,90,58,0.2)', overflow: 'hidden',
          }}>
            <BapMini size={44} color={profile.color} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: '#6B7A6C', fontWeight: 600 }}>Hi,</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#2D3A2E' }}>{profile.name}!</div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '8px 12px', borderRadius: 999, background: '#FFE6A8',
            border: '2px solid #2D3A2E', boxShadow: '0 3px 0 #C89220',
            fontWeight: 700, color: '#5E3A00',
          }}>
            🔥 <span>{streak}</span>
          </div>
          <IconBtn color="cream" size={44} onClick={onParent} style={{ fontSize: 18 }}>👤</IconBtn>
        </div>

        {/* Daily mission */}
        <div style={{ marginTop: 18, position: 'relative' }}>
          <div style={{
            background: 'linear-gradient(180deg, #B9E2B2 0%, #8FCC8A 100%)',
            borderRadius: 28, border: '3px solid #2D3A2E',
            boxShadow: '0 5px 0 rgba(46,90,58,0.25), 0 14px 24px rgba(46,90,58,0.15)',
            padding: '18px 18px 20px', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', right: -10, top: -6, opacity: 0.25, fontSize: 120 }}>✨</div>
            <Tag color="cream" style={{ background: '#FFF8EC', borderColor: '#2D3A2E', fontWeight: 700 }}>
              ⭐ TODAY&apos;S ADVENTURE
            </Tag>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#1F4A28', marginTop: 10, lineHeight: 1.1 }}>
              Number Garden
            </div>
            <div style={{ fontSize: 14, color: '#2F6A3C', marginTop: 4, marginBottom: 14 }}>
              3 games · 2 min
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <BigButton color="sun" size="lg" onClick={onPlay} icon="▶">Play</BigButton>
              <div className="bobble" style={{ marginLeft: 'auto' }}>
                <BapMascot size={88} color={profile.color} mood="celebrate" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
          <QuickTile title="World Map" subtitle="5 worlds" color="sky" onClick={onMap} emoji="🗺️" />
          <QuickTile
            title="Stickers" subtitle={`${stickerCount} / ${stickerTotal}`}
            color="coral" onClick={onStickers} emoji="🌟"
          />
        </div>

        {/* Weekly progress */}
        <div style={{ marginTop: 'auto', padding: 14, borderRadius: 20, background: '#FFF8EC', border: '2px solid rgba(46,90,58,0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 13, color: '#6B7A6C', fontWeight: 600 }}>This week</div>
            <div style={{ fontSize: 13, color: '#2F6A3C', fontWeight: 700 }}>
              {weekDays.filter(Boolean).length} of 7 days
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {WEEK_LABELS.map((d, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  width: '100%', paddingBottom: '100%', borderRadius: 10,
                  background: weekDays[i] ? '#FFD36E' : '#F0EADD',
                  border: '2px solid ' + (weekDays[i] ? '#C79528' : 'rgba(46,90,58,0.15)'),
                  position: 'relative', marginBottom: 4,
                }}>
                  {weekDays[i] && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⭐</div>
                  )}
                </div>
                <div style={{ fontSize: 10, color: '#6B7A6C', fontWeight: 600 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
