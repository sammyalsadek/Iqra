/* ============================================================
 * Shared types for the Iqra application.
 * ============================================================ */

/** Audio and frequency data for a word within a specific surah. */
export interface SurahWordData {
  count: number;
  audio: string;
}

/** A single Quran vocabulary word with all associated data. */
export interface Word {
  /** Arabic text (Uthmani script). */
  ar: string;
  /** English translation. */
  en: string;
  /** Latin transliteration. */
  transliteration: string;
  /** Total frequency across the entire Quran. */
  freq: number;
  /** Default audio URL (first occurrence). */
  audio: string;
  /** Per-surah data keyed by surah number string. */
  surahs: Record<string, SurahWordData>;
}

/** Metadata for a surah. */
export interface SurahInfo {
  name: string;
  name_ar: string;
  ayah_count: number;
}

/** Top-level structure of words.json. */
export interface WordsData {
  meta: { total_unique: number; total_words: number };
  surah_info: Record<string, SurahInfo>;
  words: Word[];
}

/** Spaced repetition progress for a single word. */
export interface WordProgress {
  status: 'unseen' | 'learning' | 'known';
  interval: number;
  due: number;
}

/** All user progress keyed by Arabic word text. */
export type ProgressMap = Record<string, WordProgress | string>;

/** Card status values. */
export type CardStatus = 'unseen' | 'learning' | 'known';

/** Study filter options. */
export type StudyFilter = 'smart' | 'unseen' | 'learning' | 'known' | 'all';

/** Theme preference. */
export type ThemePreference = 'light' | 'dark' | 'auto';

/** A frequency range for grouping words. */
export interface FrequencyRange {
  label: string;
  min: number;
  max: number;
}
