/* ============================================================
   MedPhrase Analyzer — script.js  Phase 2
   Phase 1: PDF/TXT extraction + IMRaD split
   Phase 2: TF-IDF · n-gram · AWL analysis
   ============================================================ */

'use strict';

// ── pdf.js worker ──
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// ══════════════════════════════════════════════
//  STOP WORDS（医学論文向け・英語）
// ══════════════════════════════════════════════
const STOP_WORDS = new Set([
  "a","an","the","and","or","but","if","in","on","at","to","for","of","with",
  "by","from","as","is","was","are","were","be","been","being","have","has",
  "had","do","does","did","will","would","could","should","may","might","shall",
  "that","this","these","those","it","its","we","our","they","their","there",
  "which","who","whom","what","how","when","where","not","no","nor","so","yet",
  "both","either","each","all","any","both","few","more","most","other","some",
  "such","than","then","thus","also","only","very","can","into","than","about",
  "up","out","between","during","after","before","among","within","without",
  "through","over","under","further","while","although","however","therefore",
  "moreover","furthermore","nevertheless","nonetheless","respectively",
  "i","ii","iii","iv","v","e","g","ie","et","al","vs","fig","table","p",
  "n","s","d","r","t","f","b","c","per","ci","hr","or","rr","sd","se",
  "one","two","three","four","five","six","seven","eight","nine","ten",
  "first","second","third","fourth","fifth","last","next","used","using",
  "reported","found","showed","shown","included","based","compared","made",
  "given","total","mean","median","range","value","values","type","types",
  "group","groups","case","cases","number","numbers","rate","rates",
]);

// ══════════════════════════════════════════════
//  App State
// ══════════════════════════════════════════════
const state = {
  files: [],
  currentFile: 'all',
  currentSection: 'introduction',
  analysisSection: 'introduction',
  lastAnalysisResult: null,
};

// ══════════════════════════════════════════════
//  IMRaD Patterns
// ══════════════════════════════════════════════
const IMRAD_PATTERNS = {
  introduction: [
    /^\s*\d*[\.\s]*introduction\s*$/i,
    /^\s*\d*[\.\s]*background\s*$/i,
    /^\s*\d*[\.\s]*overview\s*$/i,
    /^\s*\d*[\.\s]*rationale\s*$/i,
  ],
  methods: [
    /^\s*\d*[\.\s]*(materials?\s*(?:and|&)\s*methods?|methods?)\s*$/i,
    /^\s*\d*[\.\s]*(patients?\s*(?:and|&)\s*methods?)\s*$/i,
    /^\s*\d*[\.\s]*study\s*design\s*$/i,
    /^\s*\d*[\.\s]*(subjects?\s*(?:and|&)\s*methods?)\s*$/i,
  ],
  results: [
    /^\s*\d*[\.\s]*results?\s*$/i,
    /^\s*\d*[\.\s]*findings?\s*$/i,
    /^\s*\d*[\.\s]*outcomes?\s*$/i,
  ],
  discussion: [
    /^\s*\d*[\.\s]*discussion\s*$/i,
    /^\s*\d*[\.\s]*conclusion\s*$/i,
    /^\s*\d*[\.\s]*conclusions?\s*$/i,
    /^\s*\d*[\.\s]*(discussion\s*(?:and|&)\s*conclusions?)\s*$/i,
  ],
};

// ══════════════════════════════════════════════
//  DOM refs
// ══════════════════════════════════════════════
const uploadZone     = document.getElementById('uploadZone');
const fileInput      = document.getElementById('fileInput');
const fileListSec    = document.getElementById('fileListSection');
const fileListEl     = document.getElementById('fileList');
const clearAllBtn    = document.getElementById('clearAllBtn');
const progressWrap   = document.getElementById('progressWrap');
const progressBar    = document.getElementById('progressBar');
const progressLabel  = document.getElementById('progressLabel');
const resultsSec     = document.getElementById('resultsSection');
const statsBar       = document.getElementById('statsBar');
const imradContent   = document.getElementById('imradContent');
const fileSelector   = document.getElementById('fileSelector');
const exportTxtBtn   = document.getElementById('exportTxtBtn');
const exportCsvBtn   = document.getElementById('exportCsvBtn');
const runAnalysisBtn = document.getElementById('runAnalysisBtn');
const analysisOutput = document.getElementById('analysisOutput');
const viewText       = document.getElementById('viewText');
const viewAnalysis   = document.getElementById('viewAnalysis');

// ══════════════════════════════════════════════
//  Event: Upload
// ══════════════════════════════════════════════
uploadZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => handleFiles(Array.from(e.target.files)));
uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('drag-over');
  handleFiles(Array.from(e.dataTransfer.files));
});
clearAllBtn.addEventListener('click', () => { state.files = []; render(); });

// ══════════════════════════════════════════════
//  Event: View toggle
// ══════════════════════════════════════════════
document.querySelectorAll('.view-toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.view-toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const v = btn.dataset.view;
    viewText.style.display     = v === 'text'     ? '' : 'none';
    viewAnalysis.style.display = v === 'analysis' ? '' : 'none';
  });
});

// ══════════════════════════════════════════════
//  Event: Text view tabs
// ══════════════════════════════════════════════
document.querySelectorAll('#imradTabsText .tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    state.currentSection = btn.dataset.section;
    document.querySelectorAll('#imradTabsText .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderImradContent();
  });
});

// ══════════════════════════════════════════════
//  Event: Analysis tabs
// ══════════════════════════════════════════════
document.querySelectorAll('#imradTabsAnalysis .tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    state.analysisSection = btn.dataset.section;
    document.querySelectorAll('#imradTabsAnalysis .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ══════════════════════════════════════════════
//  Event: File selector, Export, Run Analysis
// ══════════════════════════════════════════════
fileSelector.addEventListener('change', () => {
  state.currentFile = fileSelector.value;
  renderImradContent();
  renderStats();
});
exportTxtBtn.addEventListener('click', exportTxt);
exportCsvBtn.addEventListener('click', exportCsv);
runAnalysisBtn.addEventListener('click', runAnalysis);

// ══════════════════════════════════════════════
//  File handling
// ══════════════════════════════════════════════
function handleFiles(files) {
  const valid = files.filter(f =>
    f.type === 'application/pdf' || f.name.endsWith('.txt') || f.type === 'text/plain'
  );
  if (!valid.length) return;
  const entries = valid.map(f => ({
    id: crypto.randomUUID(),
    file: f, name: f.name, size: f.size,
    type: f.name.endsWith('.pdf') ? 'pdf' : 'txt',
    status: 'pending', sections: null,
  }));
  state.files.push(...entries);
  render();
  processQueue(entries);
}

async function processQueue(entries) {
  const total = entries.length;
  showProgress(0, total);
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    setFileStatus(entry.id, 'loading');
    showProgress(i, total, `処理中: ${entry.name}`);
    try {
      const text = entry.type === 'pdf'
        ? await extractPdfText(entry.file)
        : await extractTxtText(entry.file);
      entry.sections = splitIMRaD(text);
      setFileStatus(entry.id, 'done');
    } catch (err) {
      console.error(err);
      setFileStatus(entry.id, 'error');
    }
    renderFileItem(entry);
    showProgress(i + 1, total, `完了: ${entry.name}`);
  }
  hideProgress();
  renderResults();
}

// ══════════════════════════════════════════════
//  PDF / TXT extraction
// ══════════════════════════════════════════════
async function extractPdfText(file) {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  const pages = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page    = await pdf.getPage(p);
    const content = await page.getTextContent();
    let lines = [], cur = '', lastY = null;
    for (const item of content.items) {
      if (!('str' in item)) continue;
      const y = item.transform[5];
      if (lastY !== null && Math.abs(y - lastY) > 3) {
        if (cur.trim()) lines.push(cur.trim());
        cur = item.str;
      } else { cur += item.str; }
      lastY = y;
    }
    if (cur.trim()) lines.push(cur.trim());
    pages.push(lines.join('\n'));
  }
  return pages.join('\n');
}

function extractTxtText(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = e => res(e.target.result);
    r.onerror = rej;
    r.readAsText(file, 'UTF-8');
  });
}

// ══════════════════════════════════════════════
//  IMRaD split
// ══════════════════════════════════════════════
function splitIMRaD(text) {
  const lines = text.split('\n');
  const sections = { introduction:[], methods:[], results:[], discussion:[], other:[] };
  let cur = 'other', buf = [];
  const flush = () => {
    const c = buf.join('\n').trim();
    if (c) sections[cur].push(c);
    buf = [];
  };
  const detect = line => {
    const t = line.trim();
    if (!t || t.length > 60) return null;
    for (const [sec, pats] of Object.entries(IMRAD_PATTERNS)) {
      if (pats.some(re => re.test(t))) return sec;
    }
    return null;
  };
  for (const line of lines) {
    const d = detect(line);
    if (d) { flush(); cur = d; } else { buf.push(line); }
  }
  flush();
  return sections;
}

// ══════════════════════════════════════════════
//  Phase 2: NLP Engine
// ══════════════════════════════════════════════

/**
 * テキストを前処理（URL・DOI・ゴミデータ除去）してから
 * トークン配列に変換
 */
function cleanText(text) {
  return text
    // ── Step1: URL/DOIをまず空白に（記号ごと完全除去）──
    // http(s):// または // を含む塊ごと除去
    .replace(/https?:\/\/[^\s]*/gi, ' __REMOVED__ ')
    .replace(/\/\/[^\s]*/g,         ' __REMOVED__ ')
    // www. から始まるドメイン
    .replace(/www\.[^\s]*/gi,       ' __REMOVED__ ')
    // DOI: 10.数字/... 形式
    .replace(/10\.\d{4,}[^\s]*/gi,' __REMOVED__ ')
    // ── Step2: 記号を空白化（英数字・スペース・ハイフン以外を除去）──
    .replace(/[^\w\s\-]/g, ' ')
    // ── Step3: __REMOVED__ プレースホルダと残滓トークンを除去 ──
    // __REMOVED__ とそれに連なる英数字断片
    .replace(/__REMOVED__\s*\w*/g, ' ')
    // ttp / ttps / http / https 等のプロトコル断片（単語として残った場合）
    .replace(/(https?|ttps?|ttp|doi|www)/gi, ' ')
    // 2文字以下の数字混じりトークン（参照番号断片）
    .replace(/[\w]*\d[\w]*/g, ' ')
    // ── Step4: 連続空白を正規化 ──
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function tokenize(text) {
  return cleanText(text)
    .toLowerCase()
    .replace(/[\u2018\u2019`]/g, "'")  // curly quotes
    .split(/\s+/)
    .map(t => t.replace(/^['\-]+|['\-]+$/g, ''))
    .filter(t => t.length >= 2 && !/^\d+$/.test(t) && !/^h?t{0,2}tps?$/.test(t));
}

/** n-gram 生成 */
function ngrams(tokens, n) {
  const result = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    result.push(tokens.slice(i, i + n).join(' '));
  }
  return result;
}

/** 頻度カウント */
function freqCount(arr) {
  const map = new Map();
  for (const w of arr) map.set(w, (map.get(w) || 0) + 1);
  return map;
}

/**
 * TF-IDF（複数ドキュメント横断）
 * documents: Array<string[]>  各ドキュメントのトークン配列
 * returns: Map<phrase, tfidf_score>
 */
function computeTFIDF(docTokenArrays, ngramN) {
  const D = docTokenArrays.length;
  if (D === 0) return new Map();

  // 各docのngram頻度
  const docFreqs = docTokenArrays.map(tokens => freqCount(ngrams(tokens, ngramN)));

  // DF（何個のdocに出現するか）
  const df = new Map();
  for (const fmap of docFreqs) {
    for (const [phrase] of fmap) {
      df.set(phrase, (df.get(phrase) || 0) + 1);
    }
  }

  // 全体TF（合計）+ TF-IDF
  const totalFreq = new Map();
  const tfidf = new Map();

  for (let d = 0; d < D; d++) {
    const fmap = docFreqs[d];
    const docTotal = docTokenArrays[d].length;
    for (const [phrase, freq] of fmap) {
      totalFreq.set(phrase, (totalFreq.get(phrase) || 0) + freq);
      const tf = freq / Math.max(docTotal, 1);
      const idf = Math.log((D + 1) / (df.get(phrase) + 1)) + 1;
      tfidf.set(phrase, (tfidf.get(phrase) || 0) + tf * idf);
    }
  }

  // ── Parent-Child マップ構築 ──
  // unigram → そのunigramを含むbigram/trigramの頻度上位リスト
  const parentMap = new Map(); // word -> [{phrase, freq}]
  for (const [phrase, freq] of totalFreq) {
    const words = phrase.split(' ');
    if (words.length < 2) continue;          // bigram以上のみ
    for (const w of words) {
      if (!parentMap.has(w)) parentMap.set(w, []);
      parentMap.get(w).push({ phrase, freq });
    }
  }
  // 頻度降順ソート・上位5件に絞る
  for (const [w, arr] of parentMap) {
    parentMap.set(w, arr.sort((a,b) => b.freq - a.freq).slice(0, 5));
  }

  return { totalFreq, tfidf, df, parentMap };
}

/**
 * セクションテキストを収集
 * section: 'introduction'|'methods'|'results'|'discussion'|'all'
 */
function collectSectionTexts(section) {
  const done = state.files.filter(f => f.status === 'done');
  const docs = [];
  for (const f of done) {
    if (!f.sections) continue;
    const secs = section === 'all'
      ? ['introduction','methods','results','discussion']
      : [section];
    const text = secs.flatMap(s => f.sections[s] || []).join('\n');
    if (text.trim()) docs.push({ name: f.name, text });
  }
  return docs;
}

/** ストップワード判定（ngram全トークンがストップワードなら除外） */
function isAllStop(phrase) {
  return phrase.split(' ').every(t => STOP_WORDS.has(t));
}

/** 数字のみ・記号のみフレーズを除外 */
function isJunk(phrase) {
  return /^[\d\s\.\,\-\/\%\(\)]+$/.test(phrase) || phrase.length < 2;
}

/** AWL判定（ngramの場合：いずれかのトークンがAWL） */
function hasAWL(phrase) {
  return phrase.split(' ').some(t => isAWL(t));
}

// ══════════════════════════════════════════════
//  Run Analysis
// ══════════════════════════════════════════════
function runAnalysis() {
  const section   = state.analysisSection;
  const ngramVals = [...document.querySelectorAll('input[name="ngram"]:checked')]
                    .map(el => parseInt(el.value));
  const minFreq   = parseInt(document.getElementById('minFreq').value) || 2;
  const topN      = parseInt(document.getElementById('topN').value) || 50;
  const awlOnly   = document.getElementById('awlOnly').checked;
  const stopRm    = document.getElementById('stopRemove').checked;

  const docs = collectSectionTexts(section);
  if (!docs.length) {
    analysisOutput.innerHTML = '<div class="section-empty">対象セクションにテキストがありません。</div>';
    return;
  }

  runAnalysisBtn.disabled = true;
  runAnalysisBtn.textContent = '解析中…';

  // 非同期で重い処理を回す
  setTimeout(() => {
    try {
      const docTokenArrays = docs.map(d => tokenize(d.text));
      const results = {};

      for (const n of ngramVals) {
        const { totalFreq, tfidf, df, parentMap } = computeTFIDF(docTokenArrays, n);
        if (n === 1) state._tmpParentMap = parentMap; // unigram時のparentMapを保存
        const D = docs.length;

        // フィルタリング
        let entries = [...totalFreq.entries()]
          .filter(([phrase, freq]) => {
            if (freq < minFreq) return false;
            if (isJunk(phrase)) return false;
            if (n === 1 && stopRm && STOP_WORDS.has(phrase)) return false;
            if (n > 1 && stopRm && isAllStop(phrase)) return false;
            if (awlOnly && !hasAWL(phrase)) return false;
            return true;
          })
          .map(([phrase, freq]) => ({
            phrase,
            freq,
            tfidf: Math.round(tfidf.get(phrase) * 1000) / 1000,
            docs: df.get(phrase),
            awl: hasAWL(phrase),
            awlTokens: phrase.split(' ').filter(t => isAWL(t)),
            // unigramの場合：このwordを含む上位bigram/trigramリスト
            parentPhrases: n === 1 ? (parentMap.get(phrase) || []) : [],
          }))
          .sort((a, b) => b.tfidf - a.tfidf)   // TF-IDFでソート
          .slice(0, topN);

        results[n] = entries;
      }

      // parentMap を unigram解析分から取得してstateに保存
      state.unigramParentMap = state._tmpParentMap || new Map();
      state.lastAnalysisResult = { results, section, docs: docs.map(d => d.name) };
      renderAnalysis(results, docs.length);
    } catch (err) {
      console.error(err);
      analysisOutput.innerHTML = `<div class="section-empty">エラー: ${escHtml(err.message)}</div>`;
    } finally {
      runAnalysisBtn.disabled = false;
      runAnalysisBtn.textContent = '▶ 解析実行';
    }
  }, 10);
}

// ══════════════════════════════════════════════
//  Render Analysis
// ══════════════════════════════════════════════
function renderAnalysis(results, docCount) {
  const ngramLabels = { 1:'Unigram（単語）', 2:'Bigram（2語）', 3:'Trigram（3語）' };
  const ngramColors = {
    1: { bar:'var(--accent-ui)',      cls:'n1' },
    2: { bar:'var(--accent-methods)', cls:'n2' },
    3: { bar:'var(--accent-results)', cls:'n3' },
  };

  // 集計
  let totalUniq = 0, totalAwl = 0;
  for (const entries of Object.values(results)) {
    totalUniq += entries.length;
    totalAwl  += entries.filter(e => e.awl).length;
  }

  let html = `
    <div class="analysis-summary">
      <div class="summary-chip"><span class="s-label">対象ファイル</span><span class="s-value">${docCount}</span></div>
      <div class="summary-chip"><span class="s-label">抽出フレーズ（ユニーク）</span><span class="s-value">${totalUniq.toLocaleString()}</span></div>
      <div class="summary-chip"><span class="s-label">AWL 含有フレーズ</span><span class="s-value">${totalAwl.toLocaleString()}</span></div>
    </div>
  `;

  for (const [nStr, entries] of Object.entries(results)) {
    const n = parseInt(nStr);
    if (!entries.length) continue;
    const maxFreq = entries[0] ? Math.max(...entries.map(e => e.freq)) : 1;
    const { bar, cls } = ngramColors[n] || { bar:'var(--accent-ui)', cls:'n1' };

    html += `
      <div class="phrase-table-wrap">
        <div class="phrase-table-header">
          <div class="phrase-table-title">
            <span class="ngram-badge ${cls}">${n}-gram</span>
            ${ngramLabels[n]}
          </div>
          <span class="phrase-count-badge">${entries.length} phrases</span>
        </div>
        <div class="phrase-table-scroll">
          <table class="phrase-table">
            <thead>
              <tr>
                <th>#</th>
                <th>フレーズ</th>
                <th>頻度</th>
                <th style="min-width:120px">頻度バー</th>
                <th>TF-IDF</th>
                <th>出現文書数</th>
              </tr>
            </thead>
            <tbody>
              ${entries.map((e, i) => {
                const barW = Math.round((e.freq / maxFreq) * 100);
                const awlMark = e.awl
                  ? `<span class="awl-mark" title="AWL語: ${escHtml(e.awlTokens.join(', '))}">AWL</span>`
                  : '';
                const hasEntry = !!lookupPhrase(e.phrase);
                const dictMark = hasEntry ? '<span class="awl-mark" style="background:rgba(255,183,77,0.12);color:#ffb74d;border-color:rgba(255,183,77,0.3)" title="辞書登録あり">辞書</span>' : '';
                return `
                  <tr class="phrase-row" data-phrase="${escHtml(e.phrase)}" data-freq="${e.freq}" data-tfidf="${e.tfidf}" data-awl="${e.awl}" data-parents="${escHtml(JSON.stringify(e.parentPhrases || []))}">
                    <td style="color:var(--text-faint);width:36px">${i+1}</td>
                    <td class="cell-phrase">
                      ${escHtml(e.phrase)}${awlMark}${dictMark}
                      ${e.parentPhrases && e.parentPhrases.length
                        ? `<span class="parent-hint" title="${escHtml(e.parentPhrases.map(p=>p.phrase).join(' / '))}">▲${e.parentPhrases.length}</span>`
                        : ''}
                    </td>
                    <td class="cell-freq">${e.freq}</td>
                    <td>
                      <div class="freq-bar-wrap">
                        <div class="freq-bar-bg">
                          <div class="freq-bar-fill" style="width:${barW}%;background:${bar}"></div>
                        </div>
                      </div>
                    </td>
                    <td class="cell-tfidf">${e.tfidf.toFixed(3)}</td>
                    <td class="cell-docs">${e.docs}</td>
                  </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  }

  analysisOutput.innerHTML = html;

  // ── 行クリック → モーダル ──
  document.querySelectorAll('.phrase-row').forEach(tr => {
    tr.addEventListener('click', () => {
      const phrase        = tr.dataset.phrase;
      const freq          = parseInt(tr.dataset.freq);
      const tfidf         = parseFloat(tr.dataset.tfidf);
      const awl           = tr.dataset.awl === 'true';
      const parentPhrases = JSON.parse(tr.dataset.parents || '[]');
      openPhraseModal(phrase, { freq, tfidf, awl, parentPhrases });
    });
  });

  // ヒント追加
  document.querySelectorAll('.phrase-table-wrap').forEach(wrap => {
    const hint = document.createElement('div');
    hint.className = 'row-hint';
    hint.textContent = '行をクリックすると詳細（日本語訳・類義語・用例）を表示';
    wrap.appendChild(hint);
  });
}

// ══════════════════════════════════════════════
//  Export CSV
// ══════════════════════════════════════════════
function exportCsv() {
  if (!state.lastAnalysisResult) {
    alert('先に解析を実行してください。');
    return;
  }
  const { results, section } = state.lastAnalysisResult;
  let csv = 'ngram,rank,phrase,frequency,tfidf,doc_count,is_awl,awl_tokens\n';
  for (const [n, entries] of Object.entries(results)) {
    entries.forEach((e, i) => {
      csv += [
        n, i+1,
        `"${e.phrase.replace(/"/g,'""')}"`,
        e.freq,
        e.tfidf.toFixed(4),
        e.docs,
        e.awl ? 'TRUE' : 'FALSE',
        `"${e.awlTokens.join(' ')}"`
      ].join(',') + '\n';
    });
  }
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `medphrase_${section}_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ══════════════════════════════════════════════
//  State helpers
// ══════════════════════════════════════════════
function setFileStatus(id, status) {
  const e = state.files.find(f => f.id === id);
  if (e) e.status = status;
}

// ══════════════════════════════════════════════
//  Render: File list & Results (Phase 1 carry-over)
// ══════════════════════════════════════════════
function render() {
  const hasFiles = state.files.length > 0;
  fileListSec.style.display = hasFiles ? '' : 'none';
  fileListEl.innerHTML = '';
  state.files.forEach(e => fileListEl.appendChild(createFileItemEl(e)));
  renderResults();
}

function renderFileItem(entry) {
  const ex = fileListEl.querySelector(`[data-id="${entry.id}"]`);
  if (ex) ex.replaceWith(createFileItemEl(entry));
}

function createFileItemEl(entry) {
  const el = document.createElement('div');
  el.className = 'file-item';
  el.dataset.id = entry.id;
  const labels = { pending:'待機', loading:'処理中', done:'完了', error:'エラー' };
  el.innerHTML = `
    <span class="file-icon ${entry.type}">${entry.type.toUpperCase()}</span>
    <span class="file-name">${escHtml(entry.name)}</span>
    <span class="file-size">${formatSize(entry.size)}</span>
    <span class="file-status ${entry.status}">${labels[entry.status]}</span>
    <button class="file-remove" data-id="${entry.id}" title="削除">×</button>`;
  el.querySelector('.file-remove').addEventListener('click', () => {
    state.files = state.files.filter(f => f.id !== entry.id);
    render();
  });
  return el;
}

function renderResults() {
  const done = state.files.filter(f => f.status === 'done');
  if (!done.length) { resultsSec.style.display = 'none'; return; }
  resultsSec.style.display = '';
  fileSelector.innerHTML = `<option value="all">すべてのファイル (${done.length})</option>`;
  done.forEach(f => {
    const o = document.createElement('option');
    o.value = f.id; o.textContent = f.name;
    fileSelector.appendChild(o);
  });
  fileSelector.value = state.currentFile;
  renderStats();
  renderImradContent();
}

function renderStats() {
  const done  = state.files.filter(f => f.status === 'done');
  const files = state.currentFile === 'all' ? done : done.filter(f => f.id === state.currentFile);
  const counts = { introduction:0, methods:0, results:0, discussion:0, other:0 };
  for (const f of files) {
    if (!f.sections) continue;
    for (const s of Object.keys(counts)) counts[s] += f.sections[s].join(' ').length;
  }
  const colors = {
    introduction:'var(--accent-intro)', methods:'var(--accent-methods)',
    results:'var(--accent-results)', discussion:'var(--accent-discussion)', other:'var(--accent-other)'
  };
  const lbls = { introduction:'Introduction', methods:'Methods', results:'Results', discussion:'Discussion', other:'Other' };
  statsBar.innerHTML = Object.entries(counts).map(([s, c]) => `
    <div class="stat-chip">
      <span class="stat-dot" style="background:${colors[s]}"></span>
      <span class="stat-label">${lbls[s]}</span>
      <span class="stat-value">${c.toLocaleString()} chars</span>
    </div>`).join('');
}

function renderImradContent() {
  const sec   = state.currentSection;
  const done  = state.files.filter(f => f.status === 'done');
  const files = state.currentFile === 'all' ? done : done.filter(f => f.id === state.currentFile);
  const blocks = files.filter(f => f.sections).map(f => ({
    file: f.name, paragraphs: f.sections[sec]
  })).filter(b => b.paragraphs.length);

  if (!blocks.length) {
    imradContent.innerHTML = `<div class="section-empty">
      このセクションの内容が検出されませんでした。<br>
      見出しが標準的なIMRaD形式であるか確認してください。</div>`;
    return;
  }
  imradContent.innerHTML = blocks.map(b => `
    <div class="paragraph-block">
      <div class="paragraph-source">
        <span class="source-file">${escHtml(b.file)}</span>
        <span>${b.paragraphs.length} paragraph(s)</span>
      </div>
      ${b.paragraphs.map(p => `
        <div class="paragraph-text">${escHtml(p)}</div>
        <div class="char-count">${p.length.toLocaleString()} chars · ${countWords(p).toLocaleString()} words</div>
      `).join('<hr style="border:none;border-top:1px solid var(--border);margin:12px 0">')}
    </div>`).join('');
}

// ── Progress ──
function showProgress(done, total, label='処理中…') {
  progressWrap.style.display = '';
  progressBar.style.width = total > 0 ? `${(done/total)*100}%` : '0%';
  progressLabel.textContent = label;
}
function hideProgress() { setTimeout(() => { progressWrap.style.display='none'; }, 600); }

// ── Export TXT ──
function exportTxt() {
  const sec   = state.currentSection;
  const done  = state.files.filter(f => f.status === 'done');
  const files = state.currentFile === 'all' ? done : done.filter(f => f.id === state.currentFile);
  let out = `MedPhrase Analyzer — Phase 2 Export\nSection: ${sec.toUpperCase()}\nDate: ${new Date().toLocaleString('ja-JP')}\n${'='.repeat(60)}\n\n`;
  for (const f of files) {
    if (!f.sections) continue;
    const ps = f.sections[sec];
    if (!ps.length) continue;
    out += `[${f.name}]\n${'─'.repeat(40)}\n${ps.join('\n\n')}\n\n`;
  }
  const blob = new Blob([out], { type:'text/plain;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `medphrase_${sec}_${Date.now()}.txt`;
  a.click(); URL.revokeObjectURL(url);
}

// ── Utilities ──
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function formatSize(b) {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b/1024).toFixed(1)} KB`;
  return `${(b/1048576).toFixed(1)} MB`;
}
function countWords(s) { return s.trim().split(/\s+/).filter(Boolean).length; }

// ══════════════════════════════════════════════
//  MODAL: Phrase Detail
// ══════════════════════════════════════════════

const modalOverlay = document.getElementById('modalOverlay');
const modalBody    = document.getElementById('modalBody');
const modalPhrase  = document.getElementById('modalPhraseLabel');
const modalBadges  = document.getElementById('modalBadges');
const modalCloseBtn= document.getElementById('modalCloseBtn');

// 閉じる
modalCloseBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

function closeModal() {
  modalOverlay.classList.remove('open');
}

/**
 * モーダルを開く
 * @param {string} phrase   - 表示フレーズ
 * @param {object} stats    - { freq, tfidf, awl, parentPhrases }
 */
function openPhraseModal(phrase, stats) {
  // ── 多層辞書引き（新構造対応）──
  const lookup  = lookupPhrase(phrase);
  // 完全一致があればエントリ本体あり、なければnull
  const entry   = lookup && lookup.matched === phrase.toLowerCase().trim() ? lookup : null;
  // 関連フレーズ（部分一致・上位概念）
  const related = lookup ? (lookup.relatedPhrases || []) : [];

  // 複合語の場合：構成トークンを個別に辞書引き
  const tokens = phrase.split(' ');
  const componentEntries = tokens.length > 1
    ? tokens.map(t => {
        const te = lookupPhrase(t);
        // 構成トークンは完全一致のみ採用
        if (!te || te.matched !== t.toLowerCase().trim()) return null;
        return { token: t, entry: te };
      }).filter(Boolean)
    : [];

  // ── ヘッダー ──
  modalPhrase.textContent = phrase;

  // バッジ
  let badges = '';
  if (stats.awl)   badges += '<span class="modal-badge awl">AWL</span>';
  if (entry) {
    const secMap = { I:'Introduction', M:'Methods', R:'Results', D:'Discussion' };
    entry.section.forEach(s => {
      badges += `<span class="modal-badge sec">${secMap[s] || s}</span>`;
    });
  }
  badges += `<span class="modal-badge freq">freq: ${stats.freq}</span>`;
  badges += `<span class="modal-badge tfidf">TF-IDF: ${stats.tfidf.toFixed(3)}</span>`;
  modalBadges.innerHTML = badges;

  // ── ボディ ──
  let body = '';

  // 1. 日本語訳・意味
  if (entry) {
    body += `
      <div class="modal-section">
        <div class="modal-section-label">🇯🇵 日本語訳・意味</div>
        <div class="modal-ja">${escHtml(entry.ja)}</div>
        <div class="modal-note">${escHtml(entry.note)}</div>
      </div>`;
  } else {
    body += `
      <div class="modal-section">
        <div class="modal-section-label">🇯🇵 日本語訳・意味</div>
        <div class="modal-no-entry">このフレーズは辞書に未登録です。KWIC（文脈中の用例）のみ表示します。</div>
      </div>`;
  }

  // 2. 類義語
  if (entry && entry.synonyms.length) {
    body += `
      <div class="modal-section">
        <div class="modal-section-label">≈ 類義語・類似フレーズ</div>
        <div class="modal-tag-list">
          ${entry.synonyms.map(s => `<span class="modal-tag synonym" title="クリックで検索">${escHtml(s)}</span>`).join('')}
        </div>
      </div>`;
  }

  // 3. 対義語
  if (entry && entry.antonyms.length) {
    body += `
      <div class="modal-section">
        <div class="modal-section-label">⇔ 対義語・対比表現</div>
        <div class="modal-tag-list">
          ${entry.antonyms.map(s => `<span class="modal-tag antonym">${escHtml(s)}</span>`).join('')}
        </div>
      </div>`;
  }

  // 4. 言い換え
  if (entry && entry.paraphrase.length) {
    body += `
      <div class="modal-section">
        <div class="modal-section-label">↺ 言い換え表現（Paraphrase）</div>
        <div class="modal-tag-list">
          ${entry.paraphrase.map(s => `<span class="modal-tag paraphrase">${escHtml(s)}</span>`).join('')}
        </div>
      </div>`;
  }

  // 5. 用例テンプレート
  if (entry && entry.templates.length) {
    body += `
      <div class="modal-section">
        <div class="modal-section-label">✏️ 用例テンプレート</div>
        <div class="modal-template-list">
          ${entry.templates.map(t => {
            // {変数}をハイライト
            const highlighted = escHtml(t).replace(/\{([^}]+)\}/g,
              '<span class="tmpl-var">{$1}</span>');
            return `
              <div class="modal-template">
                <button class="modal-copy-btn" data-text="${escHtml(t)}">コピー</button>
                ${highlighted}
              </div>`;
          }).join('')}
        </div>
      </div>`;
  }

  // 6. 構成要素の意味（複合語の場合）＋ 関連フレーズ（partial match）
  if (componentEntries.length) {
    const rows = componentEntries.map(({ token, entry: ce }) => `
      <div class="comp-row">
        <span class="comp-token">${escHtml(token)}</span>
        <span class="comp-arrow">→</span>
        <span class="comp-ja">${escHtml(ce.ja)}</span>
      </div>`).join('');
    body += `
      <div class="modal-section">
        <div class="modal-section-label">🔤 構成要素の意味</div>
        ${rows}
      </div>`;
  }

  // 6b. 関連フレーズ（辞書の部分一致 — 上位概念・下位概念）
  if (related.length) {
    const relRows = related.map(r => {
      const typeLabel = r.matchType === 'super'
        ? '<span class="rel-type super">含まれる複合語</span>'
        : '<span class="rel-type sub">構成フレーズ</span>';
      return `
        <div class="parent-row" data-phrase="${escHtml(r.key)}">
          ${typeLabel}
          <span class="parent-phrase">${escHtml(r.key)}</span>
          <span class="parent-ja">${escHtml(r.ja)}</span>
        </div>`;
    }).join('');
    body += `
      <div class="modal-section">
        <div class="modal-section-label">🔗 関連フレーズ（辞書）</div>
        <div class="parent-list">${relRows}</div>
      </div>`;
  }

  // 7. 上位フレーズ（Parent-Child）
  const parentPhrases = stats.parentPhrases || [];
  if (parentPhrases.length) {
    const parentRows = parentPhrases.map(p => {
      const pe = lookupPhrase(p.phrase);
      const jaSnippet = pe ? `<span class="parent-ja">${escHtml(pe.ja)}</span>` : '';
      return `
        <div class="parent-row" data-phrase="${escHtml(p.phrase)}" title="クリックでこのフレーズを検索">
          <span class="parent-phrase">${escHtml(p.phrase)}</span>
          <span class="parent-freq">×${p.freq}</span>
          ${jaSnippet}
        </div>`;
    }).join('');
    body += `
      <div class="modal-section">
        <div class="modal-section-label">▲ 上位フレーズ（この単語を含む複合語）</div>
        <div class="parent-list">${parentRows}</div>
      </div>`;
  }

  // 8. 外部辞書リンク
  body += buildExternalLinks(phrase);

  // 9. KWIC（文中での使い方）
  body += `
    <div class="modal-section">
      <div class="modal-section-label">📄 文中での使い方（アップロード論文より）</div>
      ${buildKWIC(phrase)}
    </div>`;

  modalBody.innerHTML = body;

  // コピーボタン
  modalBody.querySelectorAll('.modal-copy-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      navigator.clipboard.writeText(btn.dataset.text).then(() => {
        btn.textContent = '✓ コピー済';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'コピー'; btn.classList.remove('copied'); }, 1800);
      });
    });
  });

  // parent-row クリック → そのフレーズのモーダルを開く
  modalBody.querySelectorAll('.parent-row').forEach(row => {
    row.addEventListener('click', e => {
      e.stopPropagation();
      const p = row.dataset.phrase;
      // 頻度情報はparentPhrasesから取得
      const found = parentPhrases.find(x => x.phrase === p);
      openPhraseModal(p, {
        freq:          found ? found.freq : 0,
        tfidf:         0,
        awl:           hasAWL(p),
        parentPhrases: [],
      });
    });
  });

  // 開く
  modalOverlay.classList.add('open');

  // フォーカス管理（アクセシビリティ）
  setTimeout(() => modalCloseBtn.focus(), 50);
}

// ── KWIC 生成 ──
/**
 * アップロード済み全文書から phrase を含む文を抽出し、
 * 前後の文脈（±80文字）とともに表示
 */
function buildKWIC(phrase) {
  const done = state.files.filter(f => f.status === 'done');
  if (!done.length) return '<div class="kwic-empty">ファイルが読み込まれていません</div>';

  const phraseLC = phrase.toLowerCase();
  const hits = [];
  const MAX_HITS = 10;

  const secOrder = ['introduction','methods','results','discussion','other'];

  for (const f of done) {
    if (!f.sections) continue;
    for (const sec of secOrder) {
      const paragraphs = f.sections[sec] || [];
      for (const para of paragraphs) {
        // 文に分割（.!?で区切り）
        const sentences = para.split(/(?<=[.!?])\s+/);
        for (const sent of sentences) {
          const sentLC = sent.toLowerCase();
          const idx = sentLC.indexOf(phraseLC);
          if (idx === -1) continue;

          // ハイライト
          const before = escHtml(sent.slice(0, idx));
          const match  = escHtml(sent.slice(idx, idx + phrase.length));
          const after  = escHtml(sent.slice(idx + phrase.length));

          hits.push({ file: f.name, sec, html: `${before}<mark>${match}</mark>${after}` });
          if (hits.length >= MAX_HITS) break;
        }
        if (hits.length >= MAX_HITS) break;
      }
      if (hits.length >= MAX_HITS) break;
    }
    if (hits.length >= MAX_HITS) break;
  }

  if (!hits.length) {
    return `<div class="kwic-empty">論文中に「${escHtml(phrase)}」の用例が見つかりませんでした。</div>`;
  }

  const items = hits.map(h => `
    <div class="kwic-item" data-sec="${h.sec}">
      <div class="kwic-source">${escHtml(h.file)} — ${h.sec}</div>
      ${h.html}
    </div>`).join('');

  return `<div class="kwic-list">${items}<div class="kwic-empty" style="font-size:10px;padding:8px">${hits.length}件表示（最大10件）</div></div>`;
}

// ══════════════════════════════════════════════
//  外部辞書リンク生成
// ══════════════════════════════════════════════

/**
 * Google翻訳・Merriam-Webster・PubMed への外部リンクを生成
 * @param {string} phrase
 * @returns {string} HTML
 */
function buildExternalLinks(phrase) {
  const enc = encodeURIComponent(phrase);

  const links = [
    {
      id:    'google',
      label: 'Google 翻訳',
      icon:  '🌐',
      note:  '英→日 即時翻訳',
      url:   `https://translate.google.com/?sl=en&tl=ja&text=${enc}&op=translate`,
      color: 'var(--accent-ui)',
    },
    {
      id:    'merriam',
      label: 'Merriam-Webster',
      icon:  '📖',
      note:  '英英辞典（医学用語対応）',
      url:   `https://www.merriam-webster.com/dictionary/${enc}`,
      color: 'var(--accent-methods)',
    },
    {
      id:    'pubmed',
      label: 'PubMed',
      icon:  '🔬',
      note:  '論文での使用例を検索',
      url:   `https://pubmed.ncbi.nlm.nih.gov/?term=${enc}&filter=simsearch2.ffrft`,
      color: 'var(--accent-results)',
    },
  ];

  const cards = links.map(l => `
    <a class="ext-link-card" href="${l.url}" target="_blank" rel="noopener noreferrer"
       style="--ext-color:${l.color}" title="${l.note}">
      <span class="ext-icon">${l.icon}</span>
      <span class="ext-body">
        <span class="ext-label">${l.label}</span>
        <span class="ext-note">${l.note}</span>
      </span>
      <span class="ext-arrow">↗</span>
    </a>`).join('');

  return `
    <div class="modal-section">
      <div class="modal-section-label">🔗 外部辞書・データベース</div>
      <div class="ext-link-row">${cards}</div>
      <div class="ext-disclaimer">外部サイトへ遷移します。内容の正確性はご自身でご確認ください。</div>
    </div>`;
}
