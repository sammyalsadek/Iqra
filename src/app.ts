/* ============================================================
 * App Router — manages view switching, navigation bar, and theme.
 * ============================================================ */

import type { WordsData } from '@/types';
import {
  loadWordData,
  getSurahInfoMap,
  getWordIndicesForSurah,
  getWordIndicesForFrequencyRange,
} from '@/utils/data';
import { loadProgress } from '@/utils/progress';
import { getSavedTheme, applyTheme, cycleTheme, updateThemeMetaColor } from '@/utils/theme';
import { setCurrentSurah } from '@/utils/audio';
import { FREQUENCY_RANGES } from '@/utils/deck-engine';
import { renderDeckListView } from '@/views/deck-list/deck-list';
import { renderDeckStudyView } from '@/views/deck-study/deck-study';
import { renderSettingsView } from '@/views/settings/settings';
import { showOnboarding } from '@/components/onboarding/onboarding';
import { settingsIcon, moonIcon, sunIcon, monitorIcon, arrowLeftIcon } from '@/components/icons';
import { renderButton } from '@/components/button/button';

/** Main content element. */
let mainElement: HTMLElement;

/** Theme toggle button reference. */
let themeButton: HTMLElement;

/** Settings button reference. */
let settingsButton: HTMLElement;

/** Current view cleanup function. */
let currentCleanup: (() => void) | null = null;

/* ---- View Management ---- */

function showView(renderFn: (container: HTMLElement) => (() => void) | void): void {
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  /* Remove existing view and splash, keep nav */
  mainElement.querySelector('.view')?.remove();
  mainElement.querySelector('.splash')?.remove();

  const viewElement = document.createElement('div');
  viewElement.className = 'view active';
  mainElement.appendChild(viewElement);

  const cleanup = renderFn(viewElement);
  if (cleanup) currentCleanup = cleanup;
  window.scrollTo(0, 0);
}

/** Set the back button in the nav bar. */
function setBackButton(onBack: (() => void) | null): void {
  const backSlot = document.getElementById('navBack')!;
  if (!onBack) {
    backSlot.innerHTML = '';
    return;
  }
  backSlot.innerHTML = renderButton({
    label: 'Back',
    icon: arrowLeftIcon,
    id: 'globalBackButton',
    ariaLabel: 'Back',
  });
  backSlot.querySelector('#globalBackButton')!.addEventListener('click', onBack);
}

/* ---- Navigation ---- */

function showDeckList(): void {
  setBackButton(null);
  settingsButton.style.display = '';
  showView((container) => {
    renderDeckListView(container, {
      onOpenSurah: openSurah,
      onOpenFrequencyDeck: openFrequencyDeck,
    });
  });
}

function openSurah(surahNumber: number): void {
  const surahKey = String(surahNumber);
  const surahInfo = getSurahInfoMap();
  const info = surahInfo[surahKey];
  const wordIndices = getWordIndicesForSurah(surahNumber);
  setCurrentSurah(surahNumber);
  setBackButton(showDeckList);

  showView((container) =>
    renderDeckStudyView(container, {
      title: `${surahNumber}. ${info?.name || `Surah ${surahNumber}`}`,
      subtitle: info?.name_ar || '',
      wordIndices,
      isFrequencyDeck: false,
      surahNumber: surahKey,
      onBack: showDeckList,
    }),
  );
}

function openFrequencyDeck(rangeIndex: number): void {
  const range = FREQUENCY_RANGES[rangeIndex];
  const wordIndices = getWordIndicesForFrequencyRange(range);
  setBackButton(showDeckList);

  showView((container) =>
    renderDeckStudyView(container, {
      title: range.label,
      subtitle: 'Frequency-based deck',
      wordIndices,
      isFrequencyDeck: true,
      surahNumber: null,
      onBack: showDeckList,
    }),
  );
}

function openSettings(): void {
  settingsButton.style.display = 'none';
  setBackButton(() => {
    settingsButton.style.display = '';
    showDeckList();
  });

  showView((container) =>
    renderSettingsView(container, {
      onBack: () => {
        settingsButton.style.display = '';
        showDeckList();
      },
    }),
  );
}

/* ---- Theme ---- */

function initializeTheme(): void {
  const savedTheme = getSavedTheme();
  if (savedTheme && savedTheme !== 'auto') applyTheme(savedTheme);
  updateThemeButtonIcon();
}

function handleThemeToggle(): void {
  document.documentElement.classList.add('theme-transition');
  cycleTheme();
  updateThemeButtonIcon();
  updateThemeMetaColor();
  setTimeout(() => document.documentElement.classList.remove('theme-transition'), 500);
}

function updateThemeButtonIcon(): void {
  const savedTheme = getSavedTheme();
  if (!savedTheme || savedTheme === 'auto') {
    themeButton.innerHTML = monitorIcon;
    themeButton.setAttribute('aria-label', 'Theme: auto (click for light)');
  } else if (savedTheme === 'light') {
    themeButton.innerHTML = sunIcon;
    themeButton.setAttribute('aria-label', 'Theme: light (click for dark)');
  } else {
    themeButton.innerHTML = moonIcon;
    themeButton.setAttribute('aria-label', 'Theme: dark (click for auto)');
  }
  updateThemeMetaColor();
}

/* ---- Initialization ---- */

export function initializeApp(data: WordsData): void {
  loadWordData(data);
  loadProgress();

  mainElement = document.getElementById('main')!;

  /* Create navigation bar */
  const navElement = document.getElementById('app-nav')!;
  navElement.className = 'app-nav';
  navElement.setAttribute('role', 'navigation');
  navElement.setAttribute('aria-label', 'App controls');
  navElement.innerHTML = `
    <div id="navBack"></div>
    <div class="app-nav__right">
      ${renderButton({ label: '', icon: settingsIcon, id: 'settingsButton', ariaLabel: 'Settings' })}
      ${renderButton({ label: '', icon: moonIcon, id: 'themeButton', ariaLabel: 'Toggle theme' })}
    </div>`;

  themeButton = document.getElementById('themeButton')!;
  settingsButton = document.getElementById('settingsButton')!;

  themeButton.addEventListener('click', handleThemeToggle);
  settingsButton.addEventListener('click', openSettings);

  initializeTheme();
  showDeckList();
  showOnboarding();
}
