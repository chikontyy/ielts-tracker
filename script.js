/* =========================================================
   IELTS Prep Tracker & Study Assistant
   Vanilla JavaScript (ES6+), no dependencies.
   Sections: 1 Data · 2 State · 3 Helpers · 4 Tracker
             5 Vocabulary · 6 Timer · 7 UI extras · 8 Init
   ========================================================= */
(() => {
  'use strict';

  /* =========================================================
     1. DATA
     ========================================================= */
  const STORAGE_KEY = 'ielts-prep-tracker:v1';

  const SECTIONS = [
    { id: 'listening', label: 'Listening' },
    { id: 'reading', label: 'Reading' },
    { id: 'writing', label: 'Writing' },
    { id: 'speaking', label: 'Speaking' }
  ];
  const SECTION_IDS = SECTIONS.map((s) => s.id);
  const RING_LENGTH = 2 * Math.PI * 90;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const VOCAB = [
    { word: 'mitigate', pos: 'verb', band: 6.5, def: 'To make something less severe, serious or harmful.', example: 'Governments must act to mitigate the effects of climate change.', ru: 'смягчать, уменьшать' },
    { word: 'exacerbate', pos: 'verb', band: 7, def: 'To make a problem or bad situation worse.', example: 'Cutting public transport funding could exacerbate urban congestion.', ru: 'усугублять' },
    { word: 'ubiquitous', pos: 'adjective', band: 7.5, def: 'Present, appearing or found everywhere.', example: 'Smartphones have become ubiquitous in modern society.', ru: 'повсеместный' },
    { word: 'substantiate', pos: 'verb', band: 7.5, def: 'To provide evidence that supports or proves a claim.', example: 'The author fails to substantiate her argument with reliable data.', ru: 'обосновывать, подтверждать' },
    { word: 'paradigm', pos: 'noun', band: 7.5, def: 'A typical model or pattern; a way of thinking about something.', example: 'Online learning represents a new paradigm in education.', ru: 'парадигма, модель' },
    { word: 'pragmatic', pos: 'adjective', band: 7, def: 'Dealing with things in a realistic and practical way.', example: 'A pragmatic approach to budgeting helped the company survive.', ru: 'прагматичный' },
    { word: 'scrutinize', pos: 'verb', band: 7, def: 'To examine something very carefully and critically.', example: 'Researchers scrutinized the data for possible errors.', ru: 'тщательно изучать' },
    { word: 'detrimental', pos: 'adjective', band: 6.5, def: 'Causing harm or damage.', example: "Excessive screen time can be detrimental to children's health.", ru: 'вредный' },
    { word: 'alleviate', pos: 'verb', band: 6.5, def: 'To reduce the severity of a problem or pain.', example: 'Building new housing could alleviate the shortage of affordable homes.', ru: 'облегчать' },
    { word: 'consensus', pos: 'noun', band: 6.5, def: 'General agreement among a group of people.', example: 'There is a growing consensus that renewable energy is essential.', ru: 'консенсус, согласие' },
    { word: 'fluctuate', pos: 'verb', band: 6.5, def: 'To rise and fall irregularly in number or amount.', example: 'Oil prices tend to fluctuate in response to global events.', ru: 'колебаться' },
    { word: 'plausible', pos: 'adjective', band: 7, def: 'Seeming reasonable or likely to be true.', example: 'It is plausible that automation will reduce demand for some jobs.', ru: 'правдоподобный' },
    { word: 'ambiguous', pos: 'adjective', band: 7, def: 'Open to more than one interpretation; unclear.', example: 'The question was ambiguous, so students answered it differently.', ru: 'двусмысленный' },
    { word: 'comprehensive', pos: 'adjective', band: 6.5, def: 'Complete and including everything that is necessary.', example: 'The report offers a comprehensive analysis of urban migration.', ru: 'всесторонний' },
    { word: 'inherent', pos: 'adjective', band: 7, def: 'Existing as a natural and essential part of something.', example: 'Risk is inherent in any start-up venture.', ru: 'присущий' },
    { word: 'profound', pos: 'adjective', band: 7, def: 'Very great or intense; having deep significance.', example: 'The internet has had a profound impact on communication.', ru: 'глубокий' },
    { word: 'resilient', pos: 'adjective', band: 7, def: 'Able to recover quickly from difficulties.', example: 'Diversified economies tend to be more resilient to shocks.', ru: 'устойчивый, жизнестойкий' },
    { word: 'stagnant', pos: 'adjective', band: 7.5, def: 'Showing no activity, growth or development.', example: 'Wages have remained stagnant for over a decade.', ru: 'застойный' },
    { word: 'reluctant', pos: 'adjective', band: 6.5, def: 'Unwilling and hesitant to do something.', example: 'Many employers are reluctant to invest in staff training.', ru: 'неохотный' },
    { word: 'deteriorate', pos: 'verb', band: 7, def: 'To become progressively worse.', example: 'Air quality continues to deteriorate in large cities.', ru: 'ухудшаться' },
    { word: 'advocate', pos: 'verb', band: 6.5, def: 'To publicly support or recommend a policy or idea.', example: 'Experts advocate a ban on advertising aimed at children.', ru: 'выступать за, отстаивать' },
    { word: 'undermine', pos: 'verb', band: 7, def: 'To weaken something gradually or secretly.', example: 'Constant budget cuts undermine the quality of public education.', ru: 'подрывать' },
    { word: 'coherent', pos: 'adjective', band: 7, def: 'Logical, consistent and easy to understand.', example: 'A good essay presents a coherent argument from start to finish.', ru: 'связный, логичный' },
    { word: 'contentious', pos: 'adjective', band: 7.5, def: 'Causing or likely to cause disagreement.', example: 'Nuclear power remains a contentious issue in many countries.', ru: 'спорный' },
    { word: 'meticulous', pos: 'adjective', band: 7.5, def: 'Showing great attention to detail; very careful.', example: 'The scientist kept meticulous records of every experiment.', ru: 'дотошный, скрупулёзный' },
    { word: 'prevalent', pos: 'adjective', band: 7, def: 'Widespread in a particular area or at a particular time.', example: 'Obesity is increasingly prevalent in developed countries.', ru: 'распространённый' },
    { word: 'incentive', pos: 'noun', band: 6.5, def: 'Something that motivates or encourages a person to act.', example: 'Tax breaks provide an incentive for firms to hire graduates.', ru: 'стимул' },
    { word: 'disparity', pos: 'noun', band: 7, def: 'A significant and often unfair difference.', example: 'There is a wide disparity between urban and rural incomes.', ru: 'неравенство, несоответствие' },
    { word: 'foster', pos: 'verb', band: 6.5, def: 'To encourage the development of something.', example: 'Schools should foster creativity as well as discipline.', ru: 'способствовать, развивать' },
    { word: 'unprecedented', pos: 'adjective', band: 7, def: 'Never done or known before.', example: 'The pandemic caused unprecedented disruption to education.', ru: 'беспрецедентный' },
    { word: 'tangible', pos: 'adjective', band: 7, def: 'Clear and real enough to be seen, measured or felt.', example: 'The programme produced tangible benefits for local communities.', ru: 'ощутимый, реальный' },
    { word: 'underlying', pos: 'adjective', band: 7, def: 'Forming the basis of something without being obvious.', example: 'Governments must address the underlying causes of crime.', ru: 'основополагающий, скрытый' },
    { word: 'albeit', pos: 'conjunction', band: 7.5, def: 'Although; even though.', example: 'The policy was effective, albeit expensive.', ru: 'хотя и' },
    { word: 'discrepancy', pos: 'noun', band: 7.5, def: 'A lack of agreement between facts, figures or claims.', example: 'There was a discrepancy between the two sets of results.', ru: 'расхождение' },
    { word: 'viable', pos: 'adjective', band: 7, def: 'Capable of working successfully; feasible.', example: 'Solar power is now a viable alternative to fossil fuels.', ru: 'жизнеспособный' },
    { word: 'hinder', pos: 'verb', band: 6.5, def: 'To make it difficult for something to happen or develop.', example: 'Poor infrastructure hinders economic growth.', ru: 'препятствовать' },
    { word: 'ramification', pos: 'noun', band: 7.5, def: 'A complex or unwelcome consequence of an action.', example: 'The ramifications of automation extend far beyond manufacturing.', ru: 'последствие, осложнение' },
    { word: 'compelling', pos: 'adjective', band: 7, def: 'Very convincing or powerful.', example: 'She presented a compelling case for reforming the tax system.', ru: 'убедительный' },
    { word: 'arbitrary', pos: 'adjective', band: 7.5, def: 'Based on random choice or personal whim, not reason.', example: 'Setting one retirement age for everyone seems arbitrary.', ru: 'произвольный' },
    { word: 'elaborate', pos: 'verb', band: 6.5, def: 'To give more detail about something.', example: 'Could you elaborate on your main argument?', ru: 'подробно излагать' }
  ];

  /* =========================================================
     2. STATE & PERSISTENCE
     ========================================================= */
  const defaultState = () => ({
    entries: [],
    target: 7.5,
    known: [],
    sessions: 0,
    minutes: 0,
    theme: 'dark'
  });

  const isValidEntry = (e) =>
    e && typeof e === 'object' &&
    typeof e.id === 'string' &&
    SECTION_IDS.includes(e.section) &&
    typeof e.score === 'number' && e.score >= 0 && e.score <= 9 &&
    typeof e.date === 'string';

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      const base = defaultState();
      return {
        entries: Array.isArray(parsed.entries) ? parsed.entries.filter(isValidEntry).map((e) => ({ ...e, created: Number(e.created) || 0, note: typeof e.note === 'string' ? e.note : '' })) : [],
        target: typeof parsed.target === 'number' ? parsed.target : base.target,
        known: Array.isArray(parsed.known) ? parsed.known.filter((w) => typeof w === 'string') : [],
        sessions: Number(parsed.sessions) || 0,
        minutes: Number(parsed.minutes) || 0,
        theme: parsed.theme === 'light' ? 'light' : 'dark'
      };
    } catch (err) {
      return defaultState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      /* storage unavailable (private mode / quota) — the app still works for this session */
    }
  }

  let state = loadState();
  let known = new Set(state.known);

  /* =========================================================
     3. HELPERS
     ========================================================= */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const pad = (n) => String(n).padStart(2, '0');

  const todayISO = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const formatDate = (iso) => {
    const d = new Date(`${iso}T00:00:00`);
    return Number.isNaN(d.getTime())
      ? iso
      : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

  /** IELTS rounding: .25 -> .5, .75 -> next whole band, otherwise to the nearest. */
  function roundBand(value) {
    const v = value + 1e-9;
    const whole = Math.floor(v);
    const frac = v - whole;
    if (frac < 0.25) return whole;
    if (frac < 0.75) return whole + 0.5;
    return whole + 1;
  }

  let toastTimer = null;
  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  function animateNumber(el, target, decimals = 1) {
    if (target === null) {
      el.dataset.value = '';
      el.textContent = '–';
      return;
    }
    const prev = parseFloat(el.dataset.value);
    const from = Number.isNaN(prev) ? 0 : prev;
    el.dataset.value = String(target);

    if (prefersReducedMotion) {
      el.textContent = target.toFixed(decimals);
      return;
    }
    const start = performance.now();
    const duration = 650;
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (from + (target - from) * eased).toFixed(decimals);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* =========================================================
     4. TRACKER
     ========================================================= */
  function computeStats() {
    const per = {};
    SECTIONS.forEach((s) => {
      const list = state.entries.filter((e) => e.section === s.id);
      per[s.id] = {
        count: list.length,
        avg: list.length ? list.reduce((sum, e) => sum + e.score, 0) / list.length : null,
        best: list.length ? Math.max(...list.map((e) => e.score)) : null
      };
    });
    const covered = SECTIONS.filter((s) => per[s.id].count > 0);
    const mean = covered.length
      ? covered.reduce((sum, s) => sum + per[s.id].avg, 0) / covered.length
      : null;
    return { per, covered: covered.length, overall: mean === null ? null : roundBand(mean) };
  }

  function buildTargetSelect() {
    const select = $('#target-select');
    select.replaceChildren();
    for (let v = 5; v <= 9; v += 0.5) {
      const opt = document.createElement('option');
      opt.value = String(v);
      opt.textContent = v.toFixed(1);
      select.appendChild(opt);
    }
    if (state.target < 5 || state.target > 9) state.target = 7.5;
    select.value = String(state.target);
  }

  function buildBars() {
    const wrap = $('#section-bars');
    wrap.replaceChildren();
    SECTIONS.forEach((s) => {
      const row = document.createElement('div');
      row.className = 'bar-row';
      row.dataset.section = s.id;
      row.innerHTML =
        '<div class="bar-head"><span class="bar-dot"></span>' +
        `<span class="bar-label">${s.label}</span>` +
        '<span class="bar-value">–</span></div>' +
        '<div class="bar-track"><div class="bar-fill"></div></div>' +
        '<div class="bar-meta">No tests yet</div>';
      wrap.appendChild(row);
    });
  }

  function updateOverview(stats) {
    animateNumber($('#overall-band'), stats.overall);

    const note = $('#overall-note');
    if (stats.overall === null) {
      note.textContent = 'Log a score to begin';
    } else if (stats.covered < 4) {
      note.textContent = `Provisional · based on ${stats.covered} of 4 sections`;
    } else {
      note.textContent = 'Based on all four sections';
    }

    const gap = $('#gap-note');
    if (stats.overall === null) {
      gap.textContent = 'Set the band you are aiming for';
    } else if (stats.overall >= state.target) {
      gap.textContent = 'Target reached — keep it steady 🎯';
    } else {
      const diff = state.target - stats.overall;
      gap.textContent = `${diff.toFixed(1)} band${diff === 1 ? '' : 's'} to go`;
    }

    $('#tests-count').textContent = String(state.entries.length);
    $('#practice-minutes').textContent = String(state.minutes);
    const s = state.sessions;
    $('#practice-sessions').textContent = `${s} timed session${s === 1 ? '' : 's'} completed`;
  }

  function updateBars(stats) {
    $$('.bar-row', $('#section-bars')).forEach((row) => {
      const data = stats.per[row.dataset.section];
      const value = $('.bar-value', row);
      const fill = $('.bar-fill', row);
      const meta = $('.bar-meta', row);
      if (data.count === 0) {
        value.textContent = '–';
        fill.style.width = '0%';
        meta.textContent = 'No tests yet';
      } else {
        value.textContent = data.avg.toFixed(1);
        fill.style.width = `${(data.avg / 9) * 100}%`;
        meta.textContent = `${data.count} test${data.count === 1 ? '' : 's'} · best ${data.best.toFixed(1)}`;
      }
    });
  }

  const SVG_NS = 'http://www.w3.org/2000/svg';
  function svgEl(name, attrs = {}) {
    const el = document.createElementNS(SVG_NS, name);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
    return el;
  }

  function renderChart() {
    const svg = $('#history-chart');
    const empty = $('#chart-empty');
    svg.replaceChildren();

    const items = [...state.entries].sort((a, b) => a.date.localeCompare(b.date) || a.created - b.created);
    empty.hidden = items.length > 0;
    svg.style.display = items.length ? '' : 'none';
    if (!items.length) return;

    const W = 600, H = 240;
    const P = { l: 34, r: 16, t: 16, b: 30 };
    const plotW = W - P.l - P.r;
    const plotH = H - P.t - P.b;
    const minScore = Math.min(...items.map((i) => i.score), state.target);
    const lo = Math.max(0, Math.floor(minScore) - 1);
    const hi = 9;

    const x = (i) => (items.length === 1 ? P.l + plotW / 2 : P.l + (plotW * i) / (items.length - 1));
    const y = (v) => P.t + plotH * (1 - (v - lo) / (hi - lo));

    // Grid + y-axis labels
    for (let g = lo; g <= hi; g++) {
      svg.appendChild(svgEl('line', { class: 'grid-line', x1: P.l, x2: W - P.r, y1: y(g), y2: y(g) }));
      const label = svgEl('text', { class: 'axis-label', x: P.l - 8, y: y(g) + 4, 'text-anchor': 'end' });
      label.textContent = String(g);
      svg.appendChild(label);
    }

    // Target line
    svg.appendChild(svgEl('line', { class: 'target-line', x1: P.l, x2: W - P.r, y1: y(state.target), y2: y(state.target) }));

    // Connecting line
    if (items.length > 1) {
      const d = items.map((it, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(it.score).toFixed(1)}`).join(' ');
      const line = svgEl('path', { class: 'series-line', d });
      svg.appendChild(line);
      if (!prefersReducedMotion) {
        try {
          const len = line.getTotalLength();
          line.style.strokeDasharray = String(len);
          line.style.strokeDashoffset = String(len);
          line.getBoundingClientRect();
          line.style.transition = 'stroke-dashoffset 1s ease';
          line.style.strokeDashoffset = '0';
        } catch (err) { /* ignore */ }
      }
    }

    // Dots
    items.forEach((it, i) => {
      const dot = svgEl('circle', { class: `dot dot-${it.section}`, cx: x(i).toFixed(1), cy: y(it.score).toFixed(1), r: 6 });
      dot.style.animationDelay = `${Math.min(i * 40, 600)}ms`;
      const title = svgEl('title');
      const sectionLabel = SECTIONS.find((s) => s.id === it.section).label;
      title.textContent = `${sectionLabel}: ${it.score.toFixed(1)} · ${formatDate(it.date)}`;
      dot.appendChild(title);
      svg.appendChild(dot);
    });

    // X-axis: first and last date
    const first = svgEl('text', { class: 'axis-label', x: x(0), y: H - 8, 'text-anchor': items.length === 1 ? 'middle' : 'start' });
    first.textContent = formatDate(items[0].date);
    svg.appendChild(first);
    if (items.length > 1) {
      const last = svgEl('text', { class: 'axis-label', x: x(items.length - 1), y: H - 8, 'text-anchor': 'end' });
      last.textContent = formatDate(items[items.length - 1].date);
      svg.appendChild(last);
    }
  }

  function renderHistory() {
    const list = $('#history-list');
    list.replaceChildren();
    const items = [...state.entries].sort((a, b) => b.date.localeCompare(a.date) || b.created - a.created);
    $('#history-empty').hidden = items.length > 0;

    items.forEach((e) => {
      const li = document.createElement('li');

      const tag = document.createElement('span');
      tag.className = `tag tag-${e.section}`;
      tag.textContent = SECTIONS.find((s) => s.id === e.section).label;

      const score = document.createElement('strong');
      score.className = 'score';
      score.textContent = e.score.toFixed(1);

      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.textContent = e.note ? `${formatDate(e.date)} · ${e.note}` : formatDate(e.date);

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'del';
      del.dataset.id = e.id;
      del.setAttribute('aria-label', `Delete ${tag.textContent} result ${e.score.toFixed(1)}`);
      del.textContent = '×';

      li.append(tag, score, meta, del);
      list.appendChild(li);
    });
  }

  function renderTracker() {
    const stats = computeStats();
    updateOverview(stats);
    updateBars(stats);
    renderChart();
    renderHistory();
  }

  function initTracker() {
    buildTargetSelect();
    buildBars();

    const form = $('#score-form');
    const scoreInput = $('#score-input');
    const dateInput = $('#date-input');
    const noteInput = $('#note-input');
    const errorEl = $('#form-error');

    dateInput.value = todayISO();
    dateInput.max = todayISO();

    [scoreInput, dateInput, noteInput].forEach((el) =>
      el.addEventListener('input', () => { errorEl.textContent = ''; })
    );

    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const section = form.elements.section.value;
      const score = parseFloat(scoreInput.value);
      const date = dateInput.value || todayISO();
      const note = noteInput.value.trim().slice(0, 60);

      if (!Number.isFinite(score) || score < 0 || score > 9 || Math.round(score * 2) / 2 !== score) {
        errorEl.textContent = 'Enter a band score from 0 to 9 in steps of 0.5 (e.g. 6.5).';
        scoreInput.focus();
        return;
      }

      state.entries.push({ id: uid(), section, score, date, note, created: Date.now() });
      saveState();
      renderTracker();

      scoreInput.value = '';
      noteInput.value = '';
      errorEl.textContent = '';
      scoreInput.focus();
      toast(`${SECTIONS.find((s) => s.id === section).label} ${score.toFixed(1)} added`);
    });

    $('#history-list').addEventListener('click', (ev) => {
      const btn = ev.target.closest('.del');
      if (!btn) return;
      state.entries = state.entries.filter((e) => e.id !== btn.dataset.id);
      saveState();
      renderTracker();
      toast('Result deleted');
    });

    $('#target-select').addEventListener('change', (ev) => {
      state.target = parseFloat(ev.target.value);
      saveState();
      renderTracker();
    });

    renderTracker();
  }

  /* =========================================================
     5. VOCABULARY
     ========================================================= */
  let deck = [];
  let pos = 0;
  let filter = 'all';
  let cardFlipped = false;

  function buildDeck() {
    let list = VOCAB;
    if (filter === 'review') list = VOCAB.filter((v) => !known.has(v.word));
    else if (filter !== 'all') list = VOCAB.filter((v) => v.band === parseFloat(filter));
    deck = list.slice();
    pos = 0;
  }

  function setFlipped(value) {
    cardFlipped = value;
    const card = $('#flashcard');
    card.classList.toggle('flipped', value);
    card.setAttribute('aria-pressed', String(value));
  }

  function withUnflip(fn) {
    if (cardFlipped) {
      setFlipped(false);
      setTimeout(fn, 230);
    } else {
      fn();
    }
  }

  function saveKnown() {
    state.known = Array.from(known);
    saveState();
  }

  function updateMastery() {
    $('#mastery-count').textContent = String(known.size);
    $('#mastery-total').textContent = String(VOCAB.length);
    $('#mastery-fill').style.width = `${(known.size / VOCAB.length) * 100}%`;

    const list = $('#mastery-list');
    list.replaceChildren();
    [6.5, 7, 7.5].forEach((band) => {
      const words = VOCAB.filter((v) => v.band === band);
      const got = words.filter((v) => known.has(v.word)).length;
      const li = document.createElement('li');
      const label = document.createElement('span');
      label.textContent = `Band ${band.toFixed(1)}`;
      const value = document.createElement('b');
      value.textContent = `${got} / ${words.length}`;
      li.append(label, value);
      list.appendChild(li);
    });
  }

  function renderCard() {
    const empty = deck.length === 0;
    const wrap = $('#flashcard-wrap');
    $('#flashcard').classList.toggle('is-empty', empty);
    ['#btn-prev', '#btn-next', '#btn-shuffle', '#btn-know', '#btn-review'].forEach((s) => {
      $(s).disabled = empty;
    });

    if (empty) {
      $('#card-band').hidden = true;
      $('#card-known').hidden = true;
      $('#card-word').textContent = 'All caught up!';
      $('#card-pos').textContent = filter === 'review' ? 'You know every word 🎉' : 'No words in this filter';
      $('#card-def').textContent = '';
      $('#card-example').textContent = '';
      $('#card-ru').hidden = true;
      $('#card-counter').textContent = '0 / 0';
    } else {
      const w = deck[pos];
      $('#card-band').hidden = false;
      $('#card-band').textContent = `Band ${w.band.toFixed(1)}`;
      $('#card-known').hidden = !known.has(w.word);
      $('#card-word').textContent = w.word;
      $('#card-pos').textContent = w.pos;
      $('#card-def').textContent = w.def;
      $('#card-example').textContent = `“${w.example}”`;
      $('#card-ru').hidden = false;
      $('#card-ru').textContent = w.ru;
      $('#card-counter').textContent = `${pos + 1} / ${deck.length}`;
    }

    wrap.classList.remove('enter');
    void wrap.offsetWidth;
    wrap.classList.add('enter');
  }

  function goTo(delta) {
    if (!deck.length) return;
    withUnflip(() => {
      pos = (pos + delta + deck.length) % deck.length;
      renderCard();
    });
  }

  function mark(isKnown) {
    if (!deck.length) return;
    const word = deck[pos].word;
    if (isKnown) known.add(word);
    else known.delete(word);
    saveKnown();
    updateMastery();

    withUnflip(() => {
      if (filter === 'review' && isKnown) {
        deck.splice(pos, 1);
        if (pos >= deck.length) pos = 0;
      } else if (deck.length > 1) {
        pos = (pos + 1) % deck.length;
      }
      renderCard();
    });
    toast(isKnown ? `“${word}” marked as known` : `“${word}” will come back for review`);
  }

  function shuffleDeck() {
    if (deck.length < 2) return;
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    pos = 0;
    withUnflip(renderCard);
    toast('Deck shuffled');
  }

  function initVocab() {
    buildDeck();
    renderCard();
    updateMastery();

    const card = $('#flashcard');
    card.addEventListener('click', () => { if (deck.length) setFlipped(!cardFlipped); });
    card.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        if (deck.length) setFlipped(!cardFlipped);
      }
    });

    $('#btn-prev').addEventListener('click', () => goTo(-1));
    $('#btn-next').addEventListener('click', () => goTo(1));
    $('#btn-shuffle').addEventListener('click', shuffleDeck);
    $('#btn-know').addEventListener('click', () => mark(true));
    $('#btn-review').addEventListener('click', () => mark(false));

    $$('.chip-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        filter = btn.dataset.filter;
        $$('.chip-btn').forEach((b) => {
          const active = b === btn;
          b.classList.toggle('active', active);
          b.setAttribute('aria-pressed', String(active));
        });
        setFlipped(false);
        buildDeck();
        renderCard();
      });
    });

    document.addEventListener('keydown', (ev) => {
      const tag = (ev.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
      if (ev.key === 'ArrowRight') goTo(1);
      else if (ev.key === 'ArrowLeft') goTo(-1);
    });
  }

  /* =========================================================
     6. TIMER
     ========================================================= */
  const timer = {
    total: 20 * 60 * 1000,
    remaining: 20 * 60 * 1000,
    running: false,
    endAt: 0,
    id: null,
    label: 'Writing Task 1'
  };
  const BASE_TITLE = document.title;
  let audioCtx = null;

  function ensureAudio() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!audioCtx) audioCtx = new AC();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch (err) { /* audio not available */ }
  }

  function beep() {
    if (audioCtx) {
      try {
        const now = audioCtx.currentTime;
        [0, 0.35, 0.7].forEach((offset) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.value = 880;
          gain.gain.setValueAtTime(0.0001, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.25, now + offset + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.25);
          osc.connect(gain).connect(audioCtx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.3);
        });
      } catch (err) { /* ignore */ }
    }
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  }

  const formatTime = (ms) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${pad(m)}:${pad(s)}`;
  };

  function updateTimerUI() {
    const wrap = $('#ring-wrap');
    const fraction = timer.total ? timer.remaining / timer.total : 0;
    $('#timer-display').textContent = formatTime(timer.remaining);
    $('#ring-fg').style.strokeDashoffset = (RING_LENGTH * (1 - fraction)).toFixed(2);

    const finished = timer.remaining <= 0;
    const started = timer.remaining < timer.total;
    wrap.classList.toggle('done', finished);
    wrap.classList.toggle('danger', !finished && fraction <= 0.1);
    wrap.classList.toggle('warn', !finished && fraction > 0.1 && fraction <= 0.25);

    $('#timer-toggle').textContent = timer.running ? 'Pause' : (started && !finished ? 'Resume' : (finished ? 'Restart' : 'Start'));
    $('#timer-status').textContent = finished ? 'Time is up' : timer.running ? 'Running' : started ? 'Paused' : 'Ready';

    if (timer.running) document.title = `${formatTime(timer.remaining)} · ${BASE_TITLE}`;
    else document.title = BASE_TITLE;
  }

  function stopTicking() {
    clearInterval(timer.id);
    timer.id = null;
    timer.running = false;
  }

  function finishTimer() {
    stopTicking();
    timer.remaining = 0;
    state.sessions += 1;
    state.minutes += Math.round(timer.total / 60000);
    saveState();
    updateOverview(computeStats());
    updateTimerUI();
    beep();
    toast(`Time is up — ${timer.label} session complete`);
  }

  function tick() {
    timer.remaining = Math.max(0, timer.endAt - Date.now());
    if (timer.remaining <= 0) finishTimer();
    else updateTimerUI();
  }

  function startTimer() {
    ensureAudio();
    if (timer.remaining <= 0) timer.remaining = timer.total;
    timer.endAt = Date.now() + timer.remaining;
    timer.running = true;
    clearInterval(timer.id);
    timer.id = setInterval(tick, 200);
    updateTimerUI();
  }

  function pauseTimer() {
    tick();
    if (timer.remaining > 0) {
      stopTicking();
      updateTimerUI();
    }
  }

  function resetTimer() {
    stopTicking();
    timer.remaining = timer.total;
    updateTimerUI();
  }

  function setPreset(minutes, label, hint) {
    stopTicking();
    timer.total = minutes * 60 * 1000;
    timer.remaining = timer.total;
    timer.label = label;
    $('#timer-hint').textContent = hint;

    $$('.preset').forEach((btn) => {
      const active = btn.dataset.minutes === String(minutes) && label !== 'Custom';
      btn.classList.toggle('active', active);
    });
    updateTimerUI();
  }

  function initTimer() {
    $('#ring-fg').style.strokeDasharray = RING_LENGTH.toFixed(2);

    $$('.preset').forEach((btn) => {
      btn.addEventListener('click', () => {
        setPreset(parseInt(btn.dataset.minutes, 10), btn.dataset.label, btn.dataset.hint);
      });
    });

    $('#custom-form').addEventListener('submit', (ev) => {
      ev.preventDefault();
      const input = $('#custom-minutes');
      const minutes = parseInt(input.value, 10);
      if (!Number.isFinite(minutes) || minutes < 1 || minutes > 180) {
        toast('Enter a number of minutes between 1 and 180');
        input.focus();
        return;
      }
      setPreset(minutes, 'Custom', `Custom session: ${minutes} minute${minutes === 1 ? '' : 's'} of focused practice.`);
      input.value = '';
    });

    $('#timer-toggle').addEventListener('click', () => {
      if (timer.running) pauseTimer();
      else startTimer();
    });
    $('#timer-reset').addEventListener('click', resetTimer);

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && timer.running) tick();
    });

    updateTimerUI();
  }

  /* =========================================================
     7. UI EXTRAS (theme, scroll effects, export / reset)
     ========================================================= */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const btn = $('#theme-toggle');
    btn.textContent = theme === 'dark' ? '☀' : '☾';
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0a0e16' : '#f5f2ea');
  }

  function initTheme() {
    applyTheme(state.theme);
    $('#theme-toggle').addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(state.theme);
      saveState();
      renderChart(); // redraw so SVG colours follow the theme tokens
    });
  }

  function initScrollEffects() {
    const panels = $$('.panel');
    const links = $$('[data-nav]');

    if (!('IntersectionObserver' in window)) return;

    panels.forEach((p) => p.classList.add('reveal'));
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    panels.forEach((p) => revealObserver.observe(p));

    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.toggle('active', a.dataset.nav === entry.target.id));
      });
    }, { rootMargin: '-40% 0px -50% 0px' });
    panels.forEach((p) => navObserver.observe(p));
  }

  function exportData() {
    const payload = {
      exportedAt: new Date().toISOString(),
      targetBand: state.target,
      entries: state.entries,
      knownWords: state.known,
      timedSessions: state.sessions,
      practiceMinutes: state.minutes
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ielts-tracker-data.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    toast('Data exported');
  }

  function resetAll() {
    if (!window.confirm('Delete all results, vocabulary progress and timer statistics? This cannot be undone.')) return;
    const theme = state.theme;
    state = defaultState();
    state.theme = theme;
    known = new Set();
    saveState();

    buildTargetSelect();
    renderTracker();
    filter = 'all';
    $$('.chip-btn').forEach((b) => {
      const active = b.dataset.filter === 'all';
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', String(active));
    });
    setFlipped(false);
    buildDeck();
    renderCard();
    updateMastery();
    resetTimer();
    toast('All data has been reset');
  }

  /* =========================================================
     8. INIT
     ========================================================= */
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initTracker();
    initVocab();
    initTimer();
    initScrollEffects();

    $('#year').textContent = String(new Date().getFullYear());
    $('#export-btn').addEventListener('click', exportData);
    $('#reset-btn').addEventListener('click', resetAll);
  });
})();