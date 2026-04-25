import { adjustDifficulty, DifficultyState } from '@/lib/game-engine/difficulty-adjuster';

const baseState = (): DifficultyState => ({
  easeFactor: 2.5,
  interval: 1,
  streak: 0,
  consecutiveFails: 0,
  currentDifficulty: 'medium',
  totalSessions: 5,
});

describe('adjustDifficulty', () => {
  describe('Demotion (accuracy < 65% for 2 consecutive sessions)', () => {
    it('demotes from medium to easy after 2 consecutive low-accuracy sessions', () => {
      let state = baseState();
      let result = adjustDifficulty(state, 0.5, 'hard');
      state = result.state;
      expect(state.consecutiveFails).toBe(1);
      expect(state.currentDifficulty).toBe('medium'); // not yet, need 2

      result = adjustDifficulty(state, 0.5, 'hard');
      expect(result.state.currentDifficulty).toBe('easy');
      expect(result.changed).toBe(true);
      expect(result.previous).toBe('medium');
    });

    it('demotes from hard to medium after 2 consecutive low-accuracy sessions', () => {
      let state: DifficultyState = { ...baseState(), currentDifficulty: 'hard' };
      let result = adjustDifficulty(state, 0.4, 'hard');
      state = result.state;
      result = adjustDifficulty(state, 0.4, 'hard');
      expect(result.state.currentDifficulty).toBe('medium');
      expect(result.changed).toBe(true);
    });

    it('does not demote below easy', () => {
      let state: DifficultyState = { ...baseState(), currentDifficulty: 'easy' };
      for (let i = 0; i < 5; i++) {
        const result = adjustDifficulty(state, 0.3, 'hard');
        state = result.state;
      }
      expect(state.currentDifficulty).toBe('easy');
    });

    it('resets consecutiveFails after demotion', () => {
      let state = baseState();
      let result = adjustDifficulty(state, 0.5, 'hard');
      state = result.state;
      result = adjustDifficulty(state, 0.5, 'hard');
      state = result.state;
      expect(state.consecutiveFails).toBe(0); // reset after demotion
      expect(state.currentDifficulty).toBe('easy');
    });

    it('breaks demotion streak on higher accuracy', () => {
      let state = baseState();
      let result = adjustDifficulty(state, 0.5, 'hard');
      state = result.state;
      expect(state.consecutiveFails).toBe(1);

      result = adjustDifficulty(state, 0.7, 'hard'); // >= DEMOTE_THRESHOLD (0.65)
      expect(result.state.consecutiveFails).toBe(0); // reset
      expect(result.state.currentDifficulty).toBe('medium'); // no demotion
    });
  });

  describe('Promotion (accuracy > 85% for 3 consecutive sessions)', () => {
    it('promotes from easy to medium after 3 consecutive high-accuracy sessions', () => {
      let state: DifficultyState = { ...baseState(), currentDifficulty: 'easy' };
      let result = adjustDifficulty(state, 0.9, 'hard');
      state = result.state;
      expect(state.streak).toBe(1);

      result = adjustDifficulty(state, 0.9, 'hard');
      state = result.state;
      expect(state.streak).toBe(2);

      result = adjustDifficulty(state, 0.9, 'hard');
      expect(result.state.currentDifficulty).toBe('medium');
      expect(result.changed).toBe(true);
      expect(result.previous).toBe('easy');
    });

    it('promotes from medium to hard after 3 consecutive high-accuracy sessions', () => {
      let state: DifficultyState = { ...baseState(), currentDifficulty: 'medium' };
      for (let i = 0; i < 3; i++) {
        const result = adjustDifficulty(state, 0.95, 'hard');
        state = result.state;
      }
      expect(state.currentDifficulty).toBe('hard');
    });

    it('does not promote above hard', () => {
      let state: DifficultyState = { ...baseState(), currentDifficulty: 'hard' };
      for (let i = 0; i < 5; i++) {
        const result = adjustDifficulty(state, 0.99, 'hard');
        state = result.state;
      }
      expect(state.currentDifficulty).toBe('hard');
    });

    it('resets streak after promotion', () => {
      let state: DifficultyState = { ...baseState(), currentDifficulty: 'easy' };
      for (let i = 0; i < 3; i++) {
        const result = adjustDifficulty(state, 0.9, 'hard');
        state = result.state;
      }
      expect(state.streak).toBe(0); // reset after promotion
    });

    it('breaks promotion streak on lower accuracy', () => {
      let state: DifficultyState = { ...baseState(), currentDifficulty: 'easy' };
      let result = adjustDifficulty(state, 0.9, 'hard');
      state = result.state;
      expect(state.streak).toBe(1);

      result = adjustDifficulty(state, 0.7, 'hard'); // < PROMOTE_THRESHOLD (0.85)
      expect(result.state.streak).toBe(0); // reset
      expect(result.state.currentDifficulty).toBe('easy'); // no promotion
    });
  });

  describe('parentCeiling constraint', () => {
    it('never promotes above parentCeiling=easy', () => {
      let state: DifficultyState = { ...baseState(), currentDifficulty: 'easy' };
      for (let i = 0; i < 5; i++) {
        const result = adjustDifficulty(state, 0.95, 'easy');
        state = result.state;
      }
      expect(state.currentDifficulty).toBe('easy');
    });

    it('caps promotion at parentCeiling=medium', () => {
      let state: DifficultyState = { ...baseState(), currentDifficulty: 'easy' };
      for (let i = 0; i < 3; i++) {
        const result = adjustDifficulty(state, 0.9, 'medium');
        state = result.state;
      }
      expect(state.currentDifficulty).toBe('medium');

      // Try to promote again; ceiling prevents hard
      let result = adjustDifficulty(state, 0.9, 'medium');
      state = result.state;
      result = adjustDifficulty(state, 0.9, 'medium');
      state = result.state;
      result = adjustDifficulty(state, 0.9, 'medium');
      expect(result.state.currentDifficulty).toBe('medium'); // capped by ceiling
    });

    it('allows demotion even with ceiling constraint', () => {
      let state: DifficultyState = { ...baseState(), currentDifficulty: 'hard' };
      let result = adjustDifficulty(state, 0.3, 'hard'); // ceiling=hard, allow demotion
      state = result.state;
      result = adjustDifficulty(state, 0.3, 'hard'); // demotion from hard to medium
      expect(result.state.currentDifficulty).toBe('medium');
      expect(result.changed).toBe(true);
    });
  });

  describe('Minimum sessions constraint', () => {
    it('does not adjust difficulty before 3 total sessions', () => {
      const state: DifficultyState = {
        easeFactor: 2.5,
        interval: 1,
        streak: 0,
        consecutiveFails: 0,
        currentDifficulty: 'medium',
        totalSessions: 1, // Only 1 session
      };
      const result = adjustDifficulty(state, 0.3, 'hard');
      expect(result.state.currentDifficulty).toBe('medium'); // no change
      expect(result.changed).toBe(false);
      expect(result.state.totalSessions).toBe(2);
    });

    it('allows adjustment starting from 3 total sessions', () => {
      const state: DifficultyState = {
        easeFactor: 2.5,
        interval: 1,
        streak: 0,
        consecutiveFails: 2, // Almost demoted
        currentDifficulty: 'medium',
        totalSessions: 3, // Exactly 3 sessions
      };
      const result = adjustDifficulty(state, 0.3, 'hard');
      // This session (0.3) triggers demotion
      expect(result.state.currentDifficulty).toBe('easy');
      expect(result.changed).toBe(true);
    });
  });

  describe('SM-2 ease factor calculation', () => {
    it('updates easeFactor based on accuracy', () => {
      const state = baseState();

      // High accuracy (q=5)
      const highAccResult = adjustDifficulty(state, 0.95, 'hard');
      const highAccFactor = highAccResult.state.easeFactor;
      expect(highAccFactor).toBeGreaterThan(state.easeFactor);

      // Low accuracy (q=1)
      const lowAccResult = adjustDifficulty(state, 0.2, 'hard');
      const lowAccFactor = lowAccResult.state.easeFactor;
      expect(lowAccFactor).toBeLessThan(state.easeFactor);
    });

    it('maintains minimum easeFactor of 1.3', () => {
      const state = { ...baseState(), easeFactor: 1.35 };
      const result = adjustDifficulty(state, 0.1, 'hard');
      expect(result.state.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it('updates interval based on quality', () => {
      const state = { ...baseState(), interval: 1, easeFactor: 2.5 };

      // High quality (q >= 3): interval increases
      const highQResult = adjustDifficulty(state, 0.8, 'hard');
      expect(highQResult.state.interval).toBeGreaterThan(state.interval);

      // Low quality (q < 3): interval resets to 1
      const lowQResult = adjustDifficulty(state, 0.3, 'hard');
      expect(lowQResult.state.interval).toBe(1);
    });
  });

  describe('Boundary cases', () => {
    it('handles accuracy exactly at threshold boundaries', () => {
      const state = baseState();

      // Exactly at DEMOTE_THRESHOLD (0.65)
      const demoteEdge = adjustDifficulty(state, 0.65, 'hard');
      expect(demoteEdge.state.consecutiveFails).toBe(0); // >= 0.65, not counted as fail

      // Exactly at PROMOTE_THRESHOLD (0.85)
      const promoteEdge = adjustDifficulty(state, 0.85, 'hard');
      expect(promoteEdge.state.streak).toBe(1); // >= 0.85, counted as success
    });

    it('accumulates both streak and consecutiveFails correctly across sessions', () => {
      let state = baseState();

      // Session 1: 0.5 (fail)
      let result = adjustDifficulty(state, 0.5, 'hard');
      state = result.state;
      expect(state.consecutiveFails).toBe(1);
      expect(state.streak).toBe(0);

      // Session 2: 0.9 (success) — breaks fail streak
      result = adjustDifficulty(state, 0.9, 'hard');
      state = result.state;
      expect(state.consecutiveFails).toBe(0); // reset
      expect(state.streak).toBe(1);

      // Session 3: 0.5 (fail) — breaks success streak
      result = adjustDifficulty(state, 0.5, 'hard');
      state = result.state;
      expect(state.streak).toBe(0); // reset
      expect(state.consecutiveFails).toBe(1);
    });

    it('returns correct previous difficulty value', () => {
      const state: DifficultyState = { ...baseState(), currentDifficulty: 'hard' };
      const result = adjustDifficulty(state, 0.3, 'hard');
      expect(result.previous).toBe('hard');
    });
  });

  describe('Changed flag', () => {
    it('returns changed=true when difficulty changes', () => {
      let state = baseState();
      let result = adjustDifficulty(state, 0.5, 'hard');
      state = result.state;
      result = adjustDifficulty(state, 0.5, 'hard');
      expect(result.changed).toBe(true);
    });

    it('returns changed=false when difficulty stays same', () => {
      const state = baseState();
      const result = adjustDifficulty(state, 0.7, 'hard');
      expect(result.changed).toBe(false);
    });

    it('returns changed=false even with parentCeiling cap (no actual change)', () => {
      let state: DifficultyState = { ...baseState(), currentDifficulty: 'medium' };
      let result: ReturnType<typeof adjustDifficulty> | undefined;
      for (let i = 0; i < 3; i++) {
        result = adjustDifficulty(state, 0.9, 'medium');
        state = result.state;
      }
      // Now at medium (promoted from easy but capped)
      // Try one more: would promote to hard, but ceiling=medium
      result = adjustDifficulty(state, 0.9, 'medium');
      expect(result.changed).toBe(false); // No change because ceiling prevents it
    });
  });

  describe('Full session sequences', () => {
    it('simulates realistic mixed-accuracy sequence without adjustment', () => {
      let state: DifficultyState = {
        easeFactor: 2.5,
        interval: 1,
        streak: 0,
        consecutiveFails: 0,
        currentDifficulty: 'medium',
        totalSessions: 0,
      };

      const accuracies = [0.5, 0.6, 0.7, 0.8, 0.9];
      for (const acc of accuracies) {
        const result = adjustDifficulty(state, acc, 'hard');
        state = result.state;
      }

      // After 5 sessions with improving accuracy, should still be medium (no 3-session promotion yet)
      expect(state.currentDifficulty).toBe('medium');
      expect(state.totalSessions).toBe(5);
    });

    it('simulates consistent high-accuracy sequence with promotion', () => {
      let state: DifficultyState = {
        easeFactor: 2.5,
        interval: 1,
        streak: 0,
        consecutiveFails: 0,
        currentDifficulty: 'easy',
        totalSessions: 3,
      };

      let result: ReturnType<typeof adjustDifficulty> | undefined;
      for (let i = 0; i < 3; i++) {
        result = adjustDifficulty(state, 0.92, 'hard');
        state = result.state;
      }

      expect(state.currentDifficulty).toBe('medium');
      expect(state.totalSessions).toBe(6);
      expect(result!.changed).toBe(true);
    });
  });
});
