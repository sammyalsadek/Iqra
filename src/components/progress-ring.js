export function progressRing(pct, label = '', size = 40) {
  const r = size / 2 - 4;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const cx = size / 2, cy = size / 2;
  return `<svg width="${size}" height="${size}" role="img" aria-label="${Math.round(pct)}% complete">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--border)" stroke-width="3"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--primary)" stroke-width="3"
      stroke-dasharray="${circ}" stroke-dashoffset="${offset}" transform="rotate(-90 ${cx} ${cy})"
      stroke-linecap="round"/>
    <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central"
      fill="var(--text)" font-size="${label ? 9 : 11}" font-weight="600">${label || Math.round(pct)}</text>
  </svg>`;
}
