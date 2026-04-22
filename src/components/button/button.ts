import type { ButtonProps } from './button.types';
import { externalLinkIcon } from '@/components/icons';
import './button.css';

/** Build CSS class list for a button. */
function buildClasses(props: ButtonProps): string {
  const { variant = 'secondary', color, size, fullWidth, active, className } = props;
  return [
    'btn',
    `btn--${variant}`,
    color && color !== 'default' ? `btn--color-${color}` : '',
    size ? `btn--${size}` : '',
    fullWidth ? 'btn--full' : '',
    active ? 'btn--active' : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');
}

/** Build common HTML attributes. */
function buildAttrs(props: ButtonProps): string {
  const { ariaLabel, id, dataAttributes, ariaPressed } = props;
  const parts: string[] = [];
  if (id) parts.push(`id="${id}"`);
  if (ariaLabel) parts.push(`aria-label="${ariaLabel}"`);
  if (ariaPressed !== undefined) parts.push(`aria-pressed="${ariaPressed}"`);
  if (dataAttributes) {
    for (const [key, value] of Object.entries(dataAttributes)) {
      parts.push(`data-${key}="${value}"`);
    }
  }
  return parts.length ? ' ' + parts.join(' ') : '';
}

/** Build inner HTML (icon + label + optional external link icon). */
function buildContent(props: ButtonProps): string {
  const iconHtml = props.icon || '';
  const labelHtml = props.label ? ` ${props.label}` : '';
  const externalHtml = props.href ? ` <span class="btn__trailing">${externalLinkIcon}</span>` : '';
  return `${iconHtml}${labelHtml}${externalHtml}`;
}

/**
 * Render a button as an HTML string.
 * If `href` is provided, renders as an `<a>` tag with external link icon.
 * Otherwise renders as a `<button>` tag.
 */
export function renderButton(props: ButtonProps): string {
  const classes = buildClasses(props);
  const attrs = buildAttrs(props);
  const content = buildContent(props);

  if (props.href) {
    return `<a href="${props.href}" target="_blank" rel="noopener" class="${classes}"${attrs}>${content}</a>`;
  }
  return `<button type="button" class="${classes}"${attrs}>${content}</button>`;
}
