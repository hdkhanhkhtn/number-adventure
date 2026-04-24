'use client';

import { useState, useMemo } from 'react';
import { NumTile } from '@/components/ui/num-tile';

export interface ParentGateProps {
  onPass: () => void;
  onCancel: () => void;
}

/** Math-challenge modal — anti-toddler friction ONLY, not a security control.
 *  Answer is intentionally computed client-side. Real auth is handled via
 *  session cookies + middleware.ts. Do not treat this as an auth mechanism. */
export function ParentGate({ onPass, onCancel }: ParentGateProps) {
  const [a] = useState(() => 3 + Math.floor(Math.random() * 4));
  const [b] = useState(() => 2 + Math.floor(Math.random() * 3));
  const target = a + b;

  const [choice, setChoice] = useState<number | null>(null);

  const options = useMemo(() => {
    const set = new Set([target]);
    while (set.size < 4) set.add(1 + Math.floor(Math.random() * 15));
    return [...set].sort(() => Math.random() - 0.5);
  }, [target]);

  const onPick = (n: number) => {
    setChoice(n);
    if (n === target) {
      setTimeout(onPass, 400);
    } else {
      setTimeout(() => setChoice(null), 600);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(46,90,58,0.4)',
      backdropFilter: 'blur(6px)',
    }}>
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#FFF8EC',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: '24px 28px 36px',
        boxShadow: '0 -10px 30px rgba(0,0,0,0.15)',
        borderTop: '2px solid rgba(46,90,58,0.15)',
        animation: 'slide-up 0.3s ease-out',
      }}>
        {/* drag handle */}
        <div style={{
          width: 40, height: 4,
          background: 'rgba(46,90,58,0.2)',
          borderRadius: 4,
          margin: '0 auto 20px',
        }} />

        <div style={{ textAlign: 'center', marginBottom: 6, fontSize: 13, color: '#6B7A6C', fontWeight: 600, letterSpacing: 0.5 }}>
          CỔNG PHỤ HUYNH
        </div>
        <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, color: '#2D3A2E', marginBottom: 4 }}>
          For grown-ups only
        </div>
        <div style={{ textAlign: 'center', fontSize: 14, color: '#6B7A6C', marginBottom: 20 }}>
          Giải phép tính để tiếp tục
        </div>

        <div style={{
          fontSize: 48, fontWeight: 700, textAlign: 'center',
          color: '#2D3A2E', marginBottom: 20,
          fontFamily: 'var(--font-num)',
        }}>
          {a} + {b} = ?
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {options.map(n => (
            <NumTile
              key={n} n={n} size="md" color="cream"
              state={choice === n ? (n === target ? 'correct' : 'wrong') : 'idle'}
              onClick={() => onPick(n)}
            />
          ))}
        </div>

        <button
          onClick={onCancel}
          style={{
            width: '100%', padding: 14, fontSize: 15, fontWeight: 600,
            color: '#6B7A6C', background: 'transparent', border: 'none', cursor: 'pointer',
          }}
        >
          Hủy
        </button>
      </div>
    </div>
  );
}
