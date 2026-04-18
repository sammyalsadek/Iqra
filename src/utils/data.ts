/* ============================================================
 * Word data management — loading, querying, mastery calculations.
 * ============================================================ */

import type { Word, SurahInfo, WordsData, FrequencyRange } from '@/types';
import { getWordStatus } from '@/utils/progress';

/** All loaded words. */
let allWords: Word[] = [];

/** Surah metadata keyed by surah number string. */
let surahInfoMap: Record<string, SurahInfo> = {};

/** Load word data from the parsed JSON. */
export function loadWordData(data: WordsData): void {
  allWords = data.words;
  surahInfoMap = data.surah_info;
}

/** Get all loaded words. */
export function getAllWords(): Word[] {
  return allWords;
}

/** Get surah info map. */
export function getSurahInfoMap(): Record<string, SurahInfo> {
  return surahInfoMap;
}

/** Get word indices that belong to a specific surah. */
export function getWordIndicesForSurah(surahNumber: number): number[] {
  const surahKey = String(surahNumber);
  const indices: number[] = [];
  allWords.forEach((word, index) => {
    if (word.surahs[surahKey]) indices.push(index);
  });
  return indices;
}

/** Get word indices that fall within a frequency range. */
export function getWordIndicesForFrequencyRange(range: FrequencyRange): number[] {
  const indices: number[] = [];
  allWords.forEach((word, index) => {
    if (word.freq >= range.min && word.freq <= range.max) indices.push(index);
  });
  return indices;
}

/**
 * Calculate frequency-weighted mastery for the entire Quran.
 * Returns a value between 0 and 1.
 */
export function calculateGlobalMastery(): number {
  let totalFrequency = 0;
  let knownFrequency = 0;
  allWords.forEach((word) => {
    totalFrequency += word.freq;
    if (getWordStatus(word) === 'known') knownFrequency += word.freq;
  });
  return calculateMasteryPercentage(totalFrequency, knownFrequency);
}

/**
 * Calculate frequency-weighted mastery for a specific surah.
 * Uses per-surah word counts for accurate weighting.
 * Returns a value between 0 and 100.
 */
export function calculateSurahMastery(surahNumber: number): number {
  const surahKey = String(surahNumber);
  let totalFrequency = 0;
  let knownFrequency = 0;
  allWords.forEach((word) => {
    const surahData = word.surahs[surahKey];
    if (surahData) {
      totalFrequency += surahData.count;
      if (getWordStatus(word) === 'known') knownFrequency += surahData.count;
    }
  });
  return calculateMasteryPercentage(totalFrequency, knownFrequency);
}

/** Calculate mastery percentage from frequency totals. Returns 0-100. */
export function calculateMasteryPercentage(totalFrequency: number, knownFrequency: number): number {
  return totalFrequency ? (knownFrequency / totalFrequency) * 100 : 0;
}
