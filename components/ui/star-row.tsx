'use client';

import { motion } from 'framer-motion';

export interface StarRowProps {
  value?: number; // 0–3
  size?: number;
  gap?: number;
}

/** Star rating display 0–3 stars, pop-in via Framer Motion */
export function StarRow({ value = 0, size = 28, gap = 6 }: StarRowProps) {
  return (
    <div style={{ display: 'flex', gap }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          initial={i < value ? { scale: 0.6, opacity: 0 } : false}
          animate={i < value ? { scale: 1, opacity: 1 } : { opacity: 0.25 }}
          transition={{ delay: i * 0.1, type: 'spring', stiffness: 400, damping: 20 }}
          style={{
            fontSize: size,
            filter: i < value ? 'drop-shadow(0 2px 0 #B87C0E)' : 'none',
          }}
        >
          {i < value ? '⭐' : '☆'}
        </motion.div>
      ))}
    </div>
  );
}
