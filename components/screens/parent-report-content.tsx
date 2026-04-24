'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameProgress } from '@/context/game-progress-context';
import { IconBtn } from '@/components/ui/icon-btn';
import { WeeklyChart } from '@/components/parent/weekly-chart';

interface ReportData {
  lessonsCompleted: number;
  totalStars: number;
  recentActivity: number[];
  games: { type: string; label: string; color: string; playCount: number; accuracy: number }[];
  streak: { currentStreak: number; longestStreak: number };
  recommendedNext: string | null;
}

/** Parent report — weekly summary, play-time chart, per-game breakdown, tips */
export function ParentReportContent() {
  const router = useRouter();
  const { state } = useGameProgress();
  const { childId, profile } = state;

  const [report, setReport] = useState<ReportData | null>(null);

  useEffect(() => {
    if (!childId || childId.startsWith('guest_')) return;
    fetch(`/api/report/${childId}`)
      .then(r => r.json())
      .then(setReport)
      .catch(console.error);
  }, [childId]);

  const name = profile?.name ?? 'Bé';

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3ED', fontFamily: 'var(--font-parent)' }}>
      {/* Header */}
      <div style={{ padding: '56px 20px 14px', background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <IconBtn color="cream" size={40} onClick={() => router.push('/dashboard')}>‹</IconBtn>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1F2A1F' }}>Báo cáo của {name}</div>
      </div>

      <div className="scroll" style={{ padding: '16px 18px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Weekly summary card */}
        <div style={{ background: 'linear-gradient(135deg,#EDF7EC,#D9EED8)', borderRadius: 20, padding: 16, border: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 12, color: '#2F6A3C', fontWeight: 700, letterSpacing: 0.5 }}>TÓM TẮT TUẦN</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#1F4A28', marginTop: 6, lineHeight: 1.4 }}>
            {name} đã hoàn thành{' '}
            <b>{report?.lessonsCompleted ?? 0} bài học</b> và thu thập{' '}
            <b>{report?.totalStars ?? 0} ⭐</b> tuần này.
          </div>
        </div>

        {/* 7-day play time chart */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: '#1F2A1F' }}>Thời gian chơi 7 ngày</div>
          <WeeklyChart data={report?.recentActivity ?? Array(7).fill(0)} goal={15} height={120} showValues />
        </div>

        {/* Per-game breakdown */}
        {report && report.games.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: '#1F2A1F' }}>Theo mini-game</div>
            {report.games.map((g, i) => (
              <div key={g.type} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < report.games.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                <div style={{ width: 8, height: 32, borderRadius: 4, background: g.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2A1F' }}>{g.label}</div>
                  <div style={{ fontSize: 11, color: '#6B7A6C' }}>{g.playCount} lượt chơi</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: g.color }}>{g.accuracy}%</div>
              </div>
            ))}
          </div>
        )}

        {/* Recommended next step */}
        {report?.recommendedNext && (
          <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1F2A1F', marginBottom: 6 }}>Gợi ý tiếp theo</div>
            <div style={{ fontSize: 13, color: '#6B7A6C' }}>
              Con nên luyện tập thêm: <b style={{ color: '#1F2A1F' }}>{report.recommendedNext}</b>
            </div>
          </div>
        )}

        {/* Tips card */}
        <div style={{ background: '#FFF6E0', borderRadius: 20, padding: 16, border: '1px solid rgba(248,200,74,0.3)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#7A4E0E', letterSpacing: 0.5, marginBottom: 6 }}>💡 GỢI Ý</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#5E3A00', lineHeight: 1.6 }}>
            <li>Cùng bé đếm đồ vật quanh nhà (ví dụ: 12 viên bi, 20 cái thìa)</li>
            <li>Chơi thêm mini-game Even/Odd để củng cố khái niệm</li>
            <li>Duy trì 10–15 phút/ngày là đủ cho độ tuổi {profile?.age ?? 4}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
