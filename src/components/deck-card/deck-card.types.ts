export interface DeckCardProps {
  /** Unique identifier for click handling. */
  dataAttribute: string;
  dataValue: string;
  /** Progress ring HTML. */
  progressRing: string;
  /** Primary name. */
  name: string;
  /** Subtitle text (Arabic surah name or frequency range). */
  subtitle?: string;
  /** Whether subtitle is Arabic (uses Arabic font + RTL). */
  subtitleArabic?: boolean;
  /** Metadata text (e.g. "123 words"). */
  meta: string;
  /** Aria label for accessibility. */
  ariaLabel: string;
}
