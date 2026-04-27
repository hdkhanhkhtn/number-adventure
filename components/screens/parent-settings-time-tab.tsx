'use client';

import { Panel } from '@/components/parent/panel';
import { SettingRow } from '@/components/parent/setting-row';
import { Toggle } from '@/components/ui/toggle';
import type { ChildSettings } from '@/lib/types/common';
import type { AppSettings, AppSettingsPatch } from '@/lib/hooks/use-settings';

interface Props {
  settings: Partial<ChildSettings>;
  onChange: (patch: Partial<ChildSettings>) => void;
  appSettings: AppSettings;
  updateAppSettings: (patch: AppSettingsPatch) => void;
}

const SELECT_STYLE: React.CSSProperties = {
  padding: '6px 10px', borderRadius: 10, fontSize: 14, fontWeight: 600,
  border: '1px solid rgba(0,0,0,0.15)', background: '#fff', color: '#1F2A1F',
  cursor: 'pointer',
};

const INTERVAL_OPTS = [10, 15, 20, 30] as const;

/** Time limits tab — daily limit, quiet hours, difficulty, bedtime, break reminder, game hints */
export function ParentSettingsTimeTab({ settings, onChange, appSettings, updateAppSettings }: Props) {
  const { bedtime, breakReminder, gameHints } = appSettings;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Panel title="Giới hạn mỗi ngày" sub="Khi hết thời gian, bé sẽ thấy màn hình nghỉ ngơi nhẹ nhàng">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[5, 10, 15, 20, 30].map(m => (
            <button
              key={m}
              onClick={() => onChange({ dailyMin: m })}
              style={{
                padding: '10px 16px', borderRadius: 14, fontSize: 15, fontWeight: 600,
                background: settings.dailyMin === m ? '#1F2A1F' : '#fff',
                color: settings.dailyMin === m ? '#fff' : '#1F2A1F',
                border: '1px solid rgba(0,0,0,0.1)',
              }}
            >
              {m} phút
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Giờ yên tĩnh" sub="Không mở app trong khoảng này">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 15 }}>19:30 – 07:00</div>
          <Toggle
            checked={settings.quietHours ?? false}
            onChange={v => onChange({ quietHours: v })}
          />
        </div>
      </Panel>

      <Panel title="Độ khó">
        <div style={{ display: 'flex', gap: 8 }}>
          {(['easy', 'medium', 'hard'] as const).map(d => (
            <button
              key={d}
              onClick={() => onChange({ difficulty: d })}
              style={{
                flex: 1, padding: '10px', borderRadius: 14, fontSize: 14, fontWeight: 600,
                background: settings.difficulty === d ? '#1F2A1F' : '#fff',
                color: settings.difficulty === d ? '#fff' : '#1F2A1F',
                border: '1px solid rgba(0,0,0,0.1)',
              }}
            >
              {d === 'easy' ? 'Dễ' : d === 'medium' ? 'Vừa' : 'Khó'}
            </button>
          ))}
        </div>
      </Panel>

      {/* Bedtime mode */}
      <Panel title="Giờ đi ngủ" sub="Tự động khoá app khi đến giờ đi ngủ">
        <SettingRow
          label="Bật giờ đi ngủ"
          last={!bedtime.enabled}
          right={
            <Toggle
              checked={bedtime.enabled}
              onChange={v => updateAppSettings({ bedtime: { enabled: v } })}
            />
          }
        />
        {bedtime.enabled && (
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', paddingTop: 10 }}>
            <span style={{ fontSize: 14, color: '#6B7A6C', minWidth: 36 }}>Giờ</span>
            <select
              value={bedtime.hour}
              onChange={e => updateAppSettings({ bedtime: { hour: Number(e.target.value) } })}
              style={SELECT_STYLE}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
              ))}
            </select>
            <span style={{ fontSize: 14, color: '#6B7A6C', minWidth: 36 }}>Phút</span>
            <select
              value={bedtime.minute}
              onChange={e => updateAppSettings({ bedtime: { minute: Number(e.target.value) } })}
              style={SELECT_STYLE}
            >
              {[0, 15, 30, 45].map(m => (
                <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
              ))}
            </select>
          </div>
        )}
      </Panel>

      {/* Break reminder */}
      <Panel title="Nhắc nghỉ ngơi" sub="Nhắc bé nghỉ giải lao sau một khoảng thời gian">
        <SettingRow
          label="Bật nhắc nghỉ ngơi"
          last={!breakReminder.enabled}
          right={
            <Toggle
              checked={breakReminder.enabled}
              onChange={v => updateAppSettings({ breakReminder: { enabled: v } })}
            />
          }
        />
        {breakReminder.enabled && (
          <div style={{ display: 'flex', gap: 8, paddingTop: 10, flexWrap: 'wrap' }}>
            {INTERVAL_OPTS.map(m => (
              <button
                key={m}
                onClick={() => updateAppSettings({ breakReminder: { intervalMinutes: m } })}
                style={{
                  padding: '8px 14px', borderRadius: 14, fontSize: 14, fontWeight: 600,
                  background: breakReminder.intervalMinutes === m ? '#1F2A1F' : '#fff',
                  color: breakReminder.intervalMinutes === m ? '#fff' : '#1F2A1F',
                  border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer',
                }}
              >
                {m} phút
              </button>
            ))}
          </div>
        )}
      </Panel>

      {/* Game hints */}
      <Panel title="Gợi ý trò chơi" sub="Hiện nút gợi ý khi bé chơi">
        <SettingRow
          label="Bật gợi ý"
          last
          right={
            <Toggle
              checked={gameHints}
              onChange={v => updateAppSettings({ gameHints: v })}
            />
          }
        />
      </Panel>
    </div>
  );
}
