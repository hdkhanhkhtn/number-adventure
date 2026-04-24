# Data Models

## Core Types

```typescript
// Game type identifier
type GameType =
  | "hear-tap"
  | "number-order"
  | "build-number"
  | "even-odd"
  | "math-kitchen"

type Difficulty = "easy" | "medium" | "hard"

// Base game configuration
type GameConfig = {
  type: GameType
  difficulty: Difficulty
  questionsPerRound: number  // default 5
  timeLimit?: number          // seconds, optional
}

// A single generated question
type Question = {
  id: string
  prompt: string | number      // displayed or spoken
  correctAnswer: number | string
  choices?: (number | string)[]  // for multiple-choice games
}

// Result of answering one question
type AnswerResult = {
  questionId: string
  isCorrect: boolean
  responseTimeMs: number
}

// Result of a full game round
type RoundResult = {
  gameType: GameType
  difficulty: Difficulty
  stars: 1 | 2 | 3
  score: number
  totalQuestions: number
  correctCount: number
  completedAt: string  // ISO date
}
```

## Progress & Persistence

```typescript
// Per-level progress
type LevelProgress = {
  levelId: string
  worldId: string
  gameType: GameType
  stars: 0 | 1 | 2 | 3  // 0 = not played
  bestScore: number
  playCount: number
  lastPlayedAt: string
}

// Full progress store (persisted in localStorage)
type ProgressStore = {
  levels: Record<string, LevelProgress>  // key = levelId
  stickers: string[]                      // sticker IDs earned
  streak: {
    current: number
    longestEver: number
    lastPlayDate: string
  }
  settings: {
    audioEnabled: boolean
    volume: number
    parentPin?: string
  }
}
```

## World & Level Structure

```typescript
type Level = {
  id: string
  worldId: string
  order: number
  gameType: GameType
  config: GameConfig
  unlockCondition?: string  // levelId that must be completed first
}

type World = {
  id: string
  name: string
  theme: "farm" | "space" | "ocean" | "jungle" | "city"
  levels: Level[]
  unlockCondition?: string  // worldId that must be completed
}
```
