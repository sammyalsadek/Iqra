/* ============================================================
 * Spaced repetition — SM-2 algorithm and deck management.
 * Handles smart study ordering, session re-queue, and interval growth.
 * ============================================================ */

import type { Word, CardStatus, StudyFilter, FrequencyRange, WordProgress } from '@/types';
import { getAllWords } from '@/utils/data';
import { getWordProgress, getWordStatus, setWordProgress } from '@/utils/progress';

const ONE_DAY_MS = 86_400_000;

/** Predefined frequency ranges for grouping words. */
export const FREQUENCY_RANGES: FrequencyRange[] = [
  { label: 'Ultra Common (500+)', min: 500, max: Infinity },
  { label: 'Very Common (200–499)', min: 200, max: 499 },
  { label: 'Common (100–199)', min: 100, max: 199 },
  { label: 'Moderate (50–99)', min: 50, max: 99 },
  { label: 'Less Common (20–49)', min: 20, max: 49 },
  { label: 'Uncommon (10–19)', min: 10, max: 19 },
  { label: 'Rare (1–9)', min: 1, max: 9 },
];

/**
 * Build a study deck from word indices based on the selected filter.
 *
 * Smart Study: due cards first (sorted by due date), then unseen cards (sorted by frequency desc).
 * Other filters: simple status match.
 */
export function buildStudyDeck(
  wordIndices: number[],
  filter: StudyFilter,
  frequencyRange: FrequencyRange | null,
): number[] {
  const allWords = getAllWords();
  const now = Date.now();

  if (filter === 'smart') {
    const dueCardIndices: number[] = [];
    const unseenCardIndices: number[] = [];

    wordIndices.forEach((index) => {
      const word = allWords[index];
      if (frequencyRange && (word.freq < frequencyRange.min || word.freq > frequencyRange.max))
        return;
      const progress = getWordProgress(word);
      if (progress.status === 'unseen') {
        unseenCardIndices.push(index);
      } else if (
        progress.status === 'learning' ||
        (progress.status === 'known' && progress.due && now >= progress.due)
      ) {
        dueCardIndices.push(index);
      }
    });

    dueCardIndices.sort(
      (a, b) => (getWordProgress(allWords[a]).due || 0) - (getWordProgress(allWords[b]).due || 0),
    );
    unseenCardIndices.sort((a, b) => allWords[b].freq - allWords[a].freq);

    return [...dueCardIndices, ...unseenCardIndices];
  }

  /* Non-smart filters: simple status match */
  const deck: number[] = [];
  wordIndices.forEach((index) => {
    const word = allWords[index];
    if (filter !== 'all' && getWordStatus(word) !== filter) return;
    if (frequencyRange && (word.freq < frequencyRange.min || word.freq > frequencyRange.max))
      return;
    deck.push(index);
  });
  return deck;
}

/**
 * Mark a card with a status and update the deck accordingly.
 * Returns the new current card index.
 *
 * Smart Study: uses SM-2 intervals and session re-queue.
 * Other filters: just updates status, no intervals.
 */
export function markCard(
  deck: number[],
  currentIndex: number,
  markedStatus: CardStatus,
  activeFilter: StudyFilter,
): number {
  const allWords = getAllWords();
  const word: Word = allWords[deck[currentIndex]];
  const previousProgress: WordProgress = getWordProgress(word);
  const now = Date.now();

  /* ---- Smart Study: full SM-2 logic ---- */
  if (activeFilter === 'smart') {
    if (markedStatus === 'unseen') {
      setWordProgress(word, { status: 'unseen', interval: 0, due: 0 });
      const removedIndex = deck.splice(currentIndex, 1)[0];
      const reinsertPosition = Math.min(currentIndex + 5, deck.length);
      deck.splice(reinsertPosition, 0, removedIndex);
      return currentIndex >= deck.length ? 0 : currentIndex;
    }

    if (markedStatus === 'learning') {
      setWordProgress(word, { status: 'learning', interval: ONE_DAY_MS, due: now + ONE_DAY_MS });
      const removedIndex = deck.splice(currentIndex, 1)[0];
      const reinsertPosition = Math.min(currentIndex + 10, deck.length);
      deck.splice(reinsertPosition, 0, removedIndex);
      return currentIndex >= deck.length ? 0 : currentIndex;
    }

    /* Known: grow interval and remove from session */
    const previousInterval = previousProgress.interval || ONE_DAY_MS;
    const newInterval =
      previousInterval < ONE_DAY_MS
        ? ONE_DAY_MS
        : previousInterval < 3 * ONE_DAY_MS
          ? 3 * ONE_DAY_MS
          : previousInterval < 7 * ONE_DAY_MS
            ? 7 * ONE_DAY_MS
            : 30 * ONE_DAY_MS;
    setWordProgress(word, { status: 'known', interval: newInterval, due: now + newInterval });
    deck.splice(currentIndex, 1);
    return Math.min(currentIndex, Math.max(0, deck.length - 1));
  }

  /* ---- Non-smart filters: just set status, no intervals ---- */
  setWordProgress(word, { status: markedStatus, interval: 0, due: 0 });
  if (activeFilter !== 'all' && markedStatus !== activeFilter) {
    deck.splice(currentIndex, 1);
    return Math.min(currentIndex, Math.max(0, deck.length - 1));
  }
  return (currentIndex + 1) % deck.length;
}

/** Shuffle a deck in place using Fisher-Yates algorithm. */
export function shuffleDeck(deck: number[]): void {
  for (let i = deck.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[randomIndex]] = [deck[randomIndex], deck[i]];
  }
}
