import { z } from 'zod';

/** Zod schema for AI-generated lesson content — validated before DB write */
export const LessonSchema = z.object({
  slug: z.string().min(3).max(60),
  worldId: z.string().min(1),
  gameType: z.string().min(1),
  order: z.number().int().min(1).max(9),
  title: z.string().min(1).max(80),
  description: z.string().max(300),
  objectives: z.array(z.string().min(1)).min(1).max(5),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  questionCount: z.number().int().min(5).max(20),
  passingStars: z.number().int().min(1).max(3),
});

export type LessonData = z.infer<typeof LessonSchema>;

/** Array wrapper for per-world AI response validation (max 9 per world) */
export const LessonArraySchema = z.object({
  lessons: z.array(LessonSchema).min(1).max(9),
});

/** Schema for the full seed file containing all worlds (no max cap) */
export const SeedFileSchema = z.object({
  lessons: z.array(LessonSchema).min(1),
});
