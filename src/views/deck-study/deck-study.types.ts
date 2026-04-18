export interface DeckStudyProps {
  title: string;
  subtitle: string;
  wordIndices: number[];
  isFrequencyDeck: boolean;
  /** Surah number string, or null for frequency decks. */
  surahNumber: string | null;
  onBack: () => void;
}
