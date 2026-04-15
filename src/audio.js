let surahAudio = {};

export function loadSurahAudio(surahNum) {
  surahAudio = {};
  const pad = (n, l = 3) => (n + '').padStart(l, '0');
  function loadPage(p) {
    fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surahNum}?words=true&word_fields=text_uthmani&per_page=50&page=${p}`)
      .then(r => r.json()).then(d => {
        if (!d.verses || !d.verses.length) return;
        for (const v of d.verses) {
          const parts = v.verse_key.split(':');
          const s = pad(parts[0]), a = pad(parts[1]);
          for (const w of v.words)
            if (w.char_type_name === 'word' && !surahAudio[w.text_uthmani])
              surahAudio[w.text_uthmani] = `https://audio.qurancdn.com/wbw/${s}_${a}_${pad(w.position)}.mp3`;
        }
        if (d.verses.length >= 50) loadPage(p + 1);
      }).catch(() => {});
  }
  loadPage(1);
}

export function playWord(word) {
  const url = surahAudio[word.ar] || word.audio;
  if (url) { new Audio(url).play(); return; }
  const u = new SpeechSynthesisUtterance(word.ar);
  u.lang = 'ar'; u.rate = 0.8;
  const v = speechSynthesis.getVoices().find(v => v.lang.startsWith('ar'));
  if (v) u.voice = v;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

speechSynthesis.getVoices();
