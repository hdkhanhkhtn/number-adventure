'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameProgress } from '@/context/game-progress-context';
import { IconBtn } from '@/components/ui/icon-btn';
import { Panel } from '@/components/parent/panel';
import { SettingRow } from '@/components/parent/setting-row';
import { Toggle } from '@/components/ui/toggle';
import { useSettings, type AppSettingsPatch } from '@/lib/hooks/use-settings';
import { ParentSettingsTimeTab } from './parent-settings-time-tab';
import { ParentSettingsLangTab } from './parent-settings-lang-tab';
import { ParentSettingsAudioTab } from './parent-settings-audio-tab';
import { ParentSettingsSecurityTab } from './parent-settings-security-tab';
import { ParentSettingsGameplayTab } from './parent-settings-gameplay-tab';
import type { ChildSettings } from '@/lib/types/common';

type Tab = 'time' | 'lang' | 'audio' | 'security' | 'gameplay';

const TABS: { key: Tab; label: string }[] = [
  { key: 'time', label: '⏱ Thời gian' },
  { key: 'lang', label: '🌏 Ngôn ngữ' },
  { key: 'audio', label: '🔊 Âm thanh' },
  { key: 'security', label: '🔒 Bảo mật' },
  { key: 'gameplay', label: '🎮 Trò chơi' },
];

const DEFAULTS: ChildSettings = {
  dailyMin: 15, difficulty: 'easy', kidLang: 'en', parentLang: 'vi',
  sfx: true, music: true, voice: true, voiceStyle: 'Friendly', quietHours: false,
};

/** Parent settings screen — 3-tab layout persisted to DB */
export function ParentSettingsContent() {
  const router = useRouter();
  const { state, updateSettings } = useGameProgress();
  const { childId } = state;

  const { settings: appSettings, update: updateAppSettings } = useSettings();
  const [tab, setTab] = useState<Tab>('time');
  const [settings, setSettings] = useState<Partial<ChildSettings>>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [emailReports, setEmailReports] = useState(true);

  // Load child settings from DB on mount
  useEffect(() => {
    if (!childId || childId.startsWith('guest_')) return;
    fetch(`/api/children/${childId}/settings`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.settings) setSettings(data.settings); })
      .catch(console.error);
  }, [childId]);

  // Load parent-level settings (emailReports) on mount
  useEffect(() => {
    fetch('/api/parent/settings', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (typeof data?.emailReports === 'boolean') setEmailReports(data.emailReports); })
      .catch(console.error);
  }, []);

  const handleEmailReportsToggle = async (value: boolean) => {
    setEmailReports(value);
    try {
      const res = await fetch('/api/parent/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailReports: value }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Save failed');
    } catch (e) {
      console.error('Failed to save email reports setting', e);
      setEmailReports(!value); // rollback
    }
  };

  // Persist patch to DB and local context; rollback optimistic update on failure
  const handleChange = async (patch: Partial<ChildSettings>) => {
    const prev = settings;
    const next = { ...settings, ...patch };
    setSettings(next);
    updateSettings(next);

    if (!childId || childId.startsWith('guest_')) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/children/${childId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Save failed');
    } catch (e) {
      console.error('Failed to save settings', e);
      setSettings(prev);
      updateSettings(prev);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3ED', fontFamily: 'var(--font-parent)' }}>
      {/* Header */}
      <div style={{ padding: '56px 20px 14px', background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <IconBtn color="cream" size={40} onClick={() => router.push('/dashboard')}>‹</IconBtn>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1F2A1F', flex: 1 }}>
          Cài đặt{saving ? ' …' : ''}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 6, padding: '12px 16px', background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
              background: tab === key ? '#1F2A1F' : '#F0EADC',
              color: tab === key ? '#fff' : '#1F2A1F',
              border: 'none', cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: '16px 18px 24px' }}>
        {tab === 'time' && (
          <ParentSettingsTimeTab
            settings={settings}
            onChange={handleChange}
            appSettings={appSettings}
            updateAppSettings={updateAppSettings}
          />
        )}
        {tab === 'lang' && <ParentSettingsLangTab settings={settings} onChange={handleChange} />}
        {tab === 'audio' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <ParentSettingsAudioTab settings={settings} onChange={handleChange} appSettings={appSettings} updateAppSettings={updateAppSettings} />
            <Panel title="Trợ năng" sub="Hiển thị và chuyển động">
              <SettingRow
                label="Tương phản cao"
                right={
                  <Toggle
                    checked={appSettings.highContrast}
                    onChange={v => updateAppSettings({ highContrast: v })}
                  />
                }
              />
              <SettingRow
                label="Giảm chuyển động"
                last
                right={
                  <Toggle
                    checked={appSettings.reduceMotion}
                    onChange={v => updateAppSettings({ reduceMotion: v })}
                  />
                }
              />
            </Panel>
          </div>
        )}
        {tab === 'security' && <ParentSettingsSecurityTab childId={childId} />}
        {tab === 'gameplay' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <ParentSettingsGameplayTab
              appSettings={appSettings}
              updateAppSettings={updateAppSettings}
            />
            <Panel title="Thông báo" sub="Báo cáo tiến độ qua email">
              <SettingRow
                label="Báo cáo hàng tuần qua email"
                last
                right={
                  <Toggle
                    checked={emailReports}
                    onChange={handleEmailReportsToggle}
                  />
                }
              />
            </Panel>
          </div>
        )}
      </div>
    </div>
  );
}
