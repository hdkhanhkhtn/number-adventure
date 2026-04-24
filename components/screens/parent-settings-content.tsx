'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameProgress } from '@/context/game-progress-context';
import { IconBtn } from '@/components/ui/icon-btn';
import { ParentSettingsTimeTab } from './parent-settings-time-tab';
import { ParentSettingsLangTab } from './parent-settings-lang-tab';
import { ParentSettingsAudioTab } from './parent-settings-audio-tab';
import type { ChildSettings } from '@/lib/types/common';

type Tab = 'time' | 'lang' | 'audio';

const TABS: { key: Tab; label: string }[] = [
  { key: 'time', label: '⏱ Thời gian' },
  { key: 'lang', label: '🌏 Ngôn ngữ' },
  { key: 'audio', label: '🔊 Âm thanh' },
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

  const [tab, setTab] = useState<Tab>('time');
  const [settings, setSettings] = useState<Partial<ChildSettings>>(DEFAULTS);
  const [saving, setSaving] = useState(false);

  // Load settings from DB on mount
  useEffect(() => {
    if (!childId || childId.startsWith('guest_')) return;
    fetch(`/api/children/${childId}/settings`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.settings) setSettings(data.settings); })
      .catch(console.error);
  }, [childId]);

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
        {tab === 'time' && <ParentSettingsTimeTab settings={settings} onChange={handleChange} />}
        {tab === 'lang' && <ParentSettingsLangTab settings={settings} onChange={handleChange} />}
        {tab === 'audio' && <ParentSettingsAudioTab settings={settings} onChange={handleChange} />}
      </div>
    </div>
  );
}
