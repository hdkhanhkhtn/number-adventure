'use client';

import { IconBtn } from '@/components/ui/icon-btn';
import type { IconBtnColor } from '@/lib/types/common';

export interface SlotColumnProps {
  label: string;
  sub: string;
  count: number;
  onAdd: () => void;
  onSub: () => void;
  color: IconBtnColor;
  element: React.ReactNode;
}

/** Column for BuildNumber game: shows stacked visual elements with +/- controls */
export function SlotColumn({ label, sub, count, onAdd, onSub, color, element }: SlotColumnProps) {
  return (
    <div style={{
      borderRadius: 16, background: '#fff',
      border: '2px solid rgba(46,90,58,0.12)',
      padding: 10, display: 'flex', flexDirection: 'column', gap: 8,
    }}>
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
        <div style={{ fontFamily: 'var(--font-num)', fontWeight: 700, fontSize: 22, color: '#2D3A2E' }}>
          {count}
        </div>
        <IconBtn color={color} size={38} onClick={onAdd} style={{ fontSize: 18 }}>+</IconBtn>
      </div>
    </div>
  );
}
