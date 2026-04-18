import type { TextProps } from './typography.types';
import './typography.css';

/** Default HTML tags per variant. */
const DEFAULT_TAGS: Record<string, string> = {
  heading: 'h2',
  subheading: 'h3',
  body: 'p',
  secondary: 'span',
  hint: 'div',
  'arabic-display': 'div',
  'arabic-subtitle': 'p',
  'english-display': 'div',
};

/** Render a text element as an HTML string. */
export function renderText(props: TextProps): string {
  const { text, variant = 'body', tag, id, ariaHidden, ariaLive } = props;
  const htmlTag = tag || DEFAULT_TAGS[variant] || 'span';
  const classes = `text text--${variant}`;
  const idAttr = id ? ` id="${id}"` : '';
  const ariaHiddenAttr = ariaHidden ? ' aria-hidden="true"' : '';
  const ariaLiveAttr = ariaLive ? ` aria-live="${ariaLive}"` : '';
  return `<${htmlTag} class="${classes}"${idAttr}${ariaHiddenAttr}${ariaLiveAttr}>${text}</${htmlTag}>`;
}
