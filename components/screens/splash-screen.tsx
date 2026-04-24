'use client';

import { useEffect } from 'react';
import { GardenBg } from '@/components/ui/garden-bg';
import { BapMascot } from '@/components/ui/bap-mascot';
import { Sparkles } from '@/components/ui/sparkles';

export interface SplashScreenProps {
  onReady: () => void;
}

/** Animated splash screen — auto-advances after 2.2s */
export function SplashScreen({ onReady }: SplashScreenProps) {
  useEffect(() => {
    const t = setTimeout(onReady, 2200);
    return () => clearTimeout(t);
  }, [onReady]);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GardenBg variant="sun">
        <Sparkles count={14} color="#FFB84A" />
      </GardenBg>
      <div style={{
        position: 'relative', zIndex: 1, height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 20,
      }}>
        <div className="bobble">
          <BapMascot size={160} mood="happy" />
        </div>
        <div style={{
          fontFamily: 'var(--font-kid)', fontWeight: 700, fontSize: 44,
          color: '#5E3A00', lineHeight: 1, letterSpacing: -1,
          textShadow: '0 3px 0 rgba(255,255,255,0.6)',
        }}>Bắp</div>
        <div style={{ color: '#7A4E0E', fontSize: 18, fontWeight: 600, letterSpacing: 1 }}>
          NUMBER ADVENTURE
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: '50%', background: '#C89220',
              animation: `pulse-soft 1s ease-in-out ${i * 0.15}s infinite`,
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}
