/* ============================================================
 * Progress management — CRUD for word learning progress.
 * Persisted in localStorage.
 * ============================================================ */

import type { Word, WordProgress, ProgressMap, CardStatus } from '@/types';

const STORAGE_KEY = 'iqra-progress';

/** In-memory progress map, synced with localStorage. */
let progressMap: ProgressMap = {};

/** Load progress from localStorage into memory. */
export function loadProgress(): void {
  progressMap = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
}

/** Persist current progress to localStorage. */
function saveProgress(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progressMap));
}

/** Get the full progress entry for a word. */
export function getWordProgress(word: Word): WordProgress {
  const entry = progressMap[word.ar];
  if (!entry) return { status: 'unseen', interval: 0, due: 0 };
  if (typeof entry === 'string') return { status: entry as CardStatus, interval: 0, due: 0 };
  return entry;
}

/** Get just the status for a word. */
export function getWordStatus(word: Word): CardStatus {
  return getWordProgress(word).status;
}

/** Set progress for a word and persist. */
export function setWordProgress(word: Word, progress: WordProgress): void {
  progressMap[word.ar] = progress;
  saveProgress();
}

/** Reset progress for a list of words (by index into the word array). */
export function resetWordsProgress(words: Word[], indices: number[]): void {
  indices.forEach((index) => delete progressMap[words[index].ar]);
  saveProgress();
}

/** Reset all progress. */
export function resetAllProgress(): void {
  progressMap = {};
  saveProgress();
}

/** Export progress as a downloadable JSON file. */
export function exportProgress(): void {
  const blob = new Blob([JSON.stringify(progressMap, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `iqra-progress-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

/** Import progress from a JSON file. Returns the number of words imported. */
export function importProgress(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        progressMap = data;
        saveProgress();
        resolve(Object.keys(data).length);
      } catch {
        reject(new Error('Invalid progress file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
