import { getAll, getSurahInfo, getTheme, setTheme } from './state.js';
import { FREQ_RANGES } from './spaced-repetition.js';
import { loadSurahAudio } from './audio.js';
import { renderSurahList } from './views/surah-list.js';
import { renderFlashcard } from './views/flashcard.js';
import { renderSettings } from './views/settings.js';
import { icons } from './components/icons.js';

export function setBackButton(onBack) {
  const slot = document.getElementById('navBack');
  if (!onBack) { slot.innerHTML = ''; return; }
  slot.innerHTML = `<button type="button" class="back-btn" id="globalBackBtn" aria-label="Back">${icons.arrowLeft} Back</button>`;
  slot.querySelector('#globalBackBtn').addEventListener('click', onBack);
}

let mainEl, themeBtn;

function cleanup() {
  const view = mainEl.querySelector('.view');
  if (view && view._cleanup) { view._cleanup(); view._cleanup = null; }
}

function showView(renderFn, ...args) {
  cleanup();
  const old = mainEl.querySelector('.view');
  if (old) old.remove();
  const splash = mainEl.querySelector('.splash');
  if (splash) splash.remove();
  // Clear back button
  document.getElementById('navBack').innerHTML = '';
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
  const saved = getTheme();
  document.documentElement.classList.add('theme-transition');
  document.documentElement.classList.remove('dark', 'light');
  // Cycle: auto → light → dark → auto
  if (!saved || saved === 'auto') {
    document.documentElement.classList.add('light');
    setTheme('light');
  } else if (saved === 'light') {
    document.documentElement.classList.add('dark');
    setTheme('dark');
  } else {
    setTheme('auto');
  }
  updateThemeIcon();
  setTimeout(() => document.documentElement.classList.remove('theme-transition'), 500);
}

function updateThemeIcon() {
  const saved = getTheme();
  if (!saved || saved === 'auto') {
    themeBtn.innerHTML = icons.monitor;
    themeBtn.setAttribute('aria-label', 'Theme: auto (click for light)');
  } else if (saved === 'light') {
    themeBtn.innerHTML = icons.sun;
    themeBtn.setAttribute('aria-label', 'Theme: light (click for dark)');
  } else {
    themeBtn.innerHTML = icons.moon;
    themeBtn.setAttribute('aria-label', 'Theme: dark (click for auto)');
  }
  const isDark = document.documentElement.classList.contains('dark') ||
    (!document.documentElement.classList.contains('light') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelector('meta[name="theme-color"][media*="light"]').content = isDark ? '#141A24' : '#F7F4EE';
  document.querySelector('meta[name="theme-color"][media*="dark"]').content = isDark ? '#141A24' : '#F7F4EE';
}

export function initApp() {
  mainEl = document.getElementById('main');

  // Create nav buttons from JS
  const nav = document.getElementById('app-nav');
  nav.className = 'app-nav';
  nav.setAttribute('role', 'navigation');
  nav.setAttribute('aria-label', 'App controls');
  nav.innerHTML = `
    <div id="navBack"></div>
    <div class="nav-right">
      <button type="button" class="nav-btn" id="settingsBtn" aria-label="Settings">${icons.settings}</button>
      <button type="button" class="nav-btn" id="themeToggle" aria-label="Toggle theme">${icons.moon}</button>
    </div>`;

  themeBtn = document.getElementById('themeToggle');
  const settingsEl = document.getElementById('settingsBtn');
  settingsEl.addEventListener('click', () => {
    settingsEl.style.display = 'none';
    showView(renderSettings, { onBack: () => { settingsEl.style.display = ''; showSurahList(); } });
  });
  themeBtn.addEventListener('click', toggleTheme);

  initTheme();
  showSurahList();
}
