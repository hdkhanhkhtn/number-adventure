'use client';

interface LeaderboardEntry {
  childId: string;
  name: string;
  color: string;
  totalStars: number;
  rank: number;
}

interface Props {
  entries: LeaderboardEntry[];
}

const RANK_ICONS = ['👑', '🥈', '🥉'];

/** Family leaderboard — only rendered when there are 2+ children profiles */
export function FamilyLeaderboard({ entries }: Props) {
  if (entries.length < 2) return null;

  return (
    <div className="mx-4 mb-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 p-4">
      <h3 className="text-sm font-bold text-indigo-700 mb-3 flex items-center gap-1">
        <span>🏆</span> Family Leaderboard
      </h3>
      <ol className="space-y-2">
        {entries.map((entry) => (
          <li key={entry.childId} className="flex items-center gap-3">
            <span className="text-lg w-6 text-center">
              {RANK_ICONS[entry.rank - 1] ?? String(entry.rank)}
            </span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ backgroundColor: `var(--color-${entry.color}, #6366f1)` }}
            >
              {entry.name[0].toUpperCase()}
            </div>
            <span className="flex-1 text-sm font-medium text-gray-800">{entry.name}</span>
            <span className="text-sm font-bold text-amber-600">{entry.totalStars} ⭐</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
