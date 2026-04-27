/**
 * Tests for SaveProgressBanner component
 * Tests rendering, interaction, and error display.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SaveProgressBanner } from '@/components/screens/save-progress-banner';

describe('SaveProgressBanner', () => {
  describe('rendering', () => {
    it('renders the banner with correct text', () => {
      const onSave = jest.fn();
      const onDismiss = jest.fn();

      render(
        <SaveProgressBanner onSave={onSave} onDismiss={onDismiss} />
      );

      expect(screen.getByText('Your progress is saved on this device')).toBeInTheDocument();
      expect(screen.getByText('Link to your account to keep it safe')).toBeInTheDocument();
    });

    it('renders mascot emoji', () => {
      const onSave = jest.fn();
      const onDismiss = jest.fn();

      render(
        <SaveProgressBanner onSave={onSave} onDismiss={onDismiss} />
      );

      expect(screen.getByText('🌱')).toBeInTheDocument();
    });

    it('renders "Link account" button', () => {
      const onSave = jest.fn();
      const onDismiss = jest.fn();

      render(
        <SaveProgressBanner onSave={onSave} onDismiss={onDismiss} />
      );

      expect(screen.getByRole('button', { name: 'Link account' })).toBeInTheDocument();
    });

    it('renders dismiss button with aria-label', () => {
      const onSave = jest.fn();
      const onDismiss = jest.fn();

      render(
        <SaveProgressBanner onSave={onSave} onDismiss={onDismiss} />
      );

      expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
    });

    it('does not render error message when error prop is undefined', () => {
      const onSave = jest.fn();
      const onDismiss = jest.fn();

      render(
        <SaveProgressBanner onSave={onSave} onDismiss={onDismiss} />
      );

      expect(screen.queryByText(/error|try again/i)).not.toBeInTheDocument();
    });

    it('does not render error message when error prop is empty string', () => {
      const onSave = jest.fn();
      const onDismiss = jest.fn();

      render(
        <SaveProgressBanner onSave={onSave} onDismiss={onDismiss} error="" />
      );

      expect(screen.queryByText(/could not|failed/i)).not.toBeInTheDocument();
    });
  });

  describe('error display', () => {
    it('renders error message when error prop is provided', () => {
      const onSave = jest.fn();
      const onDismiss = jest.fn();
      const errorMsg = 'Could not save. Please try again.';

      render(
        <SaveProgressBanner onSave={onSave} onDismiss={onDismiss} error={errorMsg} />
      );

      expect(screen.getByText(errorMsg)).toBeInTheDocument();
    });

    it('displays different error messages', () => {
      const onSave = jest.fn();
      const onDismiss = jest.fn();
      const errorMsg = 'No connection. Please try again.';

      render(
        <SaveProgressBanner onSave={onSave} onDismiss={onDismiss} error={errorMsg} />
      );

      expect(screen.getByText(errorMsg)).toBeInTheDocument();
    });

    it('error message is rendered when error prop is provided', () => {
      const onSave = jest.fn();
      const onDismiss = jest.fn();
      const errorMsg = 'Connection failed';

      render(
        <SaveProgressBanner onSave={onSave} onDismiss={onDismiss} error={errorMsg} />
      );

      // Error message should be visible
      expect(screen.getByText(errorMsg)).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onSave when "Link account" button is clicked', () => {
      const onSave = jest.fn();
      const onDismiss = jest.fn();

      render(
        <SaveProgressBanner onSave={onSave} onDismiss={onDismiss} />
      );

      const linkButton = screen.getByRole('button', { name: 'Link account' });
      fireEvent.click(linkButton);

      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onDismiss).not.toHaveBeenCalled();
    });

    it('calls onDismiss when dismiss button is clicked', () => {
      const onSave = jest.fn();
      const onDismiss = jest.fn();

      render(
        <SaveProgressBanner onSave={onSave} onDismiss={onDismiss} />
      );

      const dismissButton = screen.getByRole('button', { name: 'Dismiss' });
      fireEvent.click(dismissButton);

      expect(onDismiss).toHaveBeenCalledTimes(1);
      expect(onSave).not.toHaveBeenCalled();
    });

    it('can handle multiple clicks on save button', () => {
      const onSave = jest.fn();
      const onDismiss = jest.fn();

      render(
        <SaveProgressBanner onSave={onSave} onDismiss={onDismiss} />
      );

      const linkButton = screen.getByRole('button', { name: 'Link account' });
      fireEvent.click(linkButton);
      fireEvent.click(linkButton);

      expect(onSave).toHaveBeenCalledTimes(2);
    });

    it('can handle multiple clicks on dismiss button', () => {
      const onSave = jest.fn();
      const onDismiss = jest.fn();

      render(
        <SaveProgressBanner onSave={onSave} onDismiss={onDismiss} />
      );

      const dismissButton = screen.getByRole('button', { name: 'Dismiss' });
      fireEvent.click(dismissButton);
      fireEvent.click(dismissButton);

      expect(onDismiss).toHaveBeenCalledTimes(2);
    });

    it('does not mix up onSave and onDismiss callbacks', () => {
      const onSave = jest.fn();
      const onDismiss = jest.fn();

      render(
        <SaveProgressBanner onSave={onSave} onDismiss={onDismiss} />
      );

      const linkButton = screen.getByRole('button', { name: 'Link account' });
      const dismissButton = screen.getByRole('button', { name: 'Dismiss' });

      fireEvent.click(linkButton);
      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onDismiss).not.toHaveBeenCalled();

      fireEvent.click(dismissButton);
      expect(onDismiss).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('mascot emoji has aria-hidden="true"', () => {
      const onSave = jest.fn();
      const onDismiss = jest.fn();

      render(
        <SaveProgressBanner onSave={onSave} onDismiss={onDismiss} />
      );

      const emoji = screen.getByText('🌱');
      expect(emoji).toHaveAttribute('aria-hidden', 'true');
    });

    it('dismiss button has aria-label', () => {
      const onSave = jest.fn();
      const onDismiss = jest.fn();

      render(
        <SaveProgressBanner onSave={onSave} onDismiss={onDismiss} />
      );

      const dismissButton = screen.getByRole('button', { name: 'Dismiss' });
      expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss');
    });

    it('buttons are keyboard accessible and have proper roles', () => {
      const onSave = jest.fn();
      const onDismiss = jest.fn();

      render(
        <SaveProgressBanner onSave={onSave} onDismiss={onDismiss} />
      );

      const linkButton = screen.getByRole('button', { name: 'Link account' });
      const dismissButton = screen.getByRole('button', { name: 'Dismiss' });

      expect(linkButton.tagName).toBe('BUTTON');
      expect(dismissButton.tagName).toBe('BUTTON');
    });
  });

  describe('styling & layout', () => {
    it('banner is absolutely positioned for sticky/fixed layout', () => {
      const onSave = jest.fn();
      const onDismiss = jest.fn();

      const { container } = render(
        <SaveProgressBanner onSave={onSave} onDismiss={onDismiss} />
      );

      // Find the outer container (first div in component)
      const bannerContainer = container.firstChild as HTMLElement;
      expect(bannerContainer).toBeTruthy();
      expect(bannerContainer.style.position).toBe('fixed');
    });

    it('banner has layering z-index', () => {
      const onSave = jest.fn();
      const onDismiss = jest.fn();

      const { container } = render(
        <SaveProgressBanner onSave={onSave} onDismiss={onDismiss} />
      );

      const bannerContainer = container.firstChild as HTMLElement;
      // z-index should be set for layering
      expect(bannerContainer.style.zIndex).toBeTruthy();
    });
  });

  describe('props handling', () => {
    it('accepts and uses onSave callback prop', () => {
      const onSave = jest.fn();
      const onDismiss = jest.fn();

      render(
        <SaveProgressBanner onSave={onSave} onDismiss={onDismiss} />
      );

      const linkButton = screen.getByRole('button', { name: 'Link account' });
      fireEvent.click(linkButton);

      expect(onSave).toHaveBeenCalled();
    });

    it('accepts and uses onDismiss callback prop', () => {
      const onSave = jest.fn();
      const onDismiss = jest.fn();

      render(
        <SaveProgressBanner onSave={onSave} onDismiss={onDismiss} />
      );

      const dismissButton = screen.getByRole('button', { name: 'Dismiss' });
      fireEvent.click(dismissButton);

      expect(onDismiss).toHaveBeenCalled();
    });

    it('accepts and uses optional error prop', () => {
      const onSave = jest.fn();
      const onDismiss = jest.fn();

      render(
        <SaveProgressBanner onSave={onSave} onDismiss={onDismiss} error="Test error" />
      );

      expect(screen.getByText('Test error')).toBeInTheDocument();
    });
  });
});
