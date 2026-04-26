'use client';

// Full-screen loading skeleton shown while localStorage hydration completes.
// Prevents blank screen flash on first paint (NFR-01).
export function SkeletonScreen() {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#F5F3ED',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'rgba(46,90,58,0.12)',
        // TODO(phase-3a)[suggestion]: 'pulse' keyframe is not defined in this file or guaranteed globally.
        // Replace with Tailwind animate-pulse or define keyframe inline via <style> tag.
        animation: 'pulse 1.5s ease-in-out infinite',
      }} />
    </div>
  );
}
