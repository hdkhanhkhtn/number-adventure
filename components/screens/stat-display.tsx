'use client';

export interface StatDisplayProps {
  label: string;
  value: string;
  color: string;
  icon?: string;
}

/** Small labeled stat value — used in reward screen summary */
export function StatDisplay({ label, value, color, icon }: StatDisplayProps) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: '#6B7A6C', fontWeight: 700, letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1.2, marginTop: 2 }}>
        {icon} {value}
      </div>
    </div>
  );
}
