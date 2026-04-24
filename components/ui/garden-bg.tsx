'use client';

import type { GardenBgVariant } from '@/lib/types/common';

export interface GardenBgProps {
  children?: React.ReactNode;
  variant?: GardenBgVariant;
  style?: React.CSSProperties;
}

const BG_MAP: Record<GardenBgVariant, string> = {
  cream:    'radial-gradient(ellipse 100% 60% at 50% 0%, #FFF4DE 0%, #FFF8EC 50%, #FFFDF7 100%)',
  sky:      'radial-gradient(ellipse 100% 60% at 50% 0%, #D4EAF5 0%, #E7F3FA 50%, #F5FAFD 100%)',
  sage:     'radial-gradient(ellipse 100% 60% at 50% 0%, #D6ECCE 0%, #E8F4E0 50%, #F4FAEE 100%)',
  sun:      'radial-gradient(ellipse 100% 60% at 50% 0%, #FFE6A8 0%, #FFF2CC 50%, #FFF9E6 100%)',
  lavender: 'radial-gradient(ellipse 100% 60% at 50% 0%, #E3D2F4 0%, #EEE3F8 50%, #F7F1FC 100%)',
};

/** Full-bleed decorative background with gradient wash */
export function GardenBg({ children, variant = 'cream', style }: GardenBgProps) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: BG_MAP[variant],
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
