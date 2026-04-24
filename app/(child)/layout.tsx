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

  const handleProfileDone = async (profile: { name: string; age: number; color: MascotColor }) => {
    try {
      // Register parent + child in DB
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: `guest_${Date.now()}@bap.local`, password: 'guest', name: 'Parent' }),
      });
      const { parentId } = await regRes.json() as { parentId?: string };
      if (!parentId) throw new Error('Registration failed');

      const childRes = await fetch('/api/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId, name: profile.name, age: profile.age, color: profile.color }),
      });
      const { child } = await childRes.json() as { child?: { id: string } };
      if (!child?.id) throw new Error('Child creation failed');

      setChild(child.id, { id: child.id, ...profile });
      setStep('ready');
    } catch {
      // On failure still proceed with local profile (graceful degradation)
      const tempId = `local_${Date.now()}`;
      setChild(tempId, { id: tempId, ...profile });
      setStep('ready');
    }
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
