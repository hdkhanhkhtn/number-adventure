/**
 * @jest-environment jsdom
 *
 * Tests for IosInstallPrompt component
 * Covers: display logic, visit counter, dismiss behavior, non-iOS suppression
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IosInstallPrompt } from '@/components/pwa/ios-install-prompt';

// ── Navigator mock helpers ────────────────────────────────────

function setUserAgent(ua: string) {
  Object.defineProperty(navigator, 'userAgent', {
    value: ua,
    configurable: true,
  });
}

function setStandalone(value: boolean) {
  Object.defineProperty(navigator, 'standalone', {
    value,
    configurable: true,
    writable: true,
  });
}

const IOS_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15';
const ANDROID_UA = 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/112.0.0.0 Mobile';

const DISMISSED_KEY = 'bap-ios-install-dismissed';
const VISIT_KEY = 'bap-visit-count';

// ── Tests ─────────────────────────────────────────────────────

describe('IosInstallPrompt', () => {
  beforeEach(() => {
    localStorage.clear();
    setStandalone(false);
  });

  describe('non-iOS suppression', () => {
    it('renders nothing on Android Chrome', () => {
      setUserAgent(ANDROID_UA);
      const { container } = render(<IosInstallPrompt />);
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing on desktop', () => {
      setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
      const { container } = render(<IosInstallPrompt />);
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing when already in standalone mode (installed)', () => {
      setUserAgent(IOS_UA);
      setStandalone(true);
      const { container } = render(<IosInstallPrompt />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('visit counter gate', () => {
    beforeEach(() => setUserAgent(IOS_UA));

    it('does not show on first visit (count becomes 1, need 3)', () => {
      const { container } = render(<IosInstallPrompt />);
      expect(container.firstChild).toBeNull();
      expect(localStorage.getItem(VISIT_KEY)).toBe('1');
    });

    it('does not show on second visit', () => {
      localStorage.setItem(VISIT_KEY, '1');
      const { container } = render(<IosInstallPrompt />);
      expect(container.firstChild).toBeNull();
      expect(localStorage.getItem(VISIT_KEY)).toBe('2');
    });

    it('shows on third visit', () => {
      localStorage.setItem(VISIT_KEY, '2');
      render(<IosInstallPrompt />);
      expect(screen.getByText(/Add to Home Screen/i)).toBeInTheDocument();
    });

    it('shows on fourth and subsequent visits', () => {
      localStorage.setItem(VISIT_KEY, '5');
      render(<IosInstallPrompt />);
      expect(screen.getByText(/Add to Home Screen/i)).toBeInTheDocument();
    });
  });

  describe('dismiss behavior', () => {
    beforeEach(() => {
      setUserAgent(IOS_UA);
      localStorage.setItem(VISIT_KEY, '2'); // will become 3 → shows
    });

    it('hides banner after dismiss click', () => {
      render(<IosInstallPrompt />);
      expect(screen.getByText(/Add to Home Screen/i)).toBeInTheDocument();

      const dismissBtn = screen.getByRole('button', { name: /dismiss/i });
      act(() => { fireEvent.click(dismissBtn); });

      expect(screen.queryByText(/Add to Home Screen/i)).not.toBeInTheDocument();
    });

    it('sets localStorage dismissed flag on dismiss', () => {
      render(<IosInstallPrompt />);
      const dismissBtn = screen.getByRole('button', { name: /dismiss/i });
      act(() => { fireEvent.click(dismissBtn); });

      expect(localStorage.getItem(DISMISSED_KEY)).toBe('true');
    });

    it('does not show if already dismissed in a previous session', () => {
      localStorage.setItem(DISMISSED_KEY, 'true');
      const { container } = render(<IosInstallPrompt />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('prompt content', () => {
    beforeEach(() => {
      setUserAgent(IOS_UA);
      localStorage.setItem(VISIT_KEY, '2');
    });

    it('shows Share button icon instruction', () => {
      render(<IosInstallPrompt />);
      expect(screen.getByText(/Share button/i)).toBeInTheDocument();
    });

    it('shows "Add to Home Screen" instruction text', () => {
      render(<IosInstallPrompt />);
      expect(screen.getByText(/Add to Home Screen/i)).toBeInTheDocument();
    });

    it('renders dismiss button with accessible label', () => {
      render(<IosInstallPrompt />);
      expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
    });
  });
});
