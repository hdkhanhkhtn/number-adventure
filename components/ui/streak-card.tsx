'use client';

export interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  weekData?: boolean[]; // 7 booleans Mon–Sun, true = completed
}

const DAYS = ['M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su'];

/** Shows flame + streak count + 7-day dot calendar */
export function StreakCard({ currentStreak, longestStreak, weekData = [] }: StreakCardProps) {
  const days = Array.from({ length: 7 }, (_, i) => weekData[i] ?? false);

  return (
    <div
      style={{
        background: '#FFF8EC',
        borderRadius: 'var(--r-lg)',
        border: '2px solid rgba(46,90,58,0.12)',
        padding: 16,
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Header: flame + streak count + longest */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 999,
            background: '#FFE6A8',
            border: '2px solid #2D3A2E',
            boxShadow: '0 3px 0 #C89220',
            fontWeight: 700,
            color: '#5E3A00',
            fontSize: 18,
          }}
        >
          🔥 <span>{currentStreak}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 600 }}>CURRENT STREAK</div>
          <div style={{ fontSize: 12, color: 'var(--ink-faint)' }}>Best: {longestStreak} days</div>
        </div>
      </div>

      {/* 7-day dot calendar */}
      <div style={{ display: 'flex', gap: 6 }}>
        {days.map((done, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center' }}>
            <div
              style={{
                width: '100%',
                paddingBottom: '100%',
                borderRadius: 10,
                background: done ? '#FFD36E' : '#F0EADD',
                border: `2px solid ${done ? '#C79528' : 'rgba(46,90,58,0.15)'}`,
                position: 'relative',
                marginBottom: 4,
              }}
            >
              {done && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                  }}
                >
                  ⭐
                </div>
              )}
            </div>
            <div style={{ fontSize: 9, color: 'var(--ink-soft)', fontWeight: 600 }}>
              {DAYS[i]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
