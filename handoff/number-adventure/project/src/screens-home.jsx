// Home, World Map, Level list, Sticker book, Streak screen

function HomeScreen({ profile, onPlay, onMap, onStickers, onParent, streak = 3 }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GardenBg variant="cream">
        <Sparkles count={8} color="#FFD36E"/>
      </GardenBg>
      <div style={{ position: 'relative', zIndex: 1, height: '100%', padding: '60px 20px 24px', display: 'flex', flexDirection: 'column' }}>
        {/* Top bar: avatar + streak + parent */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%', background: '#FFF8EC',
            border: '3px solid #2D3A2E', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 3px 0 rgba(46,90,58,0.2)', overflow: 'hidden',
          }}>
            <BapMini size={44} color={profile.color}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: '#6B7A6C', fontWeight: 600 }}>Hi,</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#2D3A2E' }}>{profile.name}!</div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '8px 12px', borderRadius: 999, background: '#FFE6A8',
            border: '2px solid #2D3A2E', boxShadow: '0 3px 0 #C89220',
            fontWeight: 700, color: '#5E3A00',
          }}>
            🔥 <span>{streak}</span>
          </div>
          <IconBtn color="cream" size={44} onClick={onParent} style={{ fontSize: 18 }}>👤</IconBtn>
        </div>

        {/* Big daily mission */}
        <div style={{ marginTop: 18, position: 'relative' }}>
          <div style={{
            background: 'linear-gradient(180deg, #B9E2B2 0%, #8FCC8A 100%)',
            borderRadius: 28, border: '3px solid #2D3A2E',
            boxShadow: '0 5px 0 rgba(46,90,58,0.25), 0 14px 24px rgba(46,90,58,0.15)',
            padding: '18px 18px 20px', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', right: -10, top: -6, opacity: 0.25, fontSize: 120 }}>✨</div>
            <Tag color="cream" style={{ background: '#FFF8EC', borderColor: '#2D3A2E', fontWeight: 700 }}>
              ⭐ TODAY'S ADVENTURE
            </Tag>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#1F4A28', marginTop: 10, lineHeight: 1.1 }}>
              Number Forest
            </div>
            <div style={{ fontSize: 14, color: '#2F6A3C', marginTop: 4, marginBottom: 14 }}>
              3 games · 2 min
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <BigButton color="sun" size="lg" onClick={onPlay} icon="▶">Play</BigButton>
              <div className="bobble" style={{ marginLeft: 'auto' }}>
                <BapMascot size={88} color={profile.color} mood="celebrate"/>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
          <QuickTile
            title="World Map"
            subtitle="5 worlds"
            color="sky"
            onClick={onMap}
            emoji="🗺️"
          />
          <QuickTile
            title="Stickers"
            subtitle="12 / 40"
            color="coral"
            onClick={onStickers}
            emoji="🌟"
          />
        </div>

        {/* Progress snapshot */}
        <div style={{ marginTop: 'auto', padding: 14, borderRadius: 20, background: '#FFF8EC', border: '2px solid rgba(46,90,58,0.12)' }}>
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
                  {i < 4 && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⭐</div>
                  )}
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
    sky: { bg: '#B8DEEF', sh: '#7DB0C8', ink: '#1F4A61' },
    coral: { bg: '#FFA48C', sh: '#D67560', ink: '#7A2B15' },
    lavender: { bg: '#D9C7F0', sh: '#A58AD0', ink: '#3D256D' },
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

Object.assign(window, { HomeScreen, WorldMap, LevelList, StickerBook, WORLDS });
