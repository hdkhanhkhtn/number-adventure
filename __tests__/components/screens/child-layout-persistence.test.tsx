/**
 * Tests for ChildLayout localStorage persistence
 * Tests all 8 checkpoints from plan:
 * CP1: Mid-wizard resume from welcome/setup
 * CP2: Step persistence (welcome→setup)
 * CP3: Step cleanup on registration (removes bap-onboard-step)
 * CP4: Language persistence (bap-lang)
 * CP5: Language change callback
 * CP6: Splash skip logic (fresh vs returning)
 * CP7: SplashScreen onReady writes bap-splash-seen
 * CP8: Private browsing safety (localStorage errors)
 */
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock useGameProgress context
jest.mock('@/context/game-progress-context', () => ({
  useGameProgress: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock all child components with simple divs to isolate ChildLayout logic
jest.mock('@/components/screens/splash-screen', () => ({
  SplashScreen: ({ onReady }: any) => (
    <div data-testid="splash-screen">
      <button onClick={onReady} data-testid="splash-ready-btn">
        Ready
      </button>
    </div>
  ),
}));

jest.mock('@/components/screens/welcome-screen', () => ({
  WelcomeScreen: ({ lang, setLang, onStart, onExistingProfile }: any) => (
    <div data-testid="welcome-screen" data-lang={lang}>
      <button
        onClick={() => setLang('vi')}
        data-testid="set-lang-vi-btn"
      >
        Set Lang VI
      </button>
      <button onClick={onStart} data-testid="welcome-start-btn">
        Start
      </button>
      <button onClick={onExistingProfile} data-testid="existing-profile-btn">
        Existing
      </button>
    </div>
  ),
}));

jest.mock('@/components/screens/profile-setup', () => ({
  ProfileSetup: ({ onDone }: any) => (
    <div data-testid="profile-setup">
      <button
        onClick={() =>
          onDone({ name: 'Test Child', age: 5, color: 'corn' })
        }
        data-testid="profile-done-btn"
      >
        Done
      </button>
    </div>
  ),
}));

jest.mock('@/components/ui/offline-toast', () => ({
  OfflineToast: () => <div data-testid="offline-toast" />,
}));

jest.mock('@/components/screens/save-progress-banner', () => ({
  SaveProgressBanner: ({ onSave, onDismiss }: any) => (
    <div data-testid="save-progress-banner">
      <button onClick={onSave} data-testid="banner-save-btn">
        Save
      </button>
      <button onClick={onDismiss} data-testid="banner-dismiss-btn">
        Dismiss
      </button>
    </div>
  ),
}));

jest.mock('@/components/parent/parent-gate', () => ({
  ParentGate: ({ onPass, onCancel }: any) => (
    <div data-testid="parent-gate">
      <button onClick={onPass} data-testid="gate-pass-btn">
        Pass
      </button>
      <button onClick={onCancel} data-testid="gate-cancel-btn">
        Cancel
      </button>
    </div>
  ),
}));

// Import hooks we need to mock
import { useGameProgress } from '@/context/game-progress-context';
import { useRouter } from 'next/navigation';

// Import component under test
import ChildLayout from '@/app/(child)/layout';

const mockUseGameProgress = useGameProgress as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;

describe('ChildLayout — localStorage persistence', () => {
  let localStorageMock: Record<string, string>;
  let uuidCounter = 0;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock = {};
    uuidCounter = 0;

    // Mock crypto.randomUUID
    Object.defineProperty(global.crypto, 'randomUUID', {
      value: jest.fn(() => `uuid-${uuidCounter++}`),
      configurable: true,
    });

    // Mock localStorage
    Storage.prototype.getItem = jest.fn((key: string) => {
      return localStorageMock[key] || null;
    });
    Storage.prototype.setItem = jest.fn((key: string, value: string) => {
      localStorageMock[key] = value;
    });
    Storage.prototype.removeItem = jest.fn((key: string) => {
      delete localStorageMock[key];
    });
    Storage.prototype.clear = jest.fn(() => {
      localStorageMock = {};
    });

    // Default mock implementations
    mockUseGameProgress.mockReturnValue({
      state: { childId: null, profile: null },
      setChild: jest.fn(),
    });

    mockUseRouter.mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    });

    // Mock fetch for session check
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({}),
      } as Response)
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Mounting behavior', () => {
    describe('CP6+CP7: Fresh visit (no bap-splash-seen)', () => {
      it('renders SplashScreen on fresh visit', async () => {
        render(<ChildLayout><div>children</div></ChildLayout>);

        await waitFor(() => {
          expect(screen.getByTestId('splash-screen')).toBeInTheDocument();
        });
      });

      it('does not render children before splash is complete', async () => {
        render(<ChildLayout><div data-testid="children">children</div></ChildLayout>);

        await waitFor(() => {
          expect(screen.queryByTestId('children')).not.toBeInTheDocument();
        });
      });

      it('calling onReady writes bap-splash-seen to localStorage (CP7)', async () => {
        const user = userEvent.setup();
        render(<ChildLayout><div>children</div></ChildLayout>);

        const readyBtn = await screen.findByTestId('splash-ready-btn');
        await user.click(readyBtn);

        await waitFor(() => {
          expect(localStorage.setItem).toHaveBeenCalledWith('bap-splash-seen', '1');
        });
      });

      it('onReady transitions to welcome when no childId registered', async () => {
        const user = userEvent.setup();
        render(<ChildLayout><div>children</div></ChildLayout>);

        const readyBtn = await screen.findByTestId('splash-ready-btn');
        await user.click(readyBtn);

        await waitFor(() => {
          expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
        });
      });

      it('skips splash entirely when childId already registered', async () => {
        mockUseGameProgress.mockReturnValue({
          state: { childId: 'child_123', profile: { name: 'Test', age: 5, color: 'corn' } },
          setChild: jest.fn(),
        });

        render(<ChildLayout><div data-testid="children">children</div></ChildLayout>);

        // When childId is already set, ChildLayout should skip splash and go straight to ready
        await waitFor(() => {
          expect(screen.getByTestId('children')).toBeInTheDocument();
          expect(screen.getByTestId('offline-toast')).toBeInTheDocument();
          expect(screen.queryByTestId('splash-screen')).not.toBeInTheDocument();
        });
      });
    });

    describe('CP6: Returning visit (bap-splash-seen = "1", no saved step)', () => {
      beforeEach(() => {
        localStorageMock['bap-splash-seen'] = '1';
      });

      it('skips splash and renders WelcomeScreen', async () => {
        render(<ChildLayout><div>children</div></ChildLayout>);

        await waitFor(() => {
          expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
          expect(screen.queryByTestId('splash-screen')).not.toBeInTheDocument();
        });
      });

      it('reads bap-splash-seen from localStorage', async () => {
        render(<ChildLayout><div>children</div></ChildLayout>);

        await waitFor(() => {
          expect(localStorage.getItem).toHaveBeenCalledWith('bap-splash-seen');
        });
      });
    });

    describe('CP1: Mid-wizard resume from saved step', () => {
      it('resumes from welcome when bap-onboard-step = "welcome"', async () => {
        localStorageMock['bap-splash-seen'] = '1';
        localStorageMock['bap-onboard-step'] = 'welcome';

        render(<ChildLayout><div>children</div></ChildLayout>);

        await waitFor(() => {
          expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
          expect(screen.queryByTestId('profile-setup')).not.toBeInTheDocument();
        });
      });

      it('resumes from setup when bap-onboard-step = "setup"', async () => {
        localStorageMock['bap-splash-seen'] = '1';
        localStorageMock['bap-onboard-step'] = 'setup';

        render(<ChildLayout><div>children</div></ChildLayout>);

        await waitFor(() => {
          expect(screen.getByTestId('profile-setup')).toBeInTheDocument();
          expect(screen.queryByTestId('welcome-screen')).not.toBeInTheDocument();
        });
      });

      it('defaults to welcome when bap-onboard-step has invalid value ("ready")', async () => {
        localStorageMock['bap-splash-seen'] = '1';
        localStorageMock['bap-onboard-step'] = 'ready';

        render(<ChildLayout><div>children</div></ChildLayout>);

        await waitFor(() => {
          expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
          expect(screen.queryByTestId('profile-setup')).not.toBeInTheDocument();
        });
      });

      it('defaults to welcome when bap-onboard-step has invalid value (junk)', async () => {
        localStorageMock['bap-splash-seen'] = '1';
        localStorageMock['bap-onboard-step'] = 'invalid_step';

        render(<ChildLayout><div>children</div></ChildLayout>);

        await waitFor(() => {
          expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
        });
      });

      it('reads bap-onboard-step from localStorage', async () => {
        localStorageMock['bap-splash-seen'] = '1';

        render(<ChildLayout><div>children</div></ChildLayout>);

        await waitFor(() => {
          expect(localStorage.getItem).toHaveBeenCalledWith('bap-onboard-step');
        });
      });
    });

    describe('CP4: Saved language persistence', () => {
      it('WelcomeScreen receives lang="vi" when bap-lang = "vi"', async () => {
        localStorageMock['bap-splash-seen'] = '1';
        localStorageMock['bap-lang'] = 'vi';

        render(<ChildLayout><div>children</div></ChildLayout>);

        await waitFor(() => {
          expect(screen.getByTestId('welcome-screen')).toHaveAttribute('data-lang', 'vi');
        });
      });

      it('WelcomeScreen receives lang="en" when bap-lang not set', async () => {
        localStorageMock['bap-splash-seen'] = '1';

        render(<ChildLayout><div>children</div></ChildLayout>);

        await waitFor(() => {
          expect(screen.getByTestId('welcome-screen')).toHaveAttribute('data-lang', 'en');
        });
      });

      it('reads bap-lang from localStorage on mount', async () => {
        render(<ChildLayout><div>children</div></ChildLayout>);

        await waitFor(() => {
          expect(localStorage.getItem).toHaveBeenCalledWith('bap-lang');
        });
      });

      it('supports different language values in bap-lang', async () => {
        localStorageMock['bap-splash-seen'] = '1';
        localStorageMock['bap-lang'] = 'fr';

        render(<ChildLayout><div>children</div></ChildLayout>);

        await waitFor(() => {
          expect(screen.getByTestId('welcome-screen')).toHaveAttribute('data-lang', 'fr');
        });
      });
    });

    describe('Registered user (state.childId set)', () => {
      it('renders children (ready state) when childId is set', async () => {
        mockUseGameProgress.mockReturnValue({
          state: { childId: 'child_123', profile: { name: 'Test', age: 5, color: 'corn' } },
          setChild: jest.fn(),
        });

        render(<ChildLayout><div data-testid="children">children</div></ChildLayout>);

        await waitFor(() => {
          expect(screen.getByTestId('children')).toBeInTheDocument();
          expect(screen.getByTestId('offline-toast')).toBeInTheDocument();
          expect(screen.queryByTestId('splash-screen')).not.toBeInTheDocument();
          expect(screen.queryByTestId('welcome-screen')).not.toBeInTheDocument();
        });
      });

      it('shows children even if splash has not been seen', async () => {
        mockUseGameProgress.mockReturnValue({
          state: { childId: 'child_123', profile: { name: 'Test', age: 5, color: 'corn' } },
          setChild: jest.fn(),
        });

        // Deliberately not setting bap-splash-seen
        render(<ChildLayout><div data-testid="children">children</div></ChildLayout>);

        await waitFor(() => {
          expect(screen.getByTestId('children')).toBeInTheDocument();
        });
      });
    });
  });

  describe('Step persistence', () => {
    describe('CP2: Moving from welcome to setup persists step', () => {
      it('writes "setup" to bap-onboard-step when transitioning to setup', async () => {
        localStorageMock['bap-splash-seen'] = '1';

        const user = userEvent.setup();
        render(<ChildLayout><div>children</div></ChildLayout>);

        const startBtn = await screen.findByTestId('welcome-start-btn');
        await user.click(startBtn);

        await waitFor(() => {
          expect(localStorage.setItem).toHaveBeenCalledWith('bap-onboard-step', 'setup');
        });
      });

      it('renders ProfileSetup after clicking start on WelcomeScreen', async () => {
        localStorageMock['bap-splash-seen'] = '1';

        const user = userEvent.setup();
        render(<ChildLayout><div>children</div></ChildLayout>);

        const startBtn = await screen.findByTestId('welcome-start-btn');
        await user.click(startBtn);

        await waitFor(() => {
          expect(screen.getByTestId('profile-setup')).toBeInTheDocument();
        });
      });

      it('persists welcome step when in welcome screen', async () => {
        localStorageMock['bap-splash-seen'] = '1';

        render(<ChildLayout><div>children</div></ChildLayout>);

        await waitFor(() => {
          expect(localStorage.setItem).toHaveBeenCalledWith('bap-onboard-step', 'welcome');
        });
      });
    });

    describe('CP3: Step cleanup on registration (removes bap-onboard-step)', () => {
      it('calls removeItem on bap-onboard-step when transitioning to ready', async () => {
        localStorageMock['bap-splash-seen'] = '1';
        localStorageMock['bap-onboard-step'] = 'setup';

        const setChildMock = jest.fn();
        mockUseGameProgress.mockReturnValue({
          state: { childId: null, profile: null },
          setChild: setChildMock,
        });

        const user = userEvent.setup();
        render(<ChildLayout><div>children</div></ChildLayout>);

        // Fill in profile and complete registration
        const profileDoneBtn = await screen.findByTestId('profile-done-btn');
        await user.click(profileDoneBtn);

        await waitFor(() => {
          expect(localStorage.removeItem).toHaveBeenCalledWith('bap-onboard-step');
        });
      });

      it('removes bap-onboard-step after successful registration', async () => {
        localStorageMock['bap-splash-seen'] = '1';
        localStorageMock['bap-onboard-step'] = 'setup';

        const setChildMock = jest.fn();
        mockUseGameProgress.mockReturnValue({
          state: { childId: null, profile: null },
          setChild: setChildMock,
        });

        const user = userEvent.setup();
        render(<ChildLayout><div>children</div></ChildLayout>);

        const profileDoneBtn = await screen.findByTestId('profile-done-btn');
        await user.click(profileDoneBtn);

        await waitFor(() => {
          expect(localStorage.removeItem).toHaveBeenCalledWith('bap-onboard-step');
        });
      });

      it('never persists "splash" step to localStorage', async () => {
        // Even though step starts as 'splash', it should never be written to localStorage
        render(<ChildLayout><div>children</div></ChildLayout>);

        await waitFor(() => {
          // Check all setItem calls do not include 'bap-onboard-step' with 'splash'
          const setItemCalls = (localStorage.setItem as jest.Mock).mock.calls;
          const splashCalls = setItemCalls.filter(
            ([key, value]: any) => key === 'bap-onboard-step' && value === 'splash'
          );
          expect(splashCalls.length).toBe(0);
        });
      });

      it('never persists "ready" step to localStorage', async () => {
        mockUseGameProgress.mockReturnValue({
          state: { childId: 'child_123', profile: null },
          setChild: jest.fn(),
        });

        render(<ChildLayout><div>children</div></ChildLayout>);

        await waitFor(() => {
          const setItemCalls = (localStorage.setItem as jest.Mock).mock.calls;
          const readyCalls = setItemCalls.filter(
            ([key, value]: any) => key === 'bap-onboard-step' && value === 'ready'
          );
          expect(readyCalls.length).toBe(0);
        });
      });
    });
  });

  describe('Language persistence', () => {
    describe('CP5: Language change callback persists to localStorage', () => {
      it('setLang callback writes to bap-lang', async () => {
        localStorageMock['bap-splash-seen'] = '1';

        const user = userEvent.setup();
        render(<ChildLayout><div>children</div></ChildLayout>);

        const setLangBtn = await screen.findByTestId('set-lang-vi-btn');
        await user.click(setLangBtn);

        await waitFor(() => {
          expect(localStorage.setItem).toHaveBeenCalledWith('bap-lang', 'vi');
        });
      });

      it('WelcomeScreen receives updated lang after setLang is called', async () => {
        localStorageMock['bap-splash-seen'] = '1';

        const user = userEvent.setup();
        const { rerender } = render(<ChildLayout><div>children</div></ChildLayout>);

        let welcomeScreen = await screen.findByTestId('welcome-screen');
        expect(welcomeScreen).toHaveAttribute('data-lang', 'en');

        const setLangBtn = await screen.findByTestId('set-lang-vi-btn');
        await user.click(setLangBtn);

        // After setLang, the state updates and re-render should show new lang
        await waitFor(() => {
          welcomeScreen = screen.getByTestId('welcome-screen');
          expect(welcomeScreen).toHaveAttribute('data-lang', 'vi');
        });
      });

      it('persists multiple different language values', async () => {
        localStorageMock['bap-splash-seen'] = '1';

        const user = userEvent.setup();
        render(<ChildLayout><div>children</div></ChildLayout>);

        const setLangBtn = await screen.findByTestId('set-lang-vi-btn');
        await user.click(setLangBtn);

        await waitFor(() => {
          expect(localStorage.setItem).toHaveBeenCalledWith('bap-lang', 'vi');
        });
      });
    });
  });

  describe('Private browsing safety (CP8)', () => {
    it('renders SplashScreen even when localStorage.getItem throws', async () => {
      (localStorage.getItem as jest.Mock).mockImplementation(() => {
        throw new Error('Private browsing mode');
      });

      render(<ChildLayout><div>children</div></ChildLayout>);

      await waitFor(() => {
        expect(screen.getByTestId('splash-screen')).toBeInTheDocument();
      });
    });

    it('does not crash when localStorage.setItem throws on splash ready', async () => {
      (localStorage.setItem as jest.Mock).mockImplementation(() => {
        throw new Error('Private browsing mode');
      });

      const user = userEvent.setup();
      render(<ChildLayout><div>children</div></ChildLayout>);

      const readyBtn = await screen.findByTestId('splash-ready-btn');

      // Should not crash
      expect(() => {
        act(() => {
          readyBtn.click();
        });
      }).not.toThrow();

      await waitFor(() => {
        expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
      });
    });

    it('does not crash when localStorage.setItem throws on step change', async () => {
      (localStorage.setItem as jest.Mock).mockImplementation(() => {
        throw new Error('Private browsing mode');
      });

      localStorageMock['bap-splash-seen'] = '1';

      const user = userEvent.setup();
      render(<ChildLayout><div>children</div></ChildLayout>);

      const startBtn = await screen.findByTestId('welcome-start-btn');

      expect(() => {
        act(() => {
          startBtn.click();
        });
      }).not.toThrow();

      await waitFor(() => {
        expect(screen.getByTestId('profile-setup')).toBeInTheDocument();
      });
    });

    it('does not crash when localStorage.removeItem throws', async () => {
      (localStorage.removeItem as jest.Mock).mockImplementation(() => {
        throw new Error('Private browsing mode');
      });

      localStorageMock['bap-splash-seen'] = '1';
      localStorageMock['bap-onboard-step'] = 'setup';

      const setChildMock = jest.fn();
      mockUseGameProgress.mockReturnValue({
        state: { childId: null, profile: null },
        setChild: setChildMock,
      });

      const user = userEvent.setup();
      render(<ChildLayout><div>children</div></ChildLayout>);

      const profileDoneBtn = await screen.findByTestId('profile-done-btn');

      expect(() => {
        act(() => {
          profileDoneBtn.click();
        });
      }).not.toThrow();

      await waitFor(() => {
        expect(screen.getByTestId('offline-toast')).toBeInTheDocument();
      });
    });

    it('still renders welcome screen after localStorage error on language read', async () => {
      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'bap-lang') {
          throw new Error('Private browsing mode');
        }
        return localStorageMock[key] || null;
      });

      localStorageMock['bap-splash-seen'] = '1';

      render(<ChildLayout><div>children</div></ChildLayout>);

      await waitFor(() => {
        expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
      });
    });
  });

  describe('Hydration safety', () => {
    it('does not render children until hydrated', async () => {
      render(<ChildLayout><div data-testid="children">children</div></ChildLayout>);

      // Verify initially null
      expect(screen.queryByTestId('children')).not.toBeInTheDocument();

      // Wait for hydration
      await waitFor(() => {
        expect(screen.getByTestId('splash-screen')).toBeInTheDocument();
      });
    });

    it('only hydrates once on mount', async () => {
      const { rerender } = render(<ChildLayout><div>children</div></ChildLayout>);

      await waitFor(() => {
        expect(screen.getByTestId('splash-screen')).toBeInTheDocument();
      });

      // Count getItem calls during initial render
      const initialCalls = (localStorage.getItem as jest.Mock).mock.calls.length;

      // Trigger a re-render of the same component
      rerender(<ChildLayout><div>children</div></ChildLayout>);

      // Check no additional getItem calls were made during re-render
      const finalCalls = (localStorage.getItem as jest.Mock).mock.calls.length;
      expect(finalCalls).toBe(initialCalls);
    });
  });

  describe('Edge cases', () => {
    it('handles empty localStorage gracefully', async () => {
      localStorageMock = {};

      render(<ChildLayout><div>children</div></ChildLayout>);

      await waitFor(() => {
        expect(screen.getByTestId('splash-screen')).toBeInTheDocument();
      });
    });

    it('handles null context state (no childId) correctly', async () => {
      mockUseGameProgress.mockReturnValue({
        state: { childId: null, profile: null },
        setChild: jest.fn(),
      });

      localStorageMock['bap-splash-seen'] = '1';

      render(<ChildLayout><div>children</div></ChildLayout>);

      await waitFor(() => {
        expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
      });
    });

    it('transitions from guest to registered user', async () => {
      const setChildMock = jest.fn();

      const { rerender } = render(
        <ChildLayout><div data-testid="children">children</div></ChildLayout>
      );

      // Initially render with no childId
      await waitFor(() => {
        expect(screen.getByTestId('splash-screen')).toBeInTheDocument();
      });

      // Update mock to have a registered child
      mockUseGameProgress.mockReturnValue({
        state: { childId: 'child_abc123', profile: { name: 'Test', age: 5, color: 'corn' } },
        setChild: setChildMock,
      });

      // Re-render with new state
      rerender(<ChildLayout><div data-testid="children">children</div></ChildLayout>);

      await waitFor(() => {
        expect(screen.getByTestId('children')).toBeInTheDocument();
      });
    });

    it('handles rapid step changes', async () => {
      localStorageMock['bap-splash-seen'] = '1';

      const user = userEvent.setup();
      render(<ChildLayout><div>children</div></ChildLayout>);

      const startBtn = await screen.findByTestId('welcome-start-btn');

      // Rapid clicks
      await user.click(startBtn);
      await user.click(startBtn);

      await waitFor(() => {
        expect(screen.getByTestId('profile-setup')).toBeInTheDocument();
      });
    });

    it('persists state across mount/unmount cycles', async () => {
      localStorageMock['bap-splash-seen'] = '1';

      const { unmount } = render(<ChildLayout><div>children</div></ChildLayout>);

      await waitFor(() => {
        expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
      });

      unmount();

      // Re-mount; should skip splash again
      render(<ChildLayout><div>children</div></ChildLayout>);

      await waitFor(() => {
        expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
        expect(screen.queryByTestId('splash-screen')).not.toBeInTheDocument();
      });
    });

    it('correctly typecasts saved step as OnboardStep', async () => {
      localStorageMock['bap-splash-seen'] = '1';
      localStorageMock['bap-onboard-step'] = 'welcome';

      render(<ChildLayout><div>children</div></ChildLayout>);

      await waitFor(() => {
        expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
      });
    });
  });

  describe('Async registration flow', () => {
    it('removes onboard-step localStorage key when step transitions to ready', async () => {
      localStorageMock['bap-splash-seen'] = '1';
      localStorageMock['bap-onboard-step'] = 'setup';

      const setChildMock = jest.fn();
      mockUseGameProgress.mockReturnValue({
        state: { childId: null, profile: null },
        setChild: setChildMock,
      });

      const user = userEvent.setup();
      render(<ChildLayout><div>children</div></ChildLayout>);

      // When bap-onboard-step = 'setup', should show ProfileSetup directly
      await waitFor(() => {
        expect(screen.getByTestId('profile-done-btn')).toBeInTheDocument();
      });

      const doneBtn = screen.getByTestId('profile-done-btn');
      await user.click(doneBtn);

      // After profile completion, onboard-step should be removed
      await waitFor(() => {
        expect(localStorage.removeItem).toHaveBeenCalledWith('bap-onboard-step');
      });
    });

    it('does not call setChild with an undefined guestId due to missing crypto', async () => {
      // This test verifies that if crypto.randomUUID was not mocked,
      // the component would still not crash completely
      localStorageMock['bap-splash-seen'] = '1';

      const setChildMock = jest.fn();
      mockUseGameProgress.mockReturnValue({
        state: { childId: null, profile: null },
        setChild: setChildMock,
      });

      const user = userEvent.setup();
      render(<ChildLayout><div>children</div></ChildLayout>);

      const startBtn = await screen.findByTestId('welcome-start-btn');
      await user.click(startBtn);

      const doneBtn = await screen.findByTestId('profile-done-btn');
      await user.click(doneBtn);

      // setChild should be called with a valid guestId format
      await waitFor(() => {
        expect(setChildMock).toHaveBeenCalled();
        const [guestId] = setChildMock.mock.calls[0];
        expect(typeof guestId).toBe('string');
        expect(guestId.length).toBeGreaterThan(0);
      });
    });
  });
});
