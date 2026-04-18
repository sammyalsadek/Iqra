/** Button visual variants. */
export const ButtonVariant = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  ICON: 'icon',
} as const;
export type ButtonVariant = (typeof ButtonVariant)[keyof typeof ButtonVariant];

/** Button color overrides. */
export const ButtonColor = {
  DEFAULT: 'default',
  ERROR: 'error',
  WARNING: 'warning',
  SUCCESS: 'success',
} as const;
export type ButtonColor = (typeof ButtonColor)[keyof typeof ButtonColor];

/** Button size options. */
export const ButtonSize = {
  XSMALL: 'xs',
  SMALL: 'sm',
  MEDIUM: 'md',
  LARGE: 'lg',
} as const;
export type ButtonSize = (typeof ButtonSize)[keyof typeof ButtonSize];

export interface ButtonProps {
  /** Visible text label. Empty string for icon-only buttons. */
  label: string;
  /** Visual variant. */
  variant?: ButtonVariant;
  /** Color override. */
  color?: ButtonColor;
  /** Size override. */
  size?: ButtonSize;
  /** SVG icon HTML to show before the label. */
  icon?: string;
  /** Accessible label (for icon-only buttons). */
  ariaLabel?: string;
  /** HTML id attribute. */
  id?: string;
  /** Data attributes as key-value pairs. */
  dataAttributes?: Record<string, string>;
  /** For toggle buttons — sets aria-pressed. */
  ariaPressed?: boolean;
  /** Whether the button should fill its container width. */
  fullWidth?: boolean;
  /** Whether this is an "active" toggle state. */
  active?: boolean;
  /** If provided, renders as an <a> tag with external link icon. */
  href?: string;
}
