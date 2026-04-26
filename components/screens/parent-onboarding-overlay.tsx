'use client';
import { BapMascot } from '@/components/ui/bap-mascot';

interface ParentOnboardingOverlayProps { onDismiss: () => void; }

const FEATURES = [
  { icon: '📊', text: 'Theo dõi tiến độ học của bé hàng ngày' },
  { icon: '⏱️', text: 'Đặt giới hạn thời gian chơi phù hợp' },
  { icon: '🔒', text: 'Bảo vệ cài đặt bằng mã PIN an toàn' },
];

/** First-time parent onboarding overlay — shown once, dismissed by button only */
export function ParentOnboardingOverlay({ onDismiss }: ParentOnboardingOverlayProps) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: '#fff', borderRadius: 28, padding: '32px 24px',
          maxWidth: 320, width: '85%', textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)', border: '1px solid rgba(0,0,0,0.08)',
          fontFamily: 'var(--font-parent)',
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <BapMascot size={80} mood="happy" />
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#1F2A1F', marginBottom: 6 }}>
          Chào mừng Cha Mẹ!
        </div>
        <div style={{ fontSize: 13, color: '#6B7A6C', marginBottom: 20 }}>
          Bảng điều khiển dành riêng cho bạn
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24, textAlign: 'left' }}>
          {FEATURES.map(({ icon, text }) => (
            <div key={icon} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#F5F3ED', borderRadius: 12, padding: '10px 14px' }}>
              <span style={{ fontSize: 18, lineHeight: 1.4 }}>{icon}</span>
              <span style={{ fontSize: 14, color: '#1F2A1F', lineHeight: 1.5 }}>{text}</span>
            </div>
          ))}
        </div>
        <button
          onClick={onDismiss}
          style={{
            width: '100%', padding: '14px 32px', borderRadius: 16,
            background: '#2E5A3A', color: '#fff',
            fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 0 #1B3A24',
          }}
        >
          Đã hiểu!
        </button>
      </div>
    </div>
  );
}
