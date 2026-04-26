'use client';
import { useRouter } from 'next/navigation';
import { BapMascot } from '@/components/ui/bap-mascot';

export function TimeUpOverlay() {
  const router = useRouter();
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fade-in 0.3s ease-out',
    }}>
      <div style={{
        background: '#FFF8EC', borderRadius: 28, padding: '32px 24px',
        maxWidth: 320, width: '85%', textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        border: '3px solid #2D3A2E',
      }}>
        <div className="bobble" style={{ marginBottom: 12 }}>
          <BapMascot size={80} mood="happy" />
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#2D3A2E', marginBottom: 8 }}>
          Giỏi lắm! Hết giờ rồi!
        </div>
        <div style={{ fontSize: 14, color: '#6B7A6C', marginBottom: 24, lineHeight: 1.5 }}>
          Hẹn gặp lại ngày mai nhé!
        </div>
        <button
          onClick={() => router.push('/home')}
          style={{
            width: '100%', padding: '14px 24px', borderRadius: 16,
            fontSize: 16, fontWeight: 700, color: '#fff',
            background: '#2E5A3A', border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 0 #1B3A24',
          }}
        >
          Về trang chủ
        </button>
      </div>
    </div>
  );
}
