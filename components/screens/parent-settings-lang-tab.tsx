'use client';

import { Panel } from '@/components/parent/panel';
import { LangOption } from '@/components/parent/lang-option';
import type { ChildSettings } from '@/lib/types/common';

interface Props {
  settings: Partial<ChildSettings>;
  onChange: (patch: Partial<ChildSettings>) => void;
}

/** Language tab — kid language + parent language */
export function ParentSettingsLangTab({ settings, onChange }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Panel title="Màn hình cho bé" sub="Lời nhắc âm thanh">
        <LangOption active={settings.kidLang === 'en'} label="Tiếng Anh" sub="English numbers" onClick={() => onChange({ kidLang: 'en' })} />
        <LangOption active={settings.kidLang === 'vi'} label="Tiếng Việt" sub="Số tiếng Việt" onClick={() => onChange({ kidLang: 'vi' })} />
        <LangOption active={settings.kidLang === 'bi'} label="Song ngữ" sub="Cả hai ngôn ngữ" onClick={() => onChange({ kidLang: 'bi' as ChildSettings['kidLang'] })} />
      </Panel>

      <Panel title="Màn hình cha mẹ">
        <LangOption active={settings.parentLang === 'vi'} label="Tiếng Việt" onClick={() => onChange({ parentLang: 'vi' })} />
        <LangOption active={settings.parentLang === 'en'} label="English" onClick={() => onChange({ parentLang: 'en' })} />
      </Panel>
    </div>
  );
}
