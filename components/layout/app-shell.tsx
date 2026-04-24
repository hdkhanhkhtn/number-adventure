'use client';

export interface AppShellProps {
  children: React.ReactNode;
  /** Max width for the mobile-first viewport frame */
  maxWidth?: number;
}

/**
 * Main layout wrapper — centers the mobile-first viewport frame.
 * Designed for 390px wide phone portrait.
 */
export function AppShell({ children, maxWidth = 430 }: AppShellProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        minHeight: '100dvh',
        background: '#EFE6D3',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth,
          minHeight: '100dvh',
          overflow: 'hidden',
          background: 'var(--surface)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
