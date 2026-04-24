'use client';

import { GardenBg } from '@/components/ui/garden-bg';
import { BapMascot } from '@/components/ui/bap-mascot';
import { BigButton } from '@/components/ui/big-button';
import { SpeakerIcon } from '@/components/ui/speaker-icon';

export interface WelcomeScreenProps {
  onStart: () => void;
  onExistingProfile: () => void;
  lang: string;
  setLang: (lang: string) => void;
}

const LANGS = [
  { code: 'en', label: '🇬🇧 EN' },
  { code: 'vi', label: '🇻🇳 VI' },
  { code: 'bi', label: '🌍 BI' },
];

/** Welcome screen with language toggle and start button */
export function WelcomeScreen({ onStart, onExistingProfile, lang, setLang }: WelcomeScreenProps) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GardenBg variant="cream" />
      <div style={{
        position: 'relative', zIndex: 1, height: '100%', padding: '72px 28px 40px',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Language toggle */}
        <div style={{ position: 'absolute', top: 56, right: 20, display: 'flex', gap: 6 }}>
          {LANGS.map((l) => (
            <button key={l.code} onClick={() => setLang(l.code)} className="no-select" style={{
              padding: '6px 12px', borderRadius: 999,
              background: lang === l.code ? '#FFD36E' : '#FFF4DE',
              border: '2px solid #2D3A2E',
              fontWeight: 700, fontSize: 12, color: '#5E3A00',
              boxShadow: lang === l.code ? '0 2px 0 #C79528' : 'none',
            }}>{l.label}</button>
          ))}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <div className="bobble">
            <BapMascot size={180} mood="wink" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#2D3A2E', lineHeight: 1.1 }}>
              Hi, I&apos;m Bắp!
            </div>
            <div style={{ fontSize: 18, color: '#6B7A6C', marginTop: 8, lineHeight: 1.3 }}>
              Let&apos;s play with numbers<br />together 🌱
            </div>
          </div>
          <div style={{
            marginTop: 8, padding: '10px 18px', borderRadius: 999,
            background: '#FFF4DE', border: '2px solid rgba(46,90,58,0.15)',
            display: 'inline-flex', alignItems: 'center', gap: 10,
            color: '#7A4E0E', fontSize: 14, fontWeight: 600,
          }}>
            <SpeakerIcon size={18} /> tap to hear
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <BigButton color="sage" size="xl" onClick={onStart} icon="▶">Start</BigButton>
          <button onClick={onExistingProfile} className="no-select" style={{
            fontSize: 14, color: '#6B7A6C', fontWeight: 600, padding: 10,
          }}>
            I already have a profile
          </button>
        </div>
      </div>
    </div>
  );
}
