// Reward/celebration, streak, session end, parent dashboard screens

function RewardScreen({ stars = 3, correct = 4, total = 5, sticker, onContinue, profile, coinsEarned = 5 }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GardenBg variant="sun">
        <Sparkles count={14} color="#FFB84A"/>
      </GardenBg>
      <Confetti count={40}/>
      <div style={{ position: 'relative', zIndex: 1, height: '100%', padding: '32px 24px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#5E3A00', textAlign: 'center', animation: 'pop-in 0.4s both' }}>
          {stars === 3 ? 'Amazing, ' : stars === 2 ? 'Great job, ' : 'Good try, '}{profile.name}!
        </div>

        <div className="bobble" style={{ marginTop: 12 }}>
          <BapMascot size={140} mood="celebrate" color={profile.color}/>
        </div>

        <div style={{ marginTop: 8 }}>
          <StarRow value={stars} size={52} gap={10}/>
        </div>

        <div style={{
          marginTop: 18, background: '#FFF8EC', borderRadius: 22,
          border: '3px solid #2D3A2E', boxShadow: '0 4px 0 rgba(46,90,58,0.2)',
          padding: '14px 18px', width: '100%',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', textAlign: 'center' }}>
            <Stat label="Correct" value={`${correct}/${total}`} color="#2F6A3C"/>
            <div style={{ width: 1, height: 32, background: 'rgba(46,90,58,0.15)' }}/>
            <Stat label="Coins" value={`+${coinsEarned}`} color="#7A4E0E" icon="🪙"/>
          </div>
        </div>

        {sticker && (
          <div style={{
            marginTop: 14, padding: '12px 18px', borderRadius: 20,
            background: '#D9C7F0', border: '3px solid #2D3A2E',
            boxShadow: '0 4px 0 #A58AD0',
            display: 'flex', alignItems: 'center', gap: 12,
            animation: 'pop-in 0.5s ease-out 0.5s both',
          }}>
            <div style={{ fontSize: 38 }}>{sticker.emoji}</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#5D3F94', letterSpacing: 0.5 }}>NEW STICKER!</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#2D3A2E' }}>{sticker.name}</div>
            </div>
          </div>
        )}

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10, width: '100%', alignItems: 'center' }}>
          <BigButton color="sage" size="xl" onClick={onContinue} icon="▶">Next</BigButton>
        </div>
      </div>
    </div>
  );
}
function Stat({ label, value, color, icon }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: '#6B7A6C', fontWeight: 700, letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1.2, marginTop: 2 }}>{icon} {value}</div>
    </div>
  );
}

function StreakScreen({ streak = 3, onBack, profile }) {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GardenBg variant="sun"/>
      <div style={{ position: 'relative', zIndex: 1, height: '100%', padding: '16px 20px 24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <IconBtn color="cream" size={48} onClick={onBack}>‹</IconBtn>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Daily Streak</div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <div className="pulse-soft" style={{ fontSize: 110 }}>🔥</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 58, fontWeight: 700, color: '#C14A2A', fontFamily: 'var(--font-num)', lineHeight: 1 }}>{streak}</div>
            <div style={{ fontSize: 18, color: '#7A4E0E', fontWeight: 600, marginTop: 4 }}>days in a row!</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {days.map((d, i) => (
              <div key={i} style={{
                width: 36, height: 48, borderRadius: 12,
                background: i < streak ? '#FFD36E' : '#F0EADD',
                border: '2px solid ' + (i < streak ? '#C79528' : 'rgba(46,90,58,0.15)'),
                boxShadow: i < streak ? '0 2px 0 #C79528' : 'none',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
              }}>
                <div style={{ fontSize: 14 }}>{i < streak ? '⭐' : '·'}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: i < streak ? '#7A4E0E' : '#6B7A6C' }}>{d.slice(0,1)}</div>
              </div>
            ))}
          </div>
        </div>
        <BigButton color="sage" size="lg" onClick={onBack}>Keep going!</BigButton>
      </div>
    </div>
  );
}

// —————————————————————————————————————————————————————————————
// PARENT DASHBOARD (Vietnamese)
// —————————————————————————————————————————————————————————————
function ParentDashboard({ onExit, onGotoSettings, onGotoReport, profile }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#F5F3ED', fontFamily: 'var(--font-parent)' }}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '56px 20px 14px', background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <IconBtn color="cream" size={40} onClick={onExit} style={{ fontSize: 16 }}>✕</IconBtn>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#6B7A6C', fontWeight: 600, letterSpacing: 0.5 }}>CHA MẸ</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1F2A1F' }}>Bảng điều khiển</div>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#FFF4DE', border: '2px solid rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BapMini size={32} color={profile.color}/>
          </div>
        </div>

        <div className="scroll" style={{ flex: 1, padding: '16px 18px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Child card */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: '#FFF4DE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BapMini size={42} color={profile.color}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1F2A1F' }}>{profile.name}</div>
                <div style={{ fontSize: 13, color: '#6B7A6C' }}>{profile.age} tuổi · Mẫu giáo</div>
              </div>
              <div style={{
                padding: '5px 10px', borderRadius: 999, background: '#EDF7EC',
                fontSize: 12, fontWeight: 600, color: '#2F6A3C',
              }}>● Đang học</div>
            </div>
          </div>

          {/* Today at a glance */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <MetricCard label="Hôm nay" value="12 phút" sub="Thời gian chơi" accent="#5FB36A"/>
            <MetricCard label="Chuỗi ngày" value="3 ngày" sub="🔥 liên tiếp" accent="#C14A2A"/>
            <MetricCard label="Độ chính xác" value="82%" sub="tuần này" accent="#2E6F93"/>
            <MetricCard label="Ngôi sao" value="18 ⭐" sub="đã thu thập" accent="#B87C0E"/>
          </div>

          {/* Weekly activity */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1F2A1F' }}>Hoạt động tuần này</div>
              <div style={{ fontSize: 12, color: '#6B7A6C' }}>mục tiêu 15ph/ngày</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 100 }}>
              {[10, 14, 0, 15, 8, 12, 0].map((v, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: '100%', height: `${Math.max(2, v*5)}px`, borderRadius: 6,
                    background: v === 0 ? '#EEE9DC' : v >= 15 ? '#5FB36A' : '#FFD36E',
                  }}/>
                  <div style={{ fontSize: 10, color: '#6B7A6C', fontWeight: 600 }}>{['T2','T3','T4','T5','T6','T7','CN'][i]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills breakdown */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1F2A1F', marginBottom: 12 }}>Kỹ năng</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <SkillRow label="Nhận biết số 1–20" value={0.9} color="#5FB36A" badge="Giỏi"/>
              <SkillRow label="Số chục và trăm" value={0.5} color="#FFC94A" badge="Đang học"/>
              <SkillRow label="Số chẵn / lẻ" value={0.25} color="#8AC4DE" badge="Mới bắt đầu"/>
              <SkillRow label="Cộng / Trừ cơ bản" value={0.1} color="#D9C7F0" badge="Sắp mở"/>
            </div>
          </div>

          {/* Action rows */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <MenuRow icon="📊" label="Báo cáo chi tiết" sub="Xem tiến độ theo tuần" onClick={onGotoReport}/>
            <MenuRow icon="⏱️" label="Giới hạn thời gian" sub="15 phút / ngày" onClick={onGotoSettings}/>
            <MenuRow icon="🌏" label="Ngôn ngữ & Âm thanh" sub="EN cho bé · VI cho cha mẹ" onClick={onGotoSettings}/>
            <MenuRow icon="⚙️" label="Cài đặt" sub="Hồ sơ, bảo mật" onClick={onGotoSettings} last/>
          </div>

          <div style={{ textAlign: 'center', fontSize: 12, color: '#9AA69A', padding: '8px 0 0' }}>
            Bắp Number Adventure · v1.0
          </div>
        </div>
      </div>
    </div>
  );
}
function MetricCard({ label, value, sub, accent }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '12px 14px', border: '1px solid rgba(0,0,0,0.06)' }}>
      <div style={{ fontSize: 11, color: '#6B7A6C', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: accent, lineHeight: 1.1, marginTop: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#9AA69A', marginTop: 2 }}>{sub}</div>
    </div>
  );
}
function SkillRow({ label, value, color, badge }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2A1F' }}>{label}</div>
        <div style={{ fontSize: 11, color: '#6B7A6C', fontWeight: 600 }}>{badge}</div>
      </div>
      <div style={{ height: 8, borderRadius: 8, background: '#F0EADC', overflow: 'hidden' }}>
        <div style={{ width: `${value*100}%`, height: '100%', background: color, borderRadius: 8, transition: 'width 0.5s' }}/>
      </div>
    </div>
  );
}
function MenuRow({ icon, label, sub, onClick, last }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '14px 16px', textAlign: 'left',
      display: 'flex', alignItems: 'center', gap: 12,
      borderBottom: last ? 'none' : '1px solid rgba(0,0,0,0.06)',
      background: '#fff',
    }}>
      <div style={{ fontSize: 22, width: 32, textAlign: 'center' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2A1F' }}>{label}</div>
        <div style={{ fontSize: 12, color: '#6B7A6C' }}>{sub}</div>
      </div>
      <div style={{ fontSize: 18, color: '#C4C0B3' }}>›</div>
    </button>
  );
}

// Parent settings (VN) — time limits, language, audio
function ParentSettings({ onBack, settings, setSettings }) {
  const [tab, setTab] = React.useState('time');
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#F5F3ED', fontFamily: 'var(--font-parent)' }}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '56px 20px 14px', background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <IconBtn color="cream" size={40} onClick={onBack} style={{ fontSize: 16 }}>‹</IconBtn>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1F2A1F' }}>Cài đặt</div>
        </div>
        <div style={{ display: 'flex', gap: 6, padding: '12px 16px', background: '#fff' }}>
          {[['time','⏱ Thời gian'],['lang','🌏 Ngôn ngữ'],['audio','🔊 Âm thanh']].map(([k,label]) => (
            <button key={k} onClick={() => setTab(k)} style={{
              padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
              background: tab === k ? '#1F2A1F' : '#F0EADC',
              color: tab === k ? '#fff' : '#1F2A1F',
            }}>{label}</button>
          ))}
        </div>

        <div className="scroll" style={{ flex: 1, padding: '16px 18px 24px' }}>
          {tab === 'time' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Panel title="Giới hạn mỗi ngày" sub="Khi hết thời gian, bé sẽ thấy màn hình nghỉ ngơi nhẹ nhàng">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[5, 10, 15, 20, 30].map(m => (
                    <button key={m} onClick={() => setSettings(s => ({...s, dailyMin: m}))} style={{
                      padding: '10px 16px', borderRadius: 14, fontSize: 15, fontWeight: 600,
                      background: settings.dailyMin === m ? '#1F2A1F' : '#fff',
                      color: settings.dailyMin === m ? '#fff' : '#1F2A1F',
                      border: '1px solid rgba(0,0,0,0.1)',
                    }}>{m} phút</button>
                  ))}
                </div>
              </Panel>
              <Panel title="Giờ yên tĩnh" sub="Không mở app trong khoảng này">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 15 }}>19:30 – 07:00</div>
                  <Toggle on={settings.quietHours} onChange={v => setSettings(s => ({...s, quietHours: v}))}/>
                </div>
              </Panel>
              <Panel title="Độ khó">
                <div style={{ display: 'flex', gap: 8 }}>
                  {['easy','medium','hard'].map(d => (
                    <button key={d} onClick={() => setSettings(s => ({...s, difficulty: d}))} style={{
                      flex: 1, padding: '10px', borderRadius: 14, fontSize: 14, fontWeight: 600,
                      background: settings.difficulty === d ? '#1F2A1F' : '#fff',
                      color: settings.difficulty === d ? '#fff' : '#1F2A1F',
                      border: '1px solid rgba(0,0,0,0.1)',
                    }}>{d === 'easy' ? 'Dễ' : d === 'medium' ? 'Vừa' : 'Khó'}</button>
                  ))}
                </div>
              </Panel>
            </div>
          )}
          {tab === 'lang' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Panel title="Màn hình cho bé" sub="Lời nhắc âm thanh">
                <LangOpt active={settings.kidLang === 'en'} label="Tiếng Anh" sub="English numbers" onClick={() => setSettings(s => ({...s, kidLang: 'en'}))}/>
                <LangOpt active={settings.kidLang === 'vi'} label="Tiếng Việt" sub="Số tiếng Việt" onClick={() => setSettings(s => ({...s, kidLang: 'vi'}))}/>
                <LangOpt active={settings.kidLang === 'bi'} label="Song ngữ" sub="Cả hai ngôn ngữ" onClick={() => setSettings(s => ({...s, kidLang: 'bi'}))}/>
              </Panel>
              <Panel title="Màn hình cha mẹ">
                <LangOpt active={settings.parentLang === 'vi'} label="Tiếng Việt" onClick={() => setSettings(s => ({...s, parentLang: 'vi'}))}/>
                <LangOpt active={settings.parentLang === 'en'} label="English" onClick={() => setSettings(s => ({...s, parentLang: 'en'}))}/>
              </Panel>
            </div>
          )}
          {tab === 'audio' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Panel title="Âm thanh" sub="Hiệu ứng và nhạc nền">
                <SettingRow label="Hiệu ứng âm thanh" right={<Toggle on={settings.sfx} onChange={v => setSettings(s => ({...s, sfx: v}))}/>}/>
                <SettingRow label="Nhạc nền nhẹ" right={<Toggle on={settings.music} onChange={v => setSettings(s => ({...s, music: v}))}/>}/>
                <SettingRow label="Giọng nói hướng dẫn" right={<Toggle on={settings.voice} onChange={v => setSettings(s => ({...s, voice: v}))}/>} last/>
              </Panel>
              <Panel title="Giọng đọc số" sub="Cho mini-game Hear & Tap">
                <div style={{ display: 'flex', gap: 8 }}>
                  {['Friendly','Slow','Adult'].map(v => (
                    <button key={v} onClick={() => setSettings(s => ({...s, voiceStyle: v}))} style={{
                      flex: 1, padding: '10px', borderRadius: 14, fontSize: 13, fontWeight: 600,
                      background: settings.voiceStyle === v ? '#1F2A1F' : '#fff',
                      color: settings.voiceStyle === v ? '#fff' : '#1F2A1F',
                      border: '1px solid rgba(0,0,0,0.1)',
                    }}>{v}</button>
                  ))}
                </div>
              </Panel>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function Panel({ title, sub, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 18, padding: 16, border: '1px solid rgba(0,0,0,0.06)' }}>
      <div style={{ marginBottom: sub ? 4 : 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1F2A1F' }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: '#6B7A6C', marginTop: 2, marginBottom: 10 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}
function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      width: 48, height: 28, borderRadius: 999, padding: 3,
      background: on ? '#5FB36A' : '#D8D2C0',
      display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start',
      transition: 'all 0.2s',
    }}>
      <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}/>
    </button>
  );
}
function LangOpt({ active, label, sub, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '12px 14px', textAlign: 'left',
      display: 'flex', alignItems: 'center', gap: 12,
      borderRadius: 14, marginBottom: 8,
      background: active ? '#EDF5F9' : 'transparent',
      border: active ? '1px solid #8AC4DE' : '1px solid rgba(0,0,0,0.08)',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2A1F' }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: '#6B7A6C' }}>{sub}</div>}
      </div>
      <div style={{
        width: 20, height: 20, borderRadius: '50%',
        border: '2px solid ' + (active ? '#2E6F93' : '#C4C0B3'),
        background: active ? '#2E6F93' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {active && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }}/>}
      </div>
    </button>
  );
}
function SettingRow({ label, right, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 0', borderBottom: last ? 'none' : '1px solid rgba(0,0,0,0.06)',
    }}>
      <div style={{ fontSize: 14, color: '#1F2A1F' }}>{label}</div>
      {right}
    </div>
  );
}

// Detailed progress report (VN)
function ParentReport({ onBack, profile }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#F5F3ED', fontFamily: 'var(--font-parent)' }}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '56px 20px 14px', background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <IconBtn color="cream" size={40} onClick={onBack} style={{ fontSize: 16 }}>‹</IconBtn>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1F2A1F' }}>Báo cáo của {profile.name}</div>
        </div>
        <div className="scroll" style={{ flex: 1, padding: '16px 18px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'linear-gradient(135deg,#EDF7EC,#D9EED8)', borderRadius: 20, padding: 16, border: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 12, color: '#2F6A3C', fontWeight: 700, letterSpacing: 0.5 }}>TÓM TẮT TUẦN</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1F4A28', marginTop: 6, lineHeight: 1.4 }}>
              Bé đã tiến bộ rõ ở <b>nhận biết số 1–20</b> và bắt đầu làm quen với <b>số chục</b>. Nên tiếp tục khuyến khích bé chơi mini-game "Build the Number".
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: '#1F2A1F' }}>Thời gian chơi 7 ngày</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120 }}>
              {[10, 14, 0, 15, 8, 12, 0].map((v, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 10, color: '#6B7A6C', fontWeight: 700 }}>{v || ''}</div>
                  <div style={{
                    width: '100%', height: `${Math.max(2, v*6)}px`, borderRadius: 6,
                    background: v === 0 ? '#EEE9DC' : v >= 15 ? '#5FB36A' : '#FFD36E',
                  }}/>
                  <div style={{ fontSize: 10, color: '#6B7A6C', fontWeight: 600 }}>{['T2','T3','T4','T5','T6','T7','CN'][i]}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Theo mini-game</div>
            {[
              { g: 'Hear & Tap', done: 24, acc: 90, c: '#5FB36A' },
              { g: 'Build the Number', done: 12, acc: 65, c: '#FFC94A' },
              { g: 'Number Order', done: 8, acc: 75, c: '#8AC4DE' },
              { g: 'Even / Odd', done: 5, acc: 40, c: '#D9C7F0' },
              { g: 'Add / Take Away', done: 2, acc: 30, c: '#FFA48C' },
            ].map(row => (
              <div key={row.g} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                <div style={{ width: 8, height: 32, borderRadius: 4, background: row.c }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2A1F' }}>{row.g}</div>
                  <div style={{ fontSize: 11, color: '#6B7A6C' }}>{row.done} lượt chơi</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: row.c }}>{row.acc}%</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#FFF6E0', borderRadius: 20, padding: 16, border: '1px solid rgba(248,200,74,0.3)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#7A4E0E', letterSpacing: 0.5, marginBottom: 6 }}>💡 GỢI Ý</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#5E3A00', lineHeight: 1.5 }}>
              <li>Cùng bé đếm đồ vật quanh nhà (ví dụ: 12 viên bi, 20 cái thìa)</li>
              <li>Chơi thêm mini-game Even/Odd để củng cố khái niệm</li>
              <li>Duy trì 10–15 phút/ngày là đủ cho độ tuổi 4</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { RewardScreen, StreakScreen, ParentDashboard, ParentSettings, ParentReport });
