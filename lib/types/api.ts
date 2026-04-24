// API request and response types for Bap Number Adventure

// ── Auth ───────────────────────────────────────────────────
export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  parentId: string;
  email: string;
  name?: string;
}

export interface PinRequest {
  pin: string; // 4-digit
}

// ── Children ────────────────────────────────────────────────
export interface CreateChildRequest {
  name: string;
  age: number;
  color?: string;
}

export interface UpdateChildSettingsRequest {
  dailyMin?: number;
  difficulty?: string;
  kidLang?: string;
  parentLang?: string;
  sfx?: boolean;
  music?: boolean;
  voice?: boolean;
  voiceStyle?: string;
  quietHours?: boolean;
}

// ── Sessions ────────────────────────────────────────────────
export interface CreateSessionRequest {
  childId: string;
  lessonId: string;
}

export interface CompleteSessionRequest {
  stars: number; // 0–3
}

export interface SubmitAttemptRequest {
  questionId?: string;
  answer: string;
  // `correct` intentionally omitted — server computes from AIQuestion.payload vs answer
  timeMs?: number;
}

// ── AI Questions ─────────────────────────────────────────────
export interface GenerateQuestionsRequest {
  lessonId: string;
  gameType: string;
  difficulty: string;
  count?: number;
}

export interface AIQuestionPayload {
  id: string;
  payload: Record<string, unknown>;
}

export interface GenerateQuestionsResponse {
  questions: AIQuestionPayload[];
}

// ── Progress & Reports ───────────────────────────────────────
export interface ProgressSummary {
  childId: string;
  totalSessions: number;
  totalStars: number;
  stickersEarned: number;
  currentStreak: number;
  weekData: boolean[];
}

// ── Generic API error ────────────────────────────────────────
export interface ApiError {
  error: string;
  status: number;
}
