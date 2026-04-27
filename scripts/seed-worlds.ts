#!/usr/bin/env tsx
/**
 * seed-worlds.ts — Admin lesson pipeline
 *
 * Reads prisma/seed-worlds-config.json, runs AI lesson generation for each world,
 * then seeds all generated lessons to the database.
 *
 * Usage:
 *   npm run seed:worlds                        # all worlds in config
 *   npm run seed:worlds -- --world counting-meadow  # single world
 *   npm run seed:worlds -- --dry-run           # generate only, skip DB seed
 *
 * Required env vars for AI generation: AI_ENDPOINT, AI_API_KEY, AI_MODEL
 * Required env var for DB seed: DATABASE_URL
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// ── Safety guard ──────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  console.error('ERROR: seed-worlds must not run in production.');
  process.exit(1);
}

// ── CLI args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const worldArg = args[args.indexOf('--world') + 1] as string | undefined;
const dryRun   = args.includes('--dry-run');

// ── Config ────────────────────────────────────────────────────────────────────
interface WorldEntry { id: string; gameType: string; lessonCount: number }
interface SeedConfig  { worlds: WorldEntry[] }

const CONFIG_FILE = path.resolve(__dirname, '../prisma/seed-worlds-config.json');

function loadConfig(): SeedConfig {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.error(`Config not found: ${CONFIG_FILE}`);
    process.exit(1);
  }
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8')) as SeedConfig;
  } catch {
    console.error('Could not parse seed-worlds-config.json');
    process.exit(1);
  }
}

// ── Subprocess runner ─────────────────────────────────────────────────────────
function run(command: string): boolean {
  try {
    execSync(command, { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
    return true;
  } catch {
    return false;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const config = loadConfig();

  const worlds = worldArg
    ? config.worlds.filter(w => w.id === worldArg)
    : config.worlds;

  if (worlds.length === 0) {
    const ids = config.worlds.map(w => w.id).join(', ');
    console.error(`World "${worldArg}" not found in config. Available: ${ids}`);
    process.exit(1);
  }

  console.log(`\n── Lesson pipeline: ${worlds.length} world(s) ──`);
  worlds.forEach(w => console.log(`  • ${w.id} (${w.gameType})`));

  // Phase 1: AI generation per world
  const generateScript = path.resolve(__dirname, 'generate-lessons.ts');
  let generationFailed = false;

  for (const world of worlds) {
    console.log(`\n[generate] ${world.id}…`);
    const dryFlag  = dryRun ? ' --dry-run' : '';
    const ok = run(`npx tsx "${generateScript}" --world ${world.id}${dryFlag}`);
    if (!ok) {
      console.error(`  ✗ generation failed for ${world.id}`);
      generationFailed = true;
    }
  }

  if (generationFailed) {
    console.error('\nGeneration errors — aborting DB seed.');
    process.exit(1);
  }

  // Phase 2: Seed to DB (skip in dry-run)
  if (dryRun) {
    console.log('\n── DRY RUN — skipping DB seed ──');
    return;
  }

  console.log('\n[seed] Seeding lessons to DB…');
  const seedScript = path.resolve(__dirname, 'seed-lessons.ts');
  const ok = run(`npx tsx "${seedScript}"`);
  if (!ok) {
    console.error('DB seed failed.');
    process.exit(1);
  }

  console.log('\n✓ Pipeline complete.');
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
