import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWeeklyReport } from '@/lib/email/send-weekly-report';
import { createUnsubscribeToken } from '@/lib/email/unsubscribe-token';

export const runtime = 'nodejs';

/** GET /api/cron/weekly-report — triggered by Vercel Cron every Monday 9am */
export async function GET(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bap-adventure.com';

  // Batch to avoid loading all parents+sessions into memory at once (I4)
  const BATCH_SIZE = 50;
  let cursor: string | undefined;
  let sent = 0;
  let failed = 0;

  do {
    const parents = await prisma.parent.findMany({
      where: { emailReports: true },
      take: BATCH_SIZE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      select: {
        id: true,
        email: true,
        name: true,
        children: {
          select: {
            name: true,
            sessions: {
              where: { completedAt: { gte: weekAgo }, status: 'completed' },
              select: {
                stars: true,
                attempts: { select: { correct: true } },
              },
            },
            streak: { select: { currentStreak: true } },
          },
        },
      },
    });

    if (parents.length === 0) break;
    cursor = parents[parents.length - 1].id;

    for (const parent of parents) {
      const childSummaries = parent.children.map((child) => {
        const sessions = child.sessions.length;
        const allAttempts = child.sessions.flatMap((s) => s.attempts);
        const correct = allAttempts.filter((a) => a.correct).length;
        const accuracy = allAttempts.length > 0
          ? Math.round((correct / allAttempts.length) * 100)
          : 0;
        const starsEarned = child.sessions.reduce((sum, s) => sum + s.stars, 0);
        return { name: child.name, sessions, starsEarned, accuracy, streakDays: child.streak?.currentStreak ?? 0 };
      });

      if (childSummaries.every((c) => c.sessions === 0)) continue;

      // Use HMAC-signed token — never expose raw parentId in email URL (C1/W3)
      const token = createUnsubscribeToken(parent.id);
      const unsubscribeUrl = `${baseUrl}/api/parent/unsubscribe?token=${encodeURIComponent(token)}`;

      try {
        await sendWeeklyReport(parent, childSummaries, unsubscribeUrl);
        sent++;
      } catch (err) {
        console.error(`Failed to send report to ${parent.email}:`, err);
        failed++;
      }
    }

    if (parents.length < BATCH_SIZE) break;
  } while (cursor);

  return NextResponse.json({ sent, failed });
}
