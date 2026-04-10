/* ===================================================
   Journal Guide — script.js
   データ駆動レンダリング + 検索・フィルタ機能
=================================================== */

const MAX_IF = 110; // IFバー計算の基準値

// ===== データ読み込み & 初期化 =====
fetch('data.json')
  .then(r => r.json())
  .then(data => init(data))
  .catch(err => {
    document.querySelector('main').innerHTML =
      `<p style="color:red;padding:2rem">data.json の読み込みに失敗しました: ${err.message}</p>`;
  });

function init(data) {
  renderMeta(data.meta);
  renderStats(data);
  renderTOC(data.categories);
  renderSections(data.categories);
  setupSearch(data);
  setupFilters(data);
}

// ===== ヘッダー情報 =====
function renderMeta(meta) {
  document.title = meta.title;
  document.getElementById('siteTitle').textContent = meta.title.replace('感染症・微生物学 ', '');
  document.getElementById('siteSubtitle').textContent = meta.subtitle;
  document.getElementById('ifNote').textContent = meta.ifNote;
}

// ===== 統計バッジ =====
function renderStats(data) {
  const allJournals = data.categories.flatMap(c => c.journals);
  const oaCount = allJournals.filter(j => j.oa).length;
  const maxIF = Math.max(...allJournals.map(j => j.if));
  const catCount = data.categories.length;

  document.getElementById('statTotal').textContent = allJournals.length;
  document.getElementById('statCat').textContent = catCount;
  document.getElementById('statOA').textContent = oaCount;
  document.getElementById('statMaxIF').textContent = maxIF.toFixed(1);
}

// ===== TOC =====
function renderTOC(categories) {
  const nav = document.getElementById('tocNav');
  nav.innerHTML = categories.map(cat =>
    `<a href="#${cat.id}">${cat.icon} ${cat.label}</a>`
  ).join('');
}

// ===== セクション & カード =====
function renderSections(categories) {
  const main = document.getElementById('mainContent');
  main.innerHTML = '';

  categories.forEach(cat => {
    const section = document.createElement('section');
    section.className = 'journal-section';
    section.id = cat.id;
    section.dataset.category = cat.id;

    section.innerHTML = `
      <div class="section-header">
        <span class="section-icon">${cat.icon}</span>
        <h2>${cat.label}</h2>
      </div>
      <p class="section-desc">${cat.desc}</p>
      <div class="journal-grid" id="grid-${cat.id}">
        ${cat.journals.map(j => renderCard(j, cat.color)).join('')}
      </div>
    `;
    main.appendChild(section);
  });

  // 引用注記
  const citation = document.createElement('div');
  citation.className = 'citation';
  citation.innerHTML = `
    📖 各誌の詳細情報・最新IF・ガイドラインは
    <a href="https://clarivate.com/academia-government/scientific-and-academic-research/research-discovery-and-referencing/webofscience-platform/journal-citation-reports/" target="_blank" rel="noopener">
      Journal Citation Reports (JCR)
    </a> および各誌の公式サイトでご確認ください。
  `;
  main.appendChild(citation);
}

function renderCard(journal, colorKey) {
  const barPct = Math.min((journal.if / MAX_IF) * 100, 100).toFixed(1);
  const oaClass = journal.oa ? 'oa-yes' : 'oa-no';
  const oaText  = journal.oa ? 'OA' : 'Sub';
  const tags = journal.tags.map(t => `<span class="tag">${t}</span>`).join('');

  return `
    <div class="journal-card cat-${colorKey}" data-name="${journal.name.toLowerCase()} ${journal.abbr.toLowerCase()}" data-tags="${journal.tags.join(' ').toLowerCase()}" data-oa="${journal.oa}">
      <div class="if-badge">
        <span class="if-score">${journal.if.toFixed(1)}</span>
        <span class="if-label">IF</span>
      </div>
      <div class="journal-info">
        <div class="journal-name">${journal.country} ${journal.name}</div>
        <div class="journal-abbr">${journal.abbr}</div>
        <div class="journal-desc">${journal.desc}</div>
        <div class="journal-meta">
          <span class="publisher">${journal.publisher}</span>
          <span class="oa-badge ${oaClass}">${oaText}</span>
        </div>
        <div class="tag-list">${tags}</div>
        <div class="if-bar-wrap">
          <div class="if-bar-bg">
            <div class="if-bar-fill" style="width: ${barPct}%"></div>
          </div>
          <span class="if-bar-val">IF ${journal.if.toFixed(1)}</span>
        </div>
      </div>
      <div class="journal-link-col">
        <a class="journal-link" href="${journal.url}" target="_blank" rel="noopener">公式サイト →</a>
      </div>
    </div>
  `;
}

// ===== 検索 =====
function setupSearch(data) {
  const input = document.getElementById('searchInput');
  input.addEventListener('input', () => applyFilters(data));
}

// ===== フィルタボタン =====
function setupFilters(data) {
  const container = document.getElementById('filterBtns');
  const filters = [
    { key: 'all',  label: 'すべて' },
    { key: 'oa',   label: 'OA誌のみ' },
    { key: 'high', label: 'IF 10以上' },
  ];

  container.innerHTML = filters.map(f =>
    `<button class="filter-btn${f.key === 'all' ? ' active' : ''}" data-filter="${f.key}">${f.label}</button>`
  ).join('');

  container.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters(data);
    });
  });
}

// ===== フィルタ & 検索の適用 =====
function applyFilters(data) {
  const query  = document.getElementById('searchInput').value.toLowerCase().trim();
  const active = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';

  let visibleCount = 0;

  document.querySelectorAll('.journal-card').forEach(card => {
    const nameMatch = card.dataset.name.includes(query);
    const tagMatch  = card.dataset.tags.includes(query);
    const descEl    = card.querySelector('.journal-desc');
    const descMatch = descEl?.textContent.toLowerCase().includes(query);
    const textOk    = !query || nameMatch || tagMatch || descMatch;

    const isOA   = card.dataset.oa === 'true';
    const ifVal  = parseFloat(card.querySelector('.if-score')?.textContent || '0');

    let filterOk = true;
    if (active === 'oa'   && !isOA)      filterOk = false;
    if (active === 'high' && ifVal < 10) filterOk = false;

    const visible = textOk && filterOk;
    card.classList.toggle('hidden', !visible);
    if (visible) visibleCount++;
  });

  // セクション単位で全カード非表示なら section も隠す
  document.querySelectorAll('.journal-section').forEach(section => {
    const anyVisible = section.querySelectorAll('.journal-card:not(.hidden)').length > 0;
    section.classList.toggle('hidden', !anyVisible);
  });

  const noRes = document.getElementById('noResults');
  if (noRes) noRes.style.display = visibleCount === 0 ? 'block' : 'none';
}
