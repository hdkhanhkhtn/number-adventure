// Main app shell — routes between all screens, manages state
(function() {
const { useState, useEffect, useRef } = React;

const STICKERS = [
  { emoji: '🌳', name: 'Oak Tree' },
  { emoji: '🍄', name: 'Mushroom' },
  { emoji: '🌷', name: 'Tulip' },
  { emoji: '🦋', name: 'Butterfly' },
  { emoji: '🐝', name: 'Bee Friend' },
  { emoji: '🐞', name: 'Ladybug' },
];

function App({ tweaks }) {
  const [route, setRoute] = useState(() => localStorage.getItem('bap.route') || 'splash');
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bap.profile')) || { name: 'Bắp', age: 4, color: tweaks.mascotColor || 'sun' }; }
    catch { return { name: 'Bắp', age: 4, color: tweaks.mascotColor || 'sun' }; }
  });
  const [currentWorld, setCurrentWorld] = useState(null);
  const [currentGame, setCurrentGame] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [lastPlayed, setLastPlayed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bap.lastPlayed')) || null; } catch { return null; }
  });
  const [settings, setSettings] = useState({
    dailyMin: 15, quietHours: true, difficulty: tweaks.difficulty || 'easy',
    kidLang: tweaks.language || 'en', parentLang: 'vi',
    sfx: true, music: false, voice: true, voiceStyle: 'Friendly',
  });
  const [showParentGate, setShowParentGate] = useState(false);
  const [lang, setLang] = useState('en');

  // Session timer
  const [sessionSecs, setSessionSecs] = useState(null); // null = not started
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => { localStorage.setItem('bap.route', route); }, [route]);
  useEffect(() => { localStorage.setItem('bap.profile', JSON.stringify(profile)); }, [profile]);
  useEffect(() => { if (lastPlayed) localStorage.setItem('bap.lastPlayed', JSON.stringify(lastPlayed)); }, [lastPlayed]);

  useEffect(() => {
    if (tweaks.mascotColor && tweaks.mascotColor !== profile.color)
      setProfile(p => ({ ...p, color: tweaks.mascotColor }));
  }, [tweaks.mascotColor]);

  // Start session timer when entering a game
  useEffect(() => {
    if (route === 'game') {
      const limitSecs = settings.dailyMin * 60;
      setSessionSecs(limitSecs);
      setSessionElapsed(0);
      timerRef.current = setInterval(() => {
        setSessionSecs(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setSessionElapsed(settings.dailyMin * 60);
            setRoute('session_end');
            return 0;
          }
          setSessionElapsed(e => e + 1);
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      if (route !== 'session_end') setSessionSecs(null);
    }
    return () => clearInterval(timerRef.current);
  }, [route]);

  const go = (r) => setRoute(r);

  const startGame = (world, level) => {
    setCurrentWorld(world);
    setCurrentGame(level.game);
    setLastPlayed({ worldName: world.name, level: level.n, game: level.game });
    go('game');
  };

  const gameByKey = (key) => {
    const props = { onExit: () => go('level_list'), onRoundEnd: finishGame, sessionSecsLeft: sessionSecs };
    if (key === 'hear_tap') return <HearTap {...props}/>;
    if (key === 'build')    return <BuildNumber {...props}/>;
    if (key === 'even_odd') return <EvenOdd {...props}/>;
    if (key === 'order')    return <NumberOrder {...props}/>;
    if (key === 'add')      return <AddTake {...props}/>;
    return null;
  };

  const finishGame = (result) => {
    const sticker = result.stars === 3 && Math.random() > 0.5
      ? STICKERS[Math.floor(Math.random() * STICKERS.length)] : null;
    setLastResult({ ...result, sticker });
    go('reward');
  };

  return (
    <>
      {route === 'splash'   && <SplashScreen onReady={() => go('onboard')}/>}
      {route === 'onboard'  && (
        <OnboardingFlow
          initial={profile}
          onDone={(p, data) => {
            setProfile(p);
            setSettings(s => ({ ...s, dailyMin: data.prefs.dailyMin, kidLang: data.lang, sfx: data.prefs.sound }));
            go('home');
          }}
        />
      )}

      {route === 'home' && (
        <HomeScreen
          profile={profile} streak={3}
          lastPlayed={lastPlayed}
          onPlay={() => { setCurrentWorld(WORLDS[0]); go('level_list'); }}
          onMap={() => go('map')}
          onStickers={() => go('stickers')}
          onParent={() => setShowParentGate(true)}
          onStreak={() => go('streak')}
          onProgress={() => go('progress')}
        />
      )}

      {route === 'map' && (
        <WorldMap onBack={() => go('home')} onPickWorld={(w) => { setCurrentWorld(w); go('level_list'); }}/>
      )}

      {route === 'level_list' && currentWorld && (
        <LevelList
          world={currentWorld}
          onBack={() => go('map')}
          onPickLevel={(lv) => startGame(currentWorld, lv)}
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

      {route === 'session_end' && (
        <SessionEndScreen
          profile={profile}
          minutesPlayed={Math.ceil(sessionElapsed / 60) || settings.dailyMin}
          starsToday={6}
          streak={3}
          onHome={() => go('home')}
        />
      )}

      {route === 'stickers'  && <StickerBook profile={profile} onBack={() => go('home')}/>}
      {route === 'streak'    && <StreakScreen streak={3} profile={profile} onBack={() => go('home')}/>}
      {route === 'progress'  && <ProgressPath profile={profile} onBack={() => go('home')}/>}

      {route === 'parent' && (
        <ParentDashboard
          profile={profile} onExit={() => go('home')}
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

      {tweaks.devJump && (
        <DevNav route={route} go={go}
          setProfile={setProfile}
          setCurrentGame={setCurrentGame}
          setCurrentWorld={setCurrentWorld}
          setLastResult={setLastResult}
        />
      )}
    </>
  );
}

function DevNav({ route, go, setProfile, setCurrentGame, setCurrentWorld, setLastResult }) {
  const [open, setOpen] = useState(false);
  const scenes = [
    ['splash','Splash'],['onboard','Onboard'],
    ['home','Home'],['map','World Map'],['level_list','Levels'],
    ['stickers','Stickers'],['streak','Streak'],['progress','Progress'],
    ['session_end','Session End'],
    ['parent','Parent'],['parent_settings','Settings'],['parent_report','Report'],
  ];
  const games = [
    ['hear_tap','Hear & Tap'],['build','Build #'],['even_odd','Even/Odd'],
    ['order','Order'],['add','Add/Take'],
  ];
  return (
    <div style={{ position:'fixed', bottom:14, left:'50%', transform:'translateX(-50%)', zIndex:9999, fontFamily:'system-ui' }}>
      {open && (
        <div style={{
          background:'rgba(20,30,25,0.96)', color:'#fff', borderRadius:14,
          padding:10, marginBottom:10, maxWidth:360, fontSize:11,
          boxShadow:'0 10px 30px rgba(0,0,0,0.3)',
        }}>
          <div style={{ fontWeight:700, marginBottom:6, opacity:0.7, letterSpacing:0.5 }}>SCENES</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:10 }}>
            {scenes.map(([k,l]) => (
              <button key={k} onClick={() => go(k)} style={{
                padding:'5px 10px', borderRadius:999, fontSize:11, fontWeight:600,
                background: route===k ? '#FFD36E' : 'rgba(255,255,255,0.12)',
                color: route===k ? '#000' : '#fff',
              }}>{l}</button>
            ))}
          </div>
          <div style={{ fontWeight:700, marginBottom:6, opacity:0.7, letterSpacing:0.5 }}>GAMES</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:8 }}>
            {games.map(([k,l]) => (
              <button key={k} onClick={() => { setCurrentWorld(WORLDS[0]); setCurrentGame(k); go('game'); }} style={{
                padding:'5px 10px', borderRadius:999, fontSize:11, fontWeight:600,
                background:'rgba(255,255,255,0.12)', color:'#fff',
              }}>{l}</button>
            ))}
          </div>
          <div style={{ display:'flex', gap:4 }}>
            <button onClick={() => { setLastResult({ stars:3, correct:5, total:5, sticker:{ emoji:'🦋', name:'Butterfly' } }); go('reward'); }} style={{ padding:'5px 10px', borderRadius:999, fontSize:11, background:'rgba(255,255,255,0.12)', color:'#fff' }}>3⭐ reward</button>
            <button onClick={() => { localStorage.clear(); location.reload(); }} style={{ padding:'5px 10px', borderRadius:999, fontSize:11, background:'#E6779E', color:'#fff' }}>reset</button>
          </div>
        </div>
      )}
      <button onClick={() => setOpen(!open)} style={{
        width:44, height:44, borderRadius:'50%',
        background:'#2D3A2E', color:'#fff', fontSize:16, fontWeight:700,
        boxShadow:'0 4px 12px rgba(0,0,0,0.3)',
      }}>{open ? '✕' : '≡'}</button>
    </div>
  );
}

window.App = App;
})();
