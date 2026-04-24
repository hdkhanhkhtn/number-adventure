/**
 * @jest-environment jsdom
 *
 * Tests for GameHud component — top game chrome with close button, progress, and hearts
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { GameHud } from '@/components/game/game-hud';

// Mock IconBtn and ProgressBar to isolate GameHud logic
jest.mock('@/components/ui/icon-btn', () => ({
  IconBtn: ({
    onClick,
    'aria-label': ariaLabel,
    children,
    ...props
  }: any) => (
    // eslint-disable-next-line react/button-has-type
    <button onClick={onClick} aria-label={ariaLabel} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/progress-bar', () => ({
  ProgressBar: ({ value, max }: any) => (
    <div data-testid="progress-bar" data-value={value} data-max={max} />
  ),
}));

describe('GameHud', () => {
  it('renders close button with correct aria-label', () => {
    render(<GameHud onClose={jest.fn()} />);
    expect(screen.getByRole('button', { name: /Exit game/i })).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();

    render(<GameHud onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: /Exit game/i });
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders progress bar component', () => {
    render(<GameHud progress={2} total={5} onClose={jest.fn()} />);
    expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
  });

  it('passes correct progress values to ProgressBar', () => {
    render(<GameHud progress={3} total={10} onClose={jest.fn()} />);
    const progressBar = screen.getByTestId('progress-bar');

    expect(progressBar).toHaveAttribute('data-value', '3');
    expect(progressBar).toHaveAttribute('data-max', '10');
  });

  it('has progressbar role with correct aria attributes', () => {
    render(<GameHud progress={2} total={5} onClose={jest.fn()} />);
    const progressBar = screen.getByRole('progressbar');

    expect(progressBar).toHaveAttribute('aria-valuenow', '2');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '5');
  });

  it('has progressbar aria-label indicating question progress', () => {
    render(<GameHud progress={3} total={7} onClose={jest.fn()} />);
    const progressBar = screen.getByRole('progressbar');

    expect(progressBar).toHaveAttribute('aria-label', 'Question 3 of 7');
  });

  it('renders hearts counter with correct count', () => {
    render(<GameHud hearts={3} onClose={jest.fn()} />);
    expect(screen.getByText(/❤️ 3/)).toBeInTheDocument();
  });

  it('renders hearts with singular "life" label when hearts=1', () => {
    render(<GameHud hearts={1} onClose={jest.fn()} />);
    const heartsArea = screen.getByLabelText(/1 life remaining/i);
    expect(heartsArea).toBeInTheDocument();
  });

  it('renders hearts with plural "lives" label when hearts > 1', () => {
    render(<GameHud hearts={2} onClose={jest.fn()} />);
    const heartsArea = screen.getByLabelText(/2 lives remaining/i);
    expect(heartsArea).toBeInTheDocument();
  });

  it('renders hearts with plural "lives" label when hearts = 0', () => {
    render(<GameHud hearts={0} onClose={jest.fn()} />);
    const heartsArea = screen.getByLabelText(/0 lives remaining/i);
    expect(heartsArea).toBeInTheDocument();
  });

  it('uses default values when props not provided', () => {
    render(<GameHud onClose={jest.fn()} />);

    // Default hearts=3
    expect(screen.getByText(/❤️ 3/)).toBeInTheDocument();

    // Default progress=0, total=5
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '5');
  });

  it('updates when props change', () => {
    const { rerender } = render(<GameHud hearts={3} progress={1} total={5} onClose={jest.fn()} />);

    expect(screen.getByText(/❤️ 3/)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');

    rerender(<GameHud hearts={2} progress={2} total={5} onClose={jest.fn()} />);

    expect(screen.getByText(/❤️ 2/)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');
  });

  it('handles edge case: progress equals total', () => {
    render(<GameHud progress={5} total={5} onClose={jest.fn()} />);
    const progressBar = screen.getByRole('progressbar');

    expect(progressBar).toHaveAttribute('aria-valuenow', '5');
    expect(progressBar).toHaveAttribute('aria-valuemax', '5');
  });

  it('handles high heart count', () => {
    render(<GameHud hearts={10} onClose={jest.fn()} />);
    expect(screen.getByText(/❤️ 10/)).toBeInTheDocument();
  });

  it('renders all three main sections: close button, progress, hearts', () => {
    const { container } = render(<GameHud hearts={3} progress={2} total={5} onClose={jest.fn()} />);

    // Close button (via IconBtn)
    expect(screen.getByRole('button', { name: /Exit game/i })).toBeInTheDocument();

    // Progress bar
    expect(screen.getByTestId('progress-bar')).toBeInTheDocument();

    // Hearts display
    expect(screen.getByText(/❤️ 3/)).toBeInTheDocument();
  });

  it('maintains correct structure on re-render', () => {
    const onClose = jest.fn();
    const { rerender } = render(<GameHud hearts={3} progress={0} total={5} onClose={onClose} />);

    rerender(<GameHud hearts={3} progress={1} total={5} onClose={onClose} />);
    rerender(<GameHud hearts={2} progress={2} total={5} onClose={onClose} />);

    // All elements should still be present
    expect(screen.getByRole('button', { name: /Exit game/i })).toBeInTheDocument();
    expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
    expect(screen.getByText(/❤️ 2/)).toBeInTheDocument();
  });

  it('has proper accessibility structure', () => {
    render(<GameHud hearts={3} progress={2} total={5} onClose={jest.fn()} />);

    // Close button should be accessible
    const closeButton = screen.getByRole('button', { name: /Exit game/i });
    expect(closeButton).toBeInTheDocument();

    // Progress bar should have proper ARIA attributes
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow');
    expect(progressBar).toHaveAttribute('aria-valuemin');
    expect(progressBar).toHaveAttribute('aria-valuemax');
    expect(progressBar).toHaveAttribute('aria-label');

    // Hearts should have descriptive label
    expect(screen.getByLabelText(/3 lives remaining/i)).toBeInTheDocument();
  });
});
