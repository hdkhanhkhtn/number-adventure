'use client';

import { createContext, useContext, useEffect, useReducer } from 'react';
import type { ChildProfile, ChildSettings, WorldId } from '@/lib/types/common';

// ── State shape ──────────────────────────────────────────────
interface GameProgressState {
  childId: string | null;
  profile: ChildProfile | null;
  settings: Partial<ChildSettings>;
  currentWorldId: WorldId | null;
  sessionActive: boolean;
}

const INITIAL_STATE: GameProgressState = {
  childId: null,
  profile: null,
  settings: {},
  currentWorldId: null,
  sessionActive: false,
};

// ── Actions ──────────────────────────────────────────────────
type Action =
  | { type: 'SET_CHILD'; payload: { childId: string; profile: ChildProfile } }
  | { type: 'SET_PROFILE'; payload: ChildProfile }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<ChildSettings> }
  | { type: 'SET_WORLD'; payload: WorldId | null }
  | { type: 'SET_SESSION_ACTIVE'; payload: boolean }
  | { type: 'CLEAR' };

function reducer(state: GameProgressState, action: Action): GameProgressState {
  switch (action.type) {
    case 'SET_CHILD':
      return { ...state, childId: action.payload.childId, profile: action.payload.profile };
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'SET_WORLD':
      return { ...state, currentWorldId: action.payload };
    case 'SET_SESSION_ACTIVE':
      return { ...state, sessionActive: action.payload };
    case 'CLEAR':
      return INITIAL_STATE;
    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────────
interface GameProgressContextValue {
  state: GameProgressState;
  setChild: (childId: string, profile: ChildProfile) => void;
  setProfile: (profile: ChildProfile) => void;
  updateSettings: (settings: Partial<ChildSettings>) => void;
  setWorld: (worldId: WorldId | null) => void;
  setSessionActive: (active: boolean) => void;
  clear: () => void;
}

const GameProgressContext = createContext<GameProgressContextValue>({
  state: INITIAL_STATE,
  setChild: () => undefined,
  setProfile: () => undefined,
  updateSettings: () => undefined,
  setWorld: () => undefined,
  setSessionActive: () => undefined,
  clear: () => undefined,
});

const LS_KEY = 'bap-progress-cache';

export function GameProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // Load from localStorage on mount (instant display while DB fetch reconciles)
  useEffect(() => {
    try {
      const cached = localStorage.getItem(LS_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as Partial<GameProgressState>;
        if (parsed.childId && parsed.profile) {
          dispatch({ type: 'SET_CHILD', payload: { childId: parsed.childId, profile: parsed.profile } });
        }
        if (parsed.settings) dispatch({ type: 'UPDATE_SETTINGS', payload: parsed.settings });
        if (parsed.currentWorldId) dispatch({ type: 'SET_WORLD', payload: parsed.currentWorldId });
      }
    } catch {
      // Ignore malformed cache
    }
  }, []);

  // Write-through cache on every state change
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        childId: state.childId,
        profile: state.profile,
        settings: state.settings,
        currentWorldId: state.currentWorldId,
      }));
    } catch {
      // Ignore storage errors (private browsing, quota)
    }
  }, [state]);

  const ctx: GameProgressContextValue = {
    state,
    setChild: (childId, profile) => dispatch({ type: 'SET_CHILD', payload: { childId, profile } }),
    setProfile: (profile) => dispatch({ type: 'SET_PROFILE', payload: profile }),
    updateSettings: (settings) => dispatch({ type: 'UPDATE_SETTINGS', payload: settings }),
    setWorld: (worldId) => dispatch({ type: 'SET_WORLD', payload: worldId }),
    setSessionActive: (active) => dispatch({ type: 'SET_SESSION_ACTIVE', payload: active }),
    clear: () => dispatch({ type: 'CLEAR' }),
  };

  return (
    <GameProgressContext.Provider value={ctx}>
      {children}
    </GameProgressContext.Provider>
  );
}

export function useGameProgress(): GameProgressContextValue {
  return useContext(GameProgressContext);
}
