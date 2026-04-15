export function showModal({ title, message, confirmText = 'Confirm', onConfirm, danger = false }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', title);
  overlay.innerHTML = `
    <div class="modal">
      <h3>${title}</h3>
      <p>${message}</p>
      <div class="modal-actions">
        <button type="button" class="modal-cancel">Cancel</button>
        <button type="button" class="${danger ? 'btn-danger' : ''} modal-confirm">${confirmText}</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  overlay.querySelector('.modal-cancel').addEventListener('click', close);
  overlay.querySelector('.modal-confirm').addEventListener('click', () => { onConfirm(); close(); });
  overlay.querySelector('.modal-confirm').focus();

  const trap = e => {
    if (e.key === 'Escape') close();
  };
  document.addEventListener('keydown', trap);
  const obs = new MutationObserver(() => {
    if (!document.body.contains(overlay)) { document.removeEventListener('keydown', trap); obs.disconnect(); }
  });
  obs.observe(document.body, { childList: true });
}
