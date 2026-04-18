import type { CardProps } from './card.types';
import './card.css';

/** Render a card container as an HTML string. */
export function renderCard(props: CardProps): string {
  const { content, variant = 'default', id, role, tabIndex, dataAttributes, ariaLabel } = props;
  const classes = `card card--${variant}`;
  const attrs: string[] = [];
  if (id) attrs.push(`id="${id}"`);
  if (role) attrs.push(`role="${role}"`);
  if (tabIndex !== undefined) attrs.push(`tabindex="${tabIndex}"`);
  if (ariaLabel) attrs.push(`aria-label="${ariaLabel}"`);
  if (dataAttributes) {
    for (const [key, value] of Object.entries(dataAttributes)) {
      attrs.push(`data-${key}="${value}"`);
    }
  }
  const attrStr = attrs.length ? ' ' + attrs.join(' ') : '';
  return `<div class="${classes}"${attrStr}>${content}</div>`;
}
