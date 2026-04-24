'use client';

export interface SkillRowProps {
  label: string;
  /** Progress 0–1 */
  value: number;
  color: string;
  badge: string;
}

/** Skill progress row — label + badge + progress bar */
export function SkillRow({ label, value, color, badge }: SkillRowProps) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2A1F' }}>{label}</div>
        <div style={{ fontSize: 11, color: '#6B7A6C', fontWeight: 600 }}>{badge}</div>
      </div>
      <div style={{ height: 8, borderRadius: 8, background: '#F0EADC', overflow: 'hidden' }}>
        <div style={{
          width: `${Math.min(100, Math.round(value * 100))}%`,
          height: '100%',
          background: color,
          borderRadius: 8,
          transition: 'width 0.5s',
        }} />
      </div>
    </div>
  );
}
