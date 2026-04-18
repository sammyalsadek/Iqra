import type { ProgressRingProps } from './progress-ring.types';

/** Render a circular SVG progress ring. */
export function renderProgressRing({
  percentage,
  centerText,
  size = 40,
}: ProgressRingProps): string {
  const radius = size / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (percentage / 100) * circumference;
  const center = size / 2;

  return `<svg width="${size}" height="${size}" role="img" aria-label="${Math.round(percentage)}% complete">
    <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="var(--border)" stroke-width="3"/>
    <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="var(--primary)" stroke-width="3"
      stroke-dasharray="${circumference}" stroke-dashoffset="${strokeOffset}" transform="rotate(-90 ${center} ${center})"
      stroke-linecap="round"/>
    <text x="${center}" y="${center}" text-anchor="middle" dominant-baseline="central"
      fill="var(--text)" font-size="9" font-weight="600">${centerText}</text>
  </svg>`;
}
