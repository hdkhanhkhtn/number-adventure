'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'bap-ios-install-dismissed';
const VISIT_COUNT_KEY = 'bap-visit-count';
const MIN_VISITS_TO_SHOW = 3;

function isIOSSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isStandalone =
    'standalone' in window.navigator &&
    (window.navigator as Navigator & { standalone?: boolean }).standalone;
  return isIOS && !isStandalone;
}

export function IosInstallPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isIOSSafari()) return;
    if (localStorage.getItem(STORAGE_KEY) === 'true') return;

    const count = parseInt(localStorage.getItem(VISIT_COUNT_KEY) ?? '0', 10) + 1;
    localStorage.setItem(VISIT_COUNT_KEY, String(count));

    if (count >= MIN_VISITS_TO_SHOW) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 pb-safe">
      <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-4 mx-auto max-w-sm">
        <div className="flex items-start gap-3">
          <span className="text-3xl">🌽</span>
          <div className="flex-1">
            <p className="font-semibold text-gray-800 text-sm">
              Install Bắp Number Adventure
            </p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Tap the{' '}
              <span className="inline-flex items-center">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="inline-block mx-0.5"
                  aria-hidden="true"
                >
                  <path
                    d="M12 3v12m0-12l4 4m-4-4L8 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 14v4a2 2 0 002 2h12a2 2 0 002-2v-4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>{' '}
              Share button, then &quot;Add to Home Screen&quot;
            </p>
          </div>
          <button
            onClick={dismiss}
            className="text-gray-400 hover:text-gray-600 p-1 -mt-1 -mr-1"
            aria-label="Dismiss install prompt"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
