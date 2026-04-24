'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameProgress } from '@/context/game-progress-context';
import { GardenBg } from '@/components/ui/garden-bg';
import { IconBtn } from '@/components/ui/icon-btn';
import { LevelNode, type LevelNodeData } from '@/components/screens/level-node';
import { WORLDS, getWorld } from '@/src/data/game-config/worlds';
import { getLessonsForWorld } from '@/src/data/game-config/lesson-templates';
import type { GardenBgVariant, TileColor, WorldId } from '@/lib/types/common';

const BG_VARIANT_MAP: Record<string, GardenBgVariant> = {
  sage: 'sage', sky: 'sky', lavender: 'lavender', sun: 'sun',
  coral: 'cream', // coral has no GardenBg variant, use cream as fallback
};

interface StarsByLesson { [lessonId: string]: number }

export default function WorldPage({ params }: { params: Promise<{ worldId: string }> }) {
  const { worldId } = use(params);
  const { state } = useGameProgress();
  const router = useRouter();
  const [starsByLesson, setStarsByLesson] = useState<StarsByLesson>({});

  const world = getWorld(worldId as WorldId);
  const worldIndex = WORLDS.findIndex((w) => w.id === worldId);

  useEffect(() => {
    if (!state.childId) return;
    fetch(`/api/progress/${state.childId}`)
      .then((r) => r.json())
      .then((d: { worldProgress?: { worldId: string; starsByLesson: StarsByLesson }[] }) => {
        const wp = d.worldProgress?.find((w) => w.worldId === worldId);
        if (wp?.starsByLesson) setStarsByLesson(wp.starsByLesson);
      })
      .catch(() => undefined);
  }, [state.childId, worldId]);

  if (!world) return null;

  const lessons = getLessonsForWorld(world.id as Parameters<typeof getLessonsForWorld>[0]);
  const levels: LevelNodeData[] = lessons.map((lesson, i) => ({
    n: lesson.order,
    stars: starsByLesson[lesson.id] ?? 0,
    locked: i > 0 && !(starsByLesson[lessons[i - 1].id] >= lesson.passingStars),
    isBoss: i === lessons.length - 1,
  }));

  const totalStars = Object.values(starsByLesson).reduce((s, n) => s + n, 0);
  const maxStars = lessons.length * 3;

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GardenBg variant={BG_VARIANT_MAP[world.color] ?? 'cream'} />
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '56px 20px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <IconBtn color="cream" size={48} onClick={() => router.push('/worlds')}>‹</IconBtn>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#6B7A6C', fontWeight: 700, letterSpacing: 0.5 }}>WORLD {worldIndex + 1}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#2D3A2E', lineHeight: 1 }}>{world.name}</div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '6px 12px', borderRadius: 999, background: '#FFF8EC',
            border: '2px solid #2D3A2E', fontSize: 13, fontWeight: 700, color: '#7A4E0E',
          }}>
            ⭐ {totalStars}/{maxStars}
          </div>
        </div>

        <div className="scroll" style={{ flex: 1, padding: '20px 20px 32px', position: 'relative' }}>
          <div style={{ position: 'relative', paddingTop: 6 }}>
            {levels.map((lv, i) => {
              const lesson = lessons[i];
              const side = i % 2 === 0 ? 'left' : 'right';
              const leftPct = side === 'left' ? '18%' : '58%';
              return (
                <div key={lesson.id} style={{ height: 92, position: 'relative' }}>
                  <button
                    onClick={() => !lv.locked && router.push(`/play/${lesson.gameType}/${lesson.id}`)}
                    disabled={lv.locked}
                    className="no-select"
                    style={{ position: 'absolute', left: leftPct, top: 0, width: 96, height: 96, background: 'none', border: 'none', cursor: lv.locked ? 'not-allowed' : 'pointer', padding: 0 }}
                  >
                    <LevelNode level={lv} worldColor={world.color as TileColor} />

                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
