import { icons } from './components/icons.js';

const LS_KEY = 'iqra-onboarded';

export function showOnboarding() {
  if (localStorage.getItem(LS_KEY)) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'How Iqra works');
  overlay.innerHTML = `
    <div class="modal onboarding">
      <h3>Iqra, Iqra, Iqra</h3>
      <div class="onboarding-steps">
        <div class="onboarding-step">
          <span class="onboarding-icon">${icons.book}</span>
          <p>Start with a surah, or dive into the most common words across the Quran.</p>
        </div>
        <div class="onboarding-step">
          <span class="onboarding-icon">${icons.volume}</span>
          <p>Flip each card to see its meaning, and tap the speaker to hear it spoken.</p>
        </div>
        <div class="onboarding-step">
          <span class="onboarding-icon">${icons.zap}</span>
          <p>Tell us how well you know each word — <b>Smart Study</b> handles the rest, bringing back the ones you need to practice.</p>
        </div>
      </div>
      <button type="button" class="onboarding-dismiss">Get Started</button>
    </div>`;

  document.body.appendChild(overlay);

  const dismiss = () => {
    localStorage.setItem(LS_KEY, '1');
    overlay.remove();
  };
  overlay.querySelector('.onboarding-dismiss').addEventListener('click', dismiss);
  overlay.addEventListener('click', e => { if (e.target === overlay) dismiss(); });
  overlay.querySelector('.onboarding-dismiss').focus();
}
