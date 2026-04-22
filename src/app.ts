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
import './app.css';

/** Main content element. */
let mainElement: HTMLElement;

/** Theme toggle button reference. */
let themeButton: HTMLElement;

/** Settings button reference. */
let settingsButton: HTMLElement;

/** Current view cleanup function. */
let currentCleanup: (() => void) | null = null;
let isPoppingState = false;
let activeTab: 'surahs' | 'frequency' = 'surahs';

/* ---- View Management ---- */

function showView(renderFn: (container: HTMLElement) => (() => void) | undefined): void {
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

function showDeckList(pushState = true): void {
  setBackButton(null);
  if (pushState && !isPoppingState) history.pushState({ view: 'decks', tab: activeTab }, '', '/');
  showView((container) => {
    renderDeckListView(container, {
      onOpenSurah: openSurah,
      onOpenFrequencyDeck: openFrequencyDeck,
      activeTab,
      onTabChange: (tab) => {
        activeTab = tab as 'surahs' | 'frequency';
        history.replaceState({ view: 'decks', tab: activeTab }, '', '/');
      },
    });
    return undefined;
  });
}

function openSurah(surahNumber: number): void {
  const surahKey = String(surahNumber);
  const surahInfo = getSurahInfoMap();
  const info = surahInfo[surahKey];
  const wordIndices = getWordIndicesForSurah(surahNumber);
  setCurrentSurah(surahNumber);
  setBackButton(() => history.back());
  if (!isPoppingState)
    history.pushState({ view: 'surah', surahNumber, tab: activeTab }, '', `/surah/${surahNumber}`);

  showView((container) =>
    renderDeckStudyView(container, {
      title: `${surahNumber}. ${info?.name || `Surah ${surahNumber}`}`,
      subtitle: info?.name_ar || '',
      wordIndices,
      isFrequencyDeck: false,
      surahNumber: surahKey,
      onBack: () => history.back(),
    }),
  );
}

function openFrequencyDeck(rangeIndex: number): void {
  const range = FREQUENCY_RANGES[rangeIndex];
  const wordIndices = getWordIndicesForFrequencyRange(range);
  setBackButton(() => history.back());
  if (!isPoppingState)
    history.pushState({ view: 'freq', rangeIndex, tab: activeTab }, '', `/freq/${rangeIndex}`);

  showView((container) =>
    renderDeckStudyView(container, {
      title: range.label,
      subtitle: 'Frequency-based deck',
      wordIndices,
      isFrequencyDeck: true,
      surahNumber: null,
      onBack: () => history.back(),
    }),
  );
}

function openSettings(): void {
  settingsButton.style.display = 'none';
  setBackButton(() => history.back());
  if (!isPoppingState) history.pushState({ view: 'settings', tab: activeTab }, '', '/settings');

  showView((container) =>
    renderSettingsView(container, {
      onBack: () => history.back(),
    }),
  );
}

/* ---- Theme ---- */

function initializeTheme(): void {
  const savedTheme = getSavedTheme();
  if (savedTheme && savedTheme !== 'auto') applyTheme(savedTheme);
  updateThemeButtonContent();
}

function handleThemeToggle(): void {
  document.documentElement.classList.add('theme-transition');
  cycleTheme();
  updateThemeButtonContent();
  setTimeout(() => document.documentElement.classList.remove('theme-transition'), 500);
}

function updateThemeButtonContent(): void {
  const savedTheme = getSavedTheme();
  let icon = monitorIcon;
  let label = 'Auto';
  let ariaLabel = 'Theme: auto (click for light)';
  if (savedTheme === 'light') {
    icon = sunIcon;
    label = 'Light';
    ariaLabel = 'Theme: light (click for dark)';
  } else if (savedTheme === 'dark') {
    icon = moonIcon;
    label = 'Dark';
    ariaLabel = 'Theme: dark (click for auto)';
  }
  const temp = document.createElement('div');
  temp.innerHTML = renderButton({
    label,
    icon,
    id: 'themeButton',
    ariaLabel,
    className: 'btn--fixed-theme',
  });
  const newButton = temp.firstElementChild as HTMLElement;
  newButton.addEventListener('click', handleThemeToggle);
  themeButton.replaceWith(newButton);
  themeButton = newButton;
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
      ${renderButton({ label: 'Settings', icon: settingsIcon, id: 'settingsButton', ariaLabel: 'Settings' })}
      ${renderButton({ label: 'Auto', icon: monitorIcon, id: 'themeButton', ariaLabel: 'Toggle theme', className: 'btn--fixed-theme' })}
    </div>`;

  themeButton = document.getElementById('themeButton')!;
  settingsButton = document.getElementById('settingsButton')!;

  themeButton.addEventListener('click', handleThemeToggle);

  window.addEventListener('popstate', (event) => {
    const state = event.state as {
      view: string;
      surahNumber?: number;
      rangeIndex?: number;
      tab?: string;
    } | null;
    isPoppingState = true;
    settingsButton.style.display = state?.view === 'settings' ? 'none' : '';
    if (state?.tab) activeTab = state.tab as 'surahs' | 'frequency';
    if (state?.view === 'surah' && state.surahNumber) openSurah(state.surahNumber);
    else if (state?.view === 'freq' && state.rangeIndex !== undefined)
      openFrequencyDeck(state.rangeIndex);
    else if (state?.view === 'settings') openSettings();
    else showDeckList(false);
    isPoppingState = false;
  });
  settingsButton.addEventListener('click', openSettings);

  initializeTheme();
  history.replaceState({ view: 'decks', tab: activeTab }, '', '/');
  showDeckList(false);
  showOnboarding();
}
