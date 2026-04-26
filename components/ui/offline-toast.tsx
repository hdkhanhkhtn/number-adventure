'use client';

import { useOnline } from '@/lib/hooks/use-online';

/** Non-blocking banner shown when device goes offline */
export function OfflineToast() {
  const { isOnline } = useOnline();
  if (isOnline) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40,
      padding: '6px 16px',
      background: '#FFF3E0',
      borderBottom: '1px solid #FFB74D',
      textAlign: 'center',
      fontSize: 12, fontWeight: 600, color: '#E65100',
    }}>
      You&apos;re offline — progress will sync when connected
    </div>
  );
}
