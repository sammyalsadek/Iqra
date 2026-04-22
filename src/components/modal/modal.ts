import type { ModalProps } from './modal.types';
import { renderButton } from '@/components/button/button';
import { renderCard } from '@/components/card/card';
import { renderText } from '@/components/typography/typography';
import { ButtonVariant, ButtonColor } from '@/components/button/button.types';
import { TextVariant } from '@/components/typography/typography.types';
import { CardVariant } from '@/components/card/card.types';
import './modal.css';

/** Show a modal dialog. */
export function showModal({
  title,
  message,
  confirmText = 'Confirm',
  onConfirm,
  danger = false,
  singleButton = false,
}: ModalProps): void {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', title);

  const cancelHtml = singleButton ? '' : renderButton({ label: 'Cancel', id: 'modalCancel' });
  const confirmColor = danger ? ButtonColor.ERROR : undefined;

  const cardContent = `
    ${renderText({ text: title, variant: TextVariant.SUBHEADING })}
    ${renderText({ text: message, variant: TextVariant.BODY })}
    <div class="modal__actions">
      ${cancelHtml}
      ${renderButton({ label: confirmText, variant: ButtonVariant.PRIMARY, color: confirmColor, id: 'modalConfirm' })}
    </div>`;

  overlay.innerHTML = renderCard({
    content: cardContent,
    variant: CardVariant.DEFAULT,
    id: 'modalCard',
  });

  document.body.appendChild(overlay);

  const close = () => {
    overlay.remove();
    document.removeEventListener('keydown', handleKeyDown, true);
  };
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });
  overlay.querySelector('#modalCancel')?.addEventListener('click', close);
  overlay.querySelector('#modalConfirm')?.addEventListener('click', () => {
    onConfirm();
    close();
  });

  const focusableSelector =
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.stopImmediatePropagation();
      close();
      return;
    }
    if (event.key === 'Tab') {
      const focusable = overlay.querySelectorAll<HTMLElement>(focusableSelector);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };
  document.addEventListener('keydown', handleKeyDown, true);

  (overlay.querySelector('#modalConfirm') as HTMLElement)?.focus();
}
