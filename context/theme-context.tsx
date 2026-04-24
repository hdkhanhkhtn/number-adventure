'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { ThemeName } from '@/lib/types/common';

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'garden',
  setTheme: () => undefined,
});

const VALID_THEMES: ThemeName[] = ['garden', 'candy', 'sunny'];

function readStoredTheme(): ThemeName {
  // Safe SSR guard — localStorage is only available in browser
  if (typeof window === 'undefined') return 'garden';
  const stored = localStorage.getItem('bap-theme');
  return stored && VALID_THEMES.includes(stored as ThemeName)
    ? (stored as ThemeName)
    : 'garden';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Lazy initializer runs once on mount — avoids useEffect + setState pattern
  const [theme, setThemeState] = useState<ThemeName>(readStoredTheme);

  // Apply data-theme attribute whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'garden') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }
    localStorage.setItem('bap-theme', theme);
  }, [theme]);

  function setTheme(next: ThemeName) {
    setThemeState(next);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
