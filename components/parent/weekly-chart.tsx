'use client';

export interface WeeklyChartProps {
  /** 7 values Mon–Sun */
  data: number[];
  /** Goal threshold for green coloring */
  goal?: number;
  height?: number;
  showValues?: boolean;
}

const LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

/** 7-day bar chart — color-coded against optional daily goal */
export function WeeklyChart({ data, goal = 15, height = 100, showValues = false }: WeeklyChartProps) {
  const max = Math.max(...data, goal, 1);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          {showValues && (
            <div style={{ fontSize: 10, color: '#6B7A6C', fontWeight: 700, minHeight: 14 }}>
              {v > 0 ? v : ''}
            </div>
          )}
          <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', flex: 1 }}>
            <div style={{
              width: '100%',
              height: `${Math.max(4, Math.round((v / max) * (height - (showValues ? 18 : 0))  ))}px`,
              borderRadius: 6,
              background: v === 0 ? '#EEE9DC' : v >= goal ? '#5FB36A' : '#FFD36E',
              transition: 'height 0.4s ease',
            }} />
          </div>
          <div style={{ fontSize: 10, color: '#6B7A6C', fontWeight: 600 }}>{LABELS[i]}</div>
        </div>
      ))}
    </div>
  );
}
