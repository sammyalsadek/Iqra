let currentSurah = null;

export function loadSurahAudio(surahNum) {
  currentSurah = String(surahNum);
}

export function playWord(word) {
  // Prefer per-surah audio, fall back to word-level audio
  const surahData = currentSurah && word.surahs[currentSurah];
  const url = (surahData && surahData.audio) || word.audio;
  if (url) { new Audio(url).play(); return; }
  const u = new SpeechSynthesisUtterance(word.ar);
  u.lang = 'ar'; u.rate = 0.8;
  const v = speechSynthesis.getVoices().find(v => v.lang.startsWith('ar'));
  if (v) u.voice = v;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

speechSynthesis.getVoices();
