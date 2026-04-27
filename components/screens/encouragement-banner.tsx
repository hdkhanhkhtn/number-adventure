'use client';

import { useState } from 'react';

interface Props {
  messageId: string;
  message: string;
  onDismiss: () => void;
}

/** Soft warm card shown on child home screen when parent sends an encouragement message */
export function EncouragementBanner({ messageId, message, onDismiss }: Props) {
  const [dismissing, setDismissing] = useState(false);

  async function handleDismiss() {
    setDismissing(true);
    try {
      await fetch('/api/parent/encouragement', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: messageId }),
      });
    } finally {
      onDismiss();
    }
  }

  return (
    <div className="mx-4 mb-3 rounded-2xl bg-amber-50 border border-amber-200 p-4 flex gap-3 items-start shadow-sm">
      <span className="text-2xl select-none" aria-hidden="true">💌</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-amber-700 mb-1">Message from your family</p>
        <p className="text-sm text-amber-900 leading-snug break-words">{message}</p>
      </div>
      <button
        onClick={handleDismiss}
        disabled={dismissing}
        className="flex-shrink-0 text-xs font-semibold text-amber-600 bg-amber-100 hover:bg-amber-200 active:scale-95 rounded-lg px-2 py-1 transition-all disabled:opacity-50"
        aria-label="Dismiss message"
      >
        Got it!
      </button>
    </div>
  );
}
