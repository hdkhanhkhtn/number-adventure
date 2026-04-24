'use client';

import { useState } from 'react';
import { GardenBg } from '@/components/ui/garden-bg';
import { BapMascot, BapMini } from '@/components/ui/bap-mascot';
import { BigButton } from '@/components/ui/big-button';
import { IconBtn } from '@/components/ui/icon-btn';
import { NumTile } from '@/components/ui/num-tile';
import type { MascotColor } from '@/lib/types/common';

export interface ProfileSetupProps {
  onDone: (profile: { name: string; age: number; color: MascotColor }) => void;
}

const COLORS: MascotColor[] = ['sun', 'sage', 'coral', 'lavender', 'sky'];
const AGES = [3, 4, 5, 6];
const STEP_COUNT = 3;

/** 3-step onboarding wizard: name → age → mascot color */
export function ProfileSetup({ onDone }: ProfileSetupProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('Bắp');
  const [age, setAge] = useState<number>(4);
  const [color, setColor] = useState<MascotColor>('sun');

  const next = () => {
    if (step < STEP_COUNT - 1) setStep(step + 1);
    else onDone({ name: name.trim() || 'Bắp', age, color });
  };

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GardenBg variant="sky" />
      <div style={{
        position: 'relative', zIndex: 1, height: '100%', padding: '64px 24px 32px',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Step dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: i === step ? 28 : 10, height: 10, borderRadius: 10,
              background: i <= step ? '#5FB36A' : 'rgba(46,90,58,0.2)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
          {step === 0 && (
            <>
              <div className="pop-in"><BapMascot size={120} color={color} mood="happy" /></div>
              <div style={{ fontSize: 24, fontWeight: 700, textAlign: 'center' }}>What&apos;s your name?</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%', maxWidth: 280, height: 68,
                  border: '3px solid #2D3A2E', borderRadius: 24,
                  background: '#fff', fontFamily: 'var(--font-kid)',
                  fontWeight: 700, fontSize: 32, textAlign: 'center',
                  color: '#2D3A2E', outline: 'none',
                  boxShadow: '0 4px 0 rgba(46,90,58,0.2)',
                }}
              />
            </>
          )}

          {step === 1 && (
            <>
              <div className="pop-in"><BapMascot size={120} color={color} mood="think" /></div>
              <div style={{ fontSize: 24, fontWeight: 700, textAlign: 'center' }}>How old are you?</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                {AGES.map((a) => (
                  <NumTile key={a} n={a} size="md" color={age === a ? 'sun' : 'cream'} onClick={() => setAge(a)} />
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="pop-in"><BapMascot size={140} color={color} mood="celebrate" /></div>
              <div style={{ fontSize: 24, fontWeight: 700, textAlign: 'center' }}>Pick your Bắp</div>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 320 }}>
                {COLORS.map((c) => (
                  <button key={c} onClick={() => setColor(c)} className="no-select" style={{
                    width: 68, height: 68, borderRadius: 20,
                    background: '#fff',
                    border: color === c ? '3px solid #2D3A2E' : '2px solid rgba(46,90,58,0.15)',
                    boxShadow: color === c ? '0 4px 0 rgba(46,90,58,0.2)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transform: color === c ? 'translateY(-2px)' : undefined,
                    transition: 'transform 0.15s',
                  }}>
                    <BapMini size={48} color={c} />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          {step > 0 && (
            <IconBtn color="cream" onClick={() => setStep(step - 1)}>‹</IconBtn>
          )}
          <BigButton color="sage" size="lg" onClick={next} icon={step === 2 ? '✓' : '›'}>
            {step === 2 ? "Let's Go!" : 'Next'}
          </BigButton>
        </div>
      </div>
    </div>
  );
}
