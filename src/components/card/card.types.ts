/** Card visual variants. */
export const CardVariant = {
  DEFAULT: 'default',
  EMPTY: 'empty',
} as const;
export type CardVariant = (typeof CardVariant)[keyof typeof CardVariant];

export interface CardProps {
  /** Inner HTML content. */
  content: string;
  /** Card variant. */
  variant?: CardVariant;
  /** HTML id attribute. */
  id?: string;
  /** ARIA role. */
  role?: string;
  /** Tab index for keyboard navigation. */
  tabIndex?: number;
  /** Data attributes. */
  dataAttributes?: Record<string, string>;
  /** ARIA label. */
  ariaLabel?: string;
}
