import { Resend } from 'resend';
import { WeeklyReportTemplate } from './weekly-report-template';

const resend = new Resend(process.env.RESEND_API_KEY);

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

  await resend.emails.send({
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
