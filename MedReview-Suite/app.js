// ============================================================
//  peer_review_v2 / app.js  (v0.3 — paper_db 統合)
// ============================================================

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// ============================================================
//  STATE
// ============================================================
const state = {
  pdfDoc:    null,
  studyType: 'rct',
  pages:     [],
  fullText:  '',
  comments:  [],
  selection: null,
  db:        null,   // data.json
  paperDb:   null,   // paper_db_*.json (optional)
};

// ============================================================
//  LOAD data.json (rule DB)
// ============================================================
async function loadDB() {
  const res  = await fetch('data.json');
  state.db   = await res.json();
}

// ============================================================
//  LOAD paper_db (user selects file)
// ============================================================
document.getElementById('paperDbInput').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    state.paperDb = JSON.parse(await file.text());
    const n = state.paperDb.meta?.n_papers   ?? '?';
    const t = state.paperDb.meta?.study_type ?? '?';
    el('paperDbLabel').textContent = `✓ ${file.name}（${n}件・${t}）`;
    el('paperDbLabel').style.color = 'var(--green)';
  } catch {
    el('paperDbLabel').textContent = '読み込みエラー';
    el('paperDbLabel').style.color = 'var(--major)';
  }
});

// ============================================================
//  PDF LOADING
// ============================================================
const uploadZone = document.getElementById('uploadZone');
document.getElementById('uploadZone').addEventListener('click',  () => document.getElementById('fileInput').click());
document.getElementById('fileInput').addEventListener('change',  e  => loadPDF(e.target.files[0]));
uploadZone.addEventListener('dragover',  e => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
uploadZone.addEventListener('dragleave', ()=> uploadZone.classList.remove('drag-over'));
uploadZone.addEventListener('drop', e => {
  e.preventDefault(); uploadZone.classList.remove('drag-over');
  if (e.dataTransfer.files[0]) loadPDF(e.dataTransfer.files[0]);
});

async function loadPDF(file) {
  if (!file || file.type !== 'application/pdf') { alert('PDF ファイルを選択してください'); return; }
  document.getElementById('fileName').textContent = file.name;
  showProgress(true); setProgress(10);
  setStatus('warn', 'PDFを読み込み中...');

  const buf = await file.arrayBuffer();
  setProgress(40);
  state.pdfDoc = await pdfjsLib.getDocument({ data: buf }).promise;
  setProgress(70);
  await renderAllPages();
  setProgress(100);
  setTimeout(() => showProgress(false), 600);

  document.getElementById('analyzeBtn').disabled = false;
  setStatus('ok', `${file.name}（${state.pdfDoc.numPages} ページ）`);
  switchTab('pdf');
}

// ============================================================
//  RENDER PAGES
// ============================================================
async function renderAllPages() {
  const area = document.getElementById('pdf-viewer-area');
  document.getElementById('pdfPlaceholder').style.display = 'none';
  area.querySelectorAll('.pdf-page-group').forEach(el => el.remove());

  state.pages    = [];
  state.fullText = '';

  const firstPage = await state.pdfDoc.getPage(1);
  const baseVP    = firstPage.getViewport({ scale: 1 });
  const scale     = Math.min(820 / baseVP.width, 1.6);

  for (let i = 1; i <= state.pdfDoc.numPages; i++) {
    const page     = await state.pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale });

    const group = document.createElement('div');
    group.className = 'pdf-page-group';

    const label = document.createElement('div');
    label.className   = 'page-num-label';
    label.textContent = `Page ${i}`;
    group.appendChild(label);

    const container = document.createElement('div');
    container.className       = 'pdf-page-container';
    container.style.width     = viewport.width  + 'px';
    container.style.height    = viewport.height + 'px';
    container.dataset.page    = i;

    const canvas  = document.createElement('canvas');
    canvas.width  = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    container.appendChild(canvas);

    const textContent = await page.getTextContent();
    const lines = buildLines(textContent, viewport);
    state.pages.push({ pageNum: i, lines });
    state.fullText += lines.map(l => l.text).join('\n') + '\n';

    const textLayer = document.createElement('div');
    textLayer.className    = 'textLayer';
    textLayer.style.width  = viewport.width  + 'px';
    textLayer.style.height = viewport.height + 'px';

    for (const item of textContent.items) {
      if (!item.str.trim()) continue;
      const span = document.createElement('span');
      span.textContent = item.str;
      const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
      const [sx,,, sy, x, y] = tx;
      span.style.left      = x + 'px';
      span.style.top       = (y - Math.abs(sy)) + 'px';
      span.style.fontSize  = Math.abs(sy) + 'px';
      span.style.transform = `scaleX(${sx / Math.abs(sy)})`;
      textLayer.appendChild(span);
    }
    container.appendChild(textLayer);
    container.addEventListener('mouseup', () => handleSelection(i, lines));

    group.appendChild(container);
    area.appendChild(group);
  }
}

function buildLines(textContent, viewport) {
  const THRESH = 5;
  const items = textContent.items
    .filter(it => it.str.trim())
    .map(it => ({ text: it.str, x: it.transform[4], y: viewport.height - it.transform[5] }))
    .sort((a, b) => a.y - b.y);

  const lines = [];
  let cur = [], curY = null;

  const flush = () => {
    if (!cur.length) return;
    cur.sort((a, b) => a.x - b.x);
    lines.push({ lineNumber: lines.length + 1, y: curY, text: cur.map(i => i.text).join(' ').trim() });
  };

  for (const it of items) {
    if (curY === null || Math.abs(it.y - curY) <= THRESH) {
      cur.push(it); curY = curY ?? it.y;
    } else { flush(); cur = [it]; curY = it.y; }
  }
  flush();
  return lines;
}

// ============================================================
//  TEXT SELECTION → TOAST
// ============================================================
function handleSelection(pageNum, lines) {
  const sel  = window.getSelection();
  if (!sel || sel.isCollapsed) return;
  const text = sel.toString().trim();
  if (text.length < 5) return;

  const matched = lines.find(l => l.text.includes(text.slice(0, 30)));
  state.selection = { page: pageNum, line: matched ? matched.lineNumber : null, text };

  document.getElementById('toastSelText').textContent =
    text.length > 60 ? text.slice(0, 60) + '…' : text;
  document.getElementById('selection-toast').classList.add('visible');
}

document.getElementById('toastAddBtn').addEventListener('click', () => {
  if (!state.selection) return;
  addComment('specific', state.selection.text, state.selection.page, state.selection.line);
  document.getElementById('selection-toast').classList.remove('visible');
  window.getSelection().removeAllRanges();
  state.selection = null;
  switchTab('comments');
});
document.getElementById('toastDismissBtn').addEventListener('click', () => {
  document.getElementById('selection-toast').classList.remove('visible');
});

// ============================================================
//  ANALYSIS ENGINE
// ============================================================
document.getElementById('analyzeBtn').addEventListener('click', analyze);

async function analyze() {
  if (!state.pdfDoc || !state.db) return;
  const btn = document.getElementById('analyzeBtn');
  btn.disabled = true; btn.textContent = '解析中...';

  const text = state.fullText;
  const db   = state.db;

  // ---- 基本統計 ----
  const words  = text.split(/\s+/).filter(Boolean).length;
  const figs   = countMatches(text, db.detection_patterns.fig);
  const tables = countMatches(text, db.detection_patterns.table);
  const hasEthics   = db.detection_patterns.ethics.some(p => new RegExp(p,'i').test(text));
  const hasTrialReg = db.detection_patterns.trial_reg.some(p => new RegExp(p,'i').test(text));

  el('res-pages').textContent  = state.pdfDoc.numPages;
  el('res-words').textContent  = words.toLocaleString();

  // Figure/Table: paper_db のノルムと比較して色付け
  const pdb  = state.paperDb;
  const norm = pdb?.figure_table_norms;

  el('res-figs').innerHTML   = renderNormValue(figs,   norm, 'fig');
  el('res-tables').innerHTML = renderNormValue(tables, norm, 'table');

  el('res-ethics').innerHTML   = hasEthics
    ? '<span class="check-ok">✓ あり</span>'
    : '<span class="check-err">✗ 未検出</span>';
  el('res-trialreg').innerHTML = hasTrialReg
    ? '<span class="check-ok">✓ あり</span>'
    : '<span class="check-warn">— 未検出</span>';

  // ---- セクション検出 ----
  const expectedSections = db.sections[state.studyType] || db.sections.rct;
  const patternMap       = db.section_patterns;
  const sectionList      = el('sectionList');
  sectionList.innerHTML  = '';

  const allLines = state.fullText.split('\n');

  for (const secName of expectedSections) {
    const patterns     = patternMap[secName] || [secName.toLowerCase()];
    let   foundExcerpt = null;

    for (const pat of patterns) {
      const idx = allLines.findIndex(l =>
        new RegExp(`(^|\\s)${pat}(\\s|:|$)`, 'i').test(l)
      );
      if (idx !== -1) {
        const ctx = allLines.slice(idx, idx + 2).join(' ').trim();
        foundExcerpt = ctx.length > 120 ? ctx.slice(0, 120) + '…' : ctx;
        break;
      }
    }

    // paper_db の section_presence から検出率を取得
    const presenceRate = pdb?.section_presence?.[secName];
    const presenceHtml = presenceRate != null
      ? `<span class="sec-presence">DB: ${Math.round(presenceRate * 100)}%</span>`
      : '';

    const found = foundExcerpt !== null;
    const row   = document.createElement('div');
    row.className = `sec-row ${found ? 'found' : 'missing'}`;
    row.innerHTML = `
      <div class="sec-row-left">
        <span class="sec-name">${secName}</span>
        <span class="sec-badge">${found ? '✓ 検出' : '✗ 未検出'}</span>
        ${presenceHtml}
      </div>
      <div class="sec-excerpt">${found ? escHtml(foundExcerpt) : '—'}</div>
    `;
    sectionList.appendChild(row);
  }

  el('resultsPanel').style.display = 'block';

  // ---- paper_db キーワード密度チェック ----
  state.comments = state.comments.filter(c => !c.auto);

  if (pdb) {
    checkKeywordDensity(text, pdb);
  }

  // ---- ルールベース自動コメント ----
  const rules = [
    ...(db.auto_comments[state.studyType] || []),
    ...(db.auto_comments['_common']       || []),
  ];

  for (const rule of rules) {
    let triggered = false;
    if (rule.trigger_absent) {
      triggered = !new RegExp(rule.trigger_absent, 'i').test(text);
    } else if (rule.trigger_absent_any) {
      triggered = !rule.trigger_absent_any.some(p => new RegExp(p, 'i').test(text));
    } else if (rule.trigger_present) {
      triggered = new RegExp(rule.trigger_present, 'i').test(text);
    }
    if (triggered) addComment(rule.type, '', null, null, rule.body, true);
  }

  btn.disabled = false; btn.textContent = '🔍 論文を再解析する';
  setStatus('ok', `解析完了 — 自動コメント ${state.comments.filter(c=>c.auto).length} 件`);
  switchTab('comments');
}

// ============================================================
//  Figure/Table ノルム比較ラベル
// ============================================================
function renderNormValue(actual, norm, key) {
  const numStr = String(actual);
  if (!norm) return numStr;

  const median = norm[`${key}_median`];
  const q1     = norm[`${key}_q1`];
  const q3     = norm[`${key}_q3`];
  if (median == null) return numStr;

  let label = '', cls = '';
  if (actual < q1) {
    label = `少 (DB中央値 ${median})`; cls = 'check-warn';
  } else if (actual > q3) {
    label = `多 (DB中央値 ${median})`; cls = 'check-warn';
  } else {
    label = `正常範囲 (DB中央値 ${median})`; cls = 'check-ok';
  }
  return `${actual} <span class="${cls}" style="font-size:10px">${label}</span>`;
}

// ============================================================
//  キーワード密度チェック（paper_db）
//  重要キーワード（doc_rate >= 0.8）が論文に存在しない場合にコメント生成
// ============================================================
function checkKeywordDensity(text, pdb) {
  const lower    = text.toLowerCase();
  const profiles = pdb.keyword_profiles || {};

  // Methods / Materials and Methods セクションの重要キーワードをチェック
  const methodsSecs = ['Methods', 'Materials and Methods'];

  for (const sec of methodsSecs) {
    const profile = profiles[sec];
    if (!profile?.keywords?.length) continue;

    // doc_rate >= 0.8 かつ weight > 0 のキーワードを「必須語」とみなす
    const highFreqTerms = profile.keywords.filter(k => k.doc_rate >= 0.8 && k.weight > 0);
    const missing = highFreqTerms.filter(k => !lower.includes(k.term.toLowerCase()));

    if (missing.length >= 3) {
      const termList = missing.slice(0, 6).map(k => `"${k.term}"`).join(', ');
      addComment(
        'minor', '', null, null,
        `The Methods section appears to be missing several frequently used terms found in comparable studies (${termList}, etc.). Please verify that all relevant methodological details are described. [Based on paper_db: ${pdb.meta?.n_papers ?? '?'} papers, study_type: ${pdb.meta?.study_type ?? '?'}]`,
        true
      );
      break; // セクションごとに1件だけ生成
    }
  }

  // Results セクションの統計語チェック
  const resProfile = profiles['Results'];
  if (resProfile?.keywords?.length) {
    const statTerms = resProfile.keywords.filter(k =>
      k.doc_rate >= 0.8 &&
      ['median','iqr','adjusted','mortality','survival','days','rate'].includes(k.term)
    );
    const missingStats = statTerms.filter(k => !lower.includes(k.term));
    if (missingStats.length >= 2) {
      const termList = missingStats.map(k => `"${k.term}"`).join(', ');
      addComment(
        'minor', '', null, null,
        `The Results section may be lacking standard statistical reporting. Terms commonly reported in similar studies (${termList}) were not detected. Please ensure all outcomes are reported with appropriate statistics (median, IQR, adjusted estimates, etc.). [Based on paper_db]`,
        true
      );
    }
  }

  // Figure/Table 数チェック → renderNormValue で表示済みだが、
  // Q1未満の場合はコメントも追加
  const norm   = pdb.figure_table_norms;
  const figs   = countMatches(text, state.db.detection_patterns.fig);
  const tables = countMatches(text, state.db.detection_patterns.table);

  if (norm) {
    if (figs < norm.fig_q1) {
      addComment('minor', '', null, null,
        `The number of figures (${figs}) is lower than the first quartile of comparable studies (Q1=${norm.fig_q1}, median=${norm.fig_median}). Consider adding figures to improve data presentation (e.g., Kaplan-Meier curves, forest plots, flowcharts). [Based on paper_db]`,
        true);
    }
    if (tables < norm.table_q1) {
      addComment('minor', '', null, null,
        `The number of tables (${tables}) is lower than the first quartile of comparable studies (Q1=${norm.table_q1}, median=${norm.table_median}). Consider whether additional tables (e.g., baseline characteristics, multivariate analysis) are needed. [Based on paper_db]`,
        true);
    }
  }
}

// ============================================================
//  HELPERS
// ============================================================
function countMatches(text, patterns) {
  let n = 0;
  for (const p of patterns) n += (text.match(new RegExp(p, 'gi')) || []).length;
  return n;
}

// ============================================================
//  COMMENT MANAGEMENT
// ============================================================
function addComment(type, selectedText='', page=null, line=null, body='', auto=false) {
  state.comments.push({
    id: Date.now() + Math.random(),
    type, selectedText, page, line, body, auto,
    ts: new Date().toISOString(),
  });
  renderComments();
  updateExport();
}

function renderComments() {
  const area  = el('commentsArea');
  const empty = el('emptyComments');
  area.querySelectorAll('.comment-card').forEach(e => e.remove());

  el('commentCount').textContent = state.comments.length;

  if (!state.comments.length) { empty.style.display = 'flex'; return; }
  empty.style.display = 'none';

  const order  = { major:0, minor:1, specific:2 };
  const sorted = [...state.comments].sort((a,b) => order[a.type]-order[b.type]);

  for (const c of sorted) {
    const card = document.createElement('div');
    card.className  = `comment-card ${c.type}`;
    card.dataset.id = c.id;

    const loc     = c.page ? `p.${c.page}${c.line ? ` l.${c.line}` : ''}` : 'General';
    const autoTag = c.auto ? ' <span style="font-size:10px;color:var(--text3)">[自動]</span>' : '';

    card.innerHTML = `
      <div class="comment-header">
        <span class="comment-type ${c.type}">${c.type.toUpperCase()}</span>
        <span class="comment-loc">${loc}${autoTag}</span>
        <button class="comment-del" data-id="${c.id}" title="削除">✕</button>
      </div>
      ${c.selectedText ? `<div class="comment-selected-text">"${escHtml(c.selectedText)}"</div>` : ''}
      <textarea class="comment-textarea" data-id="${c.id}">${escHtml(c.body)}</textarea>
      <div class="comment-meta">${new Date(c.ts).toLocaleString('ja-JP')}</div>
    `;
    area.appendChild(card);
  }

  area.querySelectorAll('.comment-del').forEach(btn =>
    btn.addEventListener('click', () => {
      state.comments = state.comments.filter(c => c.id != btn.dataset.id);
      renderComments(); updateExport();
    })
  );
  area.querySelectorAll('.comment-textarea').forEach(ta =>
    ta.addEventListener('input', () => {
      const c = state.comments.find(c => c.id == ta.dataset.id);
      if (c) { c.body = ta.value; updateExport(); }
    })
  );
}

// Manual add
document.getElementById('manualAddBtn').addEventListener('click', addManual);
document.getElementById('manualInput').addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.ctrlKey) addManual();
});
function addManual() {
  const body = document.getElementById('manualInput').value.trim();
  if (!body) return;
  addComment(document.getElementById('manualType').value, '', null, null, body, false);
  document.getElementById('manualInput').value = '';
}

// ============================================================
//  EXPORT
// ============================================================
function updateExport() {
  const order  = { major:0, minor:1, specific:2 };
  const sorted = [...state.comments].sort((a,b) => order[a.type]-order[b.type]);
  const groups = { major:[], minor:[], specific:[] };
  sorted.forEach(c => groups[c.type].push(c));

  let out = `PEER REVIEW COMMENTS\n`;
  out += `Study type : ${state.studyType}\n`;
  if (state.paperDb) {
    out += `Paper DB   : ${state.paperDb.meta?.n_papers ?? '?'} papers (${state.paperDb.meta?.study_type ?? '?'})\n`;
  }
  out += `Generated  : ${new Date().toLocaleString('ja-JP')}\n`;
  out += '='.repeat(60) + '\n\n';

  for (const [type, list] of Object.entries(groups)) {
    if (!list.length) continue;
    out += `--- ${type.toUpperCase()} COMMENTS (${list.length}) ---\n`;
    list.forEach((c, i) => {
      const loc = c.page ? ` [p.${c.page}${c.line ? `, l.${c.line}` : ''}]` : '';
      out += `${i+1}.${loc}\n${c.body}\n`;
      if (c.selectedText) out += `  > "${c.selectedText}"\n`;
      out += '\n';
    });
  }

  el('exportPreview').textContent = out;
}

document.getElementById('copyBtn').addEventListener('click', () => {
  navigator.clipboard.writeText(el('exportPreview').textContent).then(() => {
    el('copyBtn').textContent = '✅ コピーしました';
    setTimeout(() => el('copyBtn').textContent = '📋 クリップボードにコピー', 2000);
  });
});

// ============================================================
//  STUDY TYPE
// ============================================================
document.querySelectorAll('.study-btn').forEach(btn =>
  btn.addEventListener('click', () => {
    document.querySelectorAll('.study-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.studyType = btn.dataset.type;
  })
);

// ============================================================
//  TABS
// ============================================================
function switchTab(name) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab===name));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id===`tab-${name}`));
}
document.querySelectorAll('.tab-btn').forEach(btn =>
  btn.addEventListener('click', () => switchTab(btn.dataset.tab))
);

// ============================================================
//  HELPERS
// ============================================================
function el(id) { return document.getElementById(id); }

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function setStatus(s, msg) {
  const dot = el('statusDot');
  dot.className = 'status-dot ' + (s==='ok' ? 'ok' : s==='warn' ? 'warn' : '');
  el('statusText').textContent = msg;
}

function showProgress(show) { el('progressBar').style.display = show ? 'block' : 'none'; }
function setProgress(pct)   { el('progressFill').style.width  = pct + '%'; }

// ============================================================
//  INIT
// ============================================================
loadDB();
updateExport();
