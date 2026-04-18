/* ============================================================
 * Deck List View — home page with logo, mastery bar, and deck grids.
 * ============================================================ */

import {
  getAllWords,
  getSurahInfoMap,
  calculateGlobalMastery,
  calculateSurahMastery,
  calculateMasteryPercentage,
} from '@/utils/data';
import { getWordStatus } from '@/utils/progress';
import { FREQUENCY_RANGES } from '@/utils/deck-engine';
import { renderProgressBar } from '@/components/progress-bar/progress-bar';
import { renderProgressRing } from '@/components/progress-ring/progress-ring';
import { renderDeckCard } from '@/components/deck-card/deck-card';
import { renderDeckGrid, attachDeckGridTabs } from '@/components/deck-grid/deck-grid';
import './deck-list.css';

interface DeckListCallbacks {
  onOpenSurah: (surahNumber: number) => void;
  onOpenFrequencyDeck: (rangeIndex: number) => void;
}

/** Render the deck list (home) view. */
export function renderDeckListView(container: HTMLElement, callbacks: DeckListCallbacks): void {
  const allWords = getAllWords();
  const surahInfo = getSurahInfoMap();
  const globalMasteryPercentage = calculateGlobalMastery();

  /* ---- Build surah cards ---- */
  let surahGridHtml = '';
  for (let surahNumber = 1; surahNumber <= 114; surahNumber++) {
    const surahKey = String(surahNumber);
    const info = surahInfo[surahKey] || { name: `Surah ${surahNumber}`, name_ar: '' };
    const masteryPercentage = calculateSurahMastery(surahNumber);
    let wordCount = 0;
    allWords.forEach((word) => {
      if (word.surahs[surahKey]) wordCount++;
    });

    surahGridHtml += renderDeckCard({
      dataAttribute: 'surah',
      dataValue: String(surahNumber),
      progressRing: renderProgressRing({
        percentage: masteryPercentage,
        centerText: String(surahNumber),
      }),
      name: info.name,
      subtitle: info.name_ar,
      subtitleArabic: true,
      meta: `${wordCount} words`,
      ariaLabel: `${info.name}, ${wordCount} words, ${Math.round(masteryPercentage)}% complete`,
    });
  }

  /* ---- Build frequency cards ---- */
  let frequencyGridHtml = '';
  FREQUENCY_RANGES.forEach((range, rangeIndex) => {
    let wordCount = 0;
    let totalFrequency = 0;
    let knownFrequency = 0;
    allWords.forEach((word) => {
      if (word.freq >= range.min && word.freq <= range.max) {
        wordCount++;
        totalFrequency += word.freq;
        if (getWordStatus(word) === 'known') knownFrequency += word.freq;
      }
    });
    if (!wordCount) return;
    const masteryPercentage = calculateMasteryPercentage(totalFrequency, knownFrequency);

    const [freqName, freqRange] = range.label.split(' (');
    frequencyGridHtml += renderDeckCard({
      dataAttribute: 'freq',
      dataValue: String(rangeIndex),
      progressRing: renderProgressRing({
        percentage: masteryPercentage,
        centerText: `${Math.round(masteryPercentage)}%`,
      }),
      name: freqName,
      subtitle: freqRange ? `(${freqRange}` : undefined,
      meta: `${wordCount} words`,
      ariaLabel: `${range.label}, ${wordCount} words, ${Math.round(masteryPercentage)}% complete`,
    });
  });

  /* ---- Render page ---- */
  container.innerHTML = `
    <header class="deck-list__header">
      <img src="/title-light.svg" alt="Iqra" class="deck-list__logo deck-list__logo--light" width="320" height="320">
      <img src="/title-dark.svg" alt="Iqra" class="deck-list__logo deck-list__logo--dark" width="320" height="320">
    </header>
    ${renderProgressBar({ percentage: globalMasteryPercentage, label: 'Quran Mastery:' })}
    ${renderDeckGrid({ activeTab: 'surahs', surahGridHtml, frequencyGridHtml })}`;

  /* ---- Attach events ---- */
  attachDeckGridTabs(container);

  container.querySelectorAll<HTMLElement>('[data-surah]').forEach((element) => {
    const handler = () => callbacks.onOpenSurah(parseInt(element.dataset.surah!));
    element.addEventListener('click', handler);
    element.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handler();
      }
    });
  });

  container.querySelectorAll<HTMLElement>('[data-freq]').forEach((element) => {
    const handler = () => callbacks.onOpenFrequencyDeck(parseInt(element.dataset.freq!));
    element.addEventListener('click', handler);
    element.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handler();
      }
    });
  });
}
