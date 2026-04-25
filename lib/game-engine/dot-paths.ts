import type { DotPoint } from './types';

/**
 * Static dot positions for digits 0-9.
 * Coordinates: percentage of 200x280 SVG viewBox.
 * Labels: 1-based tap order following natural handwriting stroke.
 */
export const DOT_PATHS: Record<number, DotPoint[]> = {
  0: [
    { x: 50, y: 8,   label: 1 },
    { x: 85, y: 25,  label: 2 },
    { x: 85, y: 65,  label: 3 },
    { x: 50, y: 88,  label: 4 },
    { x: 15, y: 65,  label: 5 },
    { x: 15, y: 25,  label: 6 },
  ],
  1: [
    { x: 35, y: 20,  label: 1 },
    { x: 50, y: 8,   label: 2 },
    { x: 50, y: 50,  label: 3 },
    { x: 50, y: 88,  label: 4 },
  ],
  2: [
    { x: 20, y: 25,  label: 1 },
    { x: 50, y: 8,   label: 2 },
    { x: 80, y: 25,  label: 3 },
    { x: 50, y: 55,  label: 4 },
    { x: 20, y: 88,  label: 5 },
    { x: 80, y: 88,  label: 6 },
  ],
  3: [
    { x: 20, y: 15,  label: 1 },
    { x: 65, y: 8,   label: 2 },
    { x: 80, y: 30,  label: 3 },
    { x: 45, y: 48,  label: 4 },
    { x: 80, y: 68,  label: 5 },
    { x: 50, y: 88,  label: 6 },
    { x: 20, y: 80,  label: 7 },
  ],
  4: [
    { x: 65, y: 8,   label: 1 },
    { x: 35, y: 40,  label: 2 },
    { x: 15, y: 60,  label: 3 },
    { x: 85, y: 60,  label: 4 },
    { x: 65, y: 40,  label: 5 },
    { x: 65, y: 88,  label: 6 },
  ],
  5: [
    { x: 75, y: 8,   label: 1 },
    { x: 25, y: 8,   label: 2 },
    { x: 20, y: 42,  label: 3 },
    { x: 55, y: 38,  label: 4 },
    { x: 82, y: 58,  label: 5 },
    { x: 55, y: 88,  label: 6 },
    { x: 20, y: 78,  label: 7 },
  ],
  6: [
    { x: 70, y: 12,  label: 1 },
    { x: 40, y: 8,   label: 2 },
    { x: 15, y: 35,  label: 3 },
    { x: 15, y: 68,  label: 4 },
    { x: 50, y: 88,  label: 5 },
    { x: 82, y: 68,  label: 6 },
    { x: 55, y: 48,  label: 7 },
  ],
  7: [
    { x: 15, y: 8,   label: 1 },
    { x: 80, y: 8,   label: 2 },
    { x: 60, y: 35,  label: 3 },
    { x: 45, y: 60,  label: 4 },
    { x: 35, y: 88,  label: 5 },
  ],
  8: [
    { x: 50, y: 8,   label: 1 },
    { x: 80, y: 22,  label: 2 },
    { x: 50, y: 45,  label: 3 },
    { x: 18, y: 22,  label: 4 },
    { x: 18, y: 68,  label: 5 },
    { x: 50, y: 88,  label: 6 },
    { x: 82, y: 68,  label: 7 },
    { x: 50, y: 45,  label: 8 },
  ],
  9: [
    { x: 50, y: 48,  label: 1 },
    { x: 18, y: 28,  label: 2 },
    { x: 50, y: 8,   label: 3 },
    { x: 82, y: 28,  label: 4 },
    { x: 82, y: 55,  label: 5 },
    { x: 50, y: 88,  label: 6 },
    { x: 25, y: 82,  label: 7 },
  ],
};

/** SVG path data for digit outlines (simplified strokes) */
export const DIGIT_SVG_PATHS: Record<number, string> = {
  0: 'M100,22 C145,22 170,70 170,140 C170,210 145,258 100,258 C55,258 30,210 30,140 C30,70 55,22 100,22 Z',
  1: 'M70,56 L100,22 L100,258',
  2: 'M35,70 C35,35 65,22 100,22 C135,22 165,40 165,70 C165,110 100,154 35,246 L165,246',
  3: 'M40,42 L120,22 C155,22 170,50 170,78 C170,110 145,126 120,126 C155,126 175,150 175,186 C175,230 140,258 100,258 C65,258 40,240 40,224',
  4: 'M130,22 L30,168 L170,168 M130,22 L130,258',
  5: 'M150,22 L50,22 L40,118 C65,100 90,95 115,100 C155,110 170,145 170,186 C170,230 140,258 100,258 C65,258 40,240 40,218',
  6: 'M140,34 C120,22 100,22 80,28 C45,42 30,90 30,158 C30,220 55,258 100,258 C145,258 170,225 170,186 C170,148 145,126 110,126 C75,126 30,148 30,186',
  7: 'M30,22 L170,22 L90,258',
  8: 'M100,126 C60,126 40,105 40,78 C40,45 65,22 100,22 C135,22 160,45 160,78 C160,105 140,126 100,126 C55,126 30,155 30,196 C30,235 60,258 100,258 C140,258 170,235 170,196 C170,155 145,126 100,126',
  9: 'M170,100 C170,55 140,22 100,22 C60,22 30,55 30,100 C30,135 55,155 90,155 C125,155 170,135 170,100 L170,200 C170,235 145,258 110,258 C80,258 60,248 50,230',
};
