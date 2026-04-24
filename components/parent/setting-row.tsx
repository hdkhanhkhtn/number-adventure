'use client';

export interface SettingRowProps {
  label: string;
  right: React.ReactNode;
  last?: boolean;
}

/** Setting row — label on left, control on right */
export function SettingRow({ label, right, last }: SettingRowProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: last ? 'none' : '1px solid rgba(0,0,0,0.06)',
    }}>
      <div style={{ fontSize: 14, color: '#1F2A1F' }}>{label}</div>
      {right}
    </div>
  );
}
