'use client';

export interface MenuRowProps {
  icon: string;
  label: string;
  sub?: string;
  onClick?: () => void;
  last?: boolean;
}

/** Action menu row — icon + label/sub + chevron */
export function MenuRow({ icon, label, sub, onClick, last }: MenuRowProps) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '14px 16px',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderBottom: last ? 'none' : '1px solid rgba(0,0,0,0.06)',
        background: '#fff',
      }}
    >
      <div style={{ fontSize: 22, width: 32, textAlign: 'center' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2A1F' }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: '#6B7A6C' }}>{sub}</div>}
      </div>
      <div style={{ fontSize: 18, color: '#C4C0B3' }}>›</div>
    </button>
  );
}
