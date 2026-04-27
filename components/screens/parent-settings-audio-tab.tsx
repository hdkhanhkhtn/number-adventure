'use client';

import { Panel } from '@/components/parent/panel';
import { SettingRow } from '@/components/parent/setting-row';
import { Toggle } from '@/components/ui/toggle';
import type { AppSettings } from '@/lib/hooks/use-settings';
import type { ChildSettings } from '@/lib/types/common';

interface Props {
  settings: Partial<ChildSettings>;
  onChange: (patch: Partial<ChildSettings>) => void;
  appSettings: AppSettings;
  updateAppSettings: (patch: Partial<AppSettings>) => void;
}

const VOICE_STYLES = ['Friendly', 'Slow', 'Adult'] as const;

/** Audio tab — volume slider, sfx, music, voice toggles + voice style */
export function ParentSettingsAudioTab({ settings, onChange, appSettings, updateAppSettings }: Props) {

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Panel title="Âm lượng" sub="Điều chỉnh âm lượng chung của ứng dụng">
        <SettingRow
          label={`Âm lượng (${appSettings.volume}%)`}
          last
          right={
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={appSettings.volume}
              aria-label="Âm lượng ứng dụng"
              onChange={e => updateAppSettings({ volume: Number(e.target.value) })}
              style={{
                width: 140,
                accentColor: '#7FC089',
                cursor: 'pointer',
              }}
            />
          }
        />
      </Panel>

      <Panel title="Âm thanh" sub="Hiệu ứng và nhạc nền">
        <SettingRow
          label="Hiệu ứng âm thanh"
          right={<Toggle checked={settings.sfx ?? true} onChange={v => onChange({ sfx: v })} />}
        />
        <SettingRow
          label="Nhạc nền nhẹ"
          right={<Toggle checked={settings.music ?? true} onChange={v => onChange({ music: v })} />}
        />
        <SettingRow
          label="Giọng nói hướng dẫn"
          right={<Toggle checked={settings.voice ?? true} onChange={v => onChange({ voice: v })} />}
          last
        />
      </Panel>

      <Panel title="Giọng đọc số" sub="Cho mini-game Hear & Tap">
        <div style={{ display: 'flex', gap: 8 }}>
          {VOICE_STYLES.map(v => (
            <button
              key={v}
              onClick={() => onChange({ voiceStyle: v })}
              style={{
                flex: 1, padding: '10px', borderRadius: 14, fontSize: 13, fontWeight: 600,
                background: settings.voiceStyle === v ? '#1F2A1F' : '#fff',
                color: settings.voiceStyle === v ? '#fff' : '#1F2A1F',
                border: '1px solid rgba(0,0,0,0.1)',
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );
}
