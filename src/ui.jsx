// Shared UI primitives for Bắp Number Adventure

// Big tappable number tile with tactile 3D press
function NumTile({ n, state = 'idle', onClick, size = 'md', color = 'sun' }) {
  const sizes = {
    sm: { w: 64, h: 72, fs: 34, rad: 18 },
    md: { w: 92, h: 104, fs: 52, rad: 24 },
    lg: { w: 124, h: 140, fs: 72, rad: 30 },
    xl: { w: 160, h: 180, fs: 92, rad: 36 },
  };
  const s = sizes[size];
  const colors = {
    sun:      { bg: '#FFD36E', ink: '#7A4E0E', sh: '#C79528' },
    sage:     { bg: '#A8D5A2', ink: '#2F6A3C', sh: '#6FA876' },
    sky:      { bg: '#B8DEEF', ink: '#2E6F93', sh: '#7DB0C8' },
    lavender: { bg: '#D9C7F0', ink: '#5D3F94', sh: '#A58AD0' },
    coral:    { bg: '#FFA48C', ink: '#A33A1D', sh: '#D67560' },
    berry:    { bg: '#E6779E', ink: '#852C51', sh: '#B44B7A' },
    cream:    { bg: '#FFF8EC', ink: '#3A2D15', sh: '#E2CFA7' },
  };
  const c = colors[color] || colors.sun;

  const stateStyles = {
    idle: { transform: 'translateY(0)' },
    correct: {
      background: '#C4EBB9',
      boxShadow: `0 4px 0 #6FB05F, 0 10px 20px rgba(95,179,106,0.35)`,
      transform: 'translateY(-2px)',
    },
    wrong: {
      background: '#FFD6C6',
      boxShadow: `0 2px 0 #E88866, 0 4px 8px rgba(232,136,102,0.3)`,
      animation: 'wiggle 0.4s ease-in-out',
    },
    disabled: { opacity: 0.4, pointerEvents: 'none' },
  };

  return (
    <button
      className="no-select"
      onClick={onClick}
      style={{
        width: s.w, height: s.h, borderRadius: s.rad,
        background: c.bg, color: c.ink,
        fontFamily: 'var(--font-num)', fontWeight: 700, fontSize: s.fs,
        lineHeight: 1, letterSpacing: -1,
        boxShadow: `0 4px 0 ${c.sh}, 0 10px 18px rgba(46,90,58,0.12)`,
        border: '3px solid #2D3A2E',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform 0.1s ease, box-shadow 0.1s ease',
        position: 'relative',
        ...stateStyles[state],
      }}
      onMouseDown={e => {
        if (state !== 'idle') return;
        e.currentTarget.style.transform = 'translateY(3px)';
        e.currentTarget.style.boxShadow = `0 1px 0 ${c.sh}, 0 3px 6px rgba(46,90,58,0.1)`;
      }}
      onMouseUp={e => {
        if (state !== 'idle') return;
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = `0 4px 0 ${c.sh}, 0 10px 18px rgba(46,90,58,0.12)`;
      }}
      onMouseLeave={e => {
        if (state !== 'idle') return;
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = `0 4px 0 ${c.sh}, 0 10px 18px rgba(46,90,58,0.12)`;
      }}
    >
      {n}
    </button>
  );
}

// Big CTA button
function BigButton({ children, onClick, color = 'sage', size = 'lg', icon, style = {}, disabled }) {
  const colors = {
    sage:     { bg: '#7FC089', ink: '#1F4A28', sh: '#4D8B58' },
    sun:      { bg: '#FFC94A', ink: '#5E3A00', sh: '#C89220' },
    coral:    { bg: '#FF8F74', ink: '#6B1F0A', sh: '#C8614A' },
    sky:      { bg: '#8AC4DE', ink: '#1F4A61', sh: '#5A96B1' },
    lavender: { bg: '#B9A4E0', ink: '#3D256D', sh: '#8872B4' },
    cream:    { bg: '#FFF4DE', ink: '#4A3B1D', sh: '#D9C38A' },
  };
  const c = colors[color];
  const sizes = {
    md: { h: 52, fs: 18, px: 24, rad: 18 },
    lg: { h: 68, fs: 22, px: 28, rad: 24 },
    xl: { h: 82, fs: 28, px: 32, rad: 28 },
  };
  const s = sizes[size];

  return (
    <button
      className="no-select"
      onClick={disabled ? undefined : onClick}
      style={{
        height: s.h, padding: `0 ${s.px}px`, borderRadius: s.rad,
        background: c.bg, color: c.ink,
        fontFamily: 'var(--font-kid)', fontWeight: 700, fontSize: s.fs,
        boxShadow: `0 5px 0 ${c.sh}, 0 10px 20px rgba(46,90,58,0.14)`,
        border: '3px solid #2D3A2E',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        transition: 'transform 0.1s, box-shadow 0.1s',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
      onMouseDown={e => {
        if (disabled) return;
        e.currentTarget.style.transform = 'translateY(4px)';
        e.currentTarget.style.boxShadow = `0 1px 0 ${c.sh}, 0 3px 8px rgba(46,90,58,0.1)`;
      }}
      onMouseUp={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = `0 5px 0 ${c.sh}, 0 10px 20px rgba(46,90,58,0.14)`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = `0 5px 0 ${c.sh}, 0 10px 20px rgba(46,90,58,0.14)`;
      }}
    >
      {icon && <span style={{ fontSize: s.fs * 1.1 }}>{icon}</span>}
      {children}
    </button>
  );
}

// Round icon button (speaker, heart, close, back)
function IconBtn({ children, onClick, color = 'cream', size = 52, style = {}, pulse }) {
  const colors = {
    cream: { bg: '#FFF8EC', sh: '#D9C38A', ink: '#2D3A2E' },
    sage:  { bg: '#A8D5A2', sh: '#6FA876', ink: '#2F6A3C' },
    sun:   { bg: '#FFD36E', sh: '#C79528', ink: '#7A4E0E' },
    coral: { bg: '#FFA48C', sh: '#D67560', ink: '#A33A1D' },
    sky:   { bg: '#B8DEEF', sh: '#7DB0C8', ink: '#2E6F93' },
  };
  const c = colors[color];
  return (
    <button
      className={`no-select ${pulse ? 'pulse-soft' : ''}`}
      onClick={onClick}
      style={{
        width: size, height: size, borderRadius: '50%',
        background: c.bg, color: c.ink,
        boxShadow: `0 4px 0 ${c.sh}, 0 8px 14px rgba(46,90,58,0.12)`,
        border: '3px solid #2D3A2E',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.45,
        transition: 'transform 0.1s',
        ...style,
      }}
      onMouseDown={e => { e.currentTarget.style.transform = 'translateY(3px)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = ''; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
    >
      {children}
    </button>
  );
}

// Progress bar with soft ticks
function ProgressBar({ value, max = 1, color = '#7FC089', height = 14, showStar }) {
  const pct = Math.max(0, Math.min(1, value / max)) * 100;
  return (
    <div style={{
      position: 'relative',
      height, borderRadius: height,
      background: 'rgba(46,90,58,0.12)',
      border: '2px solid #2D3A2E',
      overflow: 'visible',
    }}>
      <div style={{
        height: '100%', width: `${pct}%`,
        borderRadius: height,
        background: `linear-gradient(180deg, ${color} 0%, ${color} 55%, rgba(0,0,0,0.08) 100%)`,
        transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.12), inset 0 2px 0 rgba(255,255,255,0.35)',
      }}/>
      {showStar && pct > 5 && (
        <div style={{
          position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)',
          fontSize: height * 1.8, filter: 'drop-shadow(0 2px 0 rgba(46,90,58,0.25))',
        }}>⭐</div>
      )}
    </div>
  );
}

// Soft rounded card
function Card({ children, style = {}, onClick, color = 'card' }) {
  const bg = color === 'card' ? '#FFFFFF' : `var(--${color})`;
  return (
    <div
      onClick={onClick}
      className="no-select"
      style={{
        background: bg,
        borderRadius: 'var(--r-lg)',
        border: '2px solid rgba(46,90,58,0.12)',
        boxShadow: 'var(--shadow-card)',
        padding: 16,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// Star rating 1-3
function StarRow({ value = 0, size = 28, gap = 6 }) {
  return (
    <div style={{ display: 'flex', gap }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          fontSize: size,
          filter: i < value ? 'drop-shadow(0 2px 0 #B87C0E)' : 'none',
          opacity: i < value ? 1 : 0.25,
          transition: 'all 0.3s',
          animation: i < value ? `pop-in 0.4s ease-out ${i * 0.15}s both` : 'none',
        }}>
          {i < value ? '⭐' : '☆'}
        </div>
      ))}
    </div>
  );
}

// Soft background with garden dots (decorative)
function GardenBg({ children, variant = 'cream', style = {} }) {
  const bgs = {
    cream: 'radial-gradient(ellipse 100% 60% at 50% 0%, #FFF4DE 0%, #FFF8EC 50%, #FFFDF7 100%)',
    sky: 'radial-gradient(ellipse 100% 60% at 50% 0%, #D4EAF5 0%, #E7F3FA 50%, #F5FAFD 100%)',
    sage: 'radial-gradient(ellipse 100% 60% at 50% 0%, #D6ECCE 0%, #E8F4E0 50%, #F4FAEE 100%)',
    sun: 'radial-gradient(ellipse 100% 60% at 50% 0%, #FFE6A8 0%, #FFF2CC 50%, #FFF9E6 100%)',
    lavender: 'radial-gradient(ellipse 100% 60% at 50% 0%, #E3D2F4 0%, #EEE3F8 50%, #F7F1FC 100%)',
  };
  return (
    <div style={{
      position: 'absolute', inset: 0, background: bgs[variant],
      overflow: 'hidden', ...style,
    }}>
      {children}
    </div>
  );
}

// Speaker icon (audio-first UX) — drawn SVG
function SpeakerIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 10 v4 a1 1 0 0 0 1 1 h3 l4 4 a1 1 0 0 0 1.7 -0.7 V5.7 a1 1 0 0 0 -1.7 -0.7 l-4 4 H5 a1 1 0 0 0 -1 1 z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M16 9 Q 19 12 16 15" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M18 6 Q 23 12 18 18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

// Decorative floating sparkles
function Sparkles({ count = 6, color = '#FFD36E', area = 'absolute' }) {
  const spots = React.useMemo(() => Array.from({ length: count }, (_, i) => ({
    left: 5 + Math.random() * 90,
    top: 5 + Math.random() * 90,
    size: 8 + Math.random() * 10,
    delay: Math.random() * 2,
    dur: 2 + Math.random() * 2,
  })), [count]);
  return (
    <div style={{ position: area, inset: 0, pointerEvents: 'none' }}>
      {spots.map((s, i) => (
        <div key={i} style={{
          position: 'absolute', left: `${s.left}%`, top: `${s.top}%`,
          width: s.size, height: s.size, color,
          animation: `sparkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
        }}>
          <svg viewBox="0 0 20 20" width="100%" height="100%">
            <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill="currentColor"/>
          </svg>
        </div>
      ))}
    </div>
  );
}

// Confetti burst for reward screens
function Confetti({ count = 30 }) {
  const colors = ['#FFD36E', '#FFA48C', '#A8D5A2', '#B8DEEF', '#D9C7F0', '#E6779E'];
  const pieces = React.useMemo(() => Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100,
    color: colors[i % colors.length],
    size: 8 + Math.random() * 8,
    dur: 2 + Math.random() * 2,
    delay: Math.random() * 0.5,
    shape: Math.random() > 0.5 ? '50%' : '4px',
  })), [count]);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {pieces.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', left: `${p.left}%`, top: '-20px',
          width: p.size, height: p.size, background: p.color,
          borderRadius: p.shape,
          animation: `confetti-fall ${p.dur}s ease-in ${p.delay}s forwards`,
        }}/>
      ))}
    </div>
  );
}

// Pill tag
function Tag({ children, color = 'cream', style = {} }) {
  const colors = {
    cream: { bg: '#FFF4DE', ink: '#7A4E0E' },
    sage:  { bg: '#C4E5BE', ink: '#2F6A3C' },
    sky:   { bg: '#D2E9F3', ink: '#2E6F93' },
    sun:   { bg: '#FFE6A8', ink: '#7A4E0E' },
    coral: { bg: '#FFCBBA', ink: '#A33A1D' },
  };
  const c = colors[color];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 12px', borderRadius: 999,
      background: c.bg, color: c.ink,
      fontWeight: 600, fontSize: 13,
      border: '1.5px solid rgba(46,90,58,0.15)',
      ...style,
    }}>{children}</span>
  );
}

Object.assign(window, {
  NumTile, BigButton, IconBtn, ProgressBar, Card, StarRow, GardenBg,
  SpeakerIcon, Sparkles, Confetti, Tag,
});
