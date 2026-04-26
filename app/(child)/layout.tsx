'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameProgress } from '@/context/game-progress-context';
import { SplashScreen } from '@/components/screens/splash-screen';
import { WelcomeScreen } from '@/components/screens/welcome-screen';
import { ProfileSetup } from '@/components/screens/profile-setup';
import type { MascotColor } from '@/lib/types/common';

type OnboardStep = 'splash' | 'welcome' | 'setup' | 'ready';

export default function ChildLayout({ children }: { children: React.ReactNode }) {
  const { state, setChild } = useGameProgress();
  const router = useRouter();
  const [step, setStep] = useState<OnboardStep>('splash');
  const [lang, setLang] = useState('en');
  const [hydrated, setHydrated] = useState(false);

  // Wait for context to hydrate from localStorage
  useEffect(() => { setHydrated(true); }, []);

  // Skip onboarding if child already registered
  useEffect(() => {
    if (hydrated && state.childId) setStep('ready');
  }, [hydrated, state.childId]);

  const [registering, setRegistering] = useState(false);

  // TODO Phase 2E: if state.childId?.startsWith('guest_') && parentId cookie exists → show "Save your progress" prompt

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

  // Not hydrated yet — show nothing to prevent flash
  if (!hydrated) return null;

  if (step === 'splash') {
    return <SplashScreen onReady={() => setStep(state.childId ? 'ready' : 'welcome')} />;
  }
  if (step === 'welcome') {
    return (
      <WelcomeScreen
        lang={lang} setLang={setLang}
        onStart={() => setStep('setup')}
        onExistingProfile={() => router.push('/home')}
      />
    );
  }
  if (step === 'setup') {
    return <ProfileSetup onDone={handleProfileDone} />;
  }

  return <>{children}</>;
}
