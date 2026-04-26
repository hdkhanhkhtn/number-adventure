/**
 * @jest-environment jsdom
 *
 * Tests for NumberWritingGame component — digit tracing with dot-tap mechanics
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { NumberWritingGame } from '@/app/(child)/play/[gameType]/[lessonId]/number-writing-game';
import type { NumberWritingQuestion, GameResult, DotPoint } from '@/lib/game-engine/types';

// Mock external dependencies
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, onClick, disabled, animate, transition, ...props }: any) => (
      <button onClick={onClick} disabled={disabled} {...props}>
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

jest.mock('@/lib/game-engine/dot-paths', () => ({
  DIGIT_SVG_PATHS: {
    0: 'M100,22 C145,22 170,70 170,140 C170,210 145,258 100,258 C55,258 30,210 30,140 C30,70 55,22 100,22 Z',
    1: 'M70,56 L100,22 L100,258',
    2: 'M35,70 C35,35 65,22 100,22 C135,22 165,40 165,70 C165,110 100,154 35,246 L165,246',
    3: 'M40,42 L120,22 C155,22 170,50 170,78 C170,110 145,126 120,126 C155,126 175,150 175,186 C175,230 140,258 100,258 C65,258 40,240 40,224',
    4: 'M130,22 L30,168 L170,168 M130,22 L130,258',
    5: 'M150,22 L50,22 L40,118 C65,100 90,95 115,100 C155,110 170,145 170,186 C170,230 140,258 100,258 C65,258 40,240 40,218',
    6: 'M140,34 C120,22 100,22 80,28 C45,42 30,90 30,158 C30,220 55,258 100,258 C145,258 170,225 170,186 C170,148 145,126 110,126 C75,126 30,148 30,186',
    7: 'M30,22 L170,22 L90,258',
    8: 'M100,126 C60,126 40,105 40,78 C40,45 65,22 100,22 C135,22 160,45 160,78 C160,105 140,126 100,126 C55,126 30,155 30,196 C30,235 60,258 100,258 C140,258 170,235 170,196 C170,155 145,126 100,126',
    9: 'M170,100 C170,55 140,22 100,22 C60,22 30,55 30,100 C30,135 55,155 90,155 C125,155 170,135 170,100 L170,200 C170,235 145,258 110,258 C80,258 60,248 50,230',
  },
}));

// Mock useGame hook
const mockUseGame = jest.fn();
jest.mock('@/lib/hooks/use-game', () => ({
  useGame: (...args: any[]) => mockUseGame(...args),
}));

describe('NumberWritingGame', () => {
  const createQuestion = (digit: number, dotCount: number = 4): NumberWritingQuestion => {
    const dots: DotPoint[] = [];
    for (let i = 1; i <= dotCount; i++) {
      dots.push({
        x: 25 * i,
        y: 30 * i,
        label: i,
      });
    }
    return {
      type: 'number-writing',
      digit,
      dotPath: dots,
      totalDots: dotCount,
    };
  };

  const sampleQuestions: NumberWritingQuestion[] = [
    createQuestion(1, 4),
    createQuestion(2, 6),
    createQuestion(3, 7),
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

  it('renders game container with lavender variant', () => {
    const onComplete = jest.fn();
    const onExit = jest.fn();
    const onAttempt = jest.fn();

    render(
      <NumberWritingGame
        questions={sampleQuestions}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    expect(screen.getByTestId('game-container')).toHaveAttribute('data-variant', 'lavender');
  });

  it('renders game hud with correct stats', () => {
    const onComplete = jest.fn();
    const onExit = jest.fn();
    const onAttempt = jest.fn();

    render(
      <NumberWritingGame
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

  it('renders all dot buttons for the current digit', () => {
    const onComplete = jest.fn();
    const onExit = jest.fn();
    const onAttempt = jest.fn();

    render(
      <NumberWritingGame
        questions={sampleQuestions}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    // First question has 4 dots
    for (let i = 1; i <= 4; i++) {
      expect(screen.getByRole('button', { name: `Dot ${i}` })).toBeInTheDocument();
    }
  });

  it('displays digit number in question text', () => {
    const onComplete = jest.fn();
    const onExit = jest.fn();
    const onAttempt = jest.fn();

    render(
      <NumberWritingGame
        questions={sampleQuestions}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    expect(screen.getByText(/Write the number 1/)).toBeInTheDocument();
  });

  it('tapping correct dot (label 1) calls onAttempt with true', async () => {
    const onComplete = jest.fn();
    const onExit = jest.fn();
    const onAttempt = jest.fn();

    render(
      <NumberWritingGame
        questions={sampleQuestions}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    const dot1 = screen.getByRole('button', { name: 'Dot 1' });
    await userEvent.click(dot1);

    expect(onAttempt).toHaveBeenCalledWith('1', true);
  });

  it('tapping wrong dot calls onAttempt with false', async () => {
    const onComplete = jest.fn();
    const onExit = jest.fn();
    const onAttempt = jest.fn();

    render(
      <NumberWritingGame
        questions={sampleQuestions}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    // Try tapping dot 3 when dot 1 is expected
    const dot3 = screen.getByRole('button', { name: 'Dot 3' });
    await userEvent.click(dot3);

    expect(onAttempt).toHaveBeenCalledWith('3', false);
  });

  it('tapping dots in correct order advances nextLabel', async () => {
    const onComplete = jest.fn();
    const onExit = jest.fn();
    const onAttempt = jest.fn();

    render(
      <NumberWritingGame
        questions={sampleQuestions}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    const dot1 = screen.getByRole('button', { name: 'Dot 1' });
    const dot2 = screen.getByRole('button', { name: 'Dot 2' });

    // Tap dot 1 (correct)
    await userEvent.click(dot1);
    expect(onAttempt).toHaveBeenLastCalledWith('1', true);

    // Tap dot 2 (should now be correct)
    await userEvent.click(dot2);
    expect(onAttempt).toHaveBeenLastCalledWith('2', true);

    // onAttempt should be called twice, both with true
    expect(onAttempt).toHaveBeenCalledTimes(2);
  });

  it('calls handleWrong when wrong dot is tapped', async () => {
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
      <NumberWritingGame
        questions={sampleQuestions}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    const dot2 = screen.getByRole('button', { name: 'Dot 2' });
    await userEvent.click(dot2);

    expect(handleWrong).toHaveBeenCalledTimes(1);
  });

  it('calls handleCorrect after tapping all dots in sequence', async () => {
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
      <NumberWritingGame
        questions={sampleQuestions}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    // Question has 4 dots
    const dot1 = screen.getByRole('button', { name: 'Dot 1' });
    const dot2 = screen.getByRole('button', { name: 'Dot 2' });
    const dot3 = screen.getByRole('button', { name: 'Dot 3' });
    const dot4 = screen.getByRole('button', { name: 'Dot 4' });

    // Tap all dots in order
    await userEvent.click(dot1);
    await userEvent.click(dot2);
    await userEvent.click(dot3);
    await userEvent.click(dot4);

    // All 4 dots should be recorded as correct
    expect(onAttempt).toHaveBeenCalledTimes(4);
    expect(onAttempt).toHaveBeenNthCalledWith(1, '1', true);
    expect(onAttempt).toHaveBeenNthCalledWith(2, '2', true);
    expect(onAttempt).toHaveBeenNthCalledWith(3, '3', true);
    expect(onAttempt).toHaveBeenNthCalledWith(4, '4', true);
  });

  it('correctly sequences dot taps', async () => {
    const onComplete = jest.fn();
    const onExit = jest.fn();
    const onAttempt = jest.fn();

    render(
      <NumberWritingGame
        questions={sampleQuestions}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    const dot1 = screen.getByRole('button', { name: 'Dot 1' });
    const dot2 = screen.getByRole('button', { name: 'Dot 2' });

    // Tap dot 1 (correct)
    await userEvent.click(dot1);
    expect(onAttempt).toHaveBeenLastCalledWith('1', true);

    // Tap dot 2 (should now be correct - proves dot1 was marked as completed)
    await userEvent.click(dot2);
    expect(onAttempt).toHaveBeenLastCalledWith('2', true);
  }, 10000);

  it('completes after tapping all dots in order', async () => {
    const onComplete = jest.fn();
    const onExit = jest.fn();
    const onAttempt = jest.fn();

    mockUseGame.mockReturnValue({
      round: 0,
      hearts: 3,
      question: createQuestion(1, 2), // Only 2 dots for faster completion
      totalRounds: 1,
      handleCorrect: jest.fn(),
      handleWrong: jest.fn(),
    });

    render(
      <NumberWritingGame
        questions={[createQuestion(1, 2)]}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    const dot1 = screen.getByRole('button', { name: 'Dot 1' });
    const dot2 = screen.getByRole('button', { name: 'Dot 2' });

    // Complete all dots
    await userEvent.click(dot1);
    await userEvent.click(dot2);

    // After completion, onAttempt should have been called exactly twice
    expect(onAttempt).toHaveBeenCalledTimes(2);
    expect(onAttempt).toHaveBeenNthCalledWith(1, '1', true);
    expect(onAttempt).toHaveBeenNthCalledWith(2, '2', true);
  }, 10000);

  it('calls onExit when close button is clicked', async () => {
    const onComplete = jest.fn();
    const onExit = jest.fn();
    const onAttempt = jest.fn();

    render(
      <NumberWritingGame
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
      <NumberWritingGame
        questions={sampleQuestions}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('updates question when round changes', async () => {
    const onComplete = jest.fn();
    const onExit = jest.fn();
    const onAttempt = jest.fn();
    const { rerender } = render(
      <NumberWritingGame
        questions={sampleQuestions}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    expect(screen.getByText(/Write the number 1/)).toBeInTheDocument();

    // Update to second question
    mockUseGame.mockReturnValue({
      round: 1,
      hearts: 3,
      question: sampleQuestions[1],
      totalRounds: sampleQuestions.length,
      handleCorrect: jest.fn(),
      handleWrong: jest.fn(),
    });

    rerender(
      <NumberWritingGame
        questions={sampleQuestions}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    expect(screen.getByText(/Write the number 2/)).toBeInTheDocument();
  });

  it('resets completed dots state when round changes', async () => {
    const onComplete = jest.fn();
    const onExit = jest.fn();
    const onAttempt = jest.fn();
    const { rerender } = render(
      <NumberWritingGame
        questions={sampleQuestions}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    // Complete dot 1 in first round
    const dot1FirstRound = screen.getByRole('button', { name: 'Dot 1' });
    await userEvent.click(dot1FirstRound);

    // Switch to second question with more dots
    mockUseGame.mockReturnValue({
      round: 1,
      hearts: 3,
      question: sampleQuestions[1],
      totalRounds: sampleQuestions.length,
      handleCorrect: jest.fn(),
      handleWrong: jest.fn(),
    });

    rerender(
      <NumberWritingGame
        questions={sampleQuestions}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    // Should now be able to tap all dots 1-6 in new round (state was reset)
    for (let i = 1; i <= 6; i++) {
      const dot = screen.getByRole('button', { name: `Dot ${i}` });
      expect(dot).toBeInTheDocument();
    }
  }, 10000);

  it('sequences completion after all dots are tapped', async () => {
    const onComplete = jest.fn();
    const onExit = jest.fn();
    const onAttempt = jest.fn();

    mockUseGame.mockReturnValue({
      round: 0,
      hearts: 3,
      question: createQuestion(1, 2),
      totalRounds: 1,
      handleCorrect: jest.fn(),
      handleWrong: jest.fn(),
    });

    render(
      <NumberWritingGame
        questions={[createQuestion(1, 2)]}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    const dot1 = screen.getByRole('button', { name: 'Dot 1' });
    const dot2 = screen.getByRole('button', { name: 'Dot 2' });

    await userEvent.click(dot1);
    await userEvent.click(dot2);

    // After both dots tapped, onAttempt should be called twice
    expect(onAttempt).toHaveBeenCalledTimes(2);
    expect(onAttempt).toHaveBeenNthCalledWith(1, '1', true);
    expect(onAttempt).toHaveBeenNthCalledWith(2, '2', true);
  }, 10000);

  it('displays title "TRACE THE NUMBER"', () => {
    const onComplete = jest.fn();
    const onExit = jest.fn();
    const onAttempt = jest.fn();

    render(
      <NumberWritingGame
        questions={sampleQuestions}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    expect(screen.getByText(/TRACE THE NUMBER/)).toBeInTheDocument();
  });

  it('updates hearts display when hearts change', () => {
    const onComplete = jest.fn();
    const onExit = jest.fn();
    const onAttempt = jest.fn();
    const { rerender } = render(
      <NumberWritingGame
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
      <NumberWritingGame
        questions={sampleQuestions}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    expect(screen.getByTestId('game-hud')).toHaveAttribute('data-hearts', '1');
  });

  it('handles question with single dot', async () => {
    const singleDotQuestion = createQuestion(5, 1);

    mockUseGame.mockReturnValue({
      round: 0,
      hearts: 3,
      question: singleDotQuestion,
      totalRounds: 1,
      handleCorrect: jest.fn(),
      handleWrong: jest.fn(),
    });

    const onComplete = jest.fn();
    const onExit = jest.fn();
    const onAttempt = jest.fn();

    render(
      <NumberWritingGame
        questions={[singleDotQuestion]}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    expect(screen.getByRole('button', { name: 'Dot 1' })).toBeInTheDocument();
  });

  it('does not allow skipping dots in sequence', async () => {
    const onComplete = jest.fn();
    const onExit = jest.fn();
    const onAttempt = jest.fn();

    render(
      <NumberWritingGame
        questions={sampleQuestions}
        onComplete={onComplete}
        onExit={onExit}
        onAttempt={onAttempt}
      />
    );

    // Try to tap dot 3 when dot 1 is expected
    const dot3 = screen.getByRole('button', { name: 'Dot 3' });
    await userEvent.click(dot3);

    // Should record as wrong attempt
    expect(onAttempt).toHaveBeenCalledWith('3', false);

    // Dot 1 should still be available and correct
    const dot1 = screen.getByRole('button', { name: 'Dot 1' });
    await userEvent.click(dot1);

    // After tapping correct dot 1, it should be recorded as correct
    expect(onAttempt).toHaveBeenLastCalledWith('1', true);
  }, 10000);
});
