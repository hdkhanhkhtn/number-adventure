'use client';

import { ThemeProvider } from './theme-context';
import { AudioProvider } from './audio-context';
import { GameProgressProvider } from './game-progress-context';

/** Composite provider wrapper — order: Theme > Audio > GameProgress */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AudioProvider>
        <GameProgressProvider>
          {children}
        </GameProgressProvider>
      </AudioProvider>
    </ThemeProvider>
  );
}
