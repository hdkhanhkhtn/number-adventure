'use client';

/** Visual representation of a ones-place dot (value = 1) */
export function OneDot() {
  return (
    <div style={{
      width: 18, height: 18, borderRadius: '50%',
      background: '#FFD36E', border: '2px solid #2D3A2E',
      boxShadow: '0 2px 0 #C79528',
    }} />
  );
}
