import { exportProgress, importProgress, resetAllProgress } from '../state.js';
import { showModal } from '../components/modal.js';
import { icons } from '../components/icons.js';

function showToast(text) {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

export function renderSettings(container, { onBack }) {
  container.innerHTML = `
    <button type="button" class="back-btn" id="backBtn" aria-label="Back">${icons.arrowLeft} Back</button>
    <header class="surah-title"><h2>Settings</h2></header>
    <section class="settings-section" aria-label="Progress management">
      <h3>Progress</h3>
      <button type="button" class="settings-btn" id="exportBtn">${icons.download} Export Progress</button>
      <button type="button" class="settings-btn" id="importBtn">${icons.upload} Import Progress</button>
      <input type="file" accept=".json" class="file-input-hidden" id="importFile" aria-hidden="true">
      <button type="button" class="settings-btn danger" id="resetAllBtn">${icons.trash} Reset All Progress</button>
    </section>`;

  container.querySelector('#backBtn').addEventListener('click', onBack);

  container.querySelector('#exportBtn').addEventListener('click', () => {
    exportProgress();
    showToast('Progress exported');
  });

  const fileInput = container.querySelector('#importFile');
  container.querySelector('#importBtn').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    if (!fileInput.files[0]) return;
    try {
      const count = await importProgress(fileInput.files[0]);
      showToast(`Imported progress for ${count} words`);
    } catch {
      showToast('Invalid file');
    }
    fileInput.value = '';
  });

  container.querySelector('#resetAllBtn').addEventListener('click', () => {
    showModal({
      title: 'Reset All Progress',
      message: 'This will permanently delete all your progress across every surah. This cannot be undone.',
      confirmText: 'Reset All', danger: true,
      onConfirm: () => { resetAllProgress(); showToast('All progress has been reset'); }
    });
  });

  const keyHandler = e => { if (e.key === 'Escape') onBack(); };
  document.addEventListener('keydown', keyHandler);
  container._cleanup = () => document.removeEventListener('keydown', keyHandler);
}
