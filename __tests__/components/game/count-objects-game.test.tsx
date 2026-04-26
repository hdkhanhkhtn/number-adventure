/**
 * @jest-environment jsdom
 *
 * Tests for CountObjectsGame component — emoji counting mini-game with choice selection
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { CountObjectsGame } from '@/app/(child)/play/[gameType]/[lessonId]/count-objects-game';
import type { CountObjectsQuestion, GameResult } from '@/lib/game-engine/types';

// Mock external dependencies
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, onClick, ...props }: any) => (
      <button onClick={onClick} {...props}>
        {children}
      </button>
    ),
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

jest.mock('@/lib/hooks/use-sound-effects', () => ({
  useSoundEffects: () => ({
    playCorrect: jest.fn(),
    playWrong: jest.fn(),
    playLevelComplete: jest.fn(),
  }),
}));

jest.mock('@/components/game/game-container', () => ({
  GameContainer: ({ children, variant }: any) => (
    <div data-testid="game-container" data-variant={variant}>
      {children}
    </div>
  ),
}));

jest.mock('@/components/game/game-hud', () => ({
  GameHud: ({ hearts, progress, total, onClose }: any) => (
    <div data-testid="game-hud" data-hearts={hearts} data-progress={progress} data-total={total}>
      <button onClick={onClose} data-testid="close-button">
        Close
      </button>
    </div>
  ),
}));

jest.mock('@/components/ui/sparkles', () => ({
  Sparkles: () => <div data-testid="sparkles" />,
}));

jest.mock('@/components/ui/num-tile', () => ({
  NumTile: ({ n, onClick, state, color, size }: any) => (
    <button
      data-testid={`num-tile-${n}`}
      onClick={onClick}
      data-state={state}
      data-color={color}
      data-size={size}
    >
      {n}
    </button>
  ),
}));

// Mock useGame hook
const mockUseGame = jest.fn();
jest.mock('@/lib/hooks/use-game', () => ({
  useGame: (...args: any[]) => mockUseGame(...args),
}));

describe('CountObjectsGame', () => {
  const sampleQuestions: CountObjectsQuestion[] = [
    {
      type: 'count-objects',
      items: ['🍎', '🍎', '🍎'],
      answer: 3,
      choices: [1, 2, 3, 4],
    },
    {
      type: 'count-objects',
      items: ['🚗', '🚗'],
      answer: 2,
      choices: [1, 2, 3, 4],
    },
    {
      type: 'count-objects',
      items: ['⭐', '⭐', '⭐', '⭐'],
      answer: 4,
      choices: [1, 2, 3, 4],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGame.mockReturnValue({
      round: 0,
      hearts: 3,
      question: sampleQuestions[0],
      totalRounds: sampleQuestions.length,
      handleCorrect: jest.fn(),
      handleWrong: jest.fn(),
    });
  });

  it('renders game container with sun variant', () => {
    const onComplete = jest.fn();
    const onExit = jest.fn();
    const onAttempt = jest.fn();

    render(
      <CountObjectsGame
        questions={sampleQuestions}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    expect(screen.getByTestId('game-container')).toHaveAttribute('data-variant', 'sun');
  });

  it('renders game hud with correct stats', () => {
    const onComplete = jest.fn();
    const onExit = jest.fn();
    const onAttempt = jest.fn();

    render(
      <CountObjectsGame
        questions={sampleQuestions}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    const hud = screen.getByTestId('game-hud');
    expect(hud).toHaveAttribute('data-hearts', '3');
    expect(hud).toHaveAttribute('data-progress', '0');
    expect(hud).toHaveAttribute('data-total', '3');
  });

  it('renders emoji items for the current question', () => {
    const onComplete = jest.fn();
    const onExit = jest.fn();
    const onAttempt = jest.fn();

    render(
      <CountObjectsGame
        questions={sampleQuestions}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    // Question has 3 apples
    expect(screen.getAllByText('🍎')).toHaveLength(3);
  });

  it('renders number tiles with shuffled choices', () => {
    const onComplete = jest.fn();
    const onExit = jest.fn();
    const onAttempt = jest.fn();

    render(
      <CountObjectsGame
        questions={sampleQuestions}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    const choices = sampleQuestions[0].choices;
    choices.forEach((choice) => {
      expect(screen.getByTestId(`num-tile-${choice}`)).toBeInTheDocument();
    });
  });

  it('calls onAttempt with correct answer when correct choice is selected', async () => {
    const onComplete = jest.fn();
    const onExit = jest.fn();
    const onAttempt = jest.fn();
    const handleCorrect = jest.fn();

    mockUseGame.mockReturnValue({
      round: 0,
      hearts: 3,
      question: sampleQuestions[0],
      totalRounds: sampleQuestions.length,
      handleCorrect,
      handleWrong: jest.fn(),
    });

    render(
      <CountObjectsGame
        questions={sampleQuestions}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    const correctTile = screen.getByTestId('num-tile-3');
    await userEvent.click(correctTile);

    expect(onAttempt).toHaveBeenCalledWith('3', true);
  });

  it('calls onAttempt with false when wrong choice is selected', async () => {
    const onComplete = jest.fn();
    const onExit = jest.fn();
    const onAttempt = jest.fn();
    const handleWrong = jest.fn();

    mockUseGame.mockReturnValue({
      round: 0,
      hearts: 3,
      question: sampleQuestions[0],
      totalRounds: sampleQuestions.length,
      handleCorrect: jest.fn(),
      handleWrong,
    });

    render(
      <CountObjectsGame
        questions={sampleQuestions}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    const wrongTile = screen.getByTestId('num-tile-1');
    await userEvent.click(wrongTile);

    expect(onAttempt).toHaveBeenCalledWith('1', false);
  });

  it('records correct answer when correct tile is tapped', async () => {
    const onComplete = jest.fn();
    const onExit = jest.fn();
    const onAttempt = jest.fn();
    const handleCorrect = jest.fn();

    mockUseGame.mockReturnValue({
      round: 0,
      hearts: 3,
      question: sampleQuestions[0],
      totalRounds: sampleQuestions.length,
      handleCorrect,
      handleWrong: jest.fn(),
    });

    render(
      <CountObjectsGame
        questions={sampleQuestions}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    const correctTile = screen.getByTestId('num-tile-3');
    await userEvent.click(correctTile);

    // onAttempt should be called with correct answer
    expect(onAttempt).toHaveBeenCalledWith('3', true);
  }, 10000);

  it('calls handleWrong after wrong answer', async () => {
    const onComplete = jest.fn();
    const onExit = jest.fn();
    const onAttempt = jest.fn();
    const handleWrong = jest.fn();

    mockUseGame.mockReturnValue({
      round: 0,
      hearts: 3,
      question: sampleQuestions[0],
      totalRounds: sampleQuestions.length,
      handleCorrect: jest.fn(),
      handleWrong,
    });

    render(
      <CountObjectsGame
        questions={sampleQuestions}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    const wrongTile = screen.getByTestId('num-tile-1');
    await userEvent.click(wrongTile);

    expect(handleWrong).toHaveBeenCalledTimes(1);
  }, 10000);

  it('prevents multiple selections after correct answer', async () => {
    const onComplete = jest.fn();
    const onExit = jest.fn();
    const onAttempt = jest.fn();

    mockUseGame.mockReturnValue({
      round: 0,
      hearts: 3,
      question: sampleQuestions[0],
      totalRounds: sampleQuestions.length,
      handleCorrect: jest.fn(),
      handleWrong: jest.fn(),
    });

    render(
      <CountObjectsGame
        questions={sampleQuestions}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    const correctTile = screen.getByTestId('num-tile-3');
    const wrongTile = screen.getByTestId('num-tile-1');

    await userEvent.click(correctTile);

    // Try to click another tile after correct answer
    await userEvent.click(wrongTile);

    // onAttempt should only have been called once (for the correct answer)
    expect(onAttempt).toHaveBeenCalledTimes(1);
    expect(onAttempt).toHaveBeenCalledWith('3', true);
  }, 10000);

  it('calls onExit when close button is clicked', async () => {
    const onComplete = jest.fn();
    const onExit = jest.fn();
    const onAttempt = jest.fn();

    render(
      <CountObjectsGame
        questions={sampleQuestions}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    const closeButton = screen.getByTestId('close-button');
    await userEvent.click(closeButton);

    expect(onExit).toHaveBeenCalledTimes(1);
  }, 10000);

  it('renders null when question is not loaded', () => {
    mockUseGame.mockReturnValue({
      round: 0,
      hearts: 3,
      question: null,
      totalRounds: sampleQuestions.length,
      handleCorrect: jest.fn(),
      handleWrong: jest.fn(),
    });

    const onComplete = jest.fn();
    const onExit = jest.fn();
    const onAttempt = jest.fn();

    const { container } = render(
      <CountObjectsGame
        questions={sampleQuestions}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('updates question when round changes', () => {
    const onComplete = jest.fn();
    const onExit = jest.fn();
    const onAttempt = jest.fn();
    const { rerender } = render(
      <CountObjectsGame
        questions={sampleQuestions}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    expect(screen.getAllByText('🍎')).toHaveLength(3);

    // Update to second question (2 cars)
    mockUseGame.mockReturnValue({
      round: 1,
      hearts: 3,
      question: sampleQuestions[1],
      totalRounds: sampleQuestions.length,
      handleCorrect: jest.fn(),
      handleWrong: jest.fn(),
    });

    rerender(
      <CountObjectsGame
        questions={sampleQuestions}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    expect(screen.getAllByText('🚗')).toHaveLength(2);
  });

  it('displays question title "HOW MANY DO YOU SEE?"', () => {
    const onComplete = jest.fn();
    const onExit = jest.fn();
    const onAttempt = jest.fn();

    render(
      <CountObjectsGame
        questions={sampleQuestions}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    expect(screen.getByText(/HOW MANY DO YOU SEE\?/)).toBeInTheDocument();
  });

  it('handles edge case with single emoji item', () => {
    const singleItemQuestion: CountObjectsQuestion = {
      type: 'count-objects',
      items: ['🌟'],
      answer: 1,
      choices: [1, 2, 3, 4],
    };

    mockUseGame.mockReturnValue({
      round: 0,
      hearts: 3,
      question: singleItemQuestion,
      totalRounds: 1,
      handleCorrect: jest.fn(),
      handleWrong: jest.fn(),
    });

    const onComplete = jest.fn();
    const onExit = jest.fn();
    const onAttempt = jest.fn();

    render(
      <CountObjectsGame
        questions={[singleItemQuestion]}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    expect(screen.getAllByText('🌟')).toHaveLength(1);
  });

  it('updates hearts display when hearts change', () => {
    const onComplete = jest.fn();
    const onExit = jest.fn();
    const onAttempt = jest.fn();
    const { rerender } = render(
      <CountObjectsGame
        questions={sampleQuestions}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    expect(screen.getByTestId('game-hud')).toHaveAttribute('data-hearts', '3');

    // Update hearts to 1
    mockUseGame.mockReturnValue({
      round: 0,
      hearts: 1,
      question: sampleQuestions[0],
      totalRounds: sampleQuestions.length,
      handleCorrect: jest.fn(),
      handleWrong: jest.fn(),
    });

    rerender(
      <CountObjectsGame
        questions={sampleQuestions}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    expect(screen.getByTestId('game-hud')).toHaveAttribute('data-hearts', '1');
  });
});
