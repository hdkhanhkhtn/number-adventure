// Pre-game screens: Splash, Welcome, Profile setup, Parent gate

function SplashScreen({ onReady }) {
  React.useEffect(() => {
    const t = setTimeout(onReady, 2200);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GardenBg variant="sun">
        <Sparkles count={14} color="#FFB84A" />
      </GardenBg>
      <div style={{
        position: 'relative', zIndex: 1, height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20,
      }}>
        <div className="bobble">
          <BapMascot size={160} mood="happy" />
        </div>
        <div style={{
          fontFamily: 'var(--font-kid)', fontWeight: 700, fontSize: 44,
          color: '#5E3A00', lineHeight: 1, letterSpacing: -1,
          textShadow: '0 3px 0 rgba(255,255,255,0.6)',
        }}>Bắp</div>
        <div style={{ color: '#7A4E0E', fontSize: 18, fontWeight: 600, letterSpacing: 1 }}>
          NUMBER ADVENTURE
        </div>
        <div style={{
          marginTop: 16, display: 'flex', gap: 8,
        }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: '50%', background: '#C89220',
              animation: `pulse-soft 1s ease-in-out ${i*0.15}s infinite`,
            }}/>
          ))}
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen({ onNext, lang, setLang }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GardenBg variant="cream"/>
      <div style={{
        position: 'relative', zIndex: 1, height: '100%', padding: '72px 28px 40px',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Language toggle top-right */}
        <div style={{ position: 'absolute', top: 56, right: 20, display: 'flex', gap: 6 }}>
          {['en','vi','bi'].map(l => (
            <button key={l} onClick={() => setLang(l)} className="no-select" style={{
              padding: '6px 12px', borderRadius: 999,
              background: lang === l ? '#FFD36E' : '#FFF4DE',
              border: '2px solid #2D3A2E',
              fontWeight: 700, fontSize: 12, color: '#5E3A00',
              boxShadow: lang === l ? '0 2px 0 #C79528' : 'none',
            }}>{l === 'en' ? '🇬🇧 EN' : l === 'vi' ? '🇻🇳 VI' : '🌍 BI'}</button>
          ))}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <div className="bobble">
            <BapMascot size={180} mood="wink" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#2D3A2E', lineHeight: 1.1 }}>
              Hi, I'm Bắp!
            </div>
            <div style={{ fontSize: 18, color: '#6B7A6C', marginTop: 8, lineHeight: 1.3 }}>
              Let's play with numbers<br/>together 🌱
            </div>
          </div>
          {/* Demo: audio prompt indicator */}
          <div style={{
            marginTop: 8, padding: '10px 18px', borderRadius: 999,
            background: '#FFF4DE', border: '2px solid rgba(46,90,58,0.15)',
            display: 'inline-flex', alignItems: 'center', gap: 10,
            color: '#7A4E0E', fontSize: 14, fontWeight: 600,
          }}>
            <SpeakerIcon size={18}/> tap to hear
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <BigButton color="sage" size="xl" onClick={onNext} icon="▶">Start</BigButton>
          <button onClick={onNext} className="no-select" style={{
            fontSize: 14, color: '#6B7A6C', fontWeight: 600, padding: 10,
          }}>
            I already have a profile
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileSetup({ onDone, initial }) {
  const [step, setStep] = React.useState(0);
  const [name, setName] = React.useState(initial?.name || 'Bắp');
  const [age, setAge] = React.useState(initial?.age || 4);
  const [color, setColor] = React.useState(initial?.color || 'sun');

  const next = () => step < 2 ? setStep(step + 1) : onDone({ name, age, color });

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GardenBg variant="sky"/>
      <div style={{
        position: 'relative', zIndex: 1, height: '100%', padding: '64px 24px 32px',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Step dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: i === step ? 28 : 10, height: 10, borderRadius: 10,
              background: i <= step ? '#5FB36A' : 'rgba(46,90,58,0.2)',
              transition: 'all 0.3s',
            }}/>
          ))}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
          {step === 0 && (
            <>
              <div className="pop-in"><BapMascot size={120} color={color} mood="happy"/></div>
              <div style={{ fontSize: 24, fontWeight: 700, textAlign: 'center' }}>What's your name?</div>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                style={{
                  width: '100%', maxWidth: 280, height: 68,
                  border: '3px solid #2D3A2E', borderRadius: 24,
                  background: '#fff', fontFamily: 'var(--font-kid)', fontWeight: 700, fontSize: 32,
                  textAlign: 'center', color: '#2D3A2E', outline: 'none',
                  boxShadow: '0 4px 0 rgba(46,90,58,0.2)',
                }}
              />
            </>
          )}
          {step === 1 && (
            <>
              <div className="pop-in"><BapMascot size={120} color={color} mood="think"/></div>
              <div style={{ fontSize: 24, fontWeight: 700, textAlign: 'center' }}>How old are you?</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                {[3,4,5,6].map(a => (
                  <NumTile key={a} n={a} size="md" color={age === a ? 'sun' : 'cream'} onClick={() => setAge(a)}/>
                ))}
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="pop-in"><BapMascot size={140} color={color} mood="celebrate"/></div>
              <div style={{ fontSize: 24, fontWeight: 700, textAlign: 'center' }}>Pick your Bắp</div>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 320 }}>
                {['sun','sage','coral','lavender','sky'].map(c => (
                  <button key={c} onClick={() => setColor(c)} className="no-select" style={{
                    width: 68, height: 68, borderRadius: 20,
                    background: '#fff', border: color === c ? '3px solid #2D3A2E' : '2px solid rgba(46,90,58,0.15)',
                    boxShadow: color === c ? '0 4px 0 rgba(46,90,58,0.2)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transform: color === c ? 'translateY(-2px)' : '',
                    transition: 'transform 0.15s',
                  }}>
                    <BapMini size={48} color={c}/>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          {step > 0 && (
            <IconBtn color="cream" onClick={() => setStep(step - 1)}>‹</IconBtn>
          )}
          <BigButton color="sage" size="lg" onClick={next} icon={step === 2 ? '✓' : '›'}>
            {step === 2 ? 'Let\'s Go!' : 'Next'}
          </BigButton>
        </div>
      </div>
    </div>
  );
}

function ParentGate({ onPass, onCancel }) {
  const [a] = React.useState(() => 3 + Math.floor(Math.random()*4));
  const [b] = React.useState(() => 2 + Math.floor(Math.random()*3));
  const target = a + b;
  const [choice, setChoice] = React.useState(null);
  const options = React.useMemo(() => {
    const set = new Set([target]);
    while (set.size < 4) set.add(1 + Math.floor(Math.random()*15));
    return [...set].sort(() => Math.random() - 0.5);
  }, [target]);

  const onPick = (n) => {
    setChoice(n);
    if (n === target) setTimeout(onPass, 400);
    else setTimeout(() => setChoice(null), 600);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(46,90,58,0.4)', backdropFilter: 'blur(6px)' }}>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: '#FFF8EC', borderTopLeftRadius: 32, borderTopRightRadius: 32,
        padding: '24px 28px 36px', boxShadow: '0 -10px 30px rgba(0,0,0,0.15)',
        animation: 'slide-up 0.3s ease-out',
        borderTop: '2px solid rgba(46,90,58,0.15)',
      }}>
        <div style={{ width: 40, height: 4, background: 'rgba(46,90,58,0.2)', borderRadius: 4, margin: '0 auto 20px' }}/>
        <div style={{ textAlign: 'center', marginBottom: 6, fontSize: 13, color: '#6B7A6C', fontWeight: 600, letterSpacing: 0.5 }}>
          CỔNG PHỤ HUYNH
        </div>
        <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, color: '#2D3A2E', marginBottom: 4 }}>
          For grown-ups only
        </div>
        <div style={{ textAlign: 'center', fontSize: 14, color: '#6B7A6C', marginBottom: 20 }}>
          Giải phép tính để tiếp tục
        </div>
        <div style={{
          fontSize: 48, fontWeight: 700, textAlign: 'center', color: '#2D3A2E',
          marginBottom: 20, fontFamily: 'var(--font-num)',
        }}>
          {a} + {b} = ?
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {options.map(n => (
            <NumTile key={n} n={n} size="md"
              state={choice === n ? (n === target ? 'correct' : 'wrong') : 'idle'}
              color="cream" onClick={() => onPick(n)}
            />
          ))}
        </div>
        <button onClick={onCancel} className="no-select" style={{
          width: '100%', padding: 14, fontSize: 15, fontWeight: 600,
          color: '#6B7A6C', background: 'transparent',
        }}>
          Hủy
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { SplashScreen, WelcomeScreen, ProfileSetup, ParentGate });
