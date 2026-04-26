'use client';

export default function OfflinePage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#F5F3ED', fontFamily: 'system-ui, sans-serif',
      padding: '24px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 80, marginBottom: 16 }}>🌽</div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2D3A2E', marginBottom: 8 }}>
        No Connection
      </h1>
      <p style={{ fontSize: 15, color: '#6B7A6C', lineHeight: 1.5, maxWidth: 280, marginBottom: 24 }}>
        Bap needs the internet to load new pages. Check your connection and try again!
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '14px 32px', borderRadius: 16, fontSize: 16, fontWeight: 700,
          background: '#2E5A3A', color: '#fff', border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 0 #1B3A24',
        }}
      >
        Try Again
      </button>
      <p style={{ marginTop: 32, fontSize: 12, color: '#9AA69A' }}>
        Your progress is saved locally and will sync when you reconnect.
      </p>
    </div>
  );
}
