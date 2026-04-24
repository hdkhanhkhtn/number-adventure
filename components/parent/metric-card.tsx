'use client';

export interface MetricCardProps {
  label: string;
  value: string;
  sub: string;
  accent: string;
}

/** Dashboard metric tile — white card with colored value */
export function MetricCard({ label, value, sub, accent }: MetricCardProps) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      padding: '12px 14px',
      border: '1px solid rgba(0,0,0,0.06)',
    }}>
      <div style={{ fontSize: 11, color: '#6B7A6C', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: accent, lineHeight: 1.1, marginTop: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#9AA69A', marginTop: 2 }}>{sub}</div>
    </div>
  );
}
