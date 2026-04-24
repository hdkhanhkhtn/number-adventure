'use client';

export interface QuickTileProps {
  title: string;
  subtitle: string;
  color: 'sky' | 'coral' | 'lavender';
  onClick: () => void;
  emoji: string;
}

const COLORS = {
  sky:      { bg: '#B8DEEF', sh: '#7DB0C8', ink: '#1F4A61' },
  coral:    { bg: '#FFA48C', sh: '#D67560', ink: '#7A2B15' },
  lavender: { bg: '#D9C7F0', sh: '#A58AD0', ink: '#3D256D' },
};

/** Compact action tile for world map / stickers quick links */
export function QuickTile({ title, subtitle, color, onClick, emoji }: QuickTileProps) {
  const c = COLORS[color];
  return (
    <button onClick={onClick} className="no-select" style={{
      textAlign: 'left', padding: 16, borderRadius: 24, height: 112,
      background: c.bg, color: c.ink,
      border: '3px solid #2D3A2E',
      boxShadow: `0 5px 0 ${c.sh}, 0 10px 18px rgba(46,90,58,0.12)`,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      position: 'relative', overflow: 'hidden', cursor: 'pointer',
    }}>
      <div style={{ position: 'absolute', right: 8, top: 6, fontSize: 42, opacity: 0.9 }}>{emoji}</div>
      <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.8 }}>{subtitle}</div>
      <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
    </button>
  );
}
