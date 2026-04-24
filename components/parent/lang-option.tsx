'use client';

export interface LangOptionProps {
  active: boolean;
  label: string;
  sub?: string;
  onClick: () => void;
}

/** Radio-style language selector */
export function LangOption({ active, label, sub, onClick }: LangOptionProps) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '12px 14px',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderRadius: 14,
        marginBottom: 8,
        background: active ? '#EDF5F9' : 'transparent',
        border: active ? '1px solid #8AC4DE' : '1px solid rgba(0,0,0,0.08)',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2A1F' }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: '#6B7A6C' }}>{sub}</div>}
      </div>
      <div style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        border: '2px solid ' + (active ? '#2E6F93' : '#C4C0B3'),
        background: active ? '#2E6F93' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {active && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
      </div>
    </button>
  );
}
