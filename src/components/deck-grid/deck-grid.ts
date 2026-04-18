import type { DeckGridProps } from './deck-grid.types';
import { bookIcon, barChartIcon } from '@/components/icons';
import { renderButton } from '@/components/button/button';
import './deck-grid.css';

/** Render the deck grid with tabs for surahs and frequency. */
export function renderDeckGrid(props: DeckGridProps): string {
  const isSurahActive = props.activeTab === 'surahs';
  return `
    <nav class="deck-grid__tabs" aria-label="Study mode">
      ${renderButton({ label: 'Surahs', icon: bookIcon, ariaPressed: isSurahActive, active: isSurahActive, dataAttributes: { tab: 'surahs' } })}
      ${renderButton({ label: 'By Frequency', icon: barChartIcon, ariaPressed: !isSurahActive, active: !isSurahActive, dataAttributes: { tab: 'frequency' } })}
    </nav>
    <div id="surahGrid" class="deck-grid__grid" ${!isSurahActive ? 'style="display:none"' : ''} role="list" aria-label="Surahs">${props.surahGridHtml}</div>
    <div id="frequencyGrid" class="deck-grid__grid" ${isSurahActive ? 'style="display:none"' : ''} role="list" aria-label="Frequency decks">${props.frequencyGridHtml}</div>`;
}

/** Attach tab switching behavior. */
export function attachDeckGridTabs(container: HTMLElement): void {
  container.querySelectorAll<HTMLElement>('[data-tab]').forEach((tabButton) => {
    tabButton.addEventListener('click', () => {
      const selectedTab = tabButton.dataset.tab;
      container.querySelectorAll<HTMLElement>('[data-tab]').forEach((button) => {
        const isActive = button.dataset.tab === selectedTab;
        button.classList.toggle('btn--active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });
      const surahGrid = container.querySelector<HTMLElement>('#surahGrid')!;
      const frequencyGrid = container.querySelector<HTMLElement>('#frequencyGrid')!;
      surahGrid.style.display = selectedTab === 'surahs' ? '' : 'none';
      frequencyGrid.style.display = selectedTab === 'frequency' ? '' : 'none';
    });
  });
}
