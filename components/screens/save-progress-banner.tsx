'use client';

export interface SaveProgressBannerProps {
  onSave: () => void;
  onDismiss: () => void;
  error?: string;
}

/** Sticky bottom banner prompting a guest user to link their progress to a
 *  parent account. Shown only when the parent session cookie is detected. */
export function SaveProgressBanner({ onSave, onDismiss, error }: SaveProgressBannerProps) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: '#FFF8EC',
      borderTop: '2px solid rgba(46,90,58,0.15)',
      boxShadow: '0 -4px 16px rgba(0,0,0,0.10)',
      padding: '10px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 60 }}>
        {/* Mascot accent */}
        <span style={{ fontSize: 28, flexShrink: 0 }} aria-hidden="true">🌱</span>

        {/* Text block */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#2D3A2E', lineHeight: 1.3 }}>
            Your progress is saved on this device
          </div>
          <div style={{ fontSize: 11, color: '#6B7A6C', marginTop: 2 }}>
            Link to your account to keep it safe
          </div>
        </div>

        {/* Save CTA */}
        <button
          onClick={onSave}
          style={{
            flexShrink: 0,
            background: '#2E5A3A',
            color: '#FFF8EC',
            border: 'none',
            borderRadius: 16,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Link account
        </button>

        {/* Dismiss */}
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{
            flexShrink: 0,
            background: 'transparent',
            border: 'none',
            color: '#6B7A6C',
            fontSize: 18,
            lineHeight: 1,
            cursor: 'pointer',
            padding: '4px 6px',
          }}
        >
          ×
        </button>
      </div>

      {/* Error feedback row */}
      {error && (
        <div style={{ fontSize: 11, color: '#C0392B', marginTop: 4, paddingLeft: 38 }}>
          {error}
        </div>
      )}
    </div>
  );
}
