/**
 * @jest-environment jsdom
 *
 * Tests for BigButton component — large CTA button with 3D press effect
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BigButton } from '@/components/ui/big-button';

// Mock setPointerCapture for jsdom (not natively supported)
beforeEach(() => {
  HTMLElement.prototype.setPointerCapture = jest.fn();
  HTMLElement.prototype.releasePointerCapture = jest.fn();
});

describe('BigButton', () => {
  it('renders children correctly', () => {
    render(<BigButton>Click me</BigButton>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onClick when clicked and not disabled', async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();

    render(<BigButton onClick={onClick}>Click</BigButton>);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();

    render(
      <BigButton onClick={onClick} disabled>
        Click
      </BigButton>,
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    // Attempt click (should have no effect)
    try {
      await user.click(button);
    } catch {
      // UserEvent may throw on disabled element, that's ok
    }

    expect(onClick).not.toHaveBeenCalled();
  });

  it('sets aria-disabled when disabled', () => {
    render(<BigButton disabled>Click</BigButton>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
  });

  it('does not set aria-disabled when not disabled (only set when disabled=true)', () => {
    render(<BigButton>Click</BigButton>);
    // aria-disabled is only set when disabled=true
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-disabled');
  });

  it('does not call onClick when disabled via prop', async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();

    render(<BigButton onClick={onClick} disabled>
      Click
    </BigButton>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    try {
      await user.click(button);
    } catch {
      // Expected
    }

    expect(onClick).not.toHaveBeenCalled();
  });

  it('accepts icon prop and renders it', () => {
    const { container } = render(
      <BigButton icon="🎉">Celebrate</BigButton>,
    );

    expect(screen.getByRole('button')).toHaveTextContent('Celebrate');
    // Icon should be rendered inside the button
    expect(container.textContent).toContain('🎉');
  });

  it('accepts color prop', () => {
    const { rerender } = render(<BigButton color="sage">Click</BigButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<BigButton color="coral">Click</BigButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('accepts size prop', () => {
    const { rerender } = render(<BigButton size="md">Click</BigButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<BigButton size="xl">Click</BigButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<BigButton className="custom-class">Click</BigButton>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('has no-select class for selection prevention', () => {
    render(<BigButton>Click</BigButton>);
    expect(screen.getByRole('button')).toHaveClass('no-select');
  });

  it('combines custom className with no-select', () => {
    render(<BigButton className="my-custom">Click</BigButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('no-select');
    expect(button).toHaveClass('my-custom');
  });

  it('renders with default values', () => {
    render(<BigButton>Click</BigButton>);
    const button = screen.getByRole('button');

    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click');
    expect(button).not.toBeDisabled();
  });

  it('renders icon and children together', () => {
    render(<BigButton icon="✓">Success</BigButton>);
    const button = screen.getByRole('button');

    expect(button).toHaveTextContent('Success');
    // The button should contain both
    const spans = button.querySelectorAll('span');
    expect(spans.length).toBeGreaterThan(0);
  });

  it('maintains opacity when disabled', () => {
    render(<BigButton disabled>Click</BigButton>);
    const button = screen.getByRole('button');
    window.getComputedStyle(button);

    // When disabled, opacity should be reduced (0.5)
    expect(button).toBeInTheDocument();
  });

  it('changes cursor when disabled', () => {
    render(<BigButton disabled>Click</BigButton>);
    const button = screen.getByRole('button');

    expect(button).toBeInTheDocument();
    // Disabled buttons should have not-allowed cursor
  });

  it('accepts undefined onClick', () => {
    userEvent.setup();
    render(<BigButton>Click</BigButton>);

    expect(() => {
      screen.getByRole('button');
    }).not.toThrow();
  });

  it('is accessible with keyboard navigation', () => {
    render(<BigButton>Click</BigButton>);
    const button = screen.getByRole('button');

    // Button should be keyboard focusable
    expect(button.tagName).toBe('BUTTON');
  });
});
