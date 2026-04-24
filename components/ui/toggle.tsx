'use client';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

/** Simple on/off toggle switch */
export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div
        onClick={() => !disabled && onChange(!checked)}
        style={{
          width: 52,
          height: 30,
          borderRadius: 15,
          background: checked ? '#7FC089' : 'rgba(46,90,58,0.15)',
          border: '2px solid #2D3A2E',
          position: 'relative',
          transition: 'background 0.2s',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 2,
            left: checked ? 22 : 2,
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '2px solid #2D3A2E',
            transition: 'left 0.2s cubic-bezier(0.34,1.56,0.64,1)',
            boxShadow: '0 2px 4px rgba(46,90,58,0.2)',
          }}
        />
      </div>
      {label && (
        <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>
          {label}
        </span>
      )}
    </label>
  );
}
