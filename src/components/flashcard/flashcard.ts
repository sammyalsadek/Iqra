/* ============================================================
 * Flashcard component — the flip card with Arabic/English faces.
 * Buttons (audio, flip, nav) are inside each face.
 * ============================================================ */

import type { Word, CardStatus } from '@/types';
import { volumeIcon, flipIcon, chevronLeftIcon, chevronRightIcon } from '@/components/icons';
import { renderButton } from '@/components/button/button';
import { renderText } from '@/components/typography/typography';
import { ButtonVariant } from '@/components/button/button.types';
import { TextVariant } from '@/components/typography/typography.types';
import './flashcard.css';

/** Render the flashcard HTML. */
export function renderFlashcard(containerId: string): string {
  return `
    <div class="flashcard-container" id="${containerId}" tabindex="0" role="button" aria-label="Flashcard, press space to flip">
      <div class="flashcard" id="flashcard">
        <div class="flashcard__face flashcard__face--front" id="flashcardFront">
          <div class="flashcard__corner-btn flashcard__corner-btn--left">${renderButton({ label: '', variant: ButtonVariant.ICON, icon: volumeIcon, id: 'audioButton', ariaLabel: 'Play pronunciation' })}</div>
          <div class="flashcard__corner-btn flashcard__corner-btn--right">${renderButton({ label: '', variant: ButtonVariant.ICON, icon: flipIcon, id: 'flipButtonFront', ariaLabel: 'Flip card' })}</div>
          <div class="flashcard__side-btn flashcard__side-btn--left">${renderButton({ label: '', variant: ButtonVariant.ICON, icon: chevronLeftIcon, id: 'prevButtonFront', ariaLabel: 'Previous card' })}</div>
          <div class="flashcard__side-btn flashcard__side-btn--right">${renderButton({ label: '', variant: ButtonVariant.ICON, icon: chevronRightIcon, id: 'nextButtonFront', ariaLabel: 'Next card' })}</div>
          ${renderText({ text: '', variant: TextVariant.ARABIC_DISPLAY, id: 'frontArabic' })}
          ${renderText({ text: '', variant: TextVariant.SECONDARY, id: 'frontTransliteration' })}
          ${renderText({ text: '', variant: TextVariant.HINT, id: 'frontFrequency' })}
        </div>
        <div class="flashcard__face flashcard__face--back" id="flashcardBack">
          <div class="flashcard__corner-btn flashcard__corner-btn--right">${renderButton({ label: '', variant: ButtonVariant.ICON, icon: flipIcon, id: 'flipButtonBack', ariaLabel: 'Flip card' })}</div>
          <div class="flashcard__side-btn flashcard__side-btn--left">${renderButton({ label: '', variant: ButtonVariant.ICON, icon: chevronLeftIcon, id: 'prevButtonBack', ariaLabel: 'Previous card' })}</div>
          <div class="flashcard__side-btn flashcard__side-btn--right">${renderButton({ label: '', variant: ButtonVariant.ICON, icon: chevronRightIcon, id: 'nextButtonBack', ariaLabel: 'Next card' })}</div>
          ${renderText({ text: '', variant: TextVariant.ENGLISH_DISPLAY, id: 'backEnglish' })}
          ${renderText({ text: '', variant: TextVariant.HINT, id: 'backFrequency' })}
        </div>
      </div>
    </div>`;
}

/** Update the flashcard content with a new word. */
export function updateFlashcardContent(
  container: HTMLElement,
  word: Word,
  status: CardStatus,
): void {
  const flashcard = container.querySelector<HTMLElement>('#flashcard')!;

  /* Reset flip without animation */
  flashcard.style.transition = 'none';
  flashcard.classList.remove('flashcard--flipped');
  void flashcard.offsetWidth;
  flashcard.style.transition = '';

  /* Reset button visibility */
  container.querySelectorAll<HTMLElement>('#flashcardFront button').forEach((button) => {
    button.tabIndex = 0;
    button.style.visibility = '';
  });
  container.querySelectorAll<HTMLElement>('#flashcardBack button').forEach((button) => {
    button.tabIndex = -1;
    button.style.visibility = 'hidden';
  });

  /* Update status tint */
  const statusClass =
    status === 'learning'
      ? ' flashcard__face--learning'
      : status === 'known'
        ? ' flashcard__face--known'
        : '';
  container.querySelector('#flashcardFront')!.className =
    `flashcard__face flashcard__face--front${statusClass}`;
  container.querySelector('#flashcardBack')!.className =
    `flashcard__face flashcard__face--back${statusClass}`;

  /* Update content */
  container.querySelector('#frontArabic')!.textContent = word.ar;
  container.querySelector('#frontTransliteration')!.textContent = word.transliteration || '';
  container.querySelector('#frontFrequency')!.textContent = `×${word.freq} in Quran`;
  container.querySelector('#backEnglish')!.textContent = word.en || '(no translation)';
  container.querySelector('#backFrequency')!.textContent = `×${word.freq} in Quran`;
}

/** Toggle the flip state of the flashcard. */
export function toggleFlashcardFlip(container: HTMLElement): void {
  const flashcard = container.querySelector<HTMLElement>('#flashcard')!;
  flashcard.style.transition = 'transform 0.5s';
  flashcard.classList.toggle('flashcard--flipped');
  const isFlipped = flashcard.classList.contains('flashcard--flipped');

  container.querySelectorAll<HTMLElement>('#flashcardFront button').forEach((button) => {
    button.tabIndex = isFlipped ? -1 : 0;
    button.style.visibility = isFlipped ? 'hidden' : '';
  });
  container.querySelectorAll<HTMLElement>('#flashcardBack button').forEach((button) => {
    button.tabIndex = isFlipped ? 0 : -1;
    button.style.visibility = isFlipped ? '' : 'hidden';
  });
}
