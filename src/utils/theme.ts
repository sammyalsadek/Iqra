/* ============================================================
 * Theme management — light, dark, and auto (system) modes.
 * Persisted in localStorage.
 * ============================================================ */

import type { ThemePreference } from '@/types';

const STORAGE_KEY = 'iqra-theme';

/** Get the saved theme preference. Returns null for first-time users. */
export function getSavedTheme(): ThemePreference | null {
  return localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
}

/** Save theme preference to localStorage. */
function saveTheme(theme: ThemePreference): void {
  localStorage.setItem(STORAGE_KEY, theme);
}

/** Apply a theme to the document by toggling CSS classes. */
export function applyTheme(theme: ThemePreference): void {
  document.documentElement.classList.remove('dark', 'light');
  if (theme === 'dark') document.documentElement.classList.add('dark');
  else if (theme === 'light') document.documentElement.classList.add('light');
}

/** Check if the current effective theme is dark. */
function isCurrentlyDark(): boolean {
  return (
    document.documentElement.classList.contains('dark') ||
    (!document.documentElement.classList.contains('light') &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
}

/** Update the theme-color meta tags to match the current theme. */
export function updateThemeMetaColor(): void {
  const isDark = isCurrentlyDark();
  const color = isDark ? '#141A24' : '#F7F4EE';
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    meta.content = color;
  });
}

/** Cycle to the next theme: auto → light → dark → auto. */
export function cycleTheme(): ThemePreference {
  const current = getSavedTheme();
  let next: ThemePreference;
  if (!current || current === 'auto') next = 'light';
  else if (current === 'light') next = 'dark';
  else next = 'auto';

  saveTheme(next);
  applyTheme(next);
  return next;
}
