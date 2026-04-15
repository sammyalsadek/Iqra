import { getAll, getSurahInfo, calcGlobalMastery, calcSurahMastery, getStatus } from '../state.js';
import { FREQ_RANGES } from '../spaced-repetition.js';
import { progressRing } from '../components/progress-ring.js';
import { icons } from '../components/icons.js';

let currentTab = 'surahs';

export function renderSurahList(container, { onOpenSurah, onOpenFreqDeck }) {
  const ALL = getAll();
  const info = getSurahInfo();
  const gp = calcGlobalMastery() * 100;

  container.innerHTML = `
    <header class="app-header">
      <img src="/title-light.svg" alt="Iqra" class="app-title app-title-light" width="320" height="320">
      <img src="/title-dark.svg" alt="Iqra" class="app-title app-title-dark" width="320" height="320">
      <p>Select a surah or frequency deck to study</p>
    </header>
    <section class="mastery" aria-label="Overall mastery">
      <div class="mastery-label">Quran Mastery: <b>${Math.round(gp)}%</b></div>
      <div class="mastery-bar" role="progressbar" aria-valuenow="${Math.round(gp)}" aria-valuemin="0" aria-valuemax="100">
        <div class="mastery-fill" style="width:${gp}%"></div>
      </div>
    </section>
    <nav class="view-tabs" aria-label="Study mode">
      <button type="button" class="tab-btn ${currentTab === 'surahs' ? 'active' : ''}" data-tab="surahs" aria-pressed="${currentTab === 'surahs'}">
        ${icons.book} Surahs
      </button>
      <button type="button" class="tab-btn ${currentTab === 'freq' ? 'active' : ''}" data-tab="freq" aria-pressed="${currentTab === 'freq'}">
        ${icons.barChart} By Frequency
      </button>
    </nav>
    <div id="surahGrid" class="card-grid" ${currentTab !== 'surahs' ? 'style="display:none"' : ''} role="list" aria-label="Surahs"></div>
    <div id="freqGrid" class="card-grid" ${currentTab !== 'freq' ? 'style="display:none"' : ''} role="list" aria-label="Frequency decks"></div>`;

  // Surah grid
  let surahHtml = '';
  for (let i = 1; i <= 114; i++) {
    const si = String(i);
    const s = info[si] || { name: 'Surah ' + i, name_ar: '' };
    const pct = calcSurahMastery(i) * 100;
    let count = 0;
    ALL.forEach(c => { if (c.surahs[si]) count++; });
    surahHtml += `<div class="grid-card" role="listitem" tabindex="0" data-surah="${i}" aria-label="${s.name}, ${count} words, ${Math.round(pct)}% complete">
      <div>${progressRing(pct, String(i))}</div>
      <div class="grid-card-info">
        <div class="grid-card-name">${s.name}</div>
        <div class="grid-card-name-ar">${s.name_ar}</div>
      </div>
      <div class="grid-card-meta">${count} words</div>
    </div>`;
  }
  container.querySelector('#surahGrid').innerHTML = surahHtml;

  // Freq grid
  let freqHtml = '';
  FREQ_RANGES.forEach((fr, ri) => {
    let t = 0, k = 0;
    ALL.forEach(c => { if (c.freq >= fr.min && c.freq <= fr.max) { t++; if (getStatus(c) === 'known') k++; } });
    if (!t) return;
    const pct = (k / t) * 100;
    freqHtml += `<div class="grid-card" role="listitem" tabindex="0" data-freq="${ri}" aria-label="${fr.label}, ${t} words, ${Math.round(pct)}% complete">
      <div>${progressRing(pct, Math.round(pct) + '%')}</div>
      <div class="grid-card-info">
        <div class="grid-card-name">${fr.label}</div>
        <div class="grid-card-meta">${t} words</div>
      </div>
    </div>`;
  });
  container.querySelector('#freqGrid').innerHTML = freqHtml;

  // Events
  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentTab = btn.dataset.tab;
      container.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tab === currentTab);
        b.setAttribute('aria-pressed', b.dataset.tab === currentTab);
      });
      container.querySelector('#surahGrid').style.display = currentTab === 'surahs' ? '' : 'none';
      container.querySelector('#freqGrid').style.display = currentTab === 'freq' ? '' : 'none';
    });
  });

  container.querySelectorAll('[data-surah]').forEach(el => {
    const handler = () => onOpenSurah(parseInt(el.dataset.surah));
    el.addEventListener('click', handler);
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); } });
  });

  container.querySelectorAll('[data-freq]').forEach(el => {
    const handler = () => onOpenFreqDeck(parseInt(el.dataset.freq));
    el.addEventListener('click', handler);
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); } });
  });
}
