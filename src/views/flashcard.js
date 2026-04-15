import { getAll, getStatus, getProgress, calcMastery } from '../state.js';
import { buildDeck, markCard, shuffleDeck, FREQ_RANGES } from '../spaced-repetition.js';
import { playWord } from '../audio.js';
import { showModal } from '../components/modal.js';
import { icons } from '../components/icons.js';
import { resetProgress } from '../state.js';

function showToast(text) {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

let deck = [], idx = 0, surahCards = [];

export function renderFlashcard(container, { title, subtitle, surahCards: cards, isFreqDeck, onBack }) {
  surahCards = cards;
  const ALL = getAll();

  container.innerHTML = `
    <button type="button" class="back-btn" id="backBtn" aria-label="Back">${icons.arrowLeft} Back</button>
    <div class="surah-title"><h2 id="cvTitle">${title}</h2><p id="cvSub" class="${isFreqDeck ? '' : 'arabic-subtitle'}">${subtitle}</p></div>
    <section class="mastery" style="max-width:500px;margin-top:1rem" aria-label="Deck mastery">
      <div class="mastery-label"><span id="masteryLabel">${isFreqDeck ? 'Deck' : 'Surah'} Mastery: </span><b id="surahPct">0%</b></div>
      <div class="mastery-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
        <div class="mastery-fill" id="surahFill"></div>
      </div>
    </section>
    <div class="controls">
      <div class="filter-group">
        <span class="filter-info" id="smartInfoBtn" role="button" tabindex="0" aria-label="What is Smart Study?">${icons.info}</span>
        <select id="statusFilter" aria-label="Card filter">
          <option value="smart">Smart Study</option>
          <option value="unseen">Unseen</option>
          <option value="learning">Learning</option>
          <option value="known">Known</option>
          <option value="all">All</option>
        </select>
      </div>
      <select id="freqFilter" aria-label="Frequency filter" ${isFreqDeck ? 'style="display:none"' : ''}>
        <option value="all">All Frequencies</option>
      </select>
      <button type="button" id="shuffleBtn" aria-label="Shuffle deck">${icons.shuffle} Shuffle</button>
      <button type="button" id="resetBtn" aria-label="Reset progress">${icons.trash} Reset</button>
    </div>
    <div class="stats" aria-label="Card statistics">
      <span><span class="dot dot-new"></span>Unseen: <b id="sNew">0</b></span>
      <span><span class="dot dot-learning"></span>Learning: <b id="sLrn">0</b></span>
      <span><span class="dot dot-known"></span>Known: <b id="sKnw">0</b></span>
      <span aria-hidden="true" style="opacity:.4">|</span>
      <span>Deck: <b id="sDeck">0</b></span>
    </div>
    <div class="counter" id="counter" aria-live="polite"></div>
    <div id="cardAnnounce" class="sr-only" aria-live="polite" aria-atomic="true"></div>
    <div class="card-container" id="cardWrap" tabindex="0" role="button" aria-label="Flashcard, press space to flip">
      <div class="card" id="card">
        <div class="card-face card-front" id="cardFront">
          <button type="button" class="card-corner-btn card-corner-left" id="audioBtn" aria-label="Play pronunciation">${icons.volume}</button>
          <button type="button" class="card-flip-btn" id="flipBtn" aria-label="Flip card">${icons.flip}</button>
          <button type="button" class="card-side-btn card-side-left" id="prevBtn" aria-label="Previous card">${icons.chevronLeft}</button>
          <button type="button" class="card-side-btn card-side-right" id="nextBtn" aria-label="Next card">${icons.chevronRight}</button>
          <div class="card-type" id="fType"></div>
          <div class="card-arabic" id="fAr"></div>
          <div class="card-root" id="fRoot"></div>
          <div class="card-freq" id="fFreq"></div>
        </div>
        <div class="card-face card-back" id="cardBack">
          <button type="button" class="card-flip-btn" id="flipBtn2" aria-label="Flip card">${icons.flip}</button>
          <button type="button" class="card-side-btn card-side-left" id="prevBtn2" aria-label="Previous card">${icons.chevronLeft}</button>
          <button type="button" class="card-side-btn card-side-right" id="nextBtn2" aria-label="Next card">${icons.chevronRight}</button>
          <div class="card-type" id="bType"></div>
          <div class="card-english" id="bEn"></div>
          <div class="card-detail" id="bDet"></div>
          <div class="card-freq" id="bFreq"></div>
        </div>
      </div>
    </div>
    <div class="actions" id="actions">
      <button type="button" class="btn-wrong" data-mark="unseen" aria-label="Again">${icons.x} Again</button>
      <button type="button" class="btn-learning" data-mark="learning" aria-label="Learning">${icons.minus} Learning</button>
      <button type="button" class="btn-correct" data-mark="known" aria-label="Known">${icons.check} Known</button>
    </div>
    <div class="hint" aria-hidden="true">Space = flip · Arrows = nav · 1/2/3 = mark · A = audio · Esc = back</div>`;

  // Populate freq filter
  const freqSel = container.querySelector('#freqFilter');
  FREQ_RANGES.forEach((fr, i) => {
    const count = surahCards.filter(j => ALL[j].freq >= fr.min && ALL[j].freq <= fr.max).length;
    if (count > 0) {
      const opt = document.createElement('option');
      opt.value = i; opt.textContent = `${fr.label} (${count})`;
      freqSel.appendChild(opt);
    }
  });

  const getFilter = () => container.querySelector('#statusFilter').value;
  const smartInfo = container.querySelector('#smartInfoBtn');
  const updateInfoVisibility = () => {
    const isSmart = getFilter() === 'smart';
    smartInfo.classList.toggle('hidden', !isSmart);
    smartInfo.setAttribute('tabindex', isSmart ? '0' : '-1');
  };
  const getFreqRange = () => {
    const v = freqSel.value;
    return v !== 'all' ? FREQ_RANGES[parseInt(v)] : null;
  };

  function rebuild() {
    deck = buildDeck(surahCards, getFilter(), getFreqRange());
    idx = 0;
    updateCard();
    updateStats();
    updateInfoVisibility();
  }

  function updateStats() {
    let n = 0, l = 0, k = 0;
    surahCards.forEach(i => { const st = getStatus(ALL[i]); if (st === 'unseen') n++; else if (st === 'learning') l++; else k++; });
    container.querySelector('#sNew').textContent = n;
    container.querySelector('#sLrn').textContent = l;
    container.querySelector('#sKnw').textContent = k;
    container.querySelector('#sDeck').textContent = deck.length;
    const pct = surahCards.length ? (k / surahCards.length) * 100 : 0;
    container.querySelector('#surahPct').textContent = Math.round(pct) + '%';
    container.querySelector('#surahFill').style.width = pct + '%';
    const bar = container.querySelector('.mastery-bar');
    if (bar) bar.setAttribute('aria-valuenow', Math.round(pct));
  }

  function updateCard() {
    const empty = deck.length === 0;
    const wrap = container.querySelector('#cardWrap');
    const acts = container.querySelector('#actions');
    const cnt = container.querySelector('#counter');
    if (empty) {
      wrap.style.display = 'none'; acts.style.display = 'none';
      cnt.textContent = 'No cards in this filter'; return;
    }
    wrap.style.display = ''; acts.style.display = '';
    cnt.textContent = (idx + 1) + ' / ' + deck.length;
    const c = ALL[deck[idx]];
    const st = getStatus(c);
    const cardInner = container.querySelector('#card');
    cardInner.classList.remove('flipped');
    // Force immediate style application
    cardInner.style.transition = 'none';
    // Update content
    container.querySelector('#fType').textContent = '';
    container.querySelector('#fAr').textContent = c.ar;
    container.querySelector('#fRoot').textContent = '';
    container.querySelector('#fFreq').textContent = '\u00d7' + c.freq + ' in Quran';
    container.querySelector('#bType').textContent = '';
    container.querySelector('#bEn').textContent = c.en || '(no translation)';
    container.querySelector('#bDet').textContent = '';
    container.querySelector('#bFreq').textContent = '\u00d7' + c.freq + ' in Quran';
    const front = container.querySelector('#cardFront');
    const back = container.querySelector('#cardBack');
    front.className = 'card-face card-front' + (st === 'learning' ? ' st-learning' : st === 'known' ? ' st-known' : '');
    back.className = 'card-face card-back' + (st === 'learning' ? ' st-learning' : st === 'known' ? ' st-known' : '');
    // Re-enable transition after browser processes the unflipped state
    setTimeout(() => { cardInner.style.transition = ''; }, 50);
    wrap.setAttribute('aria-label', 'Flashcard: Arabic word, press space to flip');
    const announce = container.querySelector('#cardAnnounce');
    announce.textContent = `Card ${idx + 1} of ${deck.length}. ${c.ar}. Press space to reveal meaning.`;
  }

  function flip() { if (deck.length) container.querySelector('#card').classList.toggle('flipped'); }

  function mark(status) {
    if (!deck.length) return;
    idx = markCard(deck, idx, status, getFilter());
    updateCard(); updateStats();
  }

  // Events
  container.querySelector('#backBtn').addEventListener('click', onBack);
  container.querySelector('#statusFilter').addEventListener('change', function () { this.blur(); rebuild(); });
  freqSel.addEventListener('change', function () { this.blur(); rebuild(); });
  container.querySelector('#shuffleBtn').addEventListener('click', () => { shuffleDeck(deck); idx = 0; updateCard(); });
  const openSmartInfo = () => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `<div class="modal">
      <h3>Smart Study</h3>
      <p>Smart Study picks the best cards for you. New words appear in order of how common they are in the Quran, and words you've seen before come back when it's time to review them.</p>
      <div class="modal-actions"><button type="button" class="modal-confirm">Got it</button></div>
    </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector('.modal-confirm').addEventListener('click', () => overlay.remove());
    overlay.querySelector('.modal-confirm').focus();
  };
  container.querySelector('#smartInfoBtn').addEventListener('click', openSmartInfo);
  container.querySelector('#smartInfoBtn').addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSmartInfo(); }
  });
  container.querySelector('#resetBtn').addEventListener('click', () => {
    showModal({
      title: 'Reset Progress',
      message: `This will reset all progress for <b>${title}</b> back to unseen. This cannot be undone.`,
      confirmText: 'Reset', danger: true,
      onConfirm: () => { resetProgress(surahCards); rebuild(); showToast('Progress reset for ' + title); }
    });
  });
  container.querySelector('#cardWrap').addEventListener('click', e => {
    if (e.target.closest('.card-corner-btn, .card-flip-btn, .card-side-btn')) return;
    if ('ontouchstart' in window) return;
    flip();
  });

  // Swipe navigation with drag animation
  let touchStartX = 0, touchStartY = 0, isDragging = false, touchMoved = false;
  const wrapEl = container.querySelector('#cardWrap');
  wrapEl.addEventListener('touchstart', e => {
    if (e.target.closest('.card-corner-btn, .card-flip-btn, .card-side-btn')) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isDragging = false;
    touchMoved = false;
    wrapEl.style.transition = 'none';
  }, { passive: true });
  wrapEl.addEventListener('touchmove', e => {
    const dx = e.touches[0].clientX - touchStartX;
    const dy = e.touches[0].clientY - touchStartY;
    touchMoved = true;
    if (!isDragging && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) isDragging = true;
    if (isDragging) {
      e.preventDefault();
      wrapEl.style.transform = `translateX(${dx}px) rotate(${dx * 0.05}deg)`;
    }
  }, { passive: false });
  wrapEl.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (isDragging && Math.abs(dx) > 80 && deck.length) {
      const dir = dx > 0 ? 1 : -1;
      wrapEl.style.transition = 'transform 0.2s ease-out';
      wrapEl.style.transform = `translateX(${dir * 400}px) rotate(${dir * 15}deg)`;
      setTimeout(() => {
        idx = dx > 0 ? (idx - 1 + deck.length) % deck.length : (idx + 1) % deck.length;
        container.querySelector('#card').classList.remove('flipped');
        wrapEl.style.transition = 'none';
        wrapEl.style.transform = '';
        updateCard();
        requestAnimationFrame(() => { wrapEl.style.transition = ''; });
      }, 200);
    } else {
      wrapEl.style.transition = 'transform 0.3s ease-out';
      wrapEl.style.transform = '';
      setTimeout(() => { wrapEl.style.transition = ''; }, 300);
      if (!touchMoved) flip();
    }
    isDragging = false;
  }, { passive: true });
  container.querySelector('#audioBtn').addEventListener('click', e => {
    e.stopPropagation();
    if (deck.length) playWord(ALL[deck[idx]]);
  });
  container.querySelectorAll('[data-mark]').forEach(btn => {
    btn.addEventListener('click', () => mark(btn.dataset.mark));
  });

  container.querySelector('#prevBtn').addEventListener('click', () => {
    if (deck.length) { idx = (idx - 1 + deck.length) % deck.length; updateCard(); }
  });
  container.querySelector('#nextBtn').addEventListener('click', () => {
    if (deck.length) { idx = (idx + 1) % deck.length; updateCard(); }
  });
  container.querySelector('#flipBtn').addEventListener('click', () => flip());
  container.querySelector('#flipBtn2').addEventListener('click', () => flip());
  container.querySelector('#prevBtn2').addEventListener('click', () => {
    if (deck.length) { idx = (idx - 1 + deck.length) % deck.length; updateCard(); }
  });
  container.querySelector('#nextBtn2').addEventListener('click', () => {
    if (deck.length) { idx = (idx + 1) % deck.length; updateCard(); }
  });

  // Keyboard
  const keyHandler = e => {
    if (e.target.tagName === 'INPUT') return;
    if (e.target.tagName === 'SELECT') {
      if (['Tab', 'Enter', ' '].includes(e.key)) return;
      if (['ArrowLeft', 'ArrowRight'].includes(e.key)) { e.target.blur(); e.preventDefault(); }
      return;
    }
    if (e.target.closest('button, a, [role="button"]') && !e.target.closest('#cardWrap')) return;
    if (e.key === ' ' && !e.target.closest('button, select, a')) { e.preventDefault(); flip(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); if (deck.length) { idx = (idx + 1) % deck.length; updateCard(); } }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); if (deck.length) { idx = (idx - 1 + deck.length) % deck.length; updateCard(); } }
    else if (e.key === '1') mark('unseen');
    else if (e.key === '2') mark('learning');
    else if (e.key === '3') mark('known');
    else if (e.key === 'a' || e.key === 'A') { if (deck.length) playWord(ALL[deck[idx]]); }
    else if (e.key === 'Escape') onBack();
  };
  document.addEventListener('keydown', keyHandler);

  // Cleanup function
  container._cleanup = () => document.removeEventListener('keydown', keyHandler);

  rebuild();
}
