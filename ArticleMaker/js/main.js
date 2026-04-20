// main.js — ArticleMaker core application
// Sections: State | Undo/Redo | Render | Editor | Citations | References | Metadata | Settings | Export | Init

'use strict';

// ============================================================
// STATE
// ============================================================

let doc = null;          // The live document (strict schema)
let currentLang = "en"; // "en" | "ja"
let L = null;            // Current language object (LANG from EN.js or JN.js)

// Undo/redo stacks — store deep-cloned JSON snapshots
const undoStack = [];
const redoStack = [];
const MAX_UNDO = 50;

// Active section id for outline highlight
let activeSectionId = null;

// Which paragraph is "focused" for citation insertion
// { sectionId, subsecIdx, paraIdx }
let focusedPara = null;

// Auto-save timer
let autoSaveTimer = null;

// ============================================================
// LANGUAGE SWITCHING
// ============================================================

function setLang(lang) {
  currentLang = lang;
  // EN.js and JN.js both export `const LANG = {...}`
  // We swap by reloading the appropriate script tag's global
  L = lang === "ja" ? LANG_JA : LANG_EN;
  document.documentElement.lang = lang === "ja" ? "ja" : "en";
  renderAll();
}

// ============================================================
// UNDO / REDO
// ============================================================

function pushUndo() {
  undoStack.push(deepClone(doc));
  if (undoStack.length > MAX_UNDO) undoStack.shift();
  redoStack.length = 0;
  updateUndoButtons();
}

function undo() {
  if (!undoStack.length) return;
  redoStack.push(deepClone(doc));
  doc = undoStack.pop();
  renderAll();
  scheduleAutoSave();
  updateUndoButtons();
}

function redo() {
  if (!redoStack.length) return;
  undoStack.push(deepClone(doc));
  doc = redoStack.pop();
  renderAll();
  scheduleAutoSave();
  updateUndoButtons();
}

function updateUndoButtons() {
  const u = document.getElementById("btn-undo");
  const r = document.getElementById("btn-redo");
  if (u) u.disabled = !undoStack.length;
  if (r) r.disabled = !redoStack.length;
}

// ============================================================
// AUTO-SAVE
// ============================================================

function scheduleAutoSave() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(saveToLocalStorage, 1500);
}

function saveToLocalStorage() {
  try {
    localStorage.setItem("articlemaker_doc", JSON.stringify(doc));
    localStorage.setItem("articlemaker_lang", currentLang);
  } catch(e) { console.warn("Auto-save failed:", e); }
}

function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem("articlemaker_doc");
    const lang  = localStorage.getItem("articlemaker_lang") || "en";
    if (saved) {
      const parsed = JSON.parse(saved);
      if (validateDoc(parsed)) {
        doc = parsed;
        currentLang = lang;
        return true;
      }
    }
  } catch(e) { console.warn("Load failed:", e); }
  return false;
}

// ============================================================
// RENDER ALL
// ============================================================

function renderAll() {
  L = currentLang === "ja" ? LANG_JA : LANG_EN;
  renderHeader();
  renderOutline();
  renderEditor();
  renderRightPanel();
  updateUndoButtons();
}

// ============================================================
// HEADER
// ============================================================

function renderHeader() {
  document.getElementById("app-name").textContent    = L.appName;
  document.getElementById("app-subtitle").textContent = L.appSubtitle;
  document.getElementById("btn-lang").textContent    = L.langToggle;
  document.getElementById("btn-new").textContent     = L.btnNew;
  document.getElementById("btn-load").textContent    = L.btnLoad;
  document.getElementById("btn-save").textContent    = L.btnSave;
  document.getElementById("btn-undo").textContent    = L.btnUndo;
  document.getElementById("btn-redo").textContent    = L.btnRedo;
}

// ============================================================
// LEFT PANEL — OUTLINE NAVIGATOR
// ============================================================

function renderOutline() {
  const panel = document.getElementById("outline-list");
  panel.innerHTML = "";
  document.getElementById("outline-title").textContent = L.outlineTitle;
  document.getElementById("btn-add-section").textContent = L.addSection;
  document.getElementById("struct-label").textContent = L.structLabel;

  doc.content.sections.forEach((sec, idx) => {
    const li = document.createElement("li");
    li.className = "outline-item" + (sec.id === activeSectionId ? " active" : "");
    li.draggable = true;
    li.dataset.idx = idx;

    const num = doc.settings.numbering ? `${idx+1}. ` : "";
    li.textContent = num + (sec.title || L.sectionTitlePlaceholder);

    li.addEventListener("click", () => {
      scrollToSection(sec.id);
      setActiveSection(sec.id);
    });

    // Drag events for reordering
    li.addEventListener("dragstart", onOutlineDragStart);
    li.addEventListener("dragover",  onOutlineDragOver);
    li.addEventListener("drop",      onOutlineDrop);
    li.addEventListener("dragend",   onOutlineDragEnd);

    panel.appendChild(li);
  });
}

let dragSrcIdx = null;

function onOutlineDragStart(e) {
  dragSrcIdx = parseInt(e.currentTarget.dataset.idx);
  e.currentTarget.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
}
function onOutlineDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  document.querySelectorAll(".outline-item").forEach(el => el.classList.remove("drag-over"));
  e.currentTarget.classList.add("drag-over");
}
function onOutlineDrop(e) {
  e.preventDefault();
  const targetIdx = parseInt(e.currentTarget.dataset.idx);
  if (dragSrcIdx === null || dragSrcIdx === targetIdx) return;
  pushUndo();
  const secs = doc.content.sections;
  const [moved] = secs.splice(dragSrcIdx, 1);
  secs.splice(targetIdx, 0, moved);
  scheduleAutoSave();
  renderAll();
}
function onOutlineDragEnd(e) {
  e.currentTarget.classList.remove("dragging");
  document.querySelectorAll(".outline-item").forEach(el => el.classList.remove("drag-over"));
  dragSrcIdx = null;
}

function scrollToSection(id) {
  const el = document.getElementById("section-" + id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setActiveSection(id) {
  activeSectionId = id;
  document.querySelectorAll(".outline-item").forEach(li => {
    li.classList.toggle("active", li.textContent.endsWith(
      doc.content.sections.find(s => s.id === id)?.title || ""
    ));
  });
  // Re-render outline for clean highlight
  renderOutline();
}

// ============================================================
// CENTER PANEL — EDITOR
// ============================================================

function renderEditor() {
  const container = document.getElementById("editor-sections");
  container.innerHTML = "";

  doc.content.sections.forEach((sec, secIdx) => {
    container.appendChild(buildSectionBlock(sec, secIdx));
  });
}

function buildSectionBlock(sec, secIdx) {
  const block = document.createElement("div");
  block.className = "section-block";
  block.id = "section-" + sec.id;

  // ---- Section header ----
  const header = document.createElement("div");
  header.className = "section-header";

  const numSpan = document.createElement("span");
  numSpan.className = "section-num";
  numSpan.textContent = doc.settings.numbering ? `${secIdx+1}.` : "";

  const titleInput = document.createElement("input");
  titleInput.className = "section-title-input";
  titleInput.type = "text";
  titleInput.value = sec.title;
  titleInput.placeholder = L.sectionTitlePlaceholder;
  titleInput.addEventListener("input", e => {
    pushUndo();
    sec.title = e.target.value;
    scheduleAutoSave();
    renderOutline();
  });

  // Controls
  const controls = document.createElement("div");
  controls.className = "section-controls";

  // Toggle subsections
  const subToggle = document.createElement("button");
  subToggle.className = "btn-icon" + (sec.show_subsections ? " active" : "");
  subToggle.title = L.toggleSubsections;
  subToggle.textContent = "¶";
  subToggle.addEventListener("click", () => {
    pushUndo();
    sec.show_subsections = !sec.show_subsections;
    scheduleAutoSave();
    renderEditor();
  });

  const moveUp = document.createElement("button");
  moveUp.className = "btn-icon";
  moveUp.textContent = L.moveUp;
  moveUp.disabled = secIdx === 0;
  moveUp.addEventListener("click", () => moveSectionBy(secIdx, -1));

  const moveDown = document.createElement("button");
  moveDown.className = "btn-icon";
  moveDown.textContent = L.moveDown;
  moveDown.disabled = secIdx === doc.content.sections.length - 1;
  moveDown.addEventListener("click", () => moveSectionBy(secIdx, 1));

  const delBtn = document.createElement("button");
  delBtn.className = "btn-icon btn-danger";
  delBtn.textContent = "✕";
  delBtn.title = L.deleteSection;
  delBtn.addEventListener("click", () => {
    if (!confirm(L.confirmDeleteSection)) return;
    pushUndo();
    doc.content.sections.splice(secIdx, 1);
    scheduleAutoSave();
    renderAll();
  });

  controls.append(subToggle, moveUp, moveDown, delBtn);
  header.append(numSpan, titleInput, controls);
  block.appendChild(header);

  // ---- Subsections or flat paragraphs ----
  if (sec.show_subsections) {
    sec.subsections.forEach((sub, subIdx) => {
      block.appendChild(buildSubsectionBlock(sec, secIdx, sub, subIdx));
    });
    const addSubBtn = document.createElement("button");
    addSubBtn.className = "btn-secondary";
    addSubBtn.textContent = L.addSubsection;
    addSubBtn.addEventListener("click", () => {
      pushUndo();
      sec.subsections.push(createSubsection());
      scheduleAutoSave();
      renderEditor();
    });
    block.appendChild(addSubBtn);
  } else {
    // Flat mode: use subsections[0] paragraphs
    if (!sec.subsections.length) sec.subsections.push(createSubsection());
    const sub = sec.subsections[0];
    sub.paragraphs.forEach((para, paraIdx) => {
      block.appendChild(buildParagraphBlock(sec, secIdx, sub, 0, para, paraIdx));
    });
    const addParaBtn = document.createElement("button");
    addParaBtn.className = "btn-secondary";
    addParaBtn.textContent = L.addParagraph;
    addParaBtn.addEventListener("click", () => {
      pushUndo();
      sub.paragraphs.push(createParagraph());
      scheduleAutoSave();
      renderEditor();
    });
    block.appendChild(addParaBtn);
  }

  return block;
}

function buildSubsectionBlock(sec, secIdx, sub, subIdx) {
  const div = document.createElement("div");
  div.className = "subsection-block";

  const subHeader = document.createElement("div");
  subHeader.className = "subsection-header";

  const subTitle = document.createElement("input");
  subTitle.className = "subsection-title-input";
  subTitle.type = "text";
  subTitle.value = sub.title;
  subTitle.placeholder = L.subsectionTitlePlaceholder;
  subTitle.addEventListener("input", e => {
    sub.title = e.target.value;
    scheduleAutoSave();
    renderOutline();
  });

  const delSub = document.createElement("button");
  delSub.className = "btn-icon btn-danger";
  delSub.textContent = "✕";
  delSub.addEventListener("click", () => {
    if (sec.subsections.length === 1) return; // keep at least one
    pushUndo();
    sec.subsections.splice(subIdx, 1);
    scheduleAutoSave();
    renderEditor();
  });

  subHeader.append(subTitle, delSub);
  div.appendChild(subHeader);

  sub.paragraphs.forEach((para, paraIdx) => {
    div.appendChild(buildParagraphBlock(sec, secIdx, sub, subIdx, para, paraIdx));
  });

  const addParaBtn = document.createElement("button");
  addParaBtn.className = "btn-secondary btn-small";
  addParaBtn.textContent = L.addParagraph;
  addParaBtn.addEventListener("click", () => {
    pushUndo();
    sub.paragraphs.push(createParagraph());
    scheduleAutoSave();
    renderEditor();
  });
  div.appendChild(addParaBtn);

  return div;
}

function buildParagraphBlock(sec, secIdx, sub, subIdx, para, paraIdx) {
  const wrapper = document.createElement("div");
  wrapper.className = "para-block";

  // Formatting toolbar
  const toolbar = document.createElement("div");
  toolbar.className = "para-toolbar";

  const placeholder = L.paragraphPlaceholders[sec.id] || L.paragraphPlaceholders.default;

  // Bold
  const mkFmtBtn = (label, tag) => {
    const b = document.createElement("button");
    b.className = "btn-fmt";
    b.textContent = label;
    b.addEventListener("mousedown", e => {
      e.preventDefault();
      applyFormatToTextarea(textarea, tag);
    });
    return b;
  };

  toolbar.appendChild(mkFmtBtn(L.boldBtn, "**"));
  toolbar.appendChild(mkFmtBtn(L.italicBtn, "_"));
  toolbar.appendChild(mkFmtBtn(L.subBtn, "~"));
  toolbar.appendChild(mkFmtBtn(L.supBtn, "^"));

  // Cite button
  const citeBtn = document.createElement("button");
  citeBtn.className = "btn-cite";
  citeBtn.textContent = L.insertCitation;
  citeBtn.addEventListener("click", () => {
    focusedPara = { sec, sub, paraIdx };
    openCiteDialog();
  });
  toolbar.appendChild(citeBtn);

  // Remove paragraph button
  const delBtn = document.createElement("button");
  delBtn.className = "btn-icon btn-danger btn-para-del";
  delBtn.textContent = "✕";
  delBtn.title = "Remove paragraph";
  delBtn.addEventListener("click", () => {
    if (sub.paragraphs.length === 1) return;
    pushUndo();
    sub.paragraphs.splice(paraIdx, 1);
    scheduleAutoSave();
    renderEditor();
  });
  toolbar.appendChild(delBtn);

  wrapper.appendChild(toolbar);

  // Textarea
  const textarea = document.createElement("textarea");
  textarea.className = "para-textarea";
  textarea.value = para.text;
  textarea.placeholder = placeholder;
  textarea.rows = 4;
  textarea.addEventListener("input", e => {
    para.text = e.target.value;
    scheduleAutoSave();
    updateCitationDisplay(wrapper, para);
  });
  textarea.addEventListener("focus", () => {
    focusedPara = { sec, sub, paraIdx };
  });

  wrapper.appendChild(textarea);

  // Citation display row
  const citeDisplay = document.createElement("div");
  citeDisplay.className = "cite-display";
  updateCitationDisplay(wrapper, para, citeDisplay);
  wrapper.appendChild(citeDisplay);

  return wrapper;
}

// Apply markdown-like formatting to textarea selection
function applyFormatToTextarea(ta, marker) {
  const start = ta.selectionStart;
  const end   = ta.selectionEnd;
  const sel   = ta.value.slice(start, end);
  const before = ta.value.slice(0, start);
  const after  = ta.value.slice(end);
  ta.value = before + marker + sel + marker + after;
  ta.selectionStart = start + marker.length;
  ta.selectionEnd   = end   + marker.length;
  ta.dispatchEvent(new Event("input"));
}

// Update the inline citation badge display below a paragraph
function updateCitationDisplay(wrapper, para, citeDiv) {
  const div = citeDiv || wrapper.querySelector(".cite-display");
  if (!div) return;
  div.innerHTML = "";
  if (!para.citations.length) return;

  para.citations.forEach((cid, i) => {
    const badge = document.createElement("span");
    badge.className = "cite-badge";
    badge.textContent = renderCitationLabel(cid);
    // Click to remove
    badge.title = "Click to remove";
    badge.addEventListener("click", () => {
      pushUndo();
      para.citations.splice(i, 1);
      scheduleAutoSave();
      updateCitationDisplay(wrapper, para, div);
    });
    div.appendChild(badge);
  });
}

// Render a citation label based on format setting
function renderCitationLabel(refId) {
  const fmt = doc.settings.citation_format;
  // Map refId to display number (by appearance or manual)
  const num = getDisplayNumber(refId);
  if (fmt === "bracket")    return `[${num}]`;
  if (fmt === "paren")      return `(${num})`;
  return `[${num}]`; // superscript rendered in HTML export
}

// Get the display number for a reference
// If order = appearance, compute from document; else use ref.id
function getDisplayNumber(refId) {
  if (doc.settings.reference_order === "appearance") {
    const order = getCitationOrder();
    const idx = order.indexOf(refId);
    return idx >= 0 ? idx + 1 : refId;
  }
  return refId;
}

// Get citation order array by appearance in document
function getCitationOrder() {
  const seen = [];
  for (const sec of doc.content.sections) {
    for (const sub of sec.subsections) {
      for (const para of sub.paragraphs) {
        for (const cid of para.citations) {
          if (!seen.includes(cid)) seen.push(cid);
        }
      }
    }
  }
  return seen;
}

function moveSectionBy(idx, delta) {
  const secs = doc.content.sections;
  const newIdx = idx + delta;
  if (newIdx < 0 || newIdx >= secs.length) return;
  pushUndo();
  const [moved] = secs.splice(idx, 1);
  secs.splice(newIdx, 0, moved);
  scheduleAutoSave();
  renderAll();
}

// ============================================================
// CITATION DIALOG
// ============================================================

function openCiteDialog() {
  const dlg = document.getElementById("cite-dialog-overlay");
  dlg.classList.remove("hidden");
  renderCiteDialogRefs("");
  document.getElementById("cite-search").value = "";
  document.getElementById("cite-search").focus();
  document.getElementById("dlg-title").textContent = L.citeDlgTitle;
  document.getElementById("cite-search").placeholder = L.citeDlgSearch;
  document.getElementById("cite-dlg-cancel").textContent = L.citeDlgCancel;
}

function closeCiteDialog() {
  document.getElementById("cite-dialog-overlay").classList.add("hidden");
  focusedPara = null;
}

function renderCiteDialogRefs(query) {
  const list = document.getElementById("cite-ref-list");
  list.innerHTML = "";
  const q = query.toLowerCase();
  const refs = doc.references.filter(r =>
    !q ||
    r.title.toLowerCase().includes(q) ||
    r.authors.join(" ").toLowerCase().includes(q) ||
    String(r.year).includes(q)
  );
  if (!refs.length) {
    list.innerHTML = `<div class="no-refs">${L.citeDlgNone}</div>`;
    return;
  }
  refs.forEach(ref => {
    const row = document.createElement("div");
    row.className = "cite-ref-row";
    const num = getDisplayNumber(ref.id);
    row.innerHTML = `<span class="cite-ref-num">${num}.</span>
      <span class="cite-ref-text">${escHtml(formatReference(ref, doc.settings.ref_format, "text"))}</span>`;
    row.addEventListener("click", () => insertCitation(ref.id));
    list.appendChild(row);
  });
}

function insertCitation(refId) {
  if (!focusedPara) { closeCiteDialog(); return; }
  const { sub, paraIdx } = focusedPara;
  const para = sub.paragraphs[paraIdx];
  if (!para) { closeCiteDialog(); return; }
  pushUndo();
  if (!para.citations.includes(refId)) {
    para.citations.push(refId);
    scheduleAutoSave();
    renderEditor();
  }
  closeCiteDialog();
}

// ============================================================
// RIGHT PANEL
// ============================================================

function renderRightPanel() {
  // Tabs
  document.getElementById("tab-meta").textContent    = L.tabMeta;
  document.getElementById("tab-refs").textContent    = L.tabRefs;
  document.getElementById("tab-settings").textContent = L.tabSettings;
  // Render active tab content
  const active = document.querySelector(".tab-btn.active")?.dataset.tab || "meta";
  renderTabContent(active);
}

function renderTabContent(tab) {
  document.querySelectorAll(".tab-pane").forEach(p => p.classList.add("hidden"));
  const pane = document.getElementById("pane-" + tab);
  if (pane) pane.classList.remove("hidden");

  if (tab === "meta")     renderMetaTab();
  if (tab === "refs")     renderRefsTab();
  if (tab === "settings") renderSettingsTab();
}

// ---- METADATA TAB ----

function renderMetaTab() {
  const pane = document.getElementById("pane-meta");
  pane.innerHTML = "";

  // Article title
  pane.appendChild(labeledField(L.metaTitleLabel,
    textInput(doc.meta.title, L.metaTitlePH, v => {
      doc.meta.title = v;
      scheduleAutoSave();
    })
  ));

  // Keywords
  pane.appendChild(labeledField(L.metaKeywordsLabel,
    textInput(
      Array.isArray(doc.meta.keywords) ? doc.meta.keywords.join(", ") : "",
      L.metaKeywordsPH,
      v => {
        // Support comma, Japanese comma/space as delimiters
        doc.meta.keywords = v.split(/[,、，\s]+/).map(k => k.trim()).filter(Boolean);
        scheduleAutoSave();
      }
    ),
    L.metaKeywordsHint
  ));

  // Article type
  const typeSelect = document.createElement("select");
  typeSelect.className = "form-select";
  L.metaTypes.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t.value;
    opt.textContent = t.label;
    opt.selected = doc.meta.type === t.value;
    typeSelect.appendChild(opt);
  });
  typeSelect.addEventListener("change", e => {
    doc.meta.type = e.target.value;
    scheduleAutoSave();
  });
  pane.appendChild(labeledField(L.metaTypeLabel, typeSelect));

  // Authors
  const authSection = document.createElement("div");
  authSection.className = "meta-section";
  const authLabel = document.createElement("h4");
  authLabel.textContent = L.authorsLabel;
  authSection.appendChild(authLabel);

  doc.meta.authors.forEach((author, ai) => {
    authSection.appendChild(buildAuthorRow(author, ai));
  });

  const addAuthBtn = document.createElement("button");
  addAuthBtn.className = "btn-secondary";
  addAuthBtn.textContent = L.addAuthor;
  addAuthBtn.addEventListener("click", () => {
    pushUndo();
    doc.meta.authors.push(createAuthor());
    scheduleAutoSave();
    renderMetaTab();
  });
  authSection.appendChild(addAuthBtn);
  pane.appendChild(authSection);

  // Affiliations
  const affSection = document.createElement("div");
  affSection.className = "meta-section";
  const affLabel = document.createElement("h4");
  affLabel.textContent = L.affiliationsLabel;
  affSection.appendChild(affLabel);

  doc.meta.affiliations.forEach((aff, ai) => {
    affSection.appendChild(buildAffiliationRow(aff, ai));
  });

  const addAffBtn = document.createElement("button");
  addAffBtn.className = "btn-secondary";
  addAffBtn.textContent = L.addAffiliation;
  addAffBtn.addEventListener("click", () => {
    pushUndo();
    const newId = doc.meta.affiliations.length
      ? Math.max(...doc.meta.affiliations.map(a => a.id)) + 1
      : 1;
    doc.meta.affiliations.push(createAffiliation(newId));
    scheduleAutoSave();
    renderMetaTab();
  });
  affSection.appendChild(addAffBtn);
  pane.appendChild(affSection);
}

function buildAuthorRow(author, ai) {
  const row = document.createElement("div");
  row.className = "author-row";

  const nameInput = textInput(author.name, L.authorNamePH, v => {
    author.name = v; scheduleAutoSave();
  });
  nameInput.className += " author-name";

  const orcidInput = textInput(author.orcid, L.authorOrcidPH, v => {
    author.orcid = v; scheduleAutoSave();
  });
  orcidInput.className += " author-orcid";

  const emailInput = textInput(author.email, L.authorEmailPH, v => {
    author.email = v; scheduleAutoSave();
  });
  emailInput.className += " author-email";
  emailInput.type = "email";

  const corrCheck = document.createElement("label");
  corrCheck.className = "corr-label";
  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.checked = author.corresponding;
  cb.addEventListener("change", () => {
    author.corresponding = cb.checked;
    scheduleAutoSave();
  });
  corrCheck.appendChild(cb);
  corrCheck.appendChild(document.createTextNode(" " + L.authorCorresponding));

  // Affiliation IDs checkboxes
  const affDiv = document.createElement("div");
  affDiv.className = "author-affs";
  doc.meta.affiliations.forEach(aff => {
    const lbl = document.createElement("label");
    lbl.className = "aff-check-label";
    const affCb = document.createElement("input");
    affCb.type = "checkbox";
    affCb.checked = author.affiliation_ids.includes(aff.id);
    affCb.addEventListener("change", () => {
      if (affCb.checked) {
        if (!author.affiliation_ids.includes(aff.id))
          author.affiliation_ids.push(aff.id);
      } else {
        author.affiliation_ids = author.affiliation_ids.filter(id => id !== aff.id);
      }
      scheduleAutoSave();
    });
    lbl.appendChild(affCb);
    lbl.appendChild(document.createTextNode(` ${L.affiliationLink}${aff.id}`));
    affDiv.appendChild(lbl);
  });

  const delBtn = document.createElement("button");
  delBtn.className = "btn-icon btn-danger";
  delBtn.textContent = L.removeAuthor;
  delBtn.addEventListener("click", () => {
    if (!confirm(L.confirmDeleteAuthor)) return;
    pushUndo();
    doc.meta.authors.splice(ai, 1);
    scheduleAutoSave();
    renderMetaTab();
  });

  row.append(nameInput, orcidInput, emailInput, corrCheck, affDiv, delBtn);
  return row;
}

function buildAffiliationRow(aff, ai) {
  const row = document.createElement("div");
  row.className = "affiliation-row";

  const idSpan = document.createElement("span");
  idSpan.className = "aff-id";
  idSpan.textContent = aff.id;

  const textInput2 = textInput(aff.text, L.affiliationPH, v => {
    aff.text = v; scheduleAutoSave();
  });

  const delBtn = document.createElement("button");
  delBtn.className = "btn-icon btn-danger";
  delBtn.textContent = L.removeAffiliation;
  delBtn.addEventListener("click", () => {
    pushUndo();
    doc.meta.affiliations.splice(ai, 1);
    // Remove this affiliation id from all authors
    doc.meta.authors.forEach(au => {
      au.affiliation_ids = au.affiliation_ids.filter(id => id !== aff.id);
    });
    scheduleAutoSave();
    renderMetaTab();
  });

  row.append(idSpan, textInput2, delBtn);
  return row;
}

// ---- REFERENCES TAB ----

function renderRefsTab() {
  const pane = document.getElementById("pane-refs");
  pane.innerHTML = "";

  const header = document.createElement("div");
  header.className = "refs-header";

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.className = "refs-search";
  searchInput.placeholder = L.searchRefsPH;
  searchInput.addEventListener("input", e => renderRefList(e.target.value));

  const addBtn = document.createElement("button");
  addBtn.className = "btn-primary";
  addBtn.textContent = L.addRef;
  addBtn.addEventListener("click", () => {
    pushUndo();
    doc.references.push(createReference(nextRefId(doc)));
    scheduleAutoSave();
    renderRefsTab();
  });

  const csvBtn = document.createElement("button");
  csvBtn.className = "btn-secondary";
  csvBtn.textContent = L.importCSV;
  csvBtn.addEventListener("click", triggerCSVImport);

  header.append(searchInput, addBtn, csvBtn);
  pane.appendChild(header);

  // CSV help
  const help = document.createElement("div");
  help.className = "csv-help";
  help.textContent = L.csvHelp;
  pane.appendChild(help);

  const listEl = document.createElement("div");
  listEl.id = "ref-list";
  pane.appendChild(listEl);

  renderRefList("");
}

function renderRefList(query) {
  const list = document.getElementById("ref-list");
  if (!list) return;
  list.innerHTML = "";

  const q = query.toLowerCase();
  const refs = doc.references.filter(r =>
    !q ||
    r.title.toLowerCase().includes(q) ||
    r.authors.join(" ").toLowerCase().includes(q) ||
    String(r.year).includes(q) ||
    r.journal.toLowerCase().includes(q)
  );

  if (!refs.length) {
    list.innerHTML = `<div class="no-refs">${L.noRefs}</div>`;
    return;
  }

  const citationOrder = getCitationOrder();
  // Duplicate detection: same title+year
  const seenKeys = new Map();
  doc.references.forEach(r => {
    const key = (r.title + "|" + r.year).toLowerCase();
    if (!seenKeys.has(key)) seenKeys.set(key, r.id);
    else seenKeys.set(key, -1); // -1 = duplicate
  });

  refs.forEach(ref => {
    const card = document.createElement("div");
    card.className = "ref-card";

    const key = (ref.title + "|" + ref.year).toLowerCase();
    const isDup = seenKeys.get(key) === -1;
    if (isDup) card.classList.add("ref-duplicate");

    const num = getDisplayNumber(ref.id);
    const numSpan = document.createElement("div");
    numSpan.className = "ref-num";
    numSpan.textContent = `${num}.`;

    const preview = document.createElement("div");
    preview.className = "ref-preview";
    preview.textContent = formatReference(ref, doc.settings.ref_format, "text").slice(0, 120) + (formatReference(ref, doc.settings.ref_format, "text").length > 120 ? "…" : "");
    if (isDup) {
      const dupWarn = document.createElement("span");
      dupWarn.className = "dup-warn";
      dupWarn.textContent = " " + L.duplicateWarning;
      preview.appendChild(dupWarn);
    }

    // Collapsible edit form
    const editBtn = document.createElement("button");
    editBtn.className = "btn-icon";
    editBtn.textContent = "✎";
    editBtn.title = "Edit";

    const form = document.createElement("div");
    form.className = "ref-form hidden";
    form.appendChild(buildRefForm(ref, form, editBtn));

    editBtn.addEventListener("click", () => {
      form.classList.toggle("hidden");
    });

    const delBtn = document.createElement("button");
    delBtn.className = "btn-icon btn-danger";
    delBtn.textContent = L.deleteRef;
    delBtn.addEventListener("click", () => {
      if (!confirm(L.confirmDeleteRef)) return;
      pushUndo();
      deleteReference(doc, ref.id);
      scheduleAutoSave();
      renderRefsTab();
      renderEditor(); // refresh citation displays
    });

    const insertBtn = document.createElement("button");
    insertBtn.className = "btn-secondary btn-small";
    insertBtn.textContent = L.insertRef;
    insertBtn.addEventListener("click", () => {
      if (focusedPara) {
        insertCitation(ref.id);
      } else {
        alert(currentLang === "ja"
          ? "先にエディタで段落をクリックしてください"
          : "Click a paragraph in the editor first");
      }
    });

    const actions = document.createElement("div");
    actions.className = "ref-actions";
    actions.append(editBtn, insertBtn, delBtn);

    card.append(numSpan, preview, actions, form);
    list.appendChild(card);
  });
}

function buildRefForm(ref, formEl, editBtn) {
  const grid = document.createElement("div");
  grid.className = "ref-grid";

  const fields = [
    { key: "authors", ph: L.refAuthorsPH, wide: true,
      get: () => ref.authors.join("; "),
      set: v => { ref.authors = v.split(/;|；/).map(s => s.trim()).filter(Boolean); }
    },
    { key: "year",    ph: L.refYearPH,    get: () => ref.year,    set: v => ref.year = v },
    { key: "title",   ph: L.refTitlePH,   wide: true, get: () => ref.title,   set: v => ref.title = v },
    { key: "journal", ph: L.refJournalPH, wide: true, get: () => ref.journal, set: v => ref.journal = v },
    { key: "volume",  ph: L.refVolPH,     get: () => ref.volume,  set: v => ref.volume = v },
    { key: "issue",   ph: L.refIssuePH,   get: () => ref.issue,   set: v => ref.issue = v },
    { key: "pages",   ph: L.refPagesPH,   get: () => ref.pages,   set: v => ref.pages = v },
    { key: "doi",     ph: L.refDOIPH,     wide: true, get: () => ref.doi,     set: v => ref.doi = v },
    { key: "pmid",    ph: L.refPMIDPH,    get: () => ref.pmid,    set: v => ref.pmid = v },
  ];

  fields.forEach(f => {
    const inp = document.createElement("input");
    inp.type = "text";
    inp.className = "ref-field" + (f.wide ? " ref-field-wide" : "");
    inp.placeholder = f.ph;
    inp.value = f.get();
    inp.addEventListener("input", e => {
      f.set(e.target.value);
      scheduleAutoSave();
      // Update preview
      const card = formEl.closest(".ref-card");
      const preview = card?.querySelector(".ref-preview");
      if (preview) {
        preview.textContent = formatReference(ref, doc.settings.ref_format, "text").slice(0, 120);
      }
    });
    grid.appendChild(inp);
  });

  const saveBtn = document.createElement("button");
  saveBtn.className = "btn-primary btn-small";
  saveBtn.textContent = "✓ " + (currentLang === "ja" ? "確定" : "Done");
  saveBtn.addEventListener("click", () => {
    formEl.classList.add("hidden");
    renderRefList(document.querySelector(".refs-search")?.value || "");
    renderEditor();
  });

  grid.appendChild(saveBtn);
  return grid;
}

function triggerCSVImport() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".csv,text/csv";
  input.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const refs = parseCSV(ev.target.result);
        if (!refs.length) throw new Error("No valid rows");
        pushUndo();
        refs.forEach(r => {
          r.id = nextRefId(doc);
          doc.references.push(r);
        });
        scheduleAutoSave();
        renderRefsTab();
      } catch(err) {
        alert("CSV parse error: " + err.message);
      }
    };
    reader.readAsText(file, "UTF-8");
  });
  input.click();
}

// Parse CSV — supports two formats automatically:
//
// Format A (PubMed export):
//   Columns: PMID, Title, Authors, Citation, First Author, Journal/Book,
//            Publication Year, Create Date, PMCID, NIHMS ID, DOI
//   "Authors" field is comma-separated (e.g. "Smith J, Doe A, Lee B")
//   "Citation" field encodes volume/issue/pages (e.g. "mBio. 2026 Feb 11;17(2):e0236625.")
//
// Format B (legacy ArticleMaker):
//   Columns (positional): authors(;-sep), year, title, journal, volume, issue, pages, doi, pmid

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return [];

  const firstCols = splitCSVLine(lines[0]).map(c => c.toLowerCase().trim());

  // --- Detect PubMed format by header names ---
  const isPubMed = firstCols.includes("pmid") && firstCols.includes("title") && firstCols.includes("citation");

  if (isPubMed) {
    // Build column-index map from header
    const idx = {};
    firstCols.forEach((col, i) => { idx[col] = i; });

    return lines.slice(1).map(line => {
      const cols = splitCSVLine(line);
      const get = key => (cols[idx[key]] || "").trim();

      const ref = createReference(0);

      // PMID
      ref.pmid = get("pmid");

      // Title
      ref.title = get("title");

      // Journal
      ref.journal = get("journal/book");

      // Year
      ref.year = get("publication year");

      // DOI
      ref.doi = get("doi");

      // Authors: PubMed uses comma-separated "Last FM" format
      // Split on ", " but be careful: names contain commas only between last/first
      // PubMed Authors field: "Smith J, Doe AB, Lee C" — each name is "LastName Initials"
      const authorsRaw = get("authors");
      ref.authors = authorsRaw
        ? authorsRaw.split(",").map(s => s.trim()).filter(Boolean)
        : [];

      // Parse Citation field for volume, issue, pages
      // Examples:
      //   "mBio. 2026 Feb 11;17(2):e0236625. doi:..."
      //   "J Glob Antimicrob Resist. 2023 Mar;32:21-28. doi:..."
      //   "Infect Immun. 2015 Apr;83(4):1577-86. doi:..."
      const citation = get("citation");
      parseCitation(citation, ref);

      return ref;
    }).filter(r => r.title || r.authors.length);

  } else {
    // --- Legacy format (positional columns) ---
    const hasHeader = firstCols.some(c =>
      c.includes("author") || c.includes("title") || c.includes("年")
    );
    const rows = hasHeader ? lines.slice(1) : lines;

    return rows.map(line => {
      const cols = splitCSVLine(line);
      const ref = createReference(0);
      ref.authors = (cols[0] || "").split(/;|；/).map(s => s.trim()).filter(Boolean);
      ref.year    = cols[1] || "";
      ref.title   = cols[2] || "";
      ref.journal = cols[3] || "";
      ref.volume  = cols[4] || "";
      ref.issue   = cols[5] || "";
      ref.pages   = cols[6] || "";
      ref.doi     = cols[7] || "";
      ref.pmid    = cols[8] || "";
      return ref;
    }).filter(r => r.title || r.authors.length);
  }
}

// Parse PubMed Citation string into volume / issue / pages on a ref object.
// Handles patterns like:
//   17(2):e0236625      → vol=17, issue=2, pages=e0236625
//   32:21-28            → vol=32, issue="", pages=21-28
//   83(4):1577-86       → vol=83, issue=4, pages=1577-86
// The citation string starts with "JournalName. Year MonthDay; vol..."
// We find the semicolon that separates date from volume data.
function parseCitation(citation, ref) {
  if (!citation) return;

  // Strip trailing doi / epub notes (everything after " doi:" or " Epub")
  const clean = citation.replace(/\s+doi:.*/i, "").replace(/\s+Epub.*/i, "").trim();

  // Find the semicolon separating date from vol(issue):pages
  // Format: "Journal. Year Mon Day;VOL(ISSUE):PAGES."
  const semiIdx = clean.lastIndexOf(";");
  if (semiIdx < 0) return;

  const volPart = clean.slice(semiIdx + 1).replace(/\.$/, "").trim();
  // volPart examples: "17(2):e0236625", "32:21-28", "83(4):1577-86"

  const m = volPart.match(/^(\d+)(?:\(([^)]+)\))?:(.+)$/);
  if (m) {
    ref.volume = m[1] || "";
    ref.issue  = m[2] || "";
    ref.pages  = m[3] || "";
  }
}

function splitCSVLine(line) {
  const result = [];
  let cur = "", inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuote && line[i+1] === '"') { cur += '"'; i++; }
      else inQuote = !inQuote;
    } else if ((ch === "," || ch === "，") && !inQuote) {
      result.push(cur.trim()); cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim());
  return result;
}

// ---- SETTINGS TAB ----

function renderSettingsTab() {
  const pane = document.getElementById("pane-settings");
  pane.innerHTML = "";

  const s = doc.settings;
  // Ensure ref_format exists (backward compat with older saved docs)
  if (!s.ref_format) s.ref_format = resolveRefFormat({});
  const rf = s.ref_format;

  // Citation format
  pane.appendChild(radioGroup(
    L.citeFormatLabel,
    [
      { value: "superscript", label: L.citeSuperscript },
      { value: "bracket",     label: L.citeBracket },
      { value: "paren",       label: L.citeParen },
    ],
    s.citation_format,
    v => { s.citation_format = v; scheduleAutoSave(); renderEditor(); }
  ));

  // Section numbering
  pane.appendChild(radioGroup(
    L.numberingLabel,
    [
      { value: "true",  label: L.numberingOn },
      { value: "false", label: L.numberingOff },
    ],
    String(s.numbering),
    v => { s.numbering = v === "true"; scheduleAutoSave(); renderAll(); }
  ));

  // Double spacing (DOCX)
  pane.appendChild(radioGroup(
    L.doubleSpaceLabel,
    [
      { value: "true",  label: currentLang === "ja" ? "あり" : "On" },
      { value: "false", label: currentLang === "ja" ? "なし" : "Off" },
    ],
    String(s.double_spacing),
    v => { s.double_spacing = v === "true"; scheduleAutoSave(); }
  ));

  // Font settings
  ["title", "body", "references"].forEach(type => {
    const label = { title: L.fontTitleLabel, body: L.fontBodyLabel, references: L.fontRefsLabel }[type];
    const inp = textInput(s.font[type], "Times New Roman", v => {
      s.font[type] = v; scheduleAutoSave();
    });
    pane.appendChild(labeledField(label, inp));
  });

  // ---- Reference Format Section ----
  const rfSection = document.createElement("div");
  rfSection.className = "meta-section";
  const rfTitle = document.createElement("h4");
  rfTitle.textContent = L.refFormatTitle;
  rfSection.appendChild(rfTitle);

  // author_max
  rfSection.appendChild(labeledField(
    L.refFormatAuthorMax,
    (() => {
      const sel = document.createElement("select");
      sel.className = "form-select";
      const opts = [
        { v: 0, l: currentLang === "ja" ? "全員" : "All" },
        ...[1,2,3,4,5,6,7,8,9,10].map(n => ({ v: n, l: String(n) }))
      ];
      opts.forEach(o => {
        const opt = document.createElement("option");
        opt.value = o.v;
        opt.textContent = o.l;
        opt.selected = rf.author_max === o.v;
        sel.appendChild(opt);
      });
      sel.addEventListener("change", e => {
        rf.author_max = parseInt(e.target.value);
        scheduleAutoSave(); refreshRefPreview(rfSection);
      });
      return sel;
    })()
  ));

  // etal_from
  rfSection.appendChild(labeledField(
    L.refFormatEtalFrom,
    (() => {
      const sel = document.createElement("select");
      sel.className = "form-select";
      [2,3,4,5,6,7,8,9,10,99].forEach(n => {
        const opt = document.createElement("option");
        opt.value = n;
        opt.textContent = n === 99
          ? (currentLang === "ja" ? "使わない" : "Never")
          : (currentLang === "ja" ? `${n}人超` : `> ${n} authors`);
        opt.selected = rf.etal_from === n;
        sel.appendChild(opt);
      });
      sel.addEventListener("change", e => {
        rf.etal_from = parseInt(e.target.value);
        scheduleAutoSave(); refreshRefPreview(rfSection);
      });
      return sel;
    })()
  ));

  // show_title
  rfSection.appendChild(radioGroup(
    L.refFormatShowTitle,
    [{ value: "true", label: currentLang === "ja" ? "あり" : "Yes" },
     { value: "false", label: currentLang === "ja" ? "なし" : "No" }],
    String(rf.show_title),
    v => { rf.show_title = v === "true"; scheduleAutoSave(); refreshRefPreview(rfSection); }
  ));

  // journal_italic
  rfSection.appendChild(radioGroup(
    L.refFormatJournalItalic,
    [{ value: "true",  label: currentLang === "ja" ? "イタリック" : "Italic" },
     { value: "false", label: currentLang === "ja" ? "通常" : "Normal" }],
    String(rf.journal_italic),
    v => { rf.journal_italic = v === "true"; scheduleAutoSave(); refreshRefPreview(rfSection); }
  ));

  // vol_style
  rfSection.appendChild(radioGroup(
    L.refFormatVolStyle,
    [
      { value: "17(2):21",       label: "17(2):21-28" },
      { value: "17: 21",         label: "17: 21-28" },
      { value: "Vol.17 No.2 p.21", label: "Vol.17 No.2 p.21-28" },
    ],
    rf.vol_style,
    v => { rf.vol_style = v; scheduleAutoSave(); refreshRefPreview(rfSection); }
  ));

  // show_doi / show_pmid
  rfSection.appendChild(radioGroup(
    L.refFormatShowDoi,
    [{ value: "true", label: currentLang === "ja" ? "表示" : "Show" },
     { value: "false", label: currentLang === "ja" ? "非表示" : "Hide" }],
    String(rf.show_doi),
    v => { rf.show_doi = v === "true"; scheduleAutoSave(); refreshRefPreview(rfSection); }
  ));
  rfSection.appendChild(radioGroup(
    L.refFormatShowPmid,
    [{ value: "true", label: currentLang === "ja" ? "表示" : "Show" },
     { value: "false", label: currentLang === "ja" ? "非表示" : "Hide" }],
    String(rf.show_pmid),
    v => { rf.show_pmid = v === "true"; scheduleAutoSave(); refreshRefPreview(rfSection); }
  ));

  // field_order — ↑↓ button reorder
  const foWrap = document.createElement("div");
  foWrap.className = "field-group";
  const foLabel = document.createElement("label");
  foLabel.className = "field-label";
  foLabel.textContent = L.refFormatFieldOrder;
  foWrap.appendChild(foLabel);

  const foList = document.createElement("div");
  foList.className = "field-order-list";
  foWrap.appendChild(foList);

  const fieldLabels = {
    authors: currentLang === "ja" ? "著者" : "Authors",
    year:    currentLang === "ja" ? "年"   : "Year",
    title:   currentLang === "ja" ? "タイトル" : "Title",
    journal: currentLang === "ja" ? "雑誌名" : "Journal",
    locator: currentLang === "ja" ? "巻・号・頁" : "Vol/Issue/Pages",
    doi:     "DOI",
    pmid:    "PMID",
  };

  function renderFieldOrderList() {
    foList.innerHTML = "";
    rf.field_order.forEach((key, idx) => {
      const row = document.createElement("div");
      row.className = "fo-row";

      const lbl = document.createElement("span");
      lbl.className = "fo-label";
      lbl.textContent = fieldLabels[key] || key;
      row.appendChild(lbl);

      const up = document.createElement("button");
      up.className = "btn-icon";
      up.textContent = "▲";
      up.disabled = idx === 0;
      up.addEventListener("click", () => {
        rf.field_order.splice(idx - 1, 0, rf.field_order.splice(idx, 1)[0]);
        scheduleAutoSave(); renderFieldOrderList(); refreshRefPreview(rfSection);
      });

      const dn = document.createElement("button");
      dn.className = "btn-icon";
      dn.textContent = "▼";
      dn.disabled = idx === rf.field_order.length - 1;
      dn.addEventListener("click", () => {
        rf.field_order.splice(idx + 1, 0, rf.field_order.splice(idx, 1)[0]);
        scheduleAutoSave(); renderFieldOrderList(); refreshRefPreview(rfSection);
      });

      row.append(up, dn);
      foList.appendChild(row);
    });
  }
  renderFieldOrderList();
  rfSection.appendChild(foWrap);

  // Live preview
  const previewWrap = document.createElement("div");
  previewWrap.className = "ref-preview-box";
  previewWrap.id = "ref-format-preview";
  rfSection.appendChild(previewWrap);
  refreshRefPreview(rfSection);

  pane.appendChild(rfSection);

  // Export
  const expSection = document.createElement("div");
  expSection.className = "export-section";
  const expTitle = document.createElement("h4");
  expTitle.textContent = L.exportTitle;
  expSection.appendChild(expTitle);

  [
    { label: L.exportJSON, fn: exportToJSON },
    { label: L.exportHTML, fn: exportToHTML },
    { label: L.exportDOCX, fn: exportToDOCX },
  ].forEach(({ label, fn }) => {
    const btn = document.createElement("button");
    btn.className = "btn-export";
    btn.textContent = label;
    btn.addEventListener("click", fn);
    expSection.appendChild(btn);
  });
  pane.appendChild(expSection);

  // Auto-save indicator
  const asi = document.createElement("div");
  asi.className = "autosave-indicator";
  asi.textContent = L.autoSaveOn;
  pane.appendChild(asi);
}

// Refresh the reference format preview using the first reference in the doc
function refreshRefPreview(container) {
  const box = container.querySelector("#ref-format-preview");
  if (!box) return;
  const rf = doc.settings.ref_format;
  const sample = doc.references[0] || {
    authors: ["Smith AB", "Jones CD", "Lee EF", "Brown GH", "White IJ", "Green KL", "Black MN"],
    year: "2024", title: "Sample article title for preview",
    journal: "Example Journal", volume: "17", issue: "2", pages: "100-115",
    doi: "10.1234/example", pmid: "12345678"
  };
  box.innerHTML = "<strong>" + (currentLang === "ja" ? "プレビュー：" : "Preview: ") + "</strong>"
    + formatReference(sample, rf, "html");
}

// ============================================================
// EXPORT — JSON
// ============================================================

function exportToJSON() {
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
  downloadBlob(blob, "article.json");
}

// ============================================================
// EXPORT — HTML
// ============================================================

function exportToHTML() {
  const s = doc.settings;
  const bodyFont  = s.font.body  || "Times New Roman";
  const titleFont = s.font.title || "Times New Roman";

  let html = `<!DOCTYPE html>
<html lang="${currentLang === "ja" ? "ja" : "en"}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escHtml(doc.meta.title || "Article")}</title>
<style>
  body { font-family: "${bodyFont}", "Hiragino Mincho ProN", "Yu Mincho", serif;
         font-size: ${s.font_size.body}pt; max-width: 800px; margin: 40px auto;
         line-height: 1.8; color: #1a1a1a; }
  h1 { font-family: "${titleFont}", serif; font-size: ${s.font_size.title}pt;
       text-align: center; }
  h2 { font-size: ${s.font_size.body + 2}pt; margin-top: 2em; border-bottom: 1px solid #ccc; }
  h3 { font-size: ${s.font_size.body}pt; margin-top: 1.5em; }
  .authors { text-align: center; margin: 0.5em 0; }
  .affiliations { text-align: center; font-size: 0.9em; color: #444; margin: 0.5em 0; }
  .keywords { margin: 1em 0; font-style: italic; }
  p { margin: 0.8em 0; text-indent: 1em; }
  .references { font-size: ${s.font_size.references}pt; }
  sup.cite { font-size: 0.7em; vertical-align: super; color: #0055aa; }
  .ref-list { list-style: none; padding: 0; }
  .ref-list li { margin: 0.4em 0; }
  .footer-note { font-size: 0.75em; color: #666; margin-top: 3em; border-top: 1px solid #ddd; padding-top: 1em; }
</style>
</head>
<body>
`;

  // Title
  html += `<h1>${escHtml(doc.meta.title || "")}</h1>\n`;

  // Authors
  if (doc.meta.authors.length) {
    const authStr = doc.meta.authors.map((a, i) => {
      const supIds = a.affiliation_ids.map(id => `<sup>${id}</sup>`).join("");
      const corr = a.corresponding ? (currentLang === "ja" ? "<sup>*</sup>" : "<sup>*</sup>") : "";
      return escHtml(a.name) + supIds + corr;
    }).join(", ");
    html += `<div class="authors">${authStr}</div>\n`;
  }

  // Affiliations
  if (doc.meta.affiliations.length) {
    const affStr = doc.meta.affiliations.map(a =>
      `<sup>${a.id}</sup> ${escHtml(a.text)}`
    ).join("; ");
    html += `<div class="affiliations">${affStr}</div>\n`;
  }

  // Keywords
  if (doc.meta.keywords.length) {
    html += `<div class="keywords"><strong>${currentLang === "ja" ? "キーワード" : "Keywords"}:</strong> ${escHtml(doc.meta.keywords.join(", "))}</div>\n`;
  }

  // Citation order for numbering
  const citOrder = getCitationOrder();

  // Sections
  doc.content.sections.forEach((sec, si) => {
    const secNum = s.numbering ? `${si+1}. ` : "";
    html += `<h2>${secNum}${escHtml(sec.title)}</h2>\n`;

    sec.subsections.forEach((sub, sbi) => {
      if (sec.show_subsections && sub.title) {
        const subNum = s.numbering ? `${si+1}.${sbi+1} ` : "";
        html += `<h3>${subNum}${escHtml(sub.title)}</h3>\n`;
      }
      sub.paragraphs.forEach(para => {
        let text = escHtml(para.text);
        // Apply simple markdown-like formatting
        text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        text = text.replace(/_(.+?)_/g, "<em>$1</em>");
        text = text.replace(/\^(.+?)\^/g, "<sup>$1</sup>");
        text = text.replace(/~(.+?)~/g, "<sub>$1</sub>");

        // Append citations
        if (para.citations.length) {
          const citeStr = para.citations.map(cid => {
            const num = doc.settings.reference_order === "appearance"
              ? citOrder.indexOf(cid) + 1 || cid
              : cid;
            if (s.citation_format === "superscript") return `<sup class="cite">${num}</sup>`;
            if (s.citation_format === "bracket")     return `<span class="cite">[${num}]</span>`;
            return `<span class="cite">(${num})</span>`;
          }).join("");
          text += citeStr;
        }

        if (text.trim()) html += `<p>${text}</p>\n`;
      });
    });
  });

  // References section
  const orderedRefs = buildOrderedRefs();
  if (orderedRefs.length) {
    html += `<div class="references">\n`;
    html += `<h2>${currentLang === "ja" ? "参考文献" : "References"}</h2>\n`;
    html += `<ol class="ref-list">\n`;
    orderedRefs.forEach((ref, i) => {
      html += `<li>${formatReference(ref, doc.settings.ref_format, "html")}</li>\n`;
    });
    html += `</ol>\n</div>\n`;
  }

  // Footer note
  html += `<div class="footer-note">本テキストはAI（Claude, Anthropic）を用いて作成されました。内容には誤りが含まれる可能性があります。医療上の判断には必ず公式の教科書・文献・専門家の指導を参照してください。二次利用・再配布は自己責任のもとで可能です。その際、本注記の保持を推奨します。</div>`;

  html += `\n</body>\n</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  downloadBlob(blob, "article.html");
}

// ============================================================
// EXPORT — DOCX (via docx.js CDN)
// ============================================================

async function exportToDOCX() {
  if (typeof docx === "undefined") {
    alert("docx.js library not loaded. Check your internet connection.");
    return;
  }

  const {
    Document, Packer, Paragraph, TextRun, HeadingLevel,
    AlignmentType, PageNumber, Footer, NumberFormat,
    UnderlineType, convertInchesToTwip, BorderStyle, SectionType
  } = docx;

  const s = doc.settings;
  const spacing = s.double_spacing ? { after: 240, line: 480, lineRule: "auto" } : { after: 160 };
  const bodyFont = s.font.body || "Times New Roman";
  const titleFont = s.font.title || "Times New Roman";
  const refsFont  = s.font.references || "Times New Roman";
  const bodySize  = (s.font_size.body || 12) * 2;       // half-points
  const titleSize = (s.font_size.title || 16) * 2;
  const refsSize  = (s.font_size.references || 10) * 2;

  const citOrder = getCitationOrder();

  const children = [];

  // ---- Title ----
  children.push(new Paragraph({
    text: doc.meta.title || "",
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
    spacing,
    run: { font: titleFont, size: titleSize, bold: true }
  }));

  // ---- Authors ----
  if (doc.meta.authors.length) {
    const runs = [];
    doc.meta.authors.forEach((a, i) => {
      runs.push(new TextRun({ text: a.name, font: bodyFont, size: bodySize }));
      a.affiliation_ids.forEach(id => {
        runs.push(new TextRun({ text: String(id), superScript: true, font: bodyFont, size: bodySize }));
      });
      if (a.corresponding) {
        runs.push(new TextRun({ text: "*", superScript: true, font: bodyFont, size: bodySize }));
      }
      if (i < doc.meta.authors.length - 1)
        runs.push(new TextRun({ text: ", ", font: bodyFont, size: bodySize }));
    });
    children.push(new Paragraph({ children: runs, alignment: AlignmentType.CENTER, spacing }));
  }

  // ---- Affiliations ----
  doc.meta.affiliations.forEach(aff => {
    if (!aff.text.trim()) return;
    children.push(new Paragraph({
      children: [
        new TextRun({ text: String(aff.id), superScript: true, size: bodySize - 2, font: bodyFont }),
        new TextRun({ text: " " + aff.text, size: bodySize - 2, font: bodyFont }),
      ],
      alignment: AlignmentType.CENTER,
      spacing
    }));
  });

  // ---- Keywords ----
  if (doc.meta.keywords.length) {
    children.push(new Paragraph({
      children: [
        new TextRun({ text: (currentLang === "ja" ? "キーワード: " : "Keywords: "), bold: true, font: bodyFont, size: bodySize }),
        new TextRun({ text: doc.meta.keywords.join(", "), font: bodyFont, size: bodySize }),
      ],
      spacing
    }));
  }

  // ---- Sections ----
  doc.content.sections.forEach((sec, si) => {
    const secNum = s.numbering ? `${si+1}. ` : "";
    children.push(new Paragraph({
      text: secNum + sec.title,
      heading: HeadingLevel.HEADING_1,
      spacing
    }));

    sec.subsections.forEach((sub, sbi) => {
      if (sec.show_subsections && sub.title) {
        const subNum = s.numbering ? `${si+1}.${sbi+1} ` : "";
        children.push(new Paragraph({
          text: subNum + sub.title,
          heading: HeadingLevel.HEADING_2,
          spacing
        }));
      }

      sub.paragraphs.forEach(para => {
        if (!para.text.trim() && !para.citations.length) return;
        const runs = buildDocxRuns(para.text, bodyFont, bodySize);

        // Append citation runs
        if (para.citations.length) {
          para.citations.forEach(cid => {
            const num = doc.settings.reference_order === "appearance"
              ? (citOrder.indexOf(cid) + 1 || cid)
              : cid;
            if (s.citation_format === "superscript") {
              runs.push(new TextRun({ text: String(num), superScript: true, font: bodyFont, size: bodySize }));
            } else if (s.citation_format === "bracket") {
              runs.push(new TextRun({ text: `[${num}]`, font: bodyFont, size: bodySize }));
            } else {
              runs.push(new TextRun({ text: `(${num})`, font: bodyFont, size: bodySize }));
            }
          });
        }

        children.push(new Paragraph({ children: runs, spacing }));
      });
    });
  });

  // ---- References ----
  const orderedRefs = buildOrderedRefs();
  if (orderedRefs.length) {
    children.push(new Paragraph({
      text: currentLang === "ja" ? "参考文献" : "References",
      heading: HeadingLevel.HEADING_1,
      spacing
    }));
    orderedRefs.forEach((ref, i) => {
      const rfmt = s.ref_format || {};
      const runsData = formatReference(ref, rfmt, "runs");
      const textRuns = [
        new TextRun({ text: `${i+1}. `, bold: true, font: refsFont, size: refsSize })
      ].concat(runsData.map(r =>
        new TextRun({ text: r.text, italics: r.italic, font: refsFont, size: refsSize })
      ));
      children.push(new Paragraph({
        children: textRuns,
        spacing: { after: 80 }
      }));
    });
  }

  // ---- Footer note ----
  children.push(new Paragraph({
    children: [new TextRun({
      text: "本テキストはAI（Claude, Anthropic）を用いて作成されました。内容には誤りが含まれる可能性があります。医療上の判断には必ず公式の教科書・文献・専門家の指導を参照してください。二次利用・再配布は自己責任のもとで可能です。",
      size: 16, color: "888888", font: bodyFont
    })],
    spacing: { before: 400 }
  }));

  // ---- Build document ----
  const document2 = new Document({
    sections: [{
      properties: {},
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ children: [PageNumber.CURRENT] })]
          })]
        })
      },
      children
    }]
  });

  const blob = await Packer.toBlob(document2);
  downloadBlob(blob, "article.docx");
}

// Parse simple markdown tokens into docx TextRun array
function buildDocxRuns(text, font, size) {
  const runs = [];
  // Simple state machine for **bold**, _italic_, ^sup^, ~sub~
  let i = 0;
  let buf = "";
  let bold = false, italic = false, sup = false, sub2 = false;

  const flush = () => {
    if (buf) {
      runs.push(new docx.TextRun({ text: buf, bold, italics: italic, superScript: sup, subScript: sub2, font, size }));
      buf = "";
    }
  };

  while (i < text.length) {
    if (text[i] === "*" && text[i+1] === "*") {
      flush(); bold = !bold; i += 2;
    } else if (text[i] === "_") {
      flush(); italic = !italic; i++;
    } else if (text[i] === "^") {
      flush(); sup = !sup; i++;
    } else if (text[i] === "~") {
      flush(); sub2 = !sub2; i++;
    } else {
      buf += text[i++];
    }
  }
  flush();
  return runs;
}

// Build reference list in display order
function buildOrderedRefs() {
  if (doc.settings.reference_order === "appearance") {
    const order = getCitationOrder();
    const map = new Map(doc.references.map(r => [r.id, r]));
    const ordered = order.map(id => map.get(id)).filter(Boolean);
    // Append uncited refs
    doc.references.forEach(r => {
      if (!order.includes(r.id)) ordered.push(r);
    });
    return ordered;
  }
  return [...doc.references].sort((a, b) => a.id - b.id);
}

// ============================================================
// UTILITY HELPERS
// ============================================================

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function escHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function labeledField(labelText, inputEl, hint) {
  const wrap = document.createElement("div");
  wrap.className = "field-group";
  const lbl = document.createElement("label");
  lbl.className = "field-label";
  lbl.textContent = labelText;
  wrap.appendChild(lbl);
  wrap.appendChild(inputEl);
  if (hint) {
    const h = document.createElement("div");
    h.className = "field-hint";
    h.textContent = hint;
    wrap.appendChild(h);
  }
  return wrap;
}

function textInput(value, placeholder, onChange) {
  const inp = document.createElement("input");
  inp.type = "text";
  inp.className = "form-input";
  inp.value = value || "";
  inp.placeholder = placeholder || "";
  inp.addEventListener("input", e => onChange(e.target.value));
  return inp;
}

function radioGroup(labelText, options, currentValue, onChange) {
  const wrap = document.createElement("div");
  wrap.className = "radio-group";
  const lbl = document.createElement("div");
  lbl.className = "field-label";
  lbl.textContent = labelText;
  wrap.appendChild(lbl);
  const radios = document.createElement("div");
  radios.className = "radio-row";
  options.forEach(opt => {
    const rl = document.createElement("label");
    rl.className = "radio-label";
    const rb = document.createElement("input");
    rb.type = "radio";
    rb.name = "rg_" + labelText.replace(/\s/g, "");
    rb.value = opt.value;
    rb.checked = opt.value === currentValue;
    rb.addEventListener("change", () => onChange(opt.value));
    rl.appendChild(rb);
    rl.appendChild(document.createTextNode(" " + opt.label));
    radios.appendChild(rl);
  });
  wrap.appendChild(radios);
  return wrap;
}

// ============================================================
// STRUCTURE SWITCH (IMRaD ↔ Free)
// ============================================================

function setStructure(type) {
  pushUndo();
  doc.meta.structure = type;
  if (type === "IMRaD") {
    // Prepend standard sections if not present
    const existingIds = doc.content.sections.map(s => s.id);
    IMRAD_SECTIONS.forEach(s => {
      if (!existingIds.includes(s.id)) {
        doc.content.sections.unshift(createSection(
          s.id, currentLang === "ja" ? s.title_ja : s.title_en
        ));
      }
    });
  }
  scheduleAutoSave();
  renderAll();
}

// ============================================================
// INIT
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

  // Load language files — EN.js exports LANG_EN, JN.js exports LANG_JA
  // (Already loaded via <script> tags in index.html)
  L = (currentLang === "ja") ? LANG_JA : LANG_EN;

  // Load or create document
  if (!loadFromLocalStorage()) {
    doc = createBlankDocument(currentLang);
  }

  // ---- Wire header buttons ----
  document.getElementById("btn-lang").addEventListener("click", () => {
    currentLang = currentLang === "en" ? "ja" : "en";
    localStorage.setItem("articlemaker_lang", currentLang);
    L = currentLang === "ja" ? LANG_JA : LANG_EN;
    renderAll();
  });

  document.getElementById("btn-new").addEventListener("click", () => {
    if (!confirm(L.confirmNewDoc)) return;
    pushUndo();
    doc = createBlankDocument(currentLang);
    renderAll();
    saveToLocalStorage();
  });

  document.getElementById("btn-load").addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.addEventListener("change", e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const parsed = JSON.parse(ev.target.result);
          if (!validateDoc(parsed)) throw new Error("Invalid schema");
          pushUndo();
          doc = parsed;
          renderAll();
          saveToLocalStorage();
        } catch(err) {
          alert("Load error: " + err.message);
        }
      };
      reader.readAsText(file, "UTF-8");
    });
    input.click();
  });

  document.getElementById("btn-save").addEventListener("click", exportToJSON);
  document.getElementById("btn-undo").addEventListener("click", undo);
  document.getElementById("btn-redo").addEventListener("click", redo);

  // ---- Structure switch ----
  document.getElementById("struct-imrad").addEventListener("click", () => setStructure("IMRaD"));
  document.getElementById("struct-free").addEventListener("click",  () => setStructure("free"));
  document.getElementById("btn-add-section").addEventListener("click", () => {
    pushUndo();
    doc.content.sections.push(createSection(generateId(), ""));
    scheduleAutoSave();
    renderAll();
  });

  // ---- Right panel tabs ----
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderTabContent(btn.dataset.tab);
    });
  });

  // ---- Citation dialog ----
  document.getElementById("cite-search").addEventListener("input", e => {
    renderCiteDialogRefs(e.target.value);
  });
  document.getElementById("cite-dlg-cancel").addEventListener("click", closeCiteDialog);
  document.getElementById("cite-dialog-overlay").addEventListener("click", closeCiteDialog);

  // ---- Scroll spy ----
  const editorEl = document.getElementById("editor-sections");
  editorEl.addEventListener("scroll", () => {
    const secs = document.querySelectorAll(".section-block");
    let topId = null;
    secs.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.4) topId = el.id.replace("section-", "");
    });
    if (topId && topId !== activeSectionId) setActiveSection(topId);
  }, { passive: true });

  // ---- Keyboard shortcuts ----
  document.addEventListener("keydown", e => {
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
    if (ctrl && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
    if (ctrl && e.key === "s") { e.preventDefault(); saveToLocalStorage(); exportToJSON(); }
    if (e.key === "Escape") closeCiteDialog();
  });

  // Initial render
  renderAll();
});
