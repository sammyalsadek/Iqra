import type { ProgressBarProps } from './progress-bar.types';
import './progress-bar.css';

/** Render a linear mastery progress bar. */
export function renderProgressBar({ percentage, label }: ProgressBarProps): string {
  const roundedPercentage = Math.round(percentage);
  return `
    <div class="mastery">
      <div class="mastery__label">${label} <b>${roundedPercentage}%</b></div>
      <div class="mastery__bar" role="progressbar" aria-valuenow="${roundedPercentage}" aria-valuemin="0" aria-valuemax="100">
        <div class="mastery__fill" style="width:${percentage}%"></div>
      </div>
    </div>`;
}
