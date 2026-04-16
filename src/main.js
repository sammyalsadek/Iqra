import './styles/base.css';
import './styles/theme.css';
import './styles/layout.css';
import './styles/components.css';
import { loadData } from './state.js';
import { initApp } from './app.js';
import { showOnboarding } from './onboarding.js';

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
} else if ('serviceWorker' in navigator && location.hostname === 'localhost') {
  navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
  caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
}

fetch('/data/words.json')
  .then(r => r.json())
  .then(data => {
    loadData(data);
    initApp();
    showOnboarding();
  })
  .catch(err => {
    const splash = document.getElementById('splash');
    if (splash) splash.remove();
    document.getElementById('main').innerHTML =
      `<div class="view active"><p class="empty-msg">Failed to load data. Please refresh.</p></div>`;
    console.error(err);
  });
