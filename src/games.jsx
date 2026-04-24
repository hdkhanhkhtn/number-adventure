// Mini-games: Hear & Tap, Build the Number, Even/Odd, Number Order, Add/Take Away

// Shared game chrome: top bar w/ close, hearts, progress
function GameHud({ hearts = 3, progress = 0, total = 5, onClose }) {
  return (
    <div style={{ padding: '56px 16px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <IconBtn color="cream" size={44} onClick={onClose} style={{ fontSize: 20 }}>✕</IconBtn>
      <div style={{ flex: 1 }}>
        <ProgressBar value={progress} max={total} color="#FFD36E" height={14}/>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 3,
        padding: '6px 12px', borderRadius: 999, background: '#FFDDE2',
        border: '2px solid #2D3A2E', fontSize: 14, fontWeight: 700, color: '#A33A1D',
      }}>
        ❤️ {hearts}
      </div>
    </div>
  );
}

// —————————————————————————————————————————————————————————————
// 1) HEAR & TAP — listen to the number, tap the correct tile
// —————————————————————————————————————————————————————————————
function HearTap({ onExit, onRoundEnd, config = {} }) {
  const max = config.max || 20;
  const rounds = 5;
  const [round, setRound] = React.useState(0);
  const [hearts, setHearts] = React.useState(3);
  const [wrongs, setWrongs] = React.useState(new Set());
  const [correctPicked, setCorrectPicked] = React.useState(false);

  const q = React.useMemo(() => {
    const target = 1 + Math.floor(Math.random() * max);
    const opts = new Set([target]);
    while (opts.size < 4) opts.add(1 + Math.floor(Math.random() * max));
    return { target, options: [...opts].sort(() => Math.random() - 0.5) };
  }, [round]);

  React.useEffect(() => { setWrongs(new Set()); setCorrectPicked(false); speak(q.target); }, [round]);

  const speak = (n) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(n));
      u.rate = 0.85; u.pitch = 1.1; u.lang = 'en-US';
      window.speechSynthesis.speak(u);
    } catch (e) {}
  };

  const onPick = (n) => {
    if (correctPicked) return;
    if (n === q.target) {
      setCorrectPicked(true);
      setTimeout(() => {
        if (round + 1 >= rounds) onRoundEnd({ stars: hearts === 3 ? 3 : hearts === 2 ? 2 : 1, correct: rounds - (3 - hearts), total: rounds });
        else setRound(round + 1);
      }, 900);
    } else {
      setWrongs(new Set([...wrongs, n]));
      setHearts(h => Math.max(0, h - 1));
    }
  };

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GardenBg variant="sage">
        <Sparkles count={6} color="#FFD36E"/>
      </GardenBg>
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <GameHud hearts={hearts} progress={round} total={rounds} onClose={onExit}/>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px', gap: 28 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#2F6A3C', fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>
              TAP WHAT YOU HEAR
            </div>
          </div>

          <button onClick={() => speak(q.target)} className="no-select pulse-soft" style={{
            width: 160, height: 160, borderRadius: '50%',
            background: '#FFD36E', border: '4px solid #2D3A2E',
            boxShadow: '0 6px 0 #C79528, 0 14px 24px rgba(46,90,58,0.18)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: '#5E3A00', gap: 6,
          }}>
            <SpeakerIcon size={52}/>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.5 }}>TAP TO HEAR</div>
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {q.options.map(n => (
              <NumTile
                key={n} n={n} size="lg" color={n === q.target && correctPicked ? 'sage' : 'cream'}
                state={correctPicked && n === q.target ? 'correct' : wrongs.has(n) ? 'wrong' : 'idle'}
                onClick={() => onPick(n)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// —————————————————————————————————————————————————————————————
// 2) BUILD THE NUMBER — drag/tap tens + ones to match target
// —————————————————————————————————————————————————————————————
function BuildNumber({ onExit, onRoundEnd }) {
  const rounds = 4;
  const [round, setRound] = React.useState(0);
  const [hearts, setHearts] = React.useState(3);
  const [tens, setTens] = React.useState(0);
  const [ones, setOnes] = React.useState(0);

  const target = React.useMemo(() => 11 + Math.floor(Math.random() * 60), [round]);
  React.useEffect(() => { setTens(0); setOnes(0); }, [round]);

  const current = tens * 10 + ones;
  const match = current === target;

  const submit = () => {
    if (match) {
      setTimeout(() => {
        if (round + 1 >= rounds) onRoundEnd({ stars: hearts === 3 ? 3 : hearts === 2 ? 2 : 1, correct: rounds - (3 - hearts), total: rounds });
        else setRound(round + 1);
      }, 1000);
    } else {
      setHearts(h => Math.max(0, h - 1));
    }
  };

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GardenBg variant="sky"/>
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <GameHud hearts={hearts} progress={round} total={rounds} onClose={onExit}/>
        <div style={{ padding: '0 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: '#2E6F93', fontWeight: 700, letterSpacing: 0.5 }}>BUILD THE NUMBER</div>
        </div>
        {/* target */}
        <div style={{ padding: '16px 20px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 140, height: 96, borderRadius: 22,
            background: '#FFD36E', border: '3px solid #2D3A2E',
            boxShadow: '0 5px 0 #C79528',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-num)', fontWeight: 700, fontSize: 60, color: '#5E3A00',
          }}>{target}</div>
          <div style={{ fontSize: 13, color: '#1F4A61', fontWeight: 600 }}>Make this number</div>
        </div>

        {/* Your number */}
        <div style={{ flex: 1, padding: '0 16px 8px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{
            background: 'rgba(255,255,255,0.5)', borderRadius: 20,
            border: '2px dashed rgba(46,90,58,0.3)', padding: 12,
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#2E6F93', letterSpacing: 0.5 }}>YOUR NUMBER</div>
              <div style={{ fontSize: 38, fontWeight: 700, color: match ? '#2F6A3C' : '#2D3A2E', fontFamily: 'var(--font-num)', lineHeight: 1,
                transition: 'color 0.2s',
              }}>{current}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <SlotColumn label="Tens" sub="sticks of 10" count={tens} onAdd={() => tens < 9 && setTens(tens+1)} onSub={() => tens > 0 && setTens(tens-1)} color="sky" element={<TenStick/>} />
              <SlotColumn label="Ones" sub="single dots" count={ones} onAdd={() => ones < 9 && setOnes(ones+1)} onSub={() => ones > 0 && setOnes(ones-1)} color="sun" element={<OneDot/>} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
            <BigButton color="sage" size="lg" onClick={submit} disabled={current === 0}>
              {match ? 'Yay! ✓' : 'Check'}
            </BigButton>
          </div>
        </div>
      </div>
    </div>
  );
}
function TenStick() {
  return <div style={{ width: 14, height: 40, borderRadius: 4, background: '#8AC4DE', border: '2px solid #2D3A2E', boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.12)' }}/>;
}
function OneDot() {
  return <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#FFD36E', border: '2px solid #2D3A2E', boxShadow: '0 2px 0 #C79528' }}/>;
}
function SlotColumn({ label, sub, count, onAdd, onSub, color, element }) {
  return (
    <div style={{ borderRadius: 16, background: '#fff', border: '2px solid rgba(46,90,58,0.12)', padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#2D3A2E' }}>{label}</div>
        <div style={{ fontSize: 11, color: '#6B7A6C' }}>{sub}</div>
      </div>
      <div style={{
        minHeight: 70, borderRadius: 12, background: '#FDF6E4',
        border: '1.5px dashed rgba(46,90,58,0.2)',
        display: 'flex', flexWrap: 'wrap', alignContent: 'flex-end',
        gap: 4, padding: 6, justifyContent: 'center',
      }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="pop-in">{element}</div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
        <IconBtn color="cream" size={38} onClick={onSub} style={{ fontSize: 18 }}>−</IconBtn>
        <div style={{ fontFamily: 'var(--font-num)', fontWeight: 700, fontSize: 22, color: '#2D3A2E' }}>{count}</div>
        <IconBtn color={color} size={38} onClick={onAdd} style={{ fontSize: 18 }}>+</IconBtn>
      </div>
    </div>
  );
}

// —————————————————————————————————————————————————————————————
// 3) EVEN/ODD — drag number into the right basket
// —————————————————————————————————————————————————————————————
function EvenOdd({ onExit, onRoundEnd }) {
  const rounds = 5;
  const [round, setRound] = React.useState(0);
  const [hearts, setHearts] = React.useState(3);
  const [picked, setPicked] = React.useState(null);

  const n = React.useMemo(() => 2 + Math.floor(Math.random() * 18), [round]);
  const isEven = n % 2 === 0;

  const drop = (choice) => {
    if (picked) return;
    setPicked(choice);
    const ok = (choice === 'even') === isEven;
    if (!ok) setHearts(h => Math.max(0, h - 1));
    setTimeout(() => {
      setPicked(null);
      if (round + 1 >= rounds) onRoundEnd({ stars: hearts === 3 ? 3 : hearts === 2 ? 2 : 1, correct: rounds - (3 - hearts), total: rounds });
      else setRound(round + 1);
    }, 900);
  };

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GardenBg variant="lavender"/>
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <GameHud hearts={hearts} progress={round} total={rounds} onClose={onExit}/>
        <div style={{ padding: '0 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: '#5D3F94', fontWeight: 700, letterSpacing: 0.5 }}>EVEN or ODD?</div>
        </div>

        {/* dot array visual */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 20px' }}>
          <div style={{
            padding: '18px 22px', borderRadius: 22, background: '#fff',
            border: '3px solid #2D3A2E', boxShadow: '0 4px 0 rgba(46,90,58,0.2)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          }}>
            <div style={{ fontSize: 54, fontWeight: 700, fontFamily: 'var(--font-num)', lineHeight: 1, color: '#2D3A2E' }}>{n}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 14px)', gap: 4 }}>
              {Array.from({ length: n }).map((_, i) => (
                <div key={i} style={{
                  width: 14, height: 14, borderRadius: '50%',
                  background: i % 2 === 0 ? '#FFA48C' : '#B8DEEF',
                  border: '1.5px solid #2D3A2E',
                }}/>
              ))}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'stretch' }}>
          <Basket label="EVEN" hint="pairs" color="sage" active={picked === 'even'} correct={picked === 'even' && isEven} wrong={picked === 'even' && !isEven} onClick={() => drop('even')}/>
          <Basket label="ODD" hint="one left over" color="coral" active={picked === 'odd'} correct={picked === 'odd' && !isEven} wrong={picked === 'odd' && isEven} onClick={() => drop('odd')}/>
        </div>
      </div>
    </div>
  );
}

function Basket({ label, hint, color, active, correct, wrong, onClick }) {
  const colors = {
    sage: { bg: '#A8D5A2', sh: '#6FA876', ink: '#1F4A28' },
    coral: { bg: '#FFA48C', sh: '#D67560', ink: '#7A2B15' },
  };
  const c = colors[color];
  let bg = c.bg, sh = c.sh;
  if (correct) { bg = '#C4EBB9'; sh = '#6FB05F'; }
  if (wrong) { bg = '#FFD6C6'; sh = '#E88866'; }
  return (
    <button onClick={onClick} className={`no-select ${wrong ? 'wiggle' : ''}`} style={{
      background: bg, color: c.ink,
      border: '3px solid #2D3A2E', borderRadius: 28,
      boxShadow: `0 5px 0 ${sh}, 0 10px 18px rgba(46,90,58,0.12)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 20, gap: 6,
      transform: active && !wrong ? 'scale(1.04)' : '',
      transition: 'transform 0.15s',
    }}>
      <div style={{ fontSize: 56, lineHeight: 1 }}>{label === 'EVEN' ? '🍎🍎' : '🍎'}</div>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.75 }}>{hint}</div>
    </button>
  );
}

// —————————————————————————————————————————————————————————————
// 4) NUMBER ORDER — find missing number in sequence
// —————————————————————————————————————————————————————————————
function NumberOrder({ onExit, onRoundEnd }) {
  const rounds = 4;
  const [round, setRound] = React.useState(0);
  const [hearts, setHearts] = React.useState(3);
  const [picked, setPicked] = React.useState(null);

  const q = React.useMemo(() => {
    const start = 1 + Math.floor(Math.random() * 10);
    const seq = [start, start+1, start+2, start+3, start+4];
    const hideIdx = 1 + Math.floor(Math.random() * 3);
    const target = seq[hideIdx];
    const opts = new Set([target]);
    while (opts.size < 3) opts.add(Math.max(1, target + (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random()*3))));
    return { seq, hideIdx, target, options: [...opts].sort(() => Math.random()-0.5) };
  }, [round]);

  React.useEffect(() => setPicked(null), [round]);

  const pick = (n) => {
    if (picked) return;
    setPicked(n);
    if (n !== q.target) setHearts(h => Math.max(0, h - 1));
    setTimeout(() => {
      if (round + 1 >= rounds) onRoundEnd({ stars: hearts === 3 ? 3 : hearts === 2 ? 2 : 1, correct: rounds - (3 - hearts), total: rounds });
      else setRound(round + 1);
    }, 900);
  };

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GardenBg variant="sun"/>
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <GameHud hearts={hearts} progress={round} total={rounds} onClose={onExit}/>
        <div style={{ padding: '0 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: '#7A4E0E', fontWeight: 700, letterSpacing: 0.5 }}>WHAT COMES NEXT?</div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28, padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            {q.seq.map((n, i) => (
              i === q.hideIdx ? (
                <div key={i} style={{
                  width: 64, height: 76, borderRadius: 18,
                  background: 'rgba(255,255,255,0.6)',
                  border: '3px dashed rgba(46,90,58,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 36, color: '#7A4E0E', fontWeight: 700,
                  animation: 'pulse-soft 1.5s ease-in-out infinite',
                }}>?</div>
              ) : (
                <div key={i} style={{
                  width: 56, height: 66, borderRadius: 16,
                  background: '#fff', border: '2px solid #2D3A2E',
                  boxShadow: '0 3px 0 rgba(46,90,58,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-num)', fontWeight: 700, fontSize: 30, color: '#2D3A2E',
                }}>{n}</div>
              )
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
            {q.options.map(n => (
              <NumTile key={n} n={n} size="md" color="cream"
                state={picked === n ? (n === q.target ? 'correct' : 'wrong') : 'idle'}
                onClick={() => pick(n)}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// —————————————————————————————————————————————————————————————
// 5) ADD / TAKE AWAY — visual + number equation
// —————————————————————————————————————————————————————————————
function AddTake({ onExit, onRoundEnd }) {
  const rounds = 4;
  const [round, setRound] = React.useState(0);
  const [hearts, setHearts] = React.useState(3);
  const [picked, setPicked] = React.useState(null);

  const q = React.useMemo(() => {
    const op = Math.random() > 0.5 ? '+' : '−';
    let a = 2 + Math.floor(Math.random() * 6);
    let b = 1 + Math.floor(Math.random() * 4);
    if (op === '−' && b > a) [a, b] = [b, a];
    const target = op === '+' ? a + b : a - b;
    const opts = new Set([target]);
    while (opts.size < 4) opts.add(Math.max(0, target + Math.floor(Math.random()*5) - 2));
    return { a, b, op, target, options: [...opts].sort(() => Math.random() - 0.5) };
  }, [round]);

  React.useEffect(() => setPicked(null), [round]);

  const pick = (n) => {
    if (picked) return;
    setPicked(n);
    if (n !== q.target) setHearts(h => Math.max(0, h - 1));
    setTimeout(() => {
      if (round + 1 >= rounds) onRoundEnd({ stars: hearts === 3 ? 3 : hearts === 2 ? 2 : 1, correct: rounds - (3 - hearts), total: rounds });
      else setRound(round + 1);
    }, 900);
  };

  const Apples = ({ count, crossed = 0 }) => (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 100, justifyContent: 'center' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ fontSize: 26, position: 'relative', lineHeight: 1, opacity: i < crossed ? 0.3 : 1 }}>
          🍎
          {i < crossed && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#C14A2A', fontSize: 32, fontWeight: 900,
            }}>✕</div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GardenBg variant="cream"/>
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <GameHud hearts={hearts} progress={round} total={rounds} onClose={onExit}/>
        <div style={{ padding: '0 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: '#7A4E0E', fontWeight: 700, letterSpacing: 0.5 }}>
            {q.op === '+' ? 'HOW MANY TOGETHER?' : 'HOW MANY LEFT?'}
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, padding: '8px 16px', justifyContent: 'space-around' }}>
          <div style={{
            background: '#fff', borderRadius: 22, border: '3px solid #2D3A2E',
            boxShadow: '0 4px 0 rgba(46,90,58,0.2)', padding: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 6,
          }}>
            <Apples count={q.a} crossed={q.op === '−' ? q.b : 0}/>
            <div style={{ fontSize: 44, fontWeight: 700, color: '#2D3A2E', fontFamily: 'var(--font-num)' }}>{q.op}</div>
            {q.op === '+' ? <Apples count={q.b}/> : <div style={{ fontSize: 36, fontWeight: 700, fontFamily: 'var(--font-num)' }}>{q.b}</div>}
          </div>
          <div style={{
            textAlign: 'center', fontSize: 44, fontWeight: 700, color: '#2D3A2E', fontFamily: 'var(--font-num)',
          }}>
            {q.a} {q.op} {q.b} = <span style={{ color: '#C14A2A' }}>?</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, justifyContent: 'center' }}>
            {q.options.map(n => (
              <NumTile key={n} n={n} size="sm" color="cream"
                state={picked === n ? (n === q.target ? 'correct' : 'wrong') : 'idle'}
                onClick={() => pick(n)}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { HearTap, BuildNumber, EvenOdd, NumberOrder, AddTake });
