#!/usr/bin/env tsx
/**
 * generate-lessons.ts
 * Offline script: calls AI (OpenAI-compatible endpoint) to generate lesson content,
 * validates with Zod, and writes to prisma/seed-lessons.json.
 *
 * Usage:
 *   npm run generate:lessons -- --world counting-meadow
 *   npm run generate:lessons -- --all
 *   npm run generate:lessons -- --world counting-meadow --dry-run
 *
 * Required env vars: AI_ENDPOINT, AI_API_KEY, AI_MODEL
 */

import fs from 'fs';
import path from 'path';
import { WORLDS } from '../src/data/game-config/worlds';
import { LessonArraySchema, type LessonData } from '../lib/schemas/lesson-schema';

// ── Safety guard ──────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  console.error('ERROR: generate-lessons must not run in production.');
  process.exit(1);
}

// ── CLI args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const worldArg = args[args.indexOf('--world') + 1] as string | undefined;
const runAll = args.includes('--all');
const dryRun = args.includes('--dry-run');

if (!worldArg && !runAll) {
  console.error('Usage: generate-lessons --world <worldId> | --all [--dry-run]');
  process.exit(1);
}

// ── AI config ─────────────────────────────────────────────────────────────────
const AI_ENDPOINT = process.env.AI_ENDPOINT;
const AI_API_KEY  = process.env.AI_API_KEY;
const AI_MODEL    = process.env.AI_MODEL;

if (!AI_ENDPOINT || !AI_API_KEY || !AI_MODEL) {
  console.error('ERROR: AI_ENDPOINT, AI_API_KEY, and AI_MODEL must be set in environment.');
  process.exit(1);
}

// ── Output path ───────────────────────────────────────────────────────────────
const OUTPUT_FILE = path.resolve(__dirname, '../prisma/seed-lessons.json');

// ── Core generator ────────────────────────────────────────────────────────────
async function generateLessonsForWorld(worldId: string): Promise<LessonData[]> {
  const world = WORLDS.find(w => w.id === worldId);
  if (!world) {
    console.error(`World "${worldId}" not found. Available worlds: ${WORLDS.map(w => w.id).join(', ')}`);
    process.exit(1);
  }

  const gameType = world.gameTypes[0];
  console.log(`\nGenerating lessons for "${world.name}" (${worldId}, gameType: ${gameType})…`);

  const prompt = `
You are a curriculum designer creating math lessons for children aged 3-8.
Generate exactly 9 lessons for the world "${world.name}" using game type "${gameType}".
Difficulty distribution: 3 easy lessons (order 1-3), 3 medium (order 4-6), 3 hard (order 7-9).

Each lesson slug must start with the world prefix (e.g. "${worldId.slice(0, 2)}-01").
Slug format: lowercase letters, numbers, hyphens only.

Return ONLY a JSON object with this exact structure — no markdown, no explanation:
{
  "lessons": [
    {
      "slug": string (min 3, max 60 chars),
      "worldId": "${worldId}",
      "gameType": "${gameType}",
      "order": integer 1-9,
      "title": string (max 80 chars),
      "description": string (max 300 chars),
      "objectives": string[] (1-5 items),
      "difficulty": "easy" | "medium" | "hard",
      "questionCount": integer 5-20,
      "passingStars": integer 1-3
    }
  ]
}`.trim();

  const res = await fetch(`${AI_ENDPOINT}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: 'You are a curriculum designer. Output ONLY valid JSON.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`AI API error ${res.status}: ${text.slice(0, 200)}`);
    process.exit(1);
  }

  const data = await res.json() as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    console.error('AI returned empty response.');
    process.exit(1);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    console.error('AI response is not valid JSON:\n', content.slice(0, 500));
    process.exit(1);
  }

  const result = LessonArraySchema.safeParse(parsed);
  if (!result.success) {
    console.error('Zod validation failed:');
    result.error.issues.forEach(issue => {
      console.error(`  [${issue.path.join('.')}] ${issue.message}`);
    });
    process.exit(1);
  }

  console.log(`  ✓ ${result.data.lessons.length} lessons validated for "${worldId}"`);
  return result.data.lessons;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const worldIds = runAll
    ? WORLDS.map(w => w.id)
    : [worldArg as string];

  const allLessons: LessonData[] = [];

  for (const worldId of worldIds) {
    const lessons = await generateLessonsForWorld(worldId);
    allLessons.push(...lessons);
  }

  if (dryRun) {
    console.log('\n── DRY RUN — output (not written to file) ──');
    console.log(JSON.stringify({ lessons: allLessons }, null, 2));
    console.log(`\nTotal: ${allLessons.length} lessons across ${worldIds.length} world(s).`);
    return;
  }

  // Merge with existing seed file if present (preserves lessons from other worlds)
  let existing: LessonData[] = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      const raw = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8')) as { lessons?: LessonData[] };
      existing = raw.lessons ?? [];
    } catch {
      console.warn('Could not parse existing seed-lessons.json — overwriting.');
    }
  }

  // Merge: replace existing entries for the same worldId+order, keep others
  const updatedWorldIds = new Set(worldIds);
  const merged = [
    ...existing.filter(l => !updatedWorldIds.has(l.worldId)),
    ...allLessons,
  ].sort((a, b) => a.worldId.localeCompare(b.worldId) || a.order - b.order);

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ lessons: merged }, null, 2));
  console.log(`\n✓ Written ${merged.length} lessons to ${OUTPUT_FILE}`);
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
