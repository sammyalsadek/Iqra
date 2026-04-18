import { bookIcon, volumeIcon, zapIcon } from '@/components/icons';
import { showModal } from '@/components/modal/modal';
import { renderText } from '@/components/typography/typography';
import { TextVariant } from '@/components/typography/typography.types';
import './onboarding.css';

const STORAGE_KEY = 'iqra-onboarded';

/** Show the onboarding overlay for first-time users. */
export function showOnboarding(): void {
  if (localStorage.getItem(STORAGE_KEY)) return;

  const stepsHtml = `
    <div class="onboarding__steps">
      <div class="onboarding__step">
        <span class="onboarding__icon">${bookIcon}</span>
        ${renderText({ text: 'Start with a surah, or dive into the most common words across the Quran.', variant: TextVariant.BODY })}
      </div>
      <div class="onboarding__step">
        <span class="onboarding__icon">${volumeIcon}</span>
        ${renderText({ text: 'Flip each card to see its meaning, and tap the speaker to hear it spoken.', variant: TextVariant.BODY })}
      </div>
      <div class="onboarding__step">
        <span class="onboarding__icon">${zapIcon}</span>
        ${renderText({ text: 'Tell us how well you know each word — <b>Smart Study</b> handles the rest, bringing back the ones you need to practice.', variant: TextVariant.BODY })}
      </div>
    </div>`;

  showModal({
    title: 'Iqra, Iqra, Iqra',
    message: stepsHtml,
    confirmText: 'Get Started',
    singleButton: true,
    onConfirm: () => {
      localStorage.setItem(STORAGE_KEY, '1');
    },
  });
}
