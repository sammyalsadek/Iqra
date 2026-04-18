export interface DeckGridProps {
  /** Which tab is active. */
  activeTab: 'surahs' | 'frequency';
  /** HTML content for the surah grid. */
  surahGridHtml: string;
  /** HTML content for the frequency grid. */
  frequencyGridHtml: string;
}
