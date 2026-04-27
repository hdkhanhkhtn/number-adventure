'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameProgress } from '@/context/game-progress-context';
import { IconBtn } from '@/components/ui/icon-btn';
import { BapMascot } from '@/components/ui/bap-mascot';
import { StreakCard } from '@/components/ui/streak-card';
import { MetricCard } from '@/components/parent/metric-card';
import { SkillRow } from '@/components/parent/skill-row';
import { MenuRow } from '@/components/parent/menu-row';
import { WeeklyChart } from '@/components/parent/weekly-chart';
import { ParentOnboardingOverlay } from '@/components/screens/parent-onboarding-overlay';
import { StreakDetailSheet } from '@/components/ui/streak-detail-sheet';
import { FamilyLeaderboard } from '@/components/screens/family-leaderboard';
import { exportAsCSV, exportAsPDF, type ProgressExportData } from '@/lib/export/export-progress';

interface ReportData {
  lessonsCompleted: number;
  totalStars: number;
  recentActivity: number[];
  games: { type: string; label: string; color: string; playCount: number; accuracy: number }[];
  streak: { currentStreak: number; longestStreak: number };
  recommendedNext: string | null;
}

interface LeaderboardEntry {
  childId: string;
  name: string;
  color: string;
  totalStars: number;
  rank: number;
}

const SKILL_COLORS: Record<string, string> = {
  'hear-tap': '#5FB36A', 'build-number': '#FFC94A',
  'number-order': '#8AC4DE', 'even-odd': '#D9C7F0', 'add-take': '#FFA48C',
};

/** Parent dashboard — child metrics, weekly activity, skills, action menu */
export function ParentDashboardContent() {
  const router = useRouter();
  const { state } = useGameProgress();
  const { childId, profile } = state;

  const [report, setReport] = useState<ReportData | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showStreakDetail, setShowStreakDetail] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('bap-parent-onboarded')) {
      setShowOnboarding(true);
    }
  }, []);

  const dismissOnboarding = () => {
    localStorage.setItem('bap-parent-onboarded', 'true');
    setShowOnboarding(false);
  };

  useEffect(() => {
    if (!childId || childId.startsWith('guest_')) return;
    const controller = new AbortController();
    fetch(`/api/report/${childId}`, { signal: controller.signal, credentials: 'include' })
      .then(r => {
        if (r.status === 401) { router.push('/home'); return null; }
        return r.json();
      })
      .then(data => { if (data) setReport(data); })
      .catch(e => { if (e.name !== 'AbortError') console.error(e); });
    return () => controller.abort();
  }, [childId, router]);

  // Fetch family leaderboard (children ranked by stars this week)
  useEffect(() => {
    fetch('/api/parent/children', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : []))
      .then(async (children: { id: string; name: string; color: string }[]) => {
        if (children.length < 2) return;
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const entries = await Promise.all(
          children.map(async (c) => {
            try {
              const r = await fetch(`/api/report/${c.id}`, { credentials: 'include' });
              const data: ReportData = r.ok ? await r.json() : { totalStars: 0 };
              return { childId: c.id, name: c.name, color: c.color, totalStars: data.totalStars ?? 0, rank: 0 };
            } catch {
              return { childId: c.id, name: c.name, color: c.color, totalStars: 0, rank: 0 };
            }
          })
        );
        entries.sort((a, b) => b.totalStars - a.totalStars);
        setLeaderboard(entries.map((e, i) => ({ ...e, rank: i + 1 })));
      })
      .catch(() => undefined);
  }, []);

  async function handleExport(format: 'csv' | 'pdf') {
    if (!childId || !report) return;
    setExporting(true);
    try {
      const data: ProgressExportData = {
        childName: profile?.name ?? 'Child',
        exportDate: new Date().toISOString().slice(0, 10),
        sessions: [],
        totalSessions: report.lessonsCompleted,
        totalStars: report.totalStars,
        averageAccuracy: report.games.length > 0
          ? Math.round(report.games.reduce((s, g) => s + g.accuracy, 0) / report.games.length)
          : 0,
        currentStreak: report.streak?.currentStreak ?? 0,
      };
      if (format === 'csv') exportAsCSV(data);
      else await exportAsPDF(data);
    } finally {
      setExporting(false);
    }
  }

  const streak = report?.streak ?? { currentStreak: 0, longestStreak: 0 };
  const totalMin = (report?.recentActivity ?? []).reduce((s, v) => s + v, 0);
  const isEmpty = !childId || childId.startsWith('guest_') || (!report || (report.lessonsCompleted === 0 && report.totalStars === 0));

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#F5F3ED', fontFamily: 'var(--font-parent)' }}>
      {/* Header */}
      <div style={{ padding: '56px 20px 14px', background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <IconBtn color="cream" size={40} onClick={() => router.push('/home')}>✕</IconBtn>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: '#6B7A6C', fontWeight: 600, letterSpacing: 0.5 }}>CHA MẸ</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1F2A1F' }}>Bảng điều khiển</div>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#FFF4DE', border: '2px solid rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BapMascot size={32} color={profile?.color ?? 'sage'} />
        </div>
      </div>

      <div className="scroll" style={{ padding: '16px 18px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Child profile card */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: '#FFF4DE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BapMascot size={42} color={profile?.color ?? 'sage'} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1F2A1F' }}>{profile?.name ?? 'Bé'}</div>
              <div style={{ fontSize: 13, color: '#6B7A6C' }}>{profile?.age ?? '—'} tuổi · Mẫu giáo</div>
            </div>
            <div style={{ padding: '5px 10px', borderRadius: 999, background: '#EDF7EC', fontSize: 12, fontWeight: 600, color: '#2F6A3C' }}>● Đang học</div>
          </div>
        </div>

        {isEmpty ? (
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, textAlign: 'center', border: '1px solid rgba(0,0,0,0.06)' }}>
            <BapMascot size={64} color={profile?.color ?? 'sage'} mood="happy" />
            <div style={{ fontSize: 17, fontWeight: 700, color: '#1F2A1F', marginTop: 12 }}>Chưa có hoạt động</div>
            <div style={{ fontSize: 14, color: '#6B7A6C', marginTop: 6, lineHeight: 1.5 }}>Bé chưa chơi trò nào. Hãy bắt đầu khám phá!</div>
            <button
              onClick={() => router.push('/home')}
              style={{ marginTop: 16, padding: '12px 24px', borderRadius: 999, background: '#2E5A3A', color: '#fff', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
              Bắt đầu chơi
            </button>
          </div>
        ) : (
          <>
            {/* Metrics grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <MetricCard label="Tuần này" value={`${totalMin} phút`} sub="Thời gian chơi" accent="#5FB36A" />
              <MetricCard label="Chuỗi ngày" value={`${streak.currentStreak} ngày`} sub="🔥 liên tiếp" accent="#C14A2A" />
              <MetricCard label="Độ chính xác" value={report && report.games.length > 0 ? `${Math.round(report.games.reduce((s, g) => s + g.accuracy, 0) / report.games.length)}%` : '—'} sub="trung bình" accent="#2E6F93" />
              <MetricCard label="Ngôi sao" value={`${report?.totalStars ?? 0} ⭐`} sub="đã thu thập" accent="#B87C0E" />
            </div>

            {/* Weekly chart */}
            <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1F2A1F' }}>Hoạt động tuần này</div>
                <div style={{ fontSize: 12, color: '#6B7A6C' }}>mục tiêu 15ph/ngày</div>
              </div>
              <WeeklyChart data={report?.recentActivity ?? Array(7).fill(0)} goal={15} height={100} />
            </div>

            {/* Skills breakdown */}
            {report && report.games.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1F2A1F', marginBottom: 12 }}>Kỹ năng</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {report.games.map(g => (
                    <SkillRow key={g.type} label={g.label} value={g.accuracy / 100} color={SKILL_COLORS[g.type] ?? '#9AA69A'} badge={g.accuracy >= 80 ? 'Giỏi' : g.accuracy >= 50 ? 'Đang học' : 'Mới bắt đầu'} />
                  ))}
                </div>
              </div>
            )}

            {/* Streak card */}
            <StreakCard currentStreak={streak.currentStreak} longestStreak={streak.longestStreak} onTap={() => setShowStreakDetail(true)} />

            {/* Family leaderboard (shown only when 2+ children) */}
            <FamilyLeaderboard entries={leaderboard} />

            {/* Export progress */}
            {report && (report.lessonsCompleted > 0 || report.totalStars > 0) && (
              <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1F2A1F', marginBottom: 12 }}>
                  Export Progress
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => handleExport('csv')}
                    disabled={exporting}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 12,
                      background: '#EDF7EC', border: '1.5px solid #5FB36A',
                      color: '#2F6A3C', fontWeight: 700, fontSize: 14,
                      cursor: exporting ? 'wait' : 'pointer',
                    }}
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    disabled={exporting}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 12,
                      background: '#FFF4DE', border: '1.5px solid #E8A020',
                      color: '#7A4F00', fontWeight: 700, fontSize: 14,
                      cursor: exporting ? 'wait' : 'pointer',
                    }}
                  >
                    PDF
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Action menu */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <MenuRow icon="📊" label="Báo cáo chi tiết" sub="Xem tiến độ theo tuần" onClick={() => router.push('/report')} />
          <MenuRow icon="⏱️" label="Giới hạn thời gian" sub="Cài đặt thời gian chơi" onClick={() => router.push('/settings')} />
          <MenuRow icon="🌏" label="Ngôn ngữ & Âm thanh" sub="EN cho bé · VI cho cha mẹ" onClick={() => router.push('/settings')} />
          <MenuRow icon="⚙️" label="Cài đặt" sub="Hồ sơ, bảo mật" onClick={() => router.push('/settings')} last />
        </div>

        <div style={{ textAlign: 'center', fontSize: 12, color: '#9AA69A', padding: '8px 0 0' }}>
          Bắp Number Adventure · v1.0
        </div>
      </div>
      {showOnboarding && <ParentOnboardingOverlay onDismiss={dismissOnboarding} />}
      <StreakDetailSheet
        visible={showStreakDetail}
        currentStreak={streak.currentStreak}
        longestStreak={streak.longestStreak}
        onClose={() => setShowStreakDetail(false)}
      />
    </div>
  );
}
