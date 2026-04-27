'use client';

import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
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
  | { type: 'SWITCH_CHILD'; childId: string; profile: ChildProfile }
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
    // Switch active child: update identity, clear in-progress session state to avoid
    // showing stale world/session data from the previous child (I1)
    case 'SWITCH_CHILD':
      return {
        ...state,
        childId: action.childId,
        profile: action.profile,
        currentWorldId: null,
        sessionActive: false,
      };
    case 'CLEAR':
      return INITIAL_STATE;
    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────────
interface GameProgressContextValue {
  state: GameProgressState;
  isHydrated: boolean;
  activeChildId: string | null;
  setChild: (childId: string, profile: ChildProfile) => void;
  setProfile: (profile: ChildProfile) => void;
  updateSettings: (settings: Partial<ChildSettings>) => void;
  setWorld: (worldId: WorldId | null) => void;
  setSessionActive: (active: boolean) => void;
  /** Switch active child without resetting world, settings, or session state */
  switchChild: (childId: string, profile: ChildProfile) => void;
  clear: () => void;
}

const GameProgressContext = createContext<GameProgressContextValue>({
  state: INITIAL_STATE,
  isHydrated: false,
  activeChildId: null,
  setChild: () => undefined,
  setProfile: () => undefined,
  updateSettings: () => undefined,
  setWorld: () => undefined,
  setSessionActive: () => undefined,
  switchChild: () => undefined,
  clear: () => undefined,
});

const LS_KEY = 'bap-progress-cache';
const LS_ACTIVE_CHILD_KEY = 'bap-active-child';

export function GameProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [isHydrated, setIsHydrated] = useState(false);

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
    setIsHydrated(true);
  }, []);

  // Write-through cache on every state change
  // TODO(phase-3a)[important]: sessionActive is part of state but not serialised, so any SET_SESSION_ACTIVE
  // dispatch triggers a needless localStorage write. Extract a stable serialisable slice to avoid.
  // See BACKLOG.md #2
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

  // Memoize ctx so consumers only re-render when state actually changes
  const ctx = useMemo<GameProgressContextValue>(() => ({
    state,
    isHydrated,
    activeChildId: state.childId,
    setChild: (childId, profile) => dispatch({ type: 'SET_CHILD', payload: { childId, profile } }),
    setProfile: (profile) => dispatch({ type: 'SET_PROFILE', payload: profile }),
    updateSettings: (settings) => dispatch({ type: 'UPDATE_SETTINGS', payload: settings }),
    setWorld: (worldId) => dispatch({ type: 'SET_WORLD', payload: worldId }),
    setSessionActive: (active) => dispatch({ type: 'SET_SESSION_ACTIVE', payload: active }),
    switchChild: (childId, profile) => {
      dispatch({ type: 'SWITCH_CHILD', childId, profile });
      if (typeof window !== 'undefined') {
        localStorage.setItem(LS_ACTIVE_CHILD_KEY, childId);
      }
    },
    clear: () => dispatch({ type: 'CLEAR' }),
  }), [state, isHydrated]);

  return (
    <GameProgressContext.Provider value={ctx}>
      {children}
    </GameProgressContext.Provider>
  );
}

export function useGameProgress(): GameProgressContextValue {
  return useContext(GameProgressContext);
}
