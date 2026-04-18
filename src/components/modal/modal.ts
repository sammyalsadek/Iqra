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

  const close = () => overlay.remove();
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });
  overlay.querySelector('#modalCancel')?.addEventListener('click', close);
  overlay.querySelector('#modalConfirm')?.addEventListener('click', () => {
    onConfirm();
    close();
  });

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      close();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  (overlay.querySelector('#modalConfirm') as HTMLElement)?.focus();
}
