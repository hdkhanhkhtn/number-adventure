export interface SpeakerIconProps {
  size?: number;
}

/** SVG speaker icon for audio-first UX */
export function SpeakerIcon({ size = 24 }: SpeakerIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M4 10 v4 a1 1 0 0 0 1 1 h3 l4 4 a1 1 0 0 0 1.7 -0.7 V5.7 a1 1 0 0 0 -1.7 -0.7 l-4 4 H5 a1 1 0 0 0 -1 1 z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M16 9 Q 19 12 16 15" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M18 6 Q 23 12 18 18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
