'use client';

import { Panel } from '@/components/parent/panel';
import type { AppSettings, AppSettingsPatch } from '@/lib/hooks/use-settings';

interface Props {
  appSettings: AppSettings;
  updateAppSettings: (patch: AppSettingsPatch) => void;
}

const ROTATION_OPTIONS: { value: AppSettings['gameRotation']; label: string; desc: string }[] = [
  { value: 'auto',      label: 'Tự động',     desc: 'Hệ thống chọn bài phù hợp với bé' },
  { value: 'favorites', label: 'Yêu thích',   desc: 'Chỉ chơi các trò bé đã đánh dấu' },
  { value: 'all',       label: 'Tất cả',       desc: 'Hiện toàn bộ loại trò chơi' },
];

/** Gameplay tab — game rotation control (auto / favorites / all) */
export function ParentSettingsGameplayTab({ appSettings, updateAppSettings }: Props) {
  const { gameRotation } = appSettings;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Panel
        title="Xoay vòng trò chơi"
        sub="Kiểm soát những loại trò chơi xuất hiện trong buổi chơi của bé"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {ROTATION_OPTIONS.map(({ value, label, desc }, i) => {
            const isSelected = gameRotation === value;
            const isLast = i === ROTATION_OPTIONS.length - 1;
            return (
              <button
                key={value}
                onClick={() => updateAppSettings({ gameRotation: value })}
                aria-pressed={isSelected}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 0',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isLast ? 'none' : '1px solid rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                {/* Radio indicator */}
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${isSelected ? '#2D3A2E' : 'rgba(46,90,58,0.3)'}`,
                  background: isSelected ? '#2D3A2E' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isSelected && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />
                  )}
                </div>
                {/* Label + description */}
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#1F2A1F' }}>{label}</div>
                  <div style={{ fontSize: 13, color: '#6B7A6C', marginTop: 2 }}>{desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
