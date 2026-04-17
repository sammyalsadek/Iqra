const LS_KEY = 'iqra-progress';
const LS_THEME = 'iqra-theme';

let ALL = [];
let SURAH_INFO = {};
let progress = {};

export function loadData(data) {
  SURAH_INFO = data.surah_info || {};
  ALL = (data.words || []).map(w => ({
    ar: w.ar, en: w.en || '', root: w.root || '', lemma: w.lemma || '',
    pos: w.pos || '', grammar: w.grammar || '', freq: w.freq || 0,
    surahs: w.surahs || {}, audio: w.audio || null,
    transliteration: w.transliteration || ''
  }));
  progress = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
}

export function getAll() { return ALL; }
export function getSurahInfo() { return SURAH_INFO; }

export function key(c) { return c.ar; }

export function getProgress(c) {
  const p = progress[key(c)];
  if (!p) return { status: 'unseen', interval: 0, due: 0 };
  if (typeof p === 'string') return { status: p, interval: 0, due: 0 };
  return p;
}

export function getStatus(c) { return getProgress(c).status; }

export function setProgress(c, data) {
  progress[key(c)] = data;
  localStorage.setItem(LS_KEY, JSON.stringify(progress));
}

export function resetProgress(cards) {
  cards.forEach(i => delete progress[key(ALL[i])]);
  localStorage.setItem(LS_KEY, JSON.stringify(progress));
}

export function calcMastery(indices) {
  let totalFreq = 0, knownFreq = 0;
  indices.forEach(i => { totalFreq += ALL[i].freq; if (getStatus(ALL[i]) === 'known') knownFreq += ALL[i].freq; });
  return totalFreq ? knownFreq / totalFreq : 0;
}

export function calcGlobalMastery() {
  let totalFreq = 0, knownFreq = 0;
  ALL.forEach(c => { totalFreq += c.freq; if (getStatus(c) === 'known') knownFreq += c.freq; });
  return totalFreq ? knownFreq / totalFreq : 0;
}

export function calcSurahMastery(si) {
  const s = String(si);
  let totalFreq = 0, knownFreq = 0;
  ALL.forEach(c => {
    if (c.surahs[s]) { totalFreq += c.surahs[s].count; if (getStatus(c) === 'known') knownFreq += c.surahs[s].count; }
  });
  return totalFreq ? knownFreq / totalFreq : 0;
}

export function exportProgress() {
  const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `iqra-progress-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importProgress(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        progress = data;
        localStorage.setItem(LS_KEY, JSON.stringify(progress));
        resolve(Object.keys(data).length);
      } catch { reject(new Error('Invalid file')); }
    };
    reader.onerror = () => reject(new Error('Read error'));
    reader.readAsText(file);
  });
}

export function resetAllProgress() {
  progress = {};
  localStorage.setItem(LS_KEY, JSON.stringify(progress));
}

export function getTheme() { return localStorage.getItem(LS_THEME); }
export function setTheme(t) { localStorage.setItem(LS_THEME, t); }
