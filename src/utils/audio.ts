/* ============================================================
 * Audio playback — plays word pronunciation from quran.com CDN.
 * Falls back to browser SpeechSynthesis if no audio URL.
 * ============================================================ */

import type { Word } from '@/types';

/** Currently active surah number (for per-surah audio selection). */
let currentSurahNumber: string | null = null;

/** Set the current surah for audio context. */
export function setCurrentSurah(surahNumber: number): void {
  currentSurahNumber = String(surahNumber);
}

/** Clear the current surah context (e.g. for frequency decks). */
export function clearCurrentSurah(): void {
  currentSurahNumber = null;
}

/**
 * Play the pronunciation of a word.
 * Priority: per-surah audio → default audio → SpeechSynthesis fallback.
 */
export function playWordAudio(word: Word): void {
  const surahData = currentSurahNumber ? word.surahs[currentSurahNumber] : null;
  const audioUrl = surahData?.audio || word.audio;

  if (audioUrl) {
    new Audio(audioUrl).play();
    return;
  }

  /* Fallback to browser speech synthesis */
  const utterance = new SpeechSynthesisUtterance(word.ar);
  utterance.lang = 'ar';
  utterance.rate = 0.8;
  const arabicVoice = speechSynthesis.getVoices().find((voice) => voice.lang.startsWith('ar'));
  if (arabicVoice) utterance.voice = arabicVoice;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

/* Pre-load available voices. */
speechSynthesis.getVoices();
