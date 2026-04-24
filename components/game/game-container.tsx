'use client';

import { GardenBg } from '@/components/ui/garden-bg';
import type { GardenBgVariant } from '@/lib/types/common';

export interface GameContainerProps {
  children: React.ReactNode;
  variant?: GardenBgVariant;
}

/** Full-screen wrapper with garden background for all game screens */
export function GameContainer({ children, variant = 'sage' }: GameContainerProps) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GardenBg variant={variant} />
      <div style={{
        position: 'relative',
        zIndex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {children}
      </div>
    </div>
  );
}
