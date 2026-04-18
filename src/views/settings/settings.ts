/* ============================================================
 * Settings View — progress management, feedback links, support.
 * ============================================================ */

import { exportProgress, importProgress, resetAllProgress } from '@/utils/progress';
import { showModal } from '@/components/modal/modal';
import { showToast } from '@/components/toast/toast';
import { renderButton } from '@/components/button/button';
import { ButtonColor } from '@/components/button/button.types';
import {
  downloadIcon,
  uploadIcon,
  trashIcon,
  bugIcon,
  zapIcon,
  heartIcon,
} from '@/components/icons';
import { renderText } from '@/components/typography/typography';
import { TextVariant } from '@/components/typography/typography.types';
import './settings.css';

interface SettingsCallbacks {
  onBack: () => void;
}

export function renderSettingsView(
  container: HTMLElement,
  callbacks: SettingsCallbacks,
): () => void {
  container.innerHTML = `
    <header class="settings__header">${renderText({ text: 'Settings', variant: TextVariant.HEADING })}</header>

    <section class="settings__section" aria-label="Progress management">
      ${renderText({ text: 'Progress', variant: TextVariant.SUBHEADING })}
      ${renderButton({ label: 'Export Progress', fullWidth: true, icon: downloadIcon, id: 'exportButton' })}
      ${renderButton({ label: 'Import Progress', fullWidth: true, icon: uploadIcon, id: 'importButton' })}
      <input type="file" accept=".json" class="settings__file-input" id="importFileInput" aria-hidden="true">
      ${renderButton({ label: 'Reset All Progress', color: ButtonColor.ERROR, fullWidth: true, icon: trashIcon, id: 'resetAllButton' })}
    </section>

    <section class="settings__section" aria-label="Feedback">
      ${renderText({ text: 'Feedback', variant: TextVariant.SUBHEADING })}
      ${renderButton({ label: 'Report a Bug', fullWidth: true, icon: bugIcon, href: 'https://github.com/sammyalsadek/Iqra/issues/new?template=bug_report.md' })}
      ${renderButton({ label: 'Request a Feature', fullWidth: true, icon: zapIcon, href: 'https://github.com/sammyalsadek/Iqra/issues/new?template=feature_request.md' })}
    </section>

    <section class="settings__section" aria-label="Support">
      ${renderText({ text: 'Support', variant: TextVariant.SUBHEADING })}
      ${renderButton({ label: 'Support this project', fullWidth: true, icon: heartIcon, href: 'https://ko-fi.com/sammyalsadek' })}
    </section>`;

  /* ---- Event listeners ---- */
  container.querySelector('#exportButton')!.addEventListener('click', () => {
    exportProgress();
    showToast('Progress exported');
  });

  const fileInput = container.querySelector<HTMLInputElement>('#importFileInput')!;
  container.querySelector('#importButton')!.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    if (!fileInput.files?.[0]) return;
    try {
      const wordCount = await importProgress(fileInput.files[0]);
      showToast(`Imported progress for ${wordCount} words`);
    } catch {
      showToast('Invalid file');
    }
    fileInput.value = '';
  });

  container.querySelector('#resetAllButton')!.addEventListener('click', () => {
    showModal({
      title: 'Reset All Progress',
      message:
        'This will permanently delete all your progress across every surah. This cannot be undone.',
      confirmText: 'Reset All',
      danger: true,
      onConfirm: () => {
        resetAllProgress();
        showToast('All progress has been reset');
      },
    });
  });

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') callbacks.onBack();
  };
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}
