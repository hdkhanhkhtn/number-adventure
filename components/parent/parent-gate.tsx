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
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(46,90,58,0.4)', backdropFilter: 'blur(6px)' }}>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#FFF8EC', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: '24px 28px 36px', boxShadow: '0 -10px 30px rgba(0,0,0,0.15)', borderTop: '2px solid rgba(46,90,58,0.15)', animation: 'slide-up 0.3s ease-out' }}>
        <div style={{ width: 40, height: 4, background: 'rgba(46,90,58,0.2)', borderRadius: 4, margin: '0 auto 20px' }} />
        <div style={{ textAlign: 'center', marginBottom: 6, fontSize: 13, color: '#6B7A6C', fontWeight: 600, letterSpacing: 0.5 }}>CỔNG PHỤ HUYNH</div>
        <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, color: '#2D3A2E', marginBottom: 4 }}>For grown-ups only</div>
        <div style={{ textAlign: 'center', fontSize: 14, color: '#6B7A6C', marginBottom: 20 }}>Giải phép tính để tiếp tục</div>
        <div style={{ fontSize: 48, fontWeight: 700, textAlign: 'center', color: '#2D3A2E', marginBottom: 20, fontFamily: 'var(--font-num)' }}>
          {a} + {b} = ?
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {options.map(n => (
            <NumTile key={n} n={n} size="md" color="cream" state={choice === n ? (n === target ? 'correct' : 'wrong') : 'idle'} onClick={() => onPick(n)} />
          ))}
        </div>
        <button onClick={onCancel} style={{ width: '100%', padding: 14, fontSize: 15, fontWeight: 600, color: '#6B7A6C', background: 'transparent', border: 'none', cursor: 'pointer' }}>
          Hủy
        </button>
      </div>
    </div>
  );
}

// ─── PIN Setup Wizard ────────────────────────────────────────────────────────

export interface PinSetupWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

type WizardStep = 'enter' | 'confirm' | 'saving' | 'error';

const DIGITS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

/** First-time PIN creation wizard — shown when pinSetupRequired is true. */
export function PinSetupWizard({ onComplete, onCancel }: PinSetupWizardProps) {
  const [step, setStep] = useState<WizardStep>('enter');
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const current = step === 'confirm' ? confirm : pin;
  const setter  = step === 'confirm' ? setConfirm : setPin;

  const handleDigit = (d: string) => {
    if (d === '⌫') { setter(prev => prev.slice(0, -1)); return; }
    if (d === '') return;
    setter(prev => prev.length < 4 ? prev + d : prev);
  };

  // Auto-advance when 4 digits entered
  const handleFilled = async (value: string) => {
    if (step === 'enter') {
      setStep('confirm');
      return;
    }
    if (step === 'confirm') {
      if (value !== pin) {
        setErrorMsg('PIN không khớp. Vui lòng thử lại.');
        setPin('');
        setConfirm('');
        setStep('enter');
        return;
      }
      setStep('saving');
      try {
        const res = await fetch('/api/auth/pin/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin }),
        });
        if (res.status === 201) { onComplete(); return; }
        const data = await res.json() as { error?: string };
        setErrorMsg(data.error ?? 'Có lỗi xảy ra');
        setStep('error');
      } catch {
        setErrorMsg('Có lỗi xảy ra. Thử lại.');
        setStep('error');
      }
    }
  };

  // Trigger handleFilled when 4 digits are entered
  const displayPin = step === 'confirm' ? confirm : pin;
  const prevLen = step === 'confirm' ? confirm.length : pin.length;
  void prevLen; // used via displayPin length check in render

  const onDigitPress = (d: string) => {
    if (step === 'saving') return;
    if (d === '⌫') { setter(prev => prev.slice(0, -1)); return; }
    if (d === '') return;
    const next = current.length < 4 ? current + d : current;
    setter(() => next);
    if (next.length === 4) {
      // defer to allow state update
      setTimeout(() => handleFilled(next), 50);
    }
  };

  const heading = step === 'confirm' ? 'Nhập lại để xác nhận' : 'Tạo mã PIN 4 chữ số';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(46,90,58,0.4)', backdropFilter: 'blur(6px)' }}>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#FFF8EC', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: '24px 28px 36px', boxShadow: '0 -10px 30px rgba(0,0,0,0.15)', borderTop: '2px solid rgba(46,90,58,0.15)' }}>
        <div style={{ width: 40, height: 4, background: 'rgba(46,90,58,0.2)', borderRadius: 4, margin: '0 auto 20px' }} />
        <div style={{ textAlign: 'center', marginBottom: 6, fontSize: 13, color: '#6B7A6C', fontWeight: 600, letterSpacing: 0.5 }}>CỔNG PHỤ HUYNH</div>
        <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 700, color: '#2D3A2E', marginBottom: 16 }}>{heading}</div>

        {/* PIN dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 8 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #2E5A3A', background: displayPin.length > i ? '#2E5A3A' : 'transparent', transition: 'background 0.15s' }} />
          ))}
        </div>

        {/* Error message */}
        {errorMsg ? (
          <div style={{ textAlign: 'center', fontSize: 13, color: '#C0392B', marginBottom: 8 }}>{errorMsg}</div>
        ) : (
          <div style={{ height: 21, marginBottom: 8 }} />
        )}

        {/* Digit pad */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
          {DIGITS.map((d, i) => (
            <button
              key={i}
              onClick={() => onDigitPress(d)}
              disabled={step === 'saving' || d === ''}
              style={{
                height: 52, borderRadius: 14, border: '1.5px solid rgba(46,90,58,0.2)',
                background: d === '' ? 'transparent' : '#FFFFFF',
                fontSize: d === '⌫' ? 20 : 22, fontWeight: 600, color: '#2D3A2E',
                cursor: d === '' ? 'default' : 'pointer',
                boxShadow: d !== '' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                opacity: step === 'saving' ? 0.5 : 1,
              }}
            >
              {d}
            </button>
          ))}
        </div>

        <button onClick={onCancel} disabled={step === 'saving'} style={{ width: '100%', padding: 14, fontSize: 15, fontWeight: 600, color: '#6B7A6C', background: 'transparent', border: 'none', cursor: 'pointer' }}>
          Hủy
        </button>
      </div>
    </div>
  );
}
