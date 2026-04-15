import { getAll, getSurahInfo, getTheme, setTheme } from './state.js';
import { FREQ_RANGES } from './spaced-repetition.js';
import { loadSurahAudio } from './audio.js';
import { renderSurahList } from './views/surah-list.js';
import { renderFlashcard } from './views/flashcard.js';
import { renderSettings } from './views/settings.js';
import { icons } from './components/icons.js';

let mainEl, themeBtn;

function cleanup() {
  const view = mainEl.querySelector('.view');
  if (view && view._cleanup) { view._cleanup(); view._cleanup = null; }
}

function showView(renderFn, ...args) {
  cleanup();
  mainEl.innerHTML = '';
  const view = document.createElement('div');
  view.className = 'view active';
  mainEl.appendChild(view);
  renderFn(view, ...args);
  window.scrollTo(0, 0);
}

function showSurahList() {
  showView(renderSurahList, {
    onOpenSurah: openSurah,
    onOpenFreqDeck: openFreqDeck,
  });
}

function openSurah(si) {
  const ALL = getAll();
  const info = getSurahInfo();
  const s = String(si);
  const surahCards = [];
  ALL.forEach((c, i) => { if (c.surahs[s]) surahCards.push(i); });
  loadSurahAudio(si);
  showView(renderFlashcard, {
    title: si + '. ' + (info[s]?.name || 'Surah ' + si),
    subtitle: info[s]?.name_ar || '',
    surahCards,
    isFreqDeck: false,
    onBack: showSurahList,
  });
}

function openFreqDeck(ri) {
  const ALL = getAll();
  const fr = FREQ_RANGES[ri];
  const surahCards = [];
  ALL.forEach((c, i) => { if (c.freq >= fr.min && c.freq <= fr.max) surahCards.push(i); });
  showView(renderFlashcard, {
    title: fr.label,
    subtitle: 'Frequency-based deck',
    surahCards,
    isFreqDeck: true,
    onBack: showSurahList,
  });
}

function initTheme() {
  const saved = getTheme();
  if (saved === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  } else if (saved === 'light') {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
  }
  updateThemeIcon();
}

function toggleTheme() {
  const wasDark = document.documentElement.classList.contains('dark') ||
    (!document.documentElement.classList.contains('light') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.add('theme-transition');
  document.documentElement.classList.remove('dark', 'light');
  if (wasDark) {
    document.documentElement.classList.add('light');
    setTheme('light');
  } else {
    document.documentElement.classList.add('dark');
    setTheme('dark');
  }
  updateThemeIcon();
  setTimeout(() => document.documentElement.classList.remove('theme-transition'), 500);
}

function updateThemeIcon() {
  const isDark = document.documentElement.classList.contains('dark') ||
    (!document.documentElement.classList.contains('light') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  themeBtn.innerHTML = isDark ? icons.sun : icons.moon;
  themeBtn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
}

export function initApp() {
  mainEl = document.getElementById('main');

  // Create nav buttons from JS
  const nav = document.getElementById('app-nav');
  nav.className = 'app-nav';
  nav.setAttribute('role', 'navigation');
  nav.setAttribute('aria-label', 'App controls');
  nav.innerHTML = `
    <button type="button" class="nav-btn" id="settingsBtn" aria-label="Settings">${icons.settings}</button>
    <button type="button" class="nav-btn" id="themeToggle" aria-label="Toggle theme">${icons.moon}</button>`;

  themeBtn = document.getElementById('themeToggle');
  document.getElementById('settingsBtn').addEventListener('click', () => showView(renderSettings, { onBack: showSurahList }));
  themeBtn.addEventListener('click', toggleTheme);

  initTheme();
  showSurahList();
}
