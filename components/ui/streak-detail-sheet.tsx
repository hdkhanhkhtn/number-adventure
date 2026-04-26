'use client';
import { BapMascot } from '@/components/ui/bap-mascot';

interface StreakDetailSheetProps {
  currentStreak: number;
  longestStreak: number;
  weekData?: boolean[];
  visible: boolean;
  onClose: () => void;
}

export function StreakDetailSheet({ currentStreak, longestStreak, weekData = [], visible, onClose }: StreakDetailSheetProps) {
  if (!visible) return null;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOffset = new Date(year, month, 1).getDay(); // 0=Sun
  const today = now.getDate();
  const dayOfWeek = now.getDay();

  // Map weekData (bool[7]: Mon=0..Sun=6) to completed day numbers in current month
  const completedDays = new Set<number>();
  weekData.forEach((done, i) => {
    if (!done) return;
    const weekdayIndex = i + 1; // Mon=1..Sun=7
    const diff = ((dayOfWeek || 7) - weekdayIndex + 7) % 7;
    const dayNum = today - diff;
    if (dayNum >= 1 && dayNum <= daysInMonth) completedDays.add(dayNum);
  });

  const monthName = now.toLocaleString('en', { month: 'long' });
  const blanks = Array.from({ length: firstDayOffset }, (_, i) => <div key={`b${i}`} />);
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1;
    const done = completedDays.has(d);
    const isFuture = d > today;
    return (
      <div key={d} style={{
        aspectRatio: '1', borderRadius: 8, display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600,
        background: done ? '#FFD36E' : isFuture ? '#F5F3ED' : '#F0EADD',
        border: `1.5px solid ${done ? '#C79528' : 'rgba(46,90,58,0.1)'}`,
        color: done ? '#5E3A00' : isFuture ? '#C0B9A8' : '#6B7A6C',
      }}>
        {done ? '⭐' : d}
      </div>
    );
  });

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'flex-end', animation: 'fade-in 0.2s ease-out' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#FFF8EC', borderRadius: '24px 24px 0 0', padding: '20px 20px 36px', boxShadow: '0 -4px 24px rgba(0,0,0,0.12)', maxHeight: '70vh', overflowY: 'auto' }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(46,90,58,0.2)', margin: '0 auto 16px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <BapMascot size={48} mood="happy" />
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#5E3A00' }}>🔥 {currentStreak}</div>
            <div style={{ fontSize: 12, color: '#6B7A6C' }}>Best: {longestStreak} days</div>
          </div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#2D3A2E', marginBottom: 8 }}>{monthName} {year}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
          {['S','M','T','W','T','F','S'].map((d, i) => <div key={i} style={{ textAlign: 'center', fontSize: 9, fontWeight: 700, color: '#9AA69A' }}>{d}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {blanks}{dayCells}
        </div>
      </div>
    </div>
  );
}
