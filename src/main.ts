/* ============================================================
 * Main entry point — loads styles, fetches data, initializes app.
 * ============================================================ */

import '@/styles/base.css';
import '@/styles/theme.css';
import '@/components/button/button.css';
import type { WordsData } from '@/types';
import { initializeApp } from '@/app';
import { renderText } from '@/components/typography/typography';
import { TextVariant } from '@/components/typography/typography.types';

/* ---- Service Worker ---- */
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
} else if ('serviceWorker' in navigator && location.hostname === 'localhost') {
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => registrations.forEach((registration) => registration.unregister()));
  caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
}

/* ---- Load Data and Initialize ---- */
fetch('/data/words.json')
  .then((response) => response.json())
  .then((data: WordsData) => {
    initializeApp(data);
  })
  .catch((error) => {
    console.error('Failed to load word data:', error);
    const mainElement = document.getElementById('main');
    if (mainElement) {
      mainElement.innerHTML = `<div class="view active">${renderText({ text: 'Failed to load data. Please refresh.', variant: TextVariant.SECONDARY })}</div>`;
    }
  });
