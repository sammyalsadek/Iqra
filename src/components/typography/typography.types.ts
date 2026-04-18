/** Typography visual variants matching the design system. */
export const TextVariant = {
  /** Page/section heading — accent color, 1.25rem */
  HEADING: 'heading',
  /** Section subheading — accent color, 1rem */
  SUBHEADING: 'subheading',
  /** Standard body text — text color, 0.875rem */
  BODY: 'body',
  /** Secondary/meta text — text-secondary color, 0.875rem */
  SECONDARY: 'secondary',
  /** Hint/muted text — text-secondary, reduced opacity */
  HINT: 'hint',
  /** Arabic display text — large, RTL, Amiri font */
  ARABIC_DISPLAY: 'arabic-display',
  /** Arabic subtitle — medium, RTL, Amiri font */
  ARABIC_SUBTITLE: 'arabic-subtitle',
  /** English display — medium, centered */
  ENGLISH_DISPLAY: 'english-display',
} as const;
export type TextVariant = (typeof TextVariant)[keyof typeof TextVariant];

export interface TextProps {
  /** The text content (can include HTML). */
  text: string;
  /** Typography variant. */
  variant?: TextVariant;
  /** HTML tag to use. Defaults based on variant. */
  tag?: string;
  /** HTML id attribute. */
  id?: string;
  /** aria-hidden attribute. */
  ariaHidden?: boolean;
  /** aria-live attribute for dynamic content. */
  ariaLive?: 'polite' | 'assertive';
}
