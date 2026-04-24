'use client';

/** Visual representation of a tens-place stick (value = 10) */
export function TenStick() {
  return (
    <div style={{
      width: 14, height: 40, borderRadius: 4,
      background: '#8AC4DE', border: '2px solid #2D3A2E',
      boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.12)',
    }} />
  );
}
