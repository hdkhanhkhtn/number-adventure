/**
 * Client-side progress export utilities — generates CSV or PDF from child progress data.
 * CSV uses native Blob/URL APIs; PDF uses jsPDF loaded dynamically to avoid SSR issues.
 */

export interface ProgressExportData {
  childName: string;
  exportDate: string;
  sessions: Array<{
    lessonTitle: string;
    completedAt: string;
    stars: number;
    accuracy: number;
  }>;
  totalSessions: number;
  totalStars: number;
  averageAccuracy: number;
  currentStreak: number;
}

/** Triggers a CSV file download in the browser */
export function exportAsCSV(data: ProgressExportData): void {
  const rows = [
    ['Child', 'Export Date', 'Total Sessions', 'Total Stars', 'Avg Accuracy %', 'Current Streak'],
    [data.childName, data.exportDate, data.totalSessions, data.totalStars, data.averageAccuracy, data.currentStreak],
    [],
    ['Lesson', 'Completed At', 'Stars', 'Accuracy %'],
    ...data.sessions.map((s) => [s.lessonTitle, s.completedAt, s.stars, s.accuracy]),
  ];

  const csv = rows
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.childName}-progress-${data.exportDate}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Triggers a PDF file download in the browser (jsPDF loaded dynamically) */
export async function exportAsPDF(data: ProgressExportData): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text('Progress Report', 14, 20);

  doc.setFontSize(12);
  doc.text(`Child: ${data.childName}`, 14, 35);
  doc.text(`Date: ${data.exportDate}`, 14, 43);
  doc.text(`Total Sessions: ${data.totalSessions}`, 14, 51);
  doc.text(`Total Stars: ${data.totalStars}`, 14, 59);
  doc.text(`Average Accuracy: ${data.averageAccuracy}%`, 14, 67);
  doc.text(`Current Streak: ${data.currentStreak} days`, 14, 75);

  if (data.sessions.length > 0) {
    doc.setFontSize(14);
    doc.text('Session History', 14, 90);
    doc.setFontSize(10);
    let y = 100;
    // Limit to 30 rows to avoid overflow beyond page bounds
    for (const s of data.sessions.slice(0, 30)) {
      if (y > 270) break;
      doc.text(`${s.lessonTitle} — ${s.completedAt} — ${s.stars} stars — ${s.accuracy}%`, 14, y);
      y += 8;
    }
  }

  doc.save(`${data.childName}-progress-${data.exportDate}.pdf`);
}
