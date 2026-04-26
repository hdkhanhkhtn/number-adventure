'use client';

export function ExitConfirmModal({ onStay, onQuit }: { onStay: () => void; onQuit: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.4)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#FFF8EC', borderRadius: 24, padding: '28px 24px',
        maxWidth: 300, width: '85%', textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        border: '2px solid #2D3A2E',
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🤔</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#2D3A2E', marginBottom: 8 }}>Quit game?</div>
        <div style={{ fontSize: 14, color: '#6B7A6C', marginBottom: 20 }}>Your progress will be lost.</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onQuit} style={{ flex: 1, padding: 12, borderRadius: 14, fontSize: 15, fontWeight: 700, background: '#F0EADC', color: '#6B7A6C', border: 'none', cursor: 'pointer' }}>Quit</button>
          <button onClick={onStay} style={{ flex: 1, padding: 12, borderRadius: 14, fontSize: 15, fontWeight: 700, background: '#2E5A3A', color: '#fff', border: 'none', cursor: 'pointer' }}>Stay</button>
        </div>
      </div>
    </div>
  );
}
