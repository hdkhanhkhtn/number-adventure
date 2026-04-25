'use client';

import { IosInstallPrompt } from './ios-install-prompt';

/**
 * PWA registration mount point.
 * Serwist auto-registers the service worker via its Next.js plugin.
 * This component mounts the iOS install prompt UI.
 */
export function PwaRegister() {
  return <IosInstallPrompt />;
}
