import type { DeckCardProps } from './deck-card.types';
import { renderCard } from '@/components/card/card';
import { CardVariant } from '@/components/card/card.types';
import './deck-card.css';

/** Render a single deck selection card (surah or frequency). */
export function renderDeckCard(props: DeckCardProps): string {
  const subtitleClass = props.subtitleArabic
    ? 'deck-card__subtitle--arabic'
    : 'deck-card__subtitle';
  const subtitleHtml = props.subtitle
    ? `<div class="${subtitleClass}">${props.subtitle}</div>`
    : '';

  const content = `
    <div class="deck-card__ring">${props.progressRing}</div>
    <div class="deck-card__info">
      <div class="deck-card__name">${props.name}</div>
      ${subtitleHtml}
    </div>
    <div class="deck-card__meta">${props.meta}</div>`;

  return renderCard({
    content,
    variant: CardVariant.DEFAULT,
    id: `deck-${props.dataAttribute}-${props.dataValue}`,
    role: 'listitem',
    tabIndex: 0,
    dataAttributes: { [props.dataAttribute]: props.dataValue },
    ariaLabel: props.ariaLabel,
  });
}
