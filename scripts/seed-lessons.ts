#!/usr/bin/env tsx
/**
 * seed-lessons.ts
 * Read prisma/seed-lessons.json and upsert each lesson to DB.
 * Usage: npm run seed:lessons
 */
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { SeedFileSchema } from '../lib/schemas/lesson-schema';

const prisma = new PrismaClient();
const SEED_FILE = path.resolve(__dirname, '../prisma/seed-lessons.json');

async function main() {
  if (!fs.existsSync(SEED_FILE)) {
    console.error(`Seed file not found: ${SEED_FILE}`);
    console.error('Run: npm run generate:lessons -- --all');
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(SEED_FILE, 'utf-8'));
  const result = SeedFileSchema.safeParse(raw);
  if (!result.success) {
    console.error('Invalid seed-lessons.json:');
    result.error.issues.forEach(i => console.error(`  [${i.path.join('.')}] ${i.message}`));
    process.exit(1);
  }

  const { lessons } = result.data;
  console.log(`Seeding ${lessons.length} lessons…`);

  let upserted = 0;
  for (const lesson of lessons) {
    await prisma.lesson.upsert({
      where: { worldId_order: { worldId: lesson.worldId, order: lesson.order } },
      create: {
        worldId: lesson.worldId,
        gameType: lesson.gameType,
        order: lesson.order,
        title: lesson.title,
        description: lesson.description ?? null,
        objectives: lesson.objectives ?? [],
        difficulty: lesson.difficulty,
        questionCount: lesson.questionCount,
        passingStars: lesson.passingStars,
        published: false,
      },
      update: {
        title: lesson.title,
        description: lesson.description ?? null,
        objectives: lesson.objectives ?? [],
        difficulty: lesson.difficulty,
        questionCount: lesson.questionCount,
        passingStars: lesson.passingStars,
      },
    });
    upserted++;
  }

  console.log(`✓ Upserted ${upserted} lessons.`);
}

main()
  .catch(err => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
