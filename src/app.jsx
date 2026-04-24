// Main app shell — routes between all screens, manages state
(function() {
const { useState, useEffect, useMemo } = React;

const STICKERS = [
  { emoji: '🌳', name: 'Oak Tree' },
  { emoji: '🍄', name: 'Mushroom' },
  { emoji: '🌷', name: 'Tulip' },
  { emoji: '🦋', name: 'Butterfly' },
  { emoji: '🐝', name: 'Bee Friend' },
  { emoji: '🐞', name: 'Ladybug' },
];

function App({ tweaks }) {
  // Persistent-ish state
  const [route, setRoute] = useState(() => localStorage.getItem('bap.route') || 'splash');
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bap.profile')) || { name: 'Bắp', age: 4, color: tweaks.mascotColor || 'sun' }; }
    catch { return { name: 'Bắp', age: 4, color: tweaks.mascotColor || 'sun' }; }
  });
  const [currentWorld, setCurrentWorld] = useState(null);
  const [currentGame, setCurrentGame] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [settings, setSettings] = useState({
    dailyMin: 15, quietHours: true, difficulty: tweaks.difficulty || 'easy',
    kidLang: tweaks.language || 'en', parentLang: 'vi',
    sfx: true, music: false, voice: true, voiceStyle: 'Friendly',
  });
  const [showParentGate, setShowParentGate] = useState(false);
  const [lang, setLang] = useState('en');

  useEffect(() => { localStorage.setItem('bap.route', route); }, [route]);
  useEffect(() => { localStorage.setItem('bap.profile', JSON.stringify(profile)); }, [profile]);

  // Override profile color from tweaks
  useEffect(() => {
    if (tweaks.mascotColor && tweaks.mascotColor !== profile.color) {
      setProfile(p => ({ ...p, color: tweaks.mascotColor }));
    }
  }, [tweaks.mascotColor]);

  const go = (r) => setRoute(r);

  const gameByKey = (key) => {
    if (key === 'hear_tap') return <HearTap onExit={() => go('level_list')} onRoundEnd={finishGame}/>;
    if (key === 'build')    return <BuildNumber onExit={() => go('level_list')} onRoundEnd={finishGame}/>;
    if (key === 'even_odd') return <EvenOdd onExit={() => go('level_list')} onRoundEnd={finishGame}/>;
    if (key === 'order')    return <NumberOrder onExit={() => go('level_list')} onRoundEnd={finishGame}/>;
    if (key === 'add')      return <AddTake onExit={() => go('level_list')} onRoundEnd={finishGame}/>;
    return null;
  };

  const finishGame = (result) => {
    const sticker = result.stars === 3 && Math.random() > 0.5
      ? STICKERS[Math.floor(Math.random() * STICKERS.length)] : null;
    setLastResult({ ...result, sticker });
    go('reward');
  };

  // Render
  return (
    <>
      {route === 'splash' && <SplashScreen onReady={() => go('welcome')}/>}
      {route === 'welcome' && <WelcomeScreen onNext={() => go('profile')} lang={lang} setLang={setLang}/>}
      {route === 'profile' && <ProfileSetup initial={profile} onDone={p => { setProfile(p); go('home'); }}/>}
      {route === 'home' && (
        <HomeScreen
          profile={profile}
          streak={3}
          onPlay={() => { setCurrentWorld(WORLDS[0]); go('level_list'); }}
          onMap={() => go('map')}
          onStickers={() => go('stickers')}
          onParent={() => setShowParentGate(true)}
        />
      )}
      {route === 'map' && (
        <WorldMap
          onBack={() => go('home')}
          onPickWorld={(w) => { setCurrentWorld(w); go('level_list'); }}
        />
      )}
      {route === 'level_list' && currentWorld && (
        <LevelList
          world={currentWorld}
          onBack={() => go('map')}
          onPickLevel={(lv) => { setCurrentGame(lv.game); go('game'); }}
        />
      )}
      {route === 'game' && currentGame && gameByKey(currentGame)}
      {route === 'reward' && lastResult && (
        <RewardScreen
          profile={profile}
          stars={lastResult.stars}
          correct={lastResult.correct}
          total={lastResult.total}
          sticker={lastResult.sticker}
          coinsEarned={lastResult.stars * 3}
          onContinue={() => go('level_list')}
        />
      )}
      {route === 'stickers' && <StickerBook profile={profile} onBack={() => go('home')}/>}
      {route === 'streak' && <StreakScreen streak={3} profile={profile} onBack={() => go('home')}/>}
      {route === 'parent' && (
        <ParentDashboard
          profile={profile}
          onExit={() => go('home')}
          onGotoSettings={() => go('parent_settings')}
          onGotoReport={() => go('parent_report')}
        />
      )}
      {route === 'parent_settings' && (
        <ParentSettings onBack={() => go('parent')} settings={settings} setSettings={setSettings}/>
      )}
      {route === 'parent_report' && (
        <ParentReport profile={profile} onBack={() => go('parent')}/>
      )}

      {showParentGate && (
        <ParentGate
          onPass={() => { setShowParentGate(false); go('parent'); }}
          onCancel={() => setShowParentGate(false)}
        />
      )}

      {/* Floating dev jump — hidden when tweaks off */}
      {tweaks.devJump && <DevNav route={route} go={go} setProfile={setProfile} setCurrentGame={setCurrentGame} setCurrentWorld={setCurrentWorld} setLastResult={setLastResult}/>}
    </>
  );
}

function DevNav({ route, go, setProfile, setCurrentGame, setCurrentWorld, setLastResult }) {
  const [open, setOpen] = useState(false);
  const scenes = [
    ['splash', 'Splash'],
    ['welcome', 'Welcome'],
    ['profile', 'Profile'],
    ['home', 'Home'],
    ['map', 'World Map'],
    ['level_list', 'Levels'],
    ['stickers', 'Stickers'],
    ['streak', 'Streak'],
    ['parent', 'Parent'],
    ['parent_settings', 'Settings'],
    ['parent_report', 'Report'],
  ];
  const games = [
    ['hear_tap', 'Hear & Tap'],
    ['build', 'Build #'],
    ['even_odd', 'Even/Odd'],
    ['order', 'Order'],
    ['add', 'Add/Take'],
  ];

  return (
    <div style={{
      position: 'fixed', bottom: 14, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, fontFamily: 'system-ui, sans-serif',
    }}>
      {open && (
        <div style={{
          background: 'rgba(20,30,25,0.96)', color: '#fff', borderRadius: 14,
          padding: 10, marginBottom: 10, maxWidth: 360, fontSize: 11,
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        }}>
          <div style={{ fontWeight: 700, marginBottom: 6, opacity: 0.7, letterSpacing: 0.5 }}>SCENES</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
            {scenes.map(([k, l]) => (
              <button key={k} onClick={() => go(k)} style={{
                padding: '5px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                background: route === k ? '#FFD36E' : 'rgba(255,255,255,0.12)',
                color: route === k ? '#000' : '#fff',
              }}>{l}</button>
            ))}
          </div>
          <div style={{ fontWeight: 700, marginBottom: 6, opacity: 0.7, letterSpacing: 0.5 }}>GAMES</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
            {games.map(([k, l]) => (
              <button key={k} onClick={() => { setCurrentWorld(WORLDS[0]); setCurrentGame(k); go('game'); }} style={{
                padding: '5px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                background: 'rgba(255,255,255,0.12)', color: '#fff',
              }}>{l}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => { setLastResult({ stars: 3, correct: 5, total: 5, sticker: { emoji: '🦋', name: 'Butterfly' } }); go('reward'); }} style={{
              padding: '5px 10px', borderRadius: 999, fontSize: 11, background: 'rgba(255,255,255,0.12)', color: '#fff',
            }}>3⭐ reward</button>
            <button onClick={() => { localStorage.clear(); location.reload(); }} style={{
              padding: '5px 10px', borderRadius: 999, fontSize: 11, background: '#E6779E', color: '#fff',
            }}>reset</button>
          </div>
        </div>
      )}
      <button onClick={() => setOpen(!open)} style={{
        width: 44, height: 44, borderRadius: '50%',
        background: '#2D3A2E', color: '#fff', fontSize: 16, fontWeight: 700,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}>{open ? '✕' : '≡'}</button>
    </div>
  );
}

window.App = App;
})();
