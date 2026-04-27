import { Resend } from 'resend';
import { WeeklyReportTemplate } from './weekly-report-template';

// Lazy init — avoids build-time throw when RESEND_API_KEY is absent
function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not configured');
  return new Resend(key);
}

interface ChildSummary {
  name: string;
  sessions: number;
  starsEarned: number;
  accuracy: number;
  streakDays: number;
}

export async function sendWeeklyReport(
  parent: { email: string; name: string | null },
  childSummaries: ChildSummary[],
  unsubscribeUrl: string,
) {
  // Strip CRLF characters to prevent email header injection (W4)
  const safeName = (parent.name ?? 'Your').replace(/[\r\n]/g, '').slice(0, 50);

  await getResend().emails.send({
    from: 'Bap Adventure <noreply@bap-adventure.com>',
    to: parent.email,
    subject: `${safeName}'s family weekly progress report`,
    react: WeeklyReportTemplate({
      parentName: parent.name ?? '',
      children: childSummaries,
      unsubscribeUrl,
    }),
  });
}
