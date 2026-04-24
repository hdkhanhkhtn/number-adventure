// Home, World Map, Level list, Sticker book, Streak screen

function HomeScreen({ profile, onPlay, onMap, onStickers, onParent, onStreak, onProgress, lastPlayed, streak = 3 }) {
  const [todayDone] = React.useState(false);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GardenBg variant="cream">
        <Sparkles count={8} color="#FFD36E"/>
      </GardenBg>
      <div style={{ position: 'relative', zIndex: 1, height: '100%', padding: '60px 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onProgress} className="no-select" style={{
            width: 52, height: 52, borderRadius: '50%', background: '#FFF8EC',
            border: '3px solid #2D3A2E', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 3px 0 rgba(46,90,58,0.2)', overflow: 'hidden',
          }}>
            <BapMini size={44} color={profile.color}/>
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: '#6B7A6C', fontWeight: 600 }}>Hi,</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#2D3A2E' }}>{profile.name}!</div>
          </div>
          <button onClick={onStreak} className="no-select" style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '8px 12px', borderRadius: 999, background: '#FFE6A8',
            border: '2px solid #2D3A2E', boxShadow: '0 3px 0 #C89220',
            fontWeight: 700, color: '#5E3A00', fontSize: 15,
          }}>
            🔥 <span>{streak}</span>
          </button>
          <IconBtn color="cream" size={44} onClick={onParent} style={{ fontSize: 18 }}>👤</IconBtn>
        </div>

        {/* Resume last / Big daily mission */}
        {lastPlayed ? (
          <div style={{
            background: 'linear-gradient(180deg,#FFE6A8 0%,#FFD36E 100%)',
            borderRadius: 24, border: '3px solid #2D3A2E',
            boxShadow: '0 5px 0 rgba(46,90,58,0.22), 0 12px 20px rgba(46,90,58,0.12)',
            padding: '14px 16px', position: 'relative', overflow: 'hidden',
          }}>
            <Tag color="cream" style={{ background: 'rgba(255,255,255,0.8)', borderColor: '#2D3A2E', fontWeight: 700, fontSize: 11 }}>
              🔄 CONTINUE WHERE YOU LEFT OFF
            </Tag>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#5E3A00', marginTop: 8 }}>{lastPlayed.worldName}</div>
            <div style={{ fontSize: 13, color: '#7A4E0E', marginBottom: 12 }}>Level {lastPlayed.level} · {lastPlayed.game}</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <BigButton color="sage" size="md" onClick={onPlay} icon="▶">Resume</BigButton>
              <button onClick={onMap} className="no-select" style={{
                padding: '0 14px', borderRadius: 16, fontSize: 13, fontWeight: 600,
                background: 'rgba(255,255,255,0.6)', border: '2px solid rgba(46,90,58,0.3)', color: '#5E3A00',
              }}>Choose other</button>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'linear-gradient(180deg, #B9E2B2 0%, #8FCC8A 100%)',
            borderRadius: 28, border: '3px solid #2D3A2E',
            boxShadow: '0 5px 0 rgba(46,90,58,0.25), 0 14px 24px rgba(46,90,58,0.15)',
            padding: '18px 18px 20px', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', right: -10, top: -6, opacity: 0.18, fontSize: 120 }}>✨</div>
            <Tag color="cream" style={{ background: '#FFF8EC', borderColor: '#2D3A2E', fontWeight: 700 }}>
              ⭐ TODAY'S ADVENTURE
            </Tag>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#1F4A28', marginTop: 10, lineHeight: 1.1 }}>
              Number Forest
            </div>
            <div style={{ fontSize: 14, color: '#2F6A3C', marginTop: 4, marginBottom: 14 }}>
              3 games · ~2 min
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <BigButton color="sun" size="lg" onClick={onPlay} icon="▶">Play</BigButton>
              <div className="bobble" style={{ marginLeft: 'auto' }}>
                <BapMascot size={88} color={profile.color} mood="celebrate"/>
              </div>
            </div>
          </div>
        )}

        {/* Quick actions grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <QuickTile title="World Map" subtitle="5 worlds" color="sky" onClick={onMap} emoji="🗺️"/>
          <QuickTile title="My Journey" subtitle="See progress" color="lavender" onClick={onProgress} emoji="🛤️"/>
          <QuickTile title="Stickers" subtitle="12 / 40" color="coral" onClick={onStickers} emoji="🌟"/>
          <QuickTile title="My Streak" subtitle={`${streak} days 🔥`} color="sun" onClick={onStreak} emoji="🔥"/>
        </div>

        {/* Weekly dots */}
        <div style={{ padding: '12px 14px', borderRadius: 20, background: '#FFF8EC', border: '2px solid rgba(46,90,58,0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 13, color: '#6B7A6C', fontWeight: 600 }}>This week</div>
            <div style={{ fontSize: 13, color: '#2F6A3C', fontWeight: 700 }}>4 of 5 days</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['M','T','W','T','F','S','S'].map((d, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  width: '100%', paddingBottom: '100%', borderRadius: 10,
                  background: i < 4 ? '#FFD36E' : '#F0EADD',
                  border: '2px solid ' + (i < 4 ? '#C79528' : 'rgba(46,90,58,0.15)'),
                  position: 'relative', marginBottom: 4,
                }}>
                  {i < 4 && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⭐</div>}
                </div>
                <div style={{ fontSize: 10, color: '#6B7A6C', fontWeight: 600 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function QuickTile({ title, subtitle, color, onClick, emoji }) {
  const colors = {
    sky:      { bg: '#B8DEEF', sh: '#7DB0C8', ink: '#1F4A61' },
    coral:    { bg: '#FFA48C', sh: '#D67560', ink: '#7A2B15' },
    lavender: { bg: '#D9C7F0', sh: '#A58AD0', ink: '#3D256D' },
    sun:      { bg: '#FFE6A8', sh: '#C89220', ink: '#7A4E0E' },
    sage:     { bg: '#A8D5A2', sh: '#6FA876', ink: '#1F4A28' },
  };
  const c = colors[color];
  return (
    <button onClick={onClick} className="no-select" style={{
      textAlign: 'left', padding: 16, borderRadius: 24, height: 112,
      background: c.bg, color: c.ink,
      border: '3px solid #2D3A2E',
      boxShadow: `0 5px 0 ${c.sh}, 0 10px 18px rgba(46,90,58,0.12)`,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', right: 8, top: 6, fontSize: 42, opacity: 0.9 }}>{emoji}</div>
      <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.8 }}>{subtitle}</div>
      <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
    </button>
  );
}

// World Map — playful stacked islands
const WORLDS = [
  { id: 'forest', name: 'Number Forest', subtitle: '1–20', color: 'sage', bg: '#B9E2B2', stars: 6, total: 9, unlocked: true, emoji: '🌳' },
  { id: 'tens',   name: 'Tens Town',     subtitle: '10–100', color: 'sky', bg: '#B8DEEF', stars: 2, total: 9, unlocked: true, emoji: '🏘️' },
  { id: 'even',   name: 'Even/Odd Bridge', subtitle: 'even • odd', color: 'lavender', bg: '#D9C7F0', stars: 0, total: 6, unlocked: true, emoji: '🌉' },
  { id: 'kitchen',name: 'Math Kitchen',  subtitle: '+ / −', color: 'coral', bg: '#FFC9B8', stars: 0, total: 6, unlocked: false, emoji: '🍳' },
  { id: 'castle', name: 'Big Number Castle', subtitle: '100–1000', color: 'sun', bg: '#FFE6A8', stars: 0, total: 9, unlocked: false, emoji: '🏰' },
];

function WorldMap({ onBack, onPickWorld }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GardenBg variant="sky">
        <Sparkles count={10} color="#ffffff"/>
      </GardenBg>
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '56px 20px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <IconBtn color="cream" size={48} onClick={onBack}>‹</IconBtn>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#2D3A2E' }}>World Map</div>
        </div>
        <div className="scroll" style={{ flex: 1, padding: '4px 20px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {WORLDS.map((w, i) => (
              <WorldCard key={w.id} world={w} index={i} onClick={() => w.unlocked && onPickWorld(w)}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function WorldCard({ world, index, onClick }) {
  const offset = index % 2 === 0 ? 0 : 20;
  return (
    <button onClick={onClick} disabled={!world.unlocked} className="no-select" style={{
      textAlign: 'left', width: `calc(100% - ${offset}px)`,
      marginLeft: offset, padding: '18px 20px',
      background: world.unlocked ? world.bg : '#E8DFCE',
      borderRadius: 28, border: '3px solid #2D3A2E',
      boxShadow: world.unlocked
        ? '0 5px 0 rgba(46,90,58,0.25), 0 14px 24px rgba(46,90,58,0.12)'
        : '0 3px 0 rgba(46,90,58,0.18)',
      display: 'flex', alignItems: 'center', gap: 14,
      opacity: world.unlocked ? 1 : 0.65,
      position: 'relative', overflow: 'hidden',
      cursor: world.unlocked ? 'pointer' : 'not-allowed',
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 22, background: 'rgba(255,255,255,0.6)',
        border: '2px solid rgba(46,90,58,0.2)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: 44, flexShrink: 0,
      }}>
        {world.unlocked ? world.emoji : '🔒'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(46,90,58,0.7)', letterSpacing: 0.5 }}>
          WORLD {index + 1}
        </div>
        <div style={{ fontSize: 19, fontWeight: 700, color: '#2D3A2E', lineHeight: 1.1, marginTop: 2 }}>{world.name}</div>
        <div style={{ fontSize: 13, color: 'rgba(46,90,58,0.75)', marginTop: 2, fontWeight: 600 }}>{world.subtitle}</div>
        {world.unlocked && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <div style={{ flex: 1 }}>
              <ProgressBar value={world.stars} max={world.total * 3} height={8}/>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#2D3A2E' }}>⭐ {world.stars}/{world.total * 3}</div>
          </div>
        )}
      </div>
    </button>
  );
}

// Level list — nodes on a winding path
function LevelList({ world, onBack, onPickLevel }) {
  const levels = React.useMemo(() => Array.from({ length: 9 }, (_, i) => ({
    n: i + 1,
    stars: i < 3 ? 3 : i === 3 ? 2 : i === 4 ? 1 : 0,
    locked: i > 5,
    isBoss: i === 8,
    game: ['hear_tap','build','order','hear_tap','even_odd','build','order','hear_tap','build'][i],
  })), [world.id]);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GardenBg variant={world.color}/>
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '56px 20px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <IconBtn color="cream" size={48} onClick={onBack}>‹</IconBtn>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#6B7A6C', fontWeight: 700, letterSpacing: 0.5 }}>WORLD {WORLDS.findIndex(w => w.id === world.id) + 1}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#2D3A2E', lineHeight: 1 }}>{world.name}</div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '6px 12px', borderRadius: 999, background: '#FFF8EC',
            border: '2px solid #2D3A2E', fontSize: 13, fontWeight: 700, color: '#7A4E0E',
          }}>
            ⭐ {levels.reduce((a,l) => a + l.stars, 0)}/{levels.length * 3}
          </div>
        </div>
        <div className="scroll" style={{ flex: 1, padding: '20px 20px 32px', position: 'relative' }}>
          <div style={{ position: 'relative', paddingTop: 6 }}>
            {levels.map((lv, i) => {
              const side = i % 2 === 0 ? 'left' : 'right';
              const leftPct = side === 'left' ? '18%' : '58%';
              return (
                <div key={i} style={{ height: 92, position: 'relative' }}>
                  <button
                    onClick={() => !lv.locked && onPickLevel(lv)}
                    disabled={lv.locked}
                    className="no-select"
                    style={{
                      position: 'absolute', left: leftPct, top: 0,
                      width: 96, height: 96,
                    }}>
                    <LevelNode level={lv} worldColor={world.color}/>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function LevelNode({ level, worldColor }) {
  const colors = {
    sage: { bg: '#7FC089', sh: '#4D8B58' },
    sky: { bg: '#8AC4DE', sh: '#5A96B1' },
    lavender: { bg: '#B9A4E0', sh: '#8872B4' },
    coral: { bg: '#FF8F74', sh: '#C8614A' },
    sun: { bg: '#FFC94A', sh: '#C89220' },
  };
  const c = colors[worldColor] || colors.sage;

  if (level.locked) {
    return (
      <div style={{
        width: 84, height: 84, borderRadius: '50%',
        background: '#E8DFCE', border: '3px solid rgba(46,90,58,0.3)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 3px 0 rgba(46,90,58,0.15)', fontSize: 30, color: 'rgba(46,90,58,0.4)',
      }}>🔒</div>
    );
  }
  return (
    <div style={{
      width: 84, height: 84, borderRadius: '50%',
      background: level.isBoss ? '#FFD36E' : c.bg,
      border: '3px solid #2D3A2E',
      boxShadow: `0 5px 0 ${level.isBoss ? '#C89220' : c.sh}, 0 10px 18px rgba(46,90,58,0.15)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      position: 'relative', color: '#2D3A2E', fontWeight: 700,
    }}>
      {level.isBoss ? (
        <div style={{ fontSize: 38 }}>👑</div>
      ) : (
        <div style={{ fontSize: 32, lineHeight: 1, fontFamily: 'var(--font-num)' }}>{level.n}</div>
      )}
      <div style={{ position: 'absolute', bottom: -14, display: 'flex', gap: 2 }}>
        {[0,1,2].map(i => (
          <span key={i} style={{ fontSize: 14, filter: i < level.stars ? 'drop-shadow(0 1px 0 #B87C0E)' : 'none', opacity: i < level.stars ? 1 : 0.3 }}>
            {i < level.stars ? '⭐' : '☆'}
          </span>
        ))}
      </div>
    </div>
  );
}

// Sticker collection
function StickerBook({ onBack, profile }) {
  const stickers = React.useMemo(() => [
    { e: '🌳', name: 'Oak', got: true }, { e: '🍄', name: 'Shroom', got: true }, { e: '🌷', name: 'Tulip', got: true },
    { e: '🦋', name: 'Flutter', got: true }, { e: '🐝', name: 'Buzzy', got: true }, { e: '🐞', name: 'Dotsy', got: true },
    { e: '🍎', name: 'Apple', got: true }, { e: '🌻', name: 'Sunny', got: true }, { e: '🍒', name: 'Cherry', got: true },
    { e: '🌙', name: 'Moon', got: true }, { e: '⭐', name: 'Star', got: true }, { e: '🌈', name: 'Rainbow', got: true },
    ...Array(28).fill(null).map((_, i) => ({ e: '?', name: 'locked', got: false })),
  ], []);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GardenBg variant="lavender"/>
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '56px 20px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <IconBtn color="cream" size={48} onClick={onBack}>‹</IconBtn>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#2D3A2E' }}>Sticker Book</div>
            <div style={{ fontSize: 13, color: '#6B7A6C', fontWeight: 600 }}>12 of 40 collected</div>
          </div>
          <div style={{ fontSize: 36 }}>📓</div>
        </div>
        <div style={{ padding: '0 20px 12px' }}>
          <ProgressBar value={12} max={40} color="#B9A4E0" height={12}/>
        </div>
        <div className="scroll" style={{ flex: 1, padding: '12px 20px 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {stickers.map((s, i) => (
              <div key={i} style={{
                aspectRatio: '1', borderRadius: 18,
                background: s.got ? '#FFF8EC' : 'rgba(255,255,255,0.3)',
                border: '2px dashed ' + (s.got ? 'transparent' : 'rgba(46,90,58,0.25)'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: s.got ? 40 : 28, color: s.got ? 'inherit' : 'rgba(46,90,58,0.3)',
                boxShadow: s.got ? '0 3px 0 rgba(46,90,58,0.12)' : 'none',
                animation: s.got ? `pop-in 0.4s ease-out ${i*0.02}s both` : 'none',
              }}>
                {s.e}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PROGRESS PATH ────────────────────────────────────────────
function ProgressPath({ onBack, profile }) {
  const allLevels = [
    { world: '🌳 Number Forest',  color: '#7FC089', bg: '#EAF7E4', n: 1,  stars: 3, done: true },
    { world: '🌳 Number Forest',  color: '#7FC089', bg: '#EAF7E4', n: 2,  stars: 3, done: true },
    { world: '🌳 Number Forest',  color: '#7FC089', bg: '#EAF7E4', n: 3,  stars: 2, done: true },
    { world: '🌳 Number Forest',  color: '#7FC089', bg: '#EAF7E4', n: 4,  stars: 1, done: true },
    { world: '🌳 Number Forest',  color: '#7FC089', bg: '#EAF7E4', n: 5,  stars: 0, done: false, current: true },
    { world: '🏘️ Tens Town',       color: '#8AC4DE', bg: '#E4F2FA', n: 1,  stars: 0, done: false, locked: true },
    { world: '🏘️ Tens Town',       color: '#8AC4DE', bg: '#E4F2FA', n: 2,  stars: 0, done: false, locked: true },
    { world: '🌉 Even/Odd Bridge', color: '#B9A4E0', bg: '#F0EAF8', n: 1,  stars: 0, done: false, locked: true },
    { world: '🍳 Math Kitchen',    color: '#FFA48C', bg: '#FFF0EA', n: 1,  stars: 0, done: false, locked: true },
    { world: '🏰 Big # Castle',    color: '#FFC94A', bg: '#FFF7E0', n: 1,  stars: 0, done: false, locked: true },
  ];

  // group by world
  const worlds = [];
  let cur = null;
  for (const lv of allLevels) {
    if (!cur || cur.name !== lv.world) { cur = { name: lv.world, color: lv.color, bg: lv.bg, levels: [] }; worlds.push(cur); }
    cur.levels.push(lv);
  }

  const totalStars = allLevels.reduce((a, l) => a + l.stars, 0);
  const done = allLevels.filter(l => l.done).length;

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GardenBg variant="sage">
        <Sparkles count={8} color="#fff"/>
      </GardenBg>
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ padding: '56px 20px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <IconBtn color="cream" size={48} onClick={onBack}>‹</IconBtn>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#2D3A2E' }}>My Journey</div>
            <div style={{ fontSize: 13, color: '#3E7B4A', fontWeight: 600 }}>{done} levels done · ⭐ {totalStars} stars</div>
          </div>
          <div className="bobble"><BapMini size={48} color={profile.color}/></div>
        </div>

        {/* Total progress bar */}
        <div style={{ padding: '0 20px 12px' }}>
          <ProgressBar value={done} max={allLevels.length} color="#5FB36A" height={14} showStar/>
        </div>

        {/* Path scroll */}
        <div className="scroll" style={{ flex: 1, padding: '8px 20px 32px' }}>
          {worlds.map((w, wi) => (
            <div key={wi} style={{ marginBottom: 24 }}>
              {/* World header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
                padding: '10px 14px', borderRadius: 16, background: w.bg,
                border: `2px solid ${w.color}`,
              }}>
                <div style={{ fontSize: 22 }}>{w.name.split(' ')[0]}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#2D3A2E' }}>{w.name.slice(w.name.indexOf(' ')+1)}</div>
                <div style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: w.color }}>
                  {w.levels.filter(l => l.done).length}/{w.levels.length}
                </div>
              </div>

              {/* Level nodes on path */}
              <div style={{ position: 'relative', paddingLeft: 48 }}>
                {/* Vertical line */}
                <div style={{
                  position: 'absolute', left: 22, top: 12, bottom: 12,
                  width: 3, background: `repeating-linear-gradient(to bottom, ${w.color} 0, ${w.color} 8px, transparent 8px, transparent 16px)`,
                  borderRadius: 2,
                }}/>

                {w.levels.map((lv, li) => (
                  <div key={li} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, position: 'relative' }}>
                    {/* Node circle */}
                    <div style={{
                      position: 'absolute', left: -38,
                      width: 36, height: 36, borderRadius: '50%',
                      background: lv.done ? w.color : lv.current ? '#FFF8EC' : '#E8DFCE',
                      border: `3px solid ${lv.current ? '#2D3A2E' : lv.done ? '#2D3A2E' : 'rgba(46,90,58,0.2)'}`,
                      boxShadow: lv.done ? `0 3px 0 rgba(46,90,58,0.22)` : lv.current ? '0 0 0 4px rgba(255,211,110,0.4)' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 15, fontWeight: 700, color: lv.done ? '#fff' : lv.locked ? 'rgba(46,90,58,0.3)' : '#2D3A2E',
                      animation: lv.current ? 'pulse-soft 1.5s ease-in-out infinite' : 'none',
                    }}>
                      {lv.locked ? '🔒' : lv.done ? '✓' : lv.current ? '▶' : lv.n}
                    </div>

                    {/* Level card */}
                    <div style={{
                      flex: 1, padding: '10px 14px', borderRadius: 16,
                      background: lv.done ? '#fff' : lv.current ? '#FFF8EC' : 'rgba(255,255,255,0.4)',
                      border: `2px solid ${lv.current ? '#C79528' : lv.done ? 'rgba(46,90,58,0.12)' : 'rgba(46,90,58,0.08)'}`,
                      boxShadow: lv.current ? '0 4px 12px rgba(199,149,40,0.2)' : lv.done ? '0 2px 6px rgba(46,90,58,0.06)' : 'none',
                      opacity: lv.locked ? 0.5 : 1,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#2D3A2E' }}>
                          {lv.current ? '⬤ ' : ''}{lv.world.split(' ').slice(1).join(' ')} — Level {lv.n}
                        </div>
                        {lv.done && <div style={{ display: 'flex', gap: 1 }}>
                          {[0,1,2].map(i => <span key={i} style={{ fontSize: 12, opacity: i < lv.stars ? 1 : 0.2 }}>{i < lv.stars ? '⭐' : '☆'}</span>)}
                        </div>}
                        {lv.current && <Tag color="sun" style={{ fontSize: 10, padding: '2px 8px' }}>Now!</Tag>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Footer mascot */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '12px 0 8px' }}>
            <BapMascot size={80} mood="happy" color={profile.color}/>
            <div style={{ fontSize: 14, color: '#3E7B4A', fontWeight: 600, textAlign: 'center' }}>
              Keep going, {profile.name}! 🌱
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen, WorldMap, LevelList, StickerBook, ProgressPath, WORLDS });
