'use client';

export interface PanelProps {
  title: string;
  sub?: string;
  children: React.ReactNode;
}

/** Settings panel container — white rounded card with title */
export function Panel({ title, sub, children }: PanelProps) {
  return (
    <div style={{ background: '#fff', borderRadius: 18, padding: 16, border: '1px solid rgba(0,0,0,0.06)' }}>
      <div style={{ marginBottom: sub ? 4 : 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1F2A1F' }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: '#6B7A6C', marginTop: 2, marginBottom: 10 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}
