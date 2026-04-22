/* ============================================================
 * Flashcard touch/swipe and keyboard controls.
 * ============================================================ */

interface CardControlCallbacks {
  onFlip: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onPlayAudio: () => void;
  onMark: (status: 'unseen' | 'learning' | 'known') => void;
  onBack: () => void;
  hasDeck: () => boolean;
}

/** Attach touch/swipe handlers to the flashcard container. */
export function attachTouchControls(
  wrapElement: HTMLElement,
  callbacks: CardControlCallbacks,
): void {
  let touchStartX = 0;
  let touchStartY = 0;
  let isDragging = false;
  let touchMoved = false;

  wrapElement.addEventListener(
    'touchstart',
    (event: TouchEvent) => {
      if ((event.target as HTMLElement).closest('.flashcard__corner-btn, .flashcard__side-btn'))
        return;
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
      isDragging = false;
      touchMoved = false;
      wrapElement.style.transition = 'none';
    },
    { passive: true },
  );

  wrapElement.addEventListener(
    'touchmove',
    (event: TouchEvent) => {
      const deltaX = event.touches[0].clientX - touchStartX;
      const deltaY = event.touches[0].clientY - touchStartY;
      touchMoved = true;
      if (!isDragging && Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY)) {
        isDragging = true;
      }
      if (isDragging) {
        event.preventDefault();
        wrapElement.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.05}deg)`;
      }
    },
    { passive: false },
  );

  wrapElement.addEventListener(
    'touchend',
    (event: TouchEvent) => {
      const deltaX = event.changedTouches[0].clientX - touchStartX;

      if (isDragging && Math.abs(deltaX) > 80 && callbacks.hasDeck()) {
        /* Swipe completed — animate card off screen */
        const direction = deltaX > 0 ? 1 : -1;
        wrapElement.style.transition = 'transform 0.2s ease-out';
        wrapElement.style.transform = `translateX(${direction * 400}px) rotate(${direction * 15}deg)`;

        setTimeout(() => {
          if (deltaX > 0) callbacks.onPrevious();
          else callbacks.onNext();
          wrapElement.style.transition = 'none';
          wrapElement.style.transform = '';
          requestAnimationFrame(() => {
            wrapElement.style.transition = '';
          });
        }, 200);
      } else {
        /* Snap back */
        wrapElement.style.transition = 'transform 0.3s ease-out';
        wrapElement.style.transform = '';
        setTimeout(() => {
          wrapElement.style.transition = '';
        }, 300);

        /* Tap to flip (only if no drag and not on a button) */
        if (
          !touchMoved &&
          !(event.target as HTMLElement).closest('.flashcard__corner-btn, .flashcard__side-btn')
        ) {
          callbacks.onFlip();
        }
      }
      isDragging = false;
    },
    { passive: true },
  );
}

/** Attach keyboard shortcuts for the flashcard view. */
export function attachKeyboardControls(callbacks: CardControlCallbacks): () => void {
  const handleKeyDown = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement;

    if (target.tagName === 'INPUT') return;
    if (target.tagName === 'SELECT') {
      if (['Tab', 'Enter', ' '].includes(event.key)) return;
      if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
        target.blur();
        event.preventDefault();
      }
      return;
    }

    if (event.key === ' ' && !target.closest('select, a')) {
      event.preventDefault();
      if (target.closest('button')) (target.closest('button') as HTMLElement).blur();
      callbacks.onFlip();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (callbacks.hasDeck()) callbacks.onNext();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (callbacks.hasDeck()) callbacks.onPrevious();
    } else if (event.key === '1') callbacks.onMark('unseen');
    else if (event.key === '2') callbacks.onMark('learning');
    else if (event.key === '3') callbacks.onMark('known');
    else if (event.key === 'a' || event.key === 'A') callbacks.onPlayAudio();
    else if (event.key === 'Escape') callbacks.onBack();
  };

  document.addEventListener('keydown', handleKeyDown);

  /* Return cleanup function */
  return () => document.removeEventListener('keydown', handleKeyDown);
}
