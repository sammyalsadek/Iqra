import './toast.css';

/** Show a temporary toast notification at the bottom of the screen. */
export function showToast(message: string): void {
  document.querySelectorAll('.toast').forEach((existing) => existing.remove());
  const toastElement = document.createElement('div');
  toastElement.className = 'toast';
  toastElement.setAttribute('role', 'status');
  toastElement.textContent = message;
  document.body.appendChild(toastElement);
  setTimeout(() => toastElement.remove(), 3000);
}
