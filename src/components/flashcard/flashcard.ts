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

/** Set a face as active (visible, on top) and the other as inactive (hidden, behind). */
function setActiveFace(container: HTMLElement, activeFaceId: string): void {
  const front = container.querySelector<HTMLElement>('#flashcardFront')!;
  const back = container.querySelector<HTMLElement>('#flashcardBack')!;
  const isFront = activeFaceId === 'flashcardFront';

  const active = isFront ? front : back;
  const inactive = isFront ? back : front;

  active.classList.add('flashcard__face--active');
  inactive.classList.remove('flashcard__face--active');

  /* Sync tab indices: active face interactive, inactive face not */
  active.querySelectorAll<HTMLElement>('button').forEach((b) => (b.tabIndex = 0));
  inactive.querySelectorAll<HTMLElement>('button').forEach((b) => (b.tabIndex = -1));
}

/** Update the flashcard content with a new word. */
export function updateFlashcardContent(
  container: HTMLElement,
  word: Word,
  status: CardStatus,
): void {
  /* Always reset to front face */
  setActiveFace(container, 'flashcardFront');

  /* Update status tint */
  const statusClass =
    status === 'learning'
      ? ' flashcard__face--learning'
      : status === 'known'
        ? ' flashcard__face--known'
        : '';
  container.querySelector('#flashcardFront')!.className =
    `flashcard__face flashcard__face--front flashcard__face--active${statusClass}`;
  container.querySelector('#flashcardBack')!.className =
    `flashcard__face flashcard__face--back${statusClass}`;

  /* Update content */
  container.querySelector('#frontArabic')!.textContent = word.ar;
  container.querySelector('#frontTransliteration')!.textContent = word.transliteration || '';
  container.querySelector('#frontFrequency')!.textContent = `×${word.freq} in Quran`;
  container.querySelector('#backEnglish')!.textContent = word.en || '(no translation)';
  container.querySelector('#backFrequency')!.textContent = `×${word.freq} in Quran`;
}

/** Whether a flip animation is currently running. */
let isFlipping = false;

/** Toggle the flip state of the flashcard. */
export function toggleFlashcardFlip(container: HTMLElement): void {
  if (isFlipping) return;

  const flashcard = container.querySelector<HTMLElement>('#flashcard')!;
  const front = container.querySelector<HTMLElement>('#flashcardFront')!;
  const isFrontActive = front.classList.contains('flashcard__face--active');
  const nextFaceId = isFrontActive ? 'flashcardBack' : 'flashcardFront';

  isFlipping = true;

  /* Web Animations API — scaleX flip over 0.5s */
  const animation = flashcard.animate(
    [
      { transform: 'scaleX(1)' },
      { transform: 'scaleX(0)', offset: 0.4 },
      { transform: 'scaleX(1)' },
    ],
    { duration: 500, easing: 'ease-in-out' },
  );

  /* Swap the active face at 200ms (while card is edge-on) */
  setTimeout(() => {
    setActiveFace(container, nextFaceId);
  }, 200);

  animation.onfinish = () => {
    isFlipping = false;
  };
}
