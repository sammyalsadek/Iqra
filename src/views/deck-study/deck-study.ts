/* ============================================================
 * Deck Study View — flashcard study page with controls and stats.
 * ============================================================ */

import type { StudyFilter, FrequencyRange, CardStatus } from '@/types';
import type { DeckStudyProps } from './deck-study.types';
import { getAllWords, calculateMasteryPercentage } from '@/utils/data';
import { getWordStatus } from '@/utils/progress';
import { resetWordsProgress } from '@/utils/progress';
import { playWordAudio, setCurrentSurah, clearCurrentSurah } from '@/utils/audio';
import { buildStudyDeck, markCard, shuffleDeck, FREQUENCY_RANGES } from '@/utils/deck-engine';
import {
  renderFlashcard,
  updateFlashcardContent,
  toggleFlashcardFlip,
} from '@/components/flashcard/flashcard';
import { attachTouchControls, attachKeyboardControls } from '@/components/flashcard/card-controls';
import { renderProgressBar } from '@/components/progress-bar/progress-bar';
import { showModal } from '@/components/modal/modal';
import { showToast } from '@/components/toast/toast';
import { xIcon, minusIcon, checkIcon, shuffleIcon, trashIcon, infoIcon } from '@/components/icons';
import { renderButton } from '@/components/button/button';
import { ButtonVariant, ButtonColor } from '@/components/button/button.types';
import { renderText } from '@/components/typography/typography';
import { TextVariant } from '@/components/typography/typography.types';
import { renderCard } from '@/components/card/card';
import { CardVariant } from '@/components/card/card.types';
import './deck-study.css';

/** Current study state. */
let deck: number[] = [];
let currentCardIndex = 0;

export function renderDeckStudyView(container: HTMLElement, props: DeckStudyProps): () => void {
  const allWords = getAllWords();
  const wordIndices = props.wordIndices;

  /* Set audio context */
  if (props.surahNumber) setCurrentSurah(parseInt(props.surahNumber));
  else clearCurrentSurah();

  /* ---- Build HTML ---- */
  const subtitleVariant = props.isFrequencyDeck
    ? TextVariant.SECONDARY
    : TextVariant.ARABIC_SUBTITLE;
  const masteryLabel = props.isFrequencyDeck ? 'Deck Mastery:' : 'Surah Mastery:';
  const frequencyFilterDisplay = props.isFrequencyDeck ? 'style="display:none"' : '';

  container.innerHTML = `
    <div class="deck-study__header">
      ${renderText({ text: props.title, variant: TextVariant.HEADING })}
      ${renderText({ text: props.subtitle, variant: subtitleVariant })}
    </div>
    <div id="deckMasteryBar">${renderProgressBar({ percentage: 0, label: masteryLabel })}</div>
    <div class="deck-study__controls">
      <div class="deck-study__filter-group">
        <span class="deck-study__filter-info deck-study__filter-info--hidden" id="smartStudyInfo" role="button" tabindex="-1" aria-label="What is Smart Study?">${infoIcon}</span>
        <select id="statusFilter" aria-label="Card filter">
          <option value="smart">Smart Study</option>
          <option value="unseen">Unseen</option>
          <option value="learning">Learning</option>
          <option value="known">Known</option>
          <option value="all">All</option>
        </select>
      </div>
      <select id="frequencyFilter" aria-label="Frequency filter" ${frequencyFilterDisplay}>
        <option value="all">All Frequencies</option>
      </select>
      ${renderButton({ label: 'Shuffle', icon: shuffleIcon, id: 'shuffleButton', ariaLabel: 'Shuffle deck' })}
      ${renderButton({ label: 'Reset', icon: trashIcon, id: 'resetButton', ariaLabel: 'Reset progress' })}
    </div>
    <div class="deck-study__stats" aria-label="Card statistics">
      <span><span class="deck-study__dot deck-study__dot--unseen"></span>Unseen: <b id="unseenCount">0</b></span>
      <span><span class="deck-study__dot deck-study__dot--learning"></span>Learning: <b id="learningCount">0</b></span>
      <span><span class="deck-study__dot deck-study__dot--known"></span>Known: <b id="knownCount">0</b></span>
      <span aria-hidden="true" style="opacity:.4">|</span>
      <span>Deck: <b id="deckSize">0</b></span>
    </div>
    ${renderText({ text: '', variant: TextVariant.SECONDARY, id: 'cardCounter', ariaLive: 'polite', tag: 'div' })}
    ${renderFlashcard('flashcardContainer')}
    ${renderCard({ variant: CardVariant.EMPTY, id: 'emptyCard', content: renderText({ text: "You\'re all caught up!", variant: TextVariant.BODY }) + renderText({ text: 'No cards match this filter. Try a different one or come back later for review.', variant: TextVariant.SECONDARY }) })}
    <div class="deck-study__actions" id="markActions">
      ${renderButton({ label: 'Again', variant: ButtonVariant.PRIMARY, color: ButtonColor.ERROR, icon: xIcon, ariaLabel: 'Again', dataAttributes: { mark: 'unseen' } })}
      ${renderButton({ label: 'Learning', variant: ButtonVariant.PRIMARY, color: ButtonColor.WARNING, icon: minusIcon, ariaLabel: 'Learning', dataAttributes: { mark: 'learning' } })}
      ${renderButton({ label: 'Known', variant: ButtonVariant.PRIMARY, color: ButtonColor.SUCCESS, icon: checkIcon, ariaLabel: 'Known', dataAttributes: { mark: 'known' } })}
    </div>
    ${renderText({ text: 'Space = flip · Arrows = nav · 1/2/3 = mark · A = audio · Esc = back', variant: TextVariant.HINT, ariaHidden: true, tag: 'div', id: 'hintDesktop' })}
    ${renderText({ text: 'Tap = flip · Swipe = nav', variant: TextVariant.HINT, ariaHidden: true, tag: 'div', id: 'hintMobile' })}
    <div id="cardAnnounce" class="sr-only" aria-live="polite" aria-atomic="true"></div>`;

  /* ---- Populate frequency filter ---- */
  const frequencyFilterSelect = container.querySelector<HTMLSelectElement>('#frequencyFilter')!;
  FREQUENCY_RANGES.forEach((range, index) => {
    const count = wordIndices.filter(
      (i) => allWords[i].freq >= range.min && allWords[i].freq <= range.max,
    ).length;
    if (count > 0) {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = `${range.label} (${count})`;
      frequencyFilterSelect.appendChild(option);
    }
  });

  /* ---- Helper functions ---- */
  const getActiveFilter = (): StudyFilter =>
    container.querySelector<HTMLSelectElement>('#statusFilter')!.value as StudyFilter;
  const getFrequencyRange = (): FrequencyRange | null => {
    const value = frequencyFilterSelect.value;
    return value !== 'all' ? FREQUENCY_RANGES[parseInt(value)] : null;
  };

  function rebuildDeck(): void {
    deck = buildStudyDeck(wordIndices, getActiveFilter(), getFrequencyRange());
    currentCardIndex = 0;
    updateCardDisplay();
    updateStatistics();
    updateSmartStudyInfoVisibility();
  }

  function updateStatistics(): void {
    let unseenCount = 0,
      learningCount = 0,
      knownCount = 0;
    let totalFrequency = 0,
      knownFrequency = 0;
    wordIndices.forEach((index) => {
      const word = allWords[index];
      const status = getWordStatus(word);
      if (status === 'unseen') unseenCount++;
      else if (status === 'learning') learningCount++;
      else knownCount++;
      const frequency =
        props.surahNumber && word.surahs[props.surahNumber]
          ? word.surahs[props.surahNumber].count
          : word.freq;
      totalFrequency += frequency;
      if (status === 'known') knownFrequency += frequency;
    });

    container.querySelector('#unseenCount')!.textContent = String(unseenCount);
    container.querySelector('#learningCount')!.textContent = String(learningCount);
    container.querySelector('#knownCount')!.textContent = String(knownCount);
    container.querySelector('#deckSize')!.textContent = String(deck.length);

    const masteryPercentage = calculateMasteryPercentage(totalFrequency, knownFrequency);
    container.querySelector('#deckMasteryBar')!.innerHTML = renderProgressBar({
      percentage: masteryPercentage,
      label: props.isFrequencyDeck ? 'Deck Mastery:' : 'Surah Mastery:',
    });
  }

  function updateCardDisplay(): void {
    const isEmpty = deck.length === 0;
    const flashcardContainer = container.querySelector<HTMLElement>('#flashcardContainer')!;
    const markActions = container.querySelector<HTMLElement>('#markActions')!;
    const cardCounter = container.querySelector<HTMLElement>('#cardCounter')!;
    const emptyCard = container.querySelector<HTMLElement>('#emptyCard')!;

    if (isEmpty) {
      flashcardContainer.style.display = 'none';
      markActions.style.display = 'none';
      cardCounter.textContent = '';
      emptyCard.style.display = '';
      return;
    }

    emptyCard.style.display = 'none';
    flashcardContainer.style.display = '';
    markActions.style.display = '';
    cardCounter.textContent = `${currentCardIndex + 1} / ${deck.length}`;

    const currentWord = allWords[deck[currentCardIndex]];
    const currentStatus = getWordStatus(currentWord);
    updateFlashcardContent(flashcardContainer, currentWord, currentStatus);

    const announceElement = container.querySelector('#cardAnnounce')!;
    announceElement.textContent = `Card ${currentCardIndex + 1} of ${deck.length}. ${currentWord.ar}. Press space to reveal meaning.`;
  }

  function flipCard(): void {
    if (deck.length === 0) return;
    const flashcardContainer = container.querySelector<HTMLElement>('#flashcardContainer')!;
    toggleFlashcardFlip(flashcardContainer);
  }

  function markCurrentCard(status: CardStatus): void {
    if (deck.length === 0) return;
    currentCardIndex = markCard(deck, currentCardIndex, status, getActiveFilter());
    updateCardDisplay();
    updateStatistics();
  }

  function navigateNext(): void {
    if (deck.length === 0) return;
    currentCardIndex = (currentCardIndex + 1) % deck.length;
    updateCardDisplay();
  }

  function navigatePrevious(): void {
    if (deck.length === 0) return;
    currentCardIndex = (currentCardIndex - 1 + deck.length) % deck.length;
    updateCardDisplay();
  }

  function playCurrentWordAudio(): void {
    if (deck.length === 0) return;
    playWordAudio(allWords[deck[currentCardIndex]]);
  }

  function updateSmartStudyInfoVisibility(): void {
    const infoElement = container.querySelector<HTMLElement>('#smartStudyInfo')!;
    const isSmart = getActiveFilter() === 'smart';
    infoElement.classList.toggle('deck-study__filter-info--hidden', !isSmart);
    infoElement.setAttribute('tabindex', isSmart ? '0' : '-1');
  }

  /* ---- Event listeners ---- */
  container
    .querySelector('#statusFilter')!
    .addEventListener('change', function (this: HTMLSelectElement) {
      this.blur();
      rebuildDeck();
    });
  frequencyFilterSelect.addEventListener('change', function (this: HTMLSelectElement) {
    this.blur();
    rebuildDeck();
  });
  container.querySelector('#shuffleButton')!.addEventListener('click', () => {
    shuffleDeck(deck);
    currentCardIndex = 0;
    updateCardDisplay();
  });
  container.querySelector('#resetButton')!.addEventListener('click', () => {
    showModal({
      title: 'Reset Progress',
      message: `This will reset all progress for <b>${props.title}</b> back to unseen. This cannot be undone.`,
      confirmText: 'Reset',
      danger: true,
      onConfirm: () => {
        resetWordsProgress(allWords, wordIndices);
        rebuildDeck();
        showToast(`Progress reset for ${props.title}`);
      },
    });
  });

  /* Smart Study info modal */
  const openSmartInfo = () => {
    showModal({
      title: 'Smart Study',
      message:
        "Smart Study picks the best cards for you. New words appear in order of how common they are in the Quran, and words you've seen before come back when it's time to review them.",
      confirmText: 'Got it',
      singleButton: true,
      onConfirm: () => {},
    });
  };
  container.querySelector('#smartStudyInfo')!.addEventListener('click', openSmartInfo);
  container.querySelector('#smartStudyInfo')!.addEventListener('keydown', (event) => {
    if ((event as KeyboardEvent).key === 'Enter' || (event as KeyboardEvent).key === ' ') {
      (event as KeyboardEvent).preventDefault();
      openSmartInfo();
    }
  });

  /* Mark action buttons */
  container.querySelectorAll<HTMLElement>('[data-mark]').forEach((button) => {
    button.addEventListener('click', () => markCurrentCard(button.dataset.mark as CardStatus));
  });

  /* Flashcard button handlers */
  const flashcardContainer = container.querySelector<HTMLElement>('#flashcardContainer')!;
  flashcardContainer.querySelector('#audioButton')!.addEventListener('click', (e) => {
    e.stopPropagation();
    playCurrentWordAudio();
  });
  flashcardContainer.querySelector('#flipButtonFront')!.addEventListener('click', flipCard);
  flashcardContainer.querySelector('#flipButtonBack')!.addEventListener('click', flipCard);
  flashcardContainer.querySelector('#prevButtonFront')!.addEventListener('click', navigatePrevious);
  flashcardContainer.querySelector('#nextButtonFront')!.addEventListener('click', navigateNext);
  flashcardContainer.querySelector('#prevButtonBack')!.addEventListener('click', navigatePrevious);
  flashcardContainer.querySelector('#nextButtonBack')!.addEventListener('click', navigateNext);

  /* Desktop click to flip */
  flashcardContainer.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('.flashcard__corner-btn, .flashcard__side-btn'))
      return;
    if ('ontouchstart' in window) return;
    flipCard();
  });

  /* Touch/swipe controls */
  attachTouchControls(flashcardContainer, {
    onFlip: flipCard,
    onNext: navigateNext,
    onPrevious: navigatePrevious,
    onPlayAudio: playCurrentWordAudio,
    onMark: markCurrentCard,
    onBack: props.onBack,
    hasDeck: () => deck.length > 0,
  });

  /* Keyboard controls */
  const cleanupKeyboard = attachKeyboardControls({
    onFlip: flipCard,
    onNext: navigateNext,
    onPrevious: navigatePrevious,
    onPlayAudio: playCurrentWordAudio,
    onMark: markCurrentCard,
    onBack: props.onBack,
    hasDeck: () => deck.length > 0,
  });

  /* Initial build */
  rebuildDeck();

  /* Return cleanup function */
  return cleanupKeyboard;
}
