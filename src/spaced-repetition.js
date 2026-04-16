import { getAll, getProgress, getStatus, setProgress } from './state.js';

const DAY = 86400000;

export const FREQ_RANGES = [
  { label: 'Ultra Common (500+)', min: 500, max: Infinity },
  { label: 'Very Common (200–499)', min: 200, max: 499 },
  { label: 'Common (100–199)', min: 100, max: 199 },
  { label: 'Moderate (50–99)', min: 50, max: 99 },
  { label: 'Less Common (20–49)', min: 20, max: 49 },
  { label: 'Uncommon (10–19)', min: 10, max: 19 },
  { label: 'Rare (1–9)', min: 1, max: 9 },
];

export function buildDeck(surahCards, filter, freqRange) {
  const ALL = getAll();
  const now = Date.now();

  if (filter === 'smart') {
    const due = [], unseen = [];
    surahCards.forEach(i => {
      const c = ALL[i];
      if (freqRange && (c.freq < freqRange.min || c.freq > freqRange.max)) return;
      const p = getProgress(c);
      if (p.status === 'unseen') unseen.push(i);
      else if (p.status === 'learning' || (p.status === 'known' && p.due && now >= p.due)) due.push(i);
    });
    due.sort((a, b) => (getProgress(ALL[a]).due || 0) - (getProgress(ALL[b]).due || 0));
    unseen.sort((a, b) => ALL[b].freq - ALL[a].freq);
    return due.concat(unseen);
  }

  const deck = [];
  surahCards.forEach(i => {
    const c = ALL[i];
    if (filter !== 'all' && getStatus(c) !== filter) return;
    if (freqRange && (c.freq < freqRange.min || c.freq > freqRange.max)) return;
    deck.push(i);
  });
  return deck;
}

export function markCard(deck, idx, status, filter) {
  const ALL = getAll();
  const c = ALL[deck[idx]];
  const prev = getProgress(c);
  const now = Date.now();

  if (status === 'unseen') {
    setProgress(c, { status: 'unseen', interval: 0, due: 0 });
    if (filter === 'smart') {
      const ci = deck.splice(idx, 1)[0];
      deck.splice(Math.min(idx + 5, deck.length), 0, ci);
      return idx >= deck.length ? 0 : idx;
    }
  } else if (status === 'learning') {
    setProgress(c, { status: 'learning', interval: DAY, due: now + DAY });
    if (filter === 'smart') {
      const ci = deck.splice(idx, 1)[0];
      deck.splice(Math.min(idx + 10, deck.length), 0, ci);
      return idx >= deck.length ? 0 : idx;
    }
  } else {
    const prevInt = prev.interval || DAY;
    const newInt = prevInt < DAY ? DAY : prevInt < 3 * DAY ? 3 * DAY : prevInt < 7 * DAY ? 7 * DAY : 30 * DAY;
    setProgress(c, { status: 'known', interval: newInt, due: now + newInt });
    if (filter === 'known' || filter === 'all') {
      return (idx + 1) % deck.length;
    }
    deck.splice(idx, 1);
    return Math.min(idx, Math.max(0, deck.length - 1));
  }

  if (filter !== 'all' && status !== filter) {
    deck.splice(idx, 1);
    return Math.min(idx, Math.max(0, deck.length - 1));
  }
  return (idx + 1) % deck.length;
}

export function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}
