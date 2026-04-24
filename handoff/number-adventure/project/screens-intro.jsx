// ─── ONBOARDING FLOW ──────────────────────────────────────────
// Screens: Splash → Welcome → Language → Name → Age → Avatar →
//          LearningStage → Mascot → ParentPrefs → AssessmentIntro → Complete

// ── Splash ───────────────────────────────────────────────────
function SplashScreen({ onReady }) {
  React.useEffect(() => { const t = setTimeout(onReady, 2400); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GardenBg variant="sun"><Sparkles count={16} color="#FFB84A"/></GardenBg>
      <div style={{
        position: 'relative', zIndex: 1, height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
      }}>
        <div className="bobble"><BapMascot size={168} mood="happy"/></div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-kid)', fontWeight: 700, fontSize: 48, color: '#5E3A00', letterSpacing: -1, textShadow: '0 3px 0 rgba(255,255,255,0.5)', lineHeight: 1 }}>Bắp</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#7A4E0E', letterSpacing: 2, marginTop: 4 }}>NUMBER ADVENTURE</div>
        </div>
        <div style={{ fontSize: 14, color: '#A07040', fontWeight: 500, marginTop: 4 }}>Loading your adventure…</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: '#C89220', animation: `pulse-soft 1s ease-in-out ${i*0.18}s infinite` }}/>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step progress bar ─────────────────────────────────────────
function OnboardingProgress({ step, total }) {
  return (
    <div style={{ padding: '58px 24px 0', display: 'flex', gap: 5 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 5, borderRadius: 99,
          background: i < step ? '#5FB36A' : i === step ? '#FFD36E' : 'rgba(46,90,58,0.12)',
          transition: 'background 0.3s',
        }}/>
      ))}
    </div>
  );
}

// ── Shared onboarding wrapper ──────────────────────────────────
function OnboardStep({ children, title, subtitle, step, totalSteps, onBack, noProgress }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <GardenBg variant="cream"/>
      {!noProgress && <OnboardingProgress step={step} total={totalSteps}/>}
      {onBack && (
        <button onClick={onBack} className="no-select" style={{
          position: 'absolute', top: 56, left: 16,
          width: 40, height: 40, borderRadius: '50%',
          background: '#FFF8EC', border: '2px solid rgba(46,90,58,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, color: '#6B7A6C', zIndex: 10,
        }}>‹</button>
      )}
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', padding: '16px 24px 32px', overflowY: 'auto' }}>
        {(title || subtitle) && (
          <div style={{ textAlign: 'center', marginTop: 16, marginBottom: 20 }}>
            {title && <div style={{ fontSize: 26, fontWeight: 700, color: '#2D3A2E', lineHeight: 1.15, fontFamily: 'var(--font-kid)' }}>{title}</div>}
            {subtitle && <div style={{ fontSize: 14, color: '#6B7A6C', marginTop: 6, lineHeight: 1.5 }}>{subtitle}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// ── 1. Welcome ────────────────────────────────────────────────
function WelcomeScreen({ onNext }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GardenBg variant="sage"><Sparkles count={10} color="#fff"/></GardenBg>
      <div style={{ position: 'relative', zIndex: 1, height: '100%', padding: '64px 28px 40px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <div className="bobble"><BapMascot size={160} mood="wink"/></div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-kid)', fontSize: 32, fontWeight: 700, color: '#1F4A28', lineHeight: 1.1 }}>
              Hi, I'm Bắp! 👋
            </div>
            <div style={{ fontSize: 16, color: '#3E7B4A', marginTop: 10, lineHeight: 1.5, maxWidth: 280, margin: '10px auto 0' }}>
              A playful way for your child to explore numbers and early math.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['🔢 Count to 1000','➕ Add & Subtract','⚖️ Even & Odd','🌟 Collect stickers'].map(f => (
              <div key={f} style={{
                padding: '7px 14px', borderRadius: 999,
                background: 'rgba(255,255,255,0.75)', border: '1.5px solid rgba(46,90,58,0.15)',
                fontSize: 13, fontWeight: 600, color: '#2D3A2E',
              }}>{f}</div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
          <BigButton color="sun" size="xl" onClick={onNext} icon="▶" style={{ width: '100%', justifyContent: 'center' }}>
            Get Started
          </BigButton>
          <div style={{ fontSize: 13, color: '#3E7B4A', fontWeight: 500 }}>Takes about 2 minutes to set up</div>
        </div>
      </div>
    </div>
  );
}

// ── 2. Language ───────────────────────────────────────────────
function LanguageScreen({ value, onChange, onNext, onBack, step, totalSteps }) {
  const opts = [
    { id: 'en', flag: '🇬🇧', label: 'English only', sub: 'All prompts & audio in English' },
    { id: 'vi', flag: '🇻🇳', label: 'Tiếng Việt', sub: 'Tất cả bằng tiếng Việt' },
    { id: 'bi', flag: '🌍', label: 'Bilingual', sub: 'English for child · Vietnamese for parent' },
  ];
  return (
    <OnboardStep title="Choose a language" subtitle="You can change this anytime in settings." step={step} totalSteps={totalSteps} onBack={onBack}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {opts.map(o => (
          <button key={o.id} onClick={() => onChange(o.id)} className="no-select" style={{
            padding: '16px 18px', borderRadius: 22, textAlign: 'left',
            background: value === o.id ? '#EAF7E4' : '#fff',
            border: `3px solid ${value === o.id ? '#5FB36A' : 'rgba(46,90,58,0.12)'}`,
            boxShadow: value === o.id ? '0 4px 14px rgba(95,179,106,0.2)' : '0 2px 8px rgba(46,90,58,0.04)',
            display: 'flex', alignItems: 'center', gap: 14,
            transform: value === o.id ? 'translateY(-1px)' : '',
            transition: 'all 0.15s',
          }}>
            <div style={{ fontSize: 36, lineHeight: 1 }}>{o.flag}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#2D3A2E' }}>{o.label}</div>
              <div style={{ fontSize: 13, color: '#6B7A6C', marginTop: 2 }}>{o.sub}</div>
            </div>
            <div style={{
              width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
              border: `3px solid ${value === o.id ? '#5FB36A' : 'rgba(46,90,58,0.2)'}`,
              background: value === o.id ? '#5FB36A' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {value === o.id && <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#fff' }}/>}
            </div>
          </button>
        ))}
        <div style={{
          padding: '12px 16px', borderRadius: 16,
          background: '#FFF9EC', border: '1.5px solid rgba(199,149,40,0.3)',
          display: 'flex', gap: 10, alignItems: 'flex-start',
          fontSize: 13, color: '#7A4E0E',
        }}>
          <span style={{ fontSize: 18 }}>🔊</span>
          <span>Bắp will speak to your child in the selected language during all games.</span>
        </div>
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 20 }}>
        <BigButton color="sage" size="lg" onClick={onNext} icon="›" style={{ width: '100%', justifyContent: 'center' }}>
          Continue
        </BigButton>
      </div>
    </OnboardStep>
  );
}

// ── 3. Child Name ─────────────────────────────────────────────
function ChildNameScreen({ value, onChange, onNext, onBack, step, totalSteps }) {
  return (
    <OnboardStep title="What's your child's name?" step={step} totalSteps={totalSteps} onBack={onBack}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div className="pop-in"><BapMascot size={110} mood="think"/></div>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Type their name…"
          maxLength={20}
          style={{
            width: '100%', height: 72, borderRadius: 24,
            border: '3px solid #2D3A2E', background: '#fff',
            fontFamily: 'var(--font-kid)', fontWeight: 700, fontSize: 34,
            textAlign: 'center', color: '#2D3A2E', outline: 'none',
            boxShadow: '0 4px 0 rgba(46,90,58,0.18)',
          }}
        />
        <div style={{ fontSize: 13, color: '#6B7A6C' }}>
          Bắp will use this to cheer them on! 🌱
        </div>
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        <BigButton color="sage" size="lg" onClick={onNext} disabled={!value.trim()} icon="›"
          style={{ width: '100%', justifyContent: 'center' }}>
          Continue
        </BigButton>
      </div>
    </OnboardStep>
  );
}

// ── 4. Age ────────────────────────────────────────────────────
function AgeScreen({ value, onChange, onNext, onBack, step, totalSteps, childName }) {
  return (
    <OnboardStep title={`How old is ${childName || 'your child'}?`} step={step} totalSteps={totalSteps} onBack={onBack}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <div className="pop-in"><BapMascot size={100} mood="happy"/></div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[3,4,5,6,7].map(a => (
            <button key={a} onClick={() => onChange(a)} className="no-select" style={{
              width: 88, height: 100, borderRadius: 26,
              background: value === a ? '#FFD36E' : '#fff',
              border: `3px solid ${value === a ? '#C79528' : 'rgba(46,90,58,0.15)'}`,
              boxShadow: value === a ? '0 5px 0 #C79528, 0 10px 18px rgba(199,149,40,0.2)' : '0 3px 0 rgba(46,90,58,0.1)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
              transform: value === a ? 'translateY(-3px)' : '',
              transition: 'all 0.15s',
            }}>
              <div style={{ fontFamily: 'var(--font-num)', fontWeight: 700, fontSize: 40, lineHeight: 1, color: value === a ? '#5E3A00' : '#2D3A2E' }}>{a}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: value === a ? '#7A4E0E' : '#6B7A6C' }}>years old</div>
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        <BigButton color="sage" size="lg" onClick={onNext} disabled={!value} icon="›"
          style={{ width: '100%', justifyContent: 'center' }}>
          Continue
        </BigButton>
      </div>
    </OnboardStep>
  );
}

// ── 5. Avatar Color ───────────────────────────────────────────
function AvatarScreen({ value, onChange, onNext, onBack, step, totalSteps, childName }) {
  const avatars = [
    { id: 'sun',      label: 'Sunny',    hex: '#FFD36E' },
    { id: 'sage',     label: 'Minty',    hex: '#A8D5A2' },
    { id: 'coral',    label: 'Rosy',     hex: '#FFA48C' },
    { id: 'lavender', label: 'Dreamy',   hex: '#D9C7F0' },
    { id: 'sky',      label: 'Breezy',   hex: '#B8DEEF' },
  ];
  return (
    <OnboardStep title="Pick your Bắp!" subtitle={`Choose a colour for ${childName || 'your child'}'s companion.`} step={step} totalSteps={totalSteps} onBack={onBack}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div className="bobble"><BapMascot size={130} color={value} mood="celebrate"/></div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {avatars.map(a => (
            <button key={a.id} onClick={() => onChange(a.id)} className="no-select" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              padding: '10px 10px 8px', borderRadius: 20,
              background: value === a.id ? 'rgba(255,255,255,0.9)' : 'transparent',
              border: `3px solid ${value === a.id ? '#2D3A2E' : 'transparent'}`,
              boxShadow: value === a.id ? '0 4px 14px rgba(46,90,58,0.15)' : 'none',
              transform: value === a.id ? 'translateY(-3px)' : '',
              transition: 'all 0.15s',
            }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: a.hex, border: '2.5px solid #2D3A2E', boxShadow: '0 3px 0 rgba(46,90,58,0.2)' }}/>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#2D3A2E' }}>{a.label}</div>
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        <BigButton color="sage" size="lg" onClick={onNext} icon="›" style={{ width: '100%', justifyContent: 'center' }}>
          Continue
        </BigButton>
      </div>
    </OnboardStep>
  );
}

// ── 6. Learning Stage ─────────────────────────────────────────
function LearningStageScreen({ value, onChange, onNext, onBack, step, totalSteps }) {
  const stages = [
    { id: 'stage1', emoji: '🌱', label: 'Knows numbers 1–20',        sub: 'Can read and count to 20', stars: 1 },
    { id: 'stage2', emoji: '🌿', label: 'Knows numbers 1–100',       sub: 'Counts and recognizes up to 100', stars: 2 },
    { id: 'stage3', emoji: '🌳', label: 'Ready for tens & hundreds', sub: 'Place value, 100s and 1000s', stars: 3 },
    { id: 'stage4', emoji: '⭐', label: 'Ready for early addition',   sub: 'Adding and taking away small numbers', stars: 4 },
  ];
  return (
    <OnboardStep title="Where are they now?" subtitle="We'll suggest the best starting point. Don't worry — the app adapts automatically!" step={step} totalSteps={totalSteps} onBack={onBack}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {stages.map(s => (
          <button key={s.id} onClick={() => onChange(s.id)} className="no-select" style={{
            padding: '14px 16px', borderRadius: 20, textAlign: 'left',
            background: value === s.id ? '#EAF7E4' : '#fff',
            border: `3px solid ${value === s.id ? '#5FB36A' : 'rgba(46,90,58,0.1)'}`,
            boxShadow: value === s.id ? '0 4px 14px rgba(95,179,106,0.18)' : '0 2px 6px rgba(46,90,58,0.04)',
            display: 'flex', alignItems: 'center', gap: 12,
            transform: value === s.id ? 'translateY(-1px)' : '',
            transition: 'all 0.15s',
          }}>
            <div style={{ fontSize: 32, width: 44, textAlign: 'center' }}>{s.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#2D3A2E' }}>{s.label}</div>
              <div style={{ fontSize: 12, color: '#6B7A6C', marginTop: 2 }}>{s.sub}</div>
            </div>
            <div style={{ display: 'flex', gap: 2 }}>
              {[1,2,3,4].map(i => <span key={i} style={{ fontSize: 12, opacity: i <= s.stars ? 1 : 0.15 }}>⭐</span>)}
            </div>
          </button>
        ))}
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 20 }}>
        <BigButton color="sage" size="lg" onClick={onNext} disabled={!value} icon="›"
          style={{ width: '100%', justifyContent: 'center' }}>
          Continue
        </BigButton>
      </div>
    </OnboardStep>
  );
}

// ── 7. Mascot Selection ───────────────────────────────────────
function MascotScreen({ value, onChange, onNext, onBack, step, totalSteps, childName }) {
  const mascots = [
    { id: 'bear',   emoji: '🐻', name: 'Buddy',   color: '#F5C88A', desc: 'Warm & caring', mood: 'Always cheering you on!' },
    { id: 'bunny',  emoji: '🐰', name: 'Luna',    color: '#D9C7F0', desc: 'Fast & playful', mood: 'Hops with excitement!' },
    { id: 'robot',  emoji: '🤖', name: 'Beep',    color: '#B8DEEF', desc: 'Clever & techy', mood: 'Calculates the fun!' },
    { id: 'cat',    emoji: '🐱', name: 'Whisker', color: '#FFA48C', desc: 'Curious & sneaky', mood: 'Always curious!' },
  ];
  const selected = mascots.find(m => m.id === value);
  return (
    <OnboardStep
      title="Choose a companion!"
      subtitle={`${childName || 'Your child'} will adventure with this friend.`}
      step={step} totalSteps={totalSteps} onBack={onBack}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
        {/* Selected preview */}
        <div style={{
          width: '100%', padding: '14px 20px', borderRadius: 22,
          background: selected ? selected.color + '55' : '#FFF8EC',
          border: '2px solid rgba(46,90,58,0.1)',
          display: 'flex', alignItems: 'center', gap: 14, minHeight: 72,
          transition: 'all 0.2s',
        }}>
          {selected ? (
            <>
              <div style={{ fontSize: 52 }}>{selected.emoji}</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#2D3A2E' }}>{selected.name}</div>
                <div style={{ fontSize: 13, color: '#6B7A6C' }}>{selected.mood}</div>
              </div>
            </>
          ) : (
            <div style={{ fontSize: 14, color: '#A9B4A8', fontWeight: 600, width: '100%', textAlign: 'center' }}>Tap a companion below ↓</div>
          )}
        </div>

        {/* Grid of mascots */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%' }}>
          {mascots.map(m => (
            <button key={m.id} onClick={() => onChange(m.id)} className="no-select" style={{
              padding: '16px 12px', borderRadius: 24, textAlign: 'center',
              background: value === m.id ? m.color + '88' : '#fff',
              border: `3px solid ${value === m.id ? '#2D3A2E' : 'rgba(46,90,58,0.1)'}`,
              boxShadow: value === m.id ? '0 5px 0 rgba(46,90,58,0.2), 0 10px 18px rgba(46,90,58,0.1)' : '0 2px 6px rgba(46,90,58,0.05)',
              transform: value === m.id ? 'translateY(-3px)' : '',
              transition: 'all 0.15s',
            }}>
              <div style={{ fontSize: 52, lineHeight: 1, marginBottom: 6 }}>{m.emoji}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#2D3A2E' }}>{m.name}</div>
              <div style={{ fontSize: 11, color: '#6B7A6C', marginTop: 2, fontWeight: 500 }}>{m.desc}</div>
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        <BigButton color="sage" size="lg" onClick={onNext} disabled={!value} icon="›"
          style={{ width: '100%', justifyContent: 'center' }}>
          Continue
        </BigButton>
      </div>
    </OnboardStep>
  );
}

// ── 8. Parent Preferences ─────────────────────────────────────
function ParentPrefsScreen({ value, onChange, onNext, onBack, step, totalSteps }) {
  const set = (k, v) => onChange({ ...value, [k]: v });
  const timeOpts = [5,10,15,20];
  return (
    <OnboardStep
      title="A few quick settings"
      subtitle="You can change all of these anytime."
      step={step} totalSteps={totalSteps} onBack={onBack}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Daily goal */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '1.5px solid rgba(46,90,58,0.1)', boxShadow: '0 2px 8px rgba(46,90,58,0.05)' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#2D3A2E', marginBottom: 4 }}>⏱ Daily learning goal</div>
          <div style={{ fontSize: 12, color: '#6B7A6C', marginBottom: 12 }}>A gentle nudge when time is up</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {timeOpts.map(m => (
              <button key={m} onClick={() => set('dailyMin', m)} className="no-select" style={{
                flex: 1, padding: '10px 0', borderRadius: 14, fontSize: 14, fontWeight: 700,
                background: value.dailyMin === m ? '#FFD36E' : '#F5F0E8',
                border: `2px solid ${value.dailyMin === m ? '#C79528' : 'rgba(46,90,58,0.1)'}`,
                color: value.dailyMin === m ? '#5E3A00' : '#6B7A6C',
                boxShadow: value.dailyMin === m ? '0 3px 0 #C79528' : 'none',
                transition: 'all 0.12s',
              }}>{m}<span style={{ fontSize: 11 }}>m</span></button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        {[
          { key: 'sound',        icon: '🔊', label: 'Sound on by default',       sub: 'Music, effects & voice prompts' },
          { key: 'hints',        icon: '💡', label: 'Show guided hints',          sub: 'Gentle hints when child is stuck' },
          { key: 'celebrations', icon: '🎉', label: 'Celebration animations',    sub: 'Confetti & cheers on completion' },
        ].map(row => (
          <div key={row.key} style={{
            background: '#fff', borderRadius: 20, padding: '14px 16px',
            border: '1.5px solid rgba(46,90,58,0.1)',
            display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: '0 2px 8px rgba(46,90,58,0.04)',
          }}>
            <div style={{ fontSize: 24, width: 34 }}>{row.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#2D3A2E' }}>{row.label}</div>
              <div style={{ fontSize: 12, color: '#6B7A6C', marginTop: 1 }}>{row.sub}</div>
            </div>
            <button onClick={() => set(row.key, !value[row.key])} style={{
              width: 52, height: 30, borderRadius: 999, padding: 3,
              background: value[row.key] ? '#5FB36A' : '#D8D2C0',
              display: 'flex', justifyContent: value[row.key] ? 'flex-end' : 'flex-start',
              transition: 'all 0.2s',
            }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.18)' }}/>
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 20 }}>
        <BigButton color="sage" size="lg" onClick={onNext} icon="›" style={{ width: '100%', justifyContent: 'center' }}>
          Continue
        </BigButton>
      </div>
    </OnboardStep>
  );
}

// ── 9. Assessment Intro ───────────────────────────────────────
function AssessmentIntroScreen({ onNext, onBack, step, totalSteps, childName }) {
  return (
    <OnboardStep step={step} totalSteps={totalSteps} onBack={onBack}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, textAlign: 'center' }}>
        <div className="bobble"><BapMascot size={130} mood="think"/></div>
        <div>
          <div style={{ fontFamily: 'var(--font-kid)', fontSize: 28, fontWeight: 700, color: '#2D3A2E', lineHeight: 1.15, marginBottom: 12 }}>
            Learning happens through play
          </div>
          <div style={{ fontSize: 15, color: '#6B7A6C', lineHeight: 1.6, maxWidth: 300, margin: '0 auto' }}>
            The app will gently adapt to <b style={{ color: '#2D3A2E' }}>{childName || "your child"}'s</b> level through play — no tests, no pressure.
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          {[
            { icon: '🎮', text: 'Short 2-minute game sessions' },
            { icon: '📈', text: 'Adapts difficulty automatically' },
            { icon: '🌟', text: 'Earns stars and stickers for progress' },
            { icon: '👤', text: 'Parents track everything in the dashboard' },
          ].map(item => (
            <div key={item.text} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
              borderRadius: 16, background: '#fff', border: '1.5px solid rgba(46,90,58,0.1)',
              textAlign: 'left', fontSize: 14, color: '#2D3A2E', fontWeight: 500,
            }}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>{item.text}
            </div>
          ))}
        </div>
      </div>
      <div style={{ paddingTop: 16 }}>
        <BigButton color="sun" size="xl" onClick={onNext} icon="🚀" style={{ width: '100%', justifyContent: 'center' }}>
          Start the Adventure!
        </BigButton>
      </div>
    </OnboardStep>
  );
}

// ── 10. Complete ──────────────────────────────────────────────
function CompleteScreen({ profile, mascot, onEnter }) {
  const mascotEmoji = { bear: '🐻', bunny: '🐰', robot: '🤖', cat: '🐱' }[mascot] || '🌟';
  const mascotName  = { bear: 'Buddy', bunny: 'Luna', robot: 'Beep', cat: 'Whisker' }[mascot] || 'Bắp';
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GardenBg variant="sun"><Sparkles count={20} color="#FFB84A"/></GardenBg>
      <Confetti count={50}/>
      <div style={{ position: 'relative', zIndex: 1, height: '100%', padding: '52px 28px 36px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#7A4E0E', letterSpacing: 1, marginBottom: 8 }}>ALL SET! ✨</div>
          <div style={{ fontFamily: 'var(--font-kid)', fontSize: 34, fontWeight: 700, color: '#5E3A00', lineHeight: 1.1 }}>
            Ready to adventure,<br/>{profile.name}!
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div className="bobble" style={{ fontSize: 110, lineHeight: 1 }}>{mascotEmoji}</div>
          <div style={{
            padding: '10px 20px', borderRadius: 999,
            background: '#fff', border: '2.5px solid #2D3A2E',
            boxShadow: '0 4px 0 rgba(46,90,58,0.18)',
            fontSize: 14, fontWeight: 700, color: '#2D3A2E',
          }}>
            "{mascotName} says: Let's go, {profile.name}! 🌱"
          </div>
        </div>

        {/* Profile summary card */}
        <div style={{
          width: '100%', background: 'rgba(255,255,255,0.85)', borderRadius: 24,
          border: '3px solid #2D3A2E', boxShadow: '0 5px 0 rgba(46,90,58,0.18)',
          padding: '16px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#FFF8EC', border: '3px solid #2D3A2E', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <BapMini size={44} color={profile.color}/>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#2D3A2E' }}>{profile.name}</div>
              <div style={{ fontSize: 13, color: '#6B7A6C' }}>Age {profile.age} · Ready to explore!</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Tag color="sage" style={{ fontSize: 12 }}>🌳 Number Forest</Tag>
            <Tag color="sun"  style={{ fontSize: 12 }}>⭐ 0 stars</Tag>
            <Tag color="sky"  style={{ fontSize: 12 }}>{mascotEmoji} {mascotName}</Tag>
          </div>
        </div>

        <BigButton color="sage" size="xl" onClick={onEnter} icon="▶" style={{ width: '100%', justifyContent: 'center' }}>
          Start Adventure
        </BigButton>
      </div>
    </div>
  );
}

// ── Main Onboarding Orchestrator ──────────────────────────────
const ONBOARD_STEPS = ['welcome','language','name','age','avatar','stage','mascot','prefs','assessment','complete'];
const TOTAL = ONBOARD_STEPS.length - 2; // progress bar excludes welcome & complete

function OnboardingFlow({ initial, onDone }) {
  const [step, setStep] = React.useState(0);
  const [data, setData] = React.useState({
    lang: 'en', name: initial?.name || '', age: initial?.age || 4,
    color: initial?.color || 'sun', stage: '', mascot: 'bear',
    prefs: { dailyMin: 15, sound: true, hints: true, celebrations: true },
  });

  const set = (k, v) => setData(d => ({ ...d, [k]: v }));
  const next = () => setStep(s => Math.min(s + 1, ONBOARD_STEPS.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));
  const current = ONBOARD_STEPS[step];
  const pStep = step - 1; // progress step offset (skip welcome)

  const profile = { name: data.name || 'Bắp', age: data.age, color: data.color };

  if (current === 'welcome')    return <WelcomeScreen onNext={next}/>;
  if (current === 'language')   return <LanguageScreen value={data.lang} onChange={v => set('lang',v)} onNext={next} onBack={back} step={pStep} totalSteps={TOTAL}/>;
  if (current === 'name')       return <ChildNameScreen value={data.name} onChange={v => set('name',v)} onNext={next} onBack={back} step={pStep} totalSteps={TOTAL}/>;
  if (current === 'age')        return <AgeScreen value={data.age} onChange={v => set('age',v)} childName={data.name} onNext={next} onBack={back} step={pStep} totalSteps={TOTAL}/>;
  if (current === 'avatar')     return <AvatarScreen value={data.color} onChange={v => set('color',v)} childName={data.name} onNext={next} onBack={back} step={pStep} totalSteps={TOTAL}/>;
  if (current === 'stage')      return <LearningStageScreen value={data.stage} onChange={v => set('stage',v)} onNext={next} onBack={back} step={pStep} totalSteps={TOTAL}/>;
  if (current === 'mascot')     return <MascotScreen value={data.mascot} onChange={v => set('mascot',v)} childName={data.name} onNext={next} onBack={back} step={pStep} totalSteps={TOTAL}/>;
  if (current === 'prefs')      return <ParentPrefsScreen value={data.prefs} onChange={v => set('prefs',v)} onNext={next} onBack={back} step={pStep} totalSteps={TOTAL}/>;
  if (current === 'assessment') return <AssessmentIntroScreen childName={data.name} onNext={next} onBack={back} step={pStep} totalSteps={TOTAL}/>;
  if (current === 'complete')   return <CompleteScreen profile={profile} mascot={data.mascot} onEnter={() => onDone(profile, data)}/>;
  return null;
}

// ── Parent Gate (unchanged) ───────────────────────────────────
function ParentGate({ onPass, onCancel }) {
  const [a] = React.useState(() => 3 + Math.floor(Math.random()*5));
  const [b] = React.useState(() => 2 + Math.floor(Math.random()*4));
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
    <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(46,90,58,0.45)', backdropFilter: 'blur(8px)' }}>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: '#FFF8EC', borderTopLeftRadius: 32, borderTopRightRadius: 32,
        padding: '24px 28px 40px', boxShadow: '0 -10px 30px rgba(0,0,0,0.15)',
        animation: 'slide-up 0.3s ease-out',
        borderTop: '2px solid rgba(46,90,58,0.12)',
      }}>
        <div style={{ width: 40, height: 4, background: 'rgba(46,90,58,0.2)', borderRadius: 4, margin: '0 auto 20px' }}/>
        <div style={{ textAlign: 'center', marginBottom: 4, fontSize: 12, color: '#6B7A6C', fontWeight: 700, letterSpacing: 0.5 }}>CỔNG PHỤ HUYNH</div>
        <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, color: '#2D3A2E', marginBottom: 4 }}>For grown-ups only</div>
        <div style={{ textAlign: 'center', fontSize: 14, color: '#6B7A6C', marginBottom: 20 }}>Giải phép tính để tiếp tục</div>
        <div style={{ fontSize: 52, fontWeight: 700, textAlign: 'center', color: '#2D3A2E', marginBottom: 20, fontFamily: 'var(--font-num)' }}>
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
        <button onClick={onCancel} className="no-select" style={{ width: '100%', padding: 14, fontSize: 15, fontWeight: 600, color: '#6B7A6C', background: 'transparent' }}>
          Hủy
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { SplashScreen, OnboardingFlow, ParentGate });
