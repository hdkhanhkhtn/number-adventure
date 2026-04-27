'use client';

import { useEffect, useState } from 'react';
import type { MascotColor } from '@/lib/types/common';
import { BapMini } from '@/components/ui/bap-mascot';

interface ChildEntry {
  id: string;
  name: string;
  age: number;
  color: MascotColor;
}

interface Props {
  activeChildId: string | null;
  onSelect: (child: ChildEntry) => void;
  onClose: () => void;
}

/** Bottom sheet that lists all parent's children; tap one to switch active profile */
export function ChildSwitcherModal({ activeChildId, onSelect, onClose }: Props) {
  const [children, setChildren] = useState<ChildEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/parent/children', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: ChildEntry[]) => setChildren(data))
      .catch(() => setChildren([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.4)',
        }}
      />
      {/* Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
        background: '#fff', borderRadius: '24px 24px 0 0',
        padding: '20px 20px 40px',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.18)',
      }}>
        {/* Handle bar */}
        <div style={{
          width: 40, height: 4, background: '#D1D5DB', borderRadius: 2,
          margin: '0 auto 20px',
        }} />

        <div style={{ fontSize: 16, fontWeight: 700, color: '#1F2A1F', marginBottom: 16 }}>
          Switch Profile
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#9AA69A', padding: '16px 0' }}>
            Loading…
          </div>
        ) : children.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#9AA69A', padding: '16px 0' }}>
            No profiles found.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {children.map((child) => {
              const isActive = child.id === activeChildId;
              return (
                <button
                  key={child.id}
                  onClick={() => { onSelect(child); onClose(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 16px', borderRadius: 16,
                    background: isActive ? '#EDF7EC' : '#F9FAFB',
                    border: isActive ? '2px solid #5FB36A' : '2px solid transparent',
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: '#FFF8EC', border: '2px solid #2D3A2E',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <BapMini size={40} color={child.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1F2A1F' }}>
                      {child.name}
                    </div>
                    <div style={{ fontSize: 13, color: '#6B7A6C' }}>{child.age} years old</div>
                  </div>
                  {isActive && (
                    <span style={{ fontSize: 18, color: '#5FB36A' }}>✓</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
