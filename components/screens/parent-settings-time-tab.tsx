'use client';

import { Panel } from '@/components/parent/panel';
import { Toggle } from '@/components/ui/toggle';
import type { ChildSettings } from '@/lib/types/common';

interface Props {
  settings: Partial<ChildSettings>;
  onChange: (patch: Partial<ChildSettings>) => void;
}

/** Time limits tab — daily limit, quiet hours, difficulty */
export function ParentSettingsTimeTab({ settings, onChange }: Props) {
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
    </div>
  );
}
