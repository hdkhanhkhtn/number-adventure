import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWeeklyReport } from '@/lib/email/send-weekly-report';

export const runtime = 'nodejs';

/** GET /api/cron/weekly-report — triggered by Vercel Cron every Monday 9am */
export async function GET(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const parents = await prisma.parent.findMany({
    where: { emailReports: true },
    include: {
      children: {
        include: {
          sessions: {
            where: { completedAt: { gte: weekAgo }, status: 'completed' },
            include: { attempts: { select: { correct: true } } },
          },
          streak: { select: { currentStreak: true } },
        },
      },
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bap-adventure.com';
  let sent = 0;
  let failed = 0;

  for (const parent of parents) {
    const childSummaries = parent.children.map((child) => {
      const sessions = child.sessions.length;
      const allAttempts = child.sessions.flatMap((s) => s.attempts);
      const correct = allAttempts.filter((a) => a.correct).length;
      const accuracy = allAttempts.length > 0 ? Math.round((correct / allAttempts.length) * 100) : 0;
      const starsEarned = child.sessions.reduce((sum, s) => sum + s.stars, 0);
      return {
        name: child.name,
        sessions,
        starsEarned,
        accuracy,
        streakDays: child.streak?.currentStreak ?? 0,
      };
    });

    // Skip parents whose children had no activity this week
    if (childSummaries.every((c) => c.sessions === 0)) continue;

    const unsubscribeUrl = `${baseUrl}/api/parent/unsubscribe?parentId=${parent.id}`;
    try {
      await sendWeeklyReport(parent, childSummaries, unsubscribeUrl);
      sent++;
    } catch (err) {
      console.error(`Failed to send report to ${parent.email}:`, err);
      failed++;
    }
  }

  return NextResponse.json({ sent, failed });
}
