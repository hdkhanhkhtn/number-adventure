'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameProgress } from '@/context/game-progress-context';
import { SplashScreen } from '@/components/screens/splash-screen';
import { WelcomeScreen } from '@/components/screens/welcome-screen';
import { ProfileSetup } from '@/components/screens/profile-setup';
import { OfflineToast } from '@/components/ui/offline-toast';
import { SaveProgressBanner } from '@/components/screens/save-progress-banner';
import { ParentGate } from '@/components/parent/parent-gate';
import type { MascotColor } from '@/lib/types/common';

type OnboardStep = 'splash' | 'welcome' | 'setup' | 'ready';

export default function ChildLayout({ children }: { children: React.ReactNode }) {
  const { state, setChild } = useGameProgress();
  const router = useRouter();
  const pathname = usePathname();

  // ── All useState declarations first (Rules of Hooks) ──────────────────────
  const [step, setStep] = useState<OnboardStep>('splash');
  const [lang, setLang] = useState('en');
  const [hydrated, setHydrated] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [showMigrateBanner, setShowMigrateBanner] = useState(false);
  const [showMigrateGate, setShowMigrateGate] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrateError, setMigrateError] = useState('');

  // ── Refs (stable across renders, no re-render on change) ──────────────────
  // Prevents the session-check fetch from firing more than once per mount
  const sessionChecked = useRef(false);

  // ── All useEffect declarations after all useState/useRef ──────────────────

  // On mount: hydrate state from localStorage and apply persistence rules.
  // Runs once — reads bap-splash-seen, bap-onboard-step, bap-lang then
  // decides the correct initial step (splash skip + mid-wizard resume).
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('bap-lang');
      if (savedLang) setLang(savedLang);
    } catch { /* private browsing */ }

    try {
      const splashSeen = localStorage.getItem('bap-splash-seen');
      if (splashSeen) {
        // Splash already seen — skip it; destination depends on child registration
        // (childId may not be in context yet; re-check after context hydrates below)
        const savedStep = localStorage.getItem('bap-onboard-step') as OnboardStep | null;
        if (savedStep === 'welcome' || savedStep === 'setup') {
          setStep(savedStep);
        } else {
          // No mid-wizard save — go to welcome; childId check below will promote to ready
          setStep('welcome');
        }
      }
      // If splashSeen is not set: keep default 'splash' step
    } catch { /* private browsing */ }

    setHydrated(true);
  }, []);

  // After hydration: if child is already registered, jump straight to ready.
  useEffect(() => {
    if (hydrated && state.childId) setStep('ready');
  }, [hydrated, state.childId]);

  // Persist step changes to localStorage; remove key on completion.
  useEffect(() => {
    if (!hydrated) return;
    try {
      if (step === 'ready') {
        localStorage.removeItem('bap-onboard-step');
      } else if (step === 'welcome' || step === 'setup') {
        localStorage.setItem('bap-onboard-step', step);
      }
      // 'splash' is never persisted — always show on fresh mount
    } catch { /* private browsing */ }
  }, [hydrated, step]);

  // Show "save progress" banner when a guest user has a parent session available.
  // Uses sessionChecked ref to avoid a redundant API call on every childId change.
  useEffect(() => {
    if (!hydrated) return;
    if (!state.childId?.startsWith('guest_')) return;
    if (sessionChecked.current) return;
    sessionChecked.current = true;
    fetch('/api/auth/session', { credentials: 'include' })
      .then(r => { if (r.ok) setShowMigrateBanner(true); })
      .catch(() => undefined);
  }, [hydrated, state.childId]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  // Attempt DB registration; fall back to guest mode on auth/network failure.
  // When childId starts with 'guest_', session-related API calls are skipped
  // in useGameSession to avoid FK violations.
  const handleProfileDone = async (profile: { name: string; age: number; color: MascotColor }) => {
    if (registering) return;
    setRegistering(true);
    try {
      const res = await fetch('/api/children', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.status === 201) {
        const { child } = await res.json();
        setChild(child.id, { id: child.id, ...profile });
        setStep('ready');
        return;
      }
      // 401 = no parent auth; other statuses → fall through to guest mode
    } catch {
      console.warn('[onboarding] DB registration failed, using guest mode');
    } finally {
      setRegistering(false);
    }
    const guestId = `guest_${crypto.randomUUID()}`;
    setChild(guestId, { id: guestId, ...profile });
    setStep('ready');
  };

  // Calls migrate endpoint; updates context on success; shows error on failure.
  // res.ok handles both 200 (idempotent — child already existed) and 201 (new).
  const handleMigrate = async () => {
    if (!state.profile || migrating) return;
    setMigrating(true);
    setMigrateError('');
    try {
      const res = await fetch('/api/children/migrate', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: state.profile.name, age: state.profile.age, color: state.profile.color }),
      });
      if (res.ok) {
        const { child } = await res.json() as { child: { id: string; name: string; age: number; color: string } };
        setChild(child.id, { ...state.profile, id: child.id });
        setShowMigrateBanner(false);
        setShowMigrateGate(false);
        return;
      }
      setMigrateError('Could not save. Please try again.');
    } catch {
      setMigrateError('No connection. Please try again.');
    } finally {
      setMigrating(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  // Not hydrated yet — show nothing to prevent flash
  if (!hydrated) return null;

  if (step === 'splash') {
    return (
      <SplashScreen
        onReady={() => {
          try { localStorage.setItem('bap-splash-seen', '1'); } catch { /* private browsing */ }
          setStep(state.childId ? 'ready' : 'welcome');
        }}
      />
    );
  }
  if (step === 'welcome') {
    return (
      <WelcomeScreen
        lang={lang}
        setLang={(l: string) => {
          setLang(l);
          try { localStorage.setItem('bap-lang', l); } catch { /* private browsing */ }
        }}
        onStart={() => setStep('setup')}
        onExistingProfile={() => router.push('/home')}
      />
    );
  }
  if (step === 'setup') {
    return <ProfileSetup onDone={handleProfileDone} />;
  }

  return (
    <>
      <OfflineToast />
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
      {/* TODO(phase-3a-02)[important]: Plan 3A-02 specifies banner re-shows after 3 sessions.
           Current dismiss is in-memory only — resets on every page reload, no session counter.
           Add sessionStorage counter: increment on step→'ready', show banner when count%3===0
           after first dismiss. See BACKLOG.md #6 */}
      {showMigrateBanner && !migrating && (
        <SaveProgressBanner
          onSave={() => setShowMigrateGate(true)}
          onDismiss={() => setShowMigrateBanner(false)}
          error={migrateError}
        />
      )}
      {showMigrateGate && (
        <ParentGate
          onPass={() => { setShowMigrateGate(false); void handleMigrate(); }}
          onCancel={() => setShowMigrateGate(false)}
        />
      )}
    </>
  );
}
