// schema.js — Canonical data schema and factory functions
// This is the SINGLE SOURCE OF TRUTH for data structure.
// All UI, export, and logic must read/write this shape only.

const SCHEMA_VERSION = "1.0";

// IMRaD default section templates
const IMRAD_SECTIONS = [
  { id: "abstract",      title_en: "Abstract",         title_ja: "抄録" },
  { id: "introduction",  title_en: "Introduction",      title_ja: "はじめに" },
  { id: "methods",       title_en: "Methods",           title_ja: "方法" },
  { id: "results",       title_en: "Results",           title_ja: "結果" },
  { id: "discussion",    title_en: "Discussion",        title_ja: "考察" },
  { id: "conclusion",    title_en: "Conclusion",        title_ja: "結論" },
  { id: "acknowledgments", title_en: "Acknowledgments", title_ja: "謝辞" },
  { id: "references",    title_en: "References",        title_ja: "文献" },
];

// Create a blank document conforming to the strict schema
function createBlankDocument(lang = "en") {
  const isJa = lang === "ja";
  return {
    version: SCHEMA_VERSION,
    meta: {
      title: "",
      authors: [createAuthor()],
      affiliations: [createAffiliation(1)],
      keywords: [],
      type: "original",
      structure: "IMRaD"
    },
    content: {
      sections: IMRAD_SECTIONS.map(s => createSection(
        s.id,
        isJa ? s.title_ja : s.title_en
      ))
    },
    references: [],
    settings: {
      citation_format: "superscript",  // "superscript" | "bracket" | "paren"
      reference_style: "vancouver",
      reference_order: "appearance",   // "appearance" | "manual"
      numbering: false,
      double_spacing: false,
      font: {
        title: "Times New Roman",
        body: "Times New Roman",
        references: "Times New Roman"
      },
      font_size: {
        title: 16,
        body: 12,
        references: 10
      },
      ref_format: {
        author_max: 6,
        etal_from: 7,
        journal_italic: false,
        show_title: true,
        vol_style: "17(2):21",
        show_doi: true,
        show_pmid: false,
        field_order: ["authors","year","title","journal","locator","doi","pmid"]
      }
    }
  };
}

// Factory: blank author
function createAuthor() {
  return {
    name: "",
    orcid: "",
    affiliation_ids: [1],
    corresponding: false,
    email: ""
  };
}

// Factory: blank affiliation
function createAffiliation(id) {
  return { id, text: "" };
}

// Factory: blank section
function createSection(id, title) {
  return {
    id: id || generateId(),
    title: title || "",
    show_subsections: false,
    subsections: [createSubsection()]
  };
}

// Factory: blank subsection
function createSubsection() {
  return {
    title: "",
    paragraphs: [createParagraph()]
  };
}

// Factory: blank paragraph
function createParagraph() {
  return {
    text: "",
    citations: []   // array of reference IDs (integers)
  };
}

// Factory: blank reference
function createReference(id) {
  return {
    id: id,
    authors: [],    // array of strings
    title: "",
    journal: "",
    year: "",
    volume: "",
    issue: "",
    pages: "",
    doi: "",
    pmid: ""
  };
}

// Generate a unique section ID (not for references)
function generateId() {
  return "sec_" + Math.random().toString(36).slice(2, 9);
}

// Validate that a doc object has the required top-level keys
function validateDoc(doc) {
  return (
    doc &&
    typeof doc === "object" &&
    doc.version &&
    doc.meta &&
    doc.content &&
    Array.isArray(doc.content.sections) &&
    Array.isArray(doc.references) &&
    doc.settings
  );
}

// Deep clone utility (no structuredClone for older browser compat)
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ============================================================
// REFERENCE FORMATTING — HTML-aware, settings-driven
// ============================================================

// Returns a settings object with defaults filled in.
// Accepts either doc.settings.ref_format or a partial override.
function resolveRefFormat(fmt) {
  const def = {
    author_max: 6,
    etal_from: 7,
    journal_italic: false,
    show_title: true,
    vol_style: "17(2):21",
    show_doi: true,
    show_pmid: false,
    field_order: ["authors","year","title","journal","locator","doi","pmid"]
  };
  return Object.assign({}, def, fmt || {});
}

// Build the locator string (volume/issue/pages) for a ref.
function buildLocator(ref, vol_style) {
  const vol   = ref.volume || "";
  const issue = ref.issue  || "";
  const pages = ref.pages  || "";
  if (!vol && !issue && !pages) return "";

  if (vol_style === "17: 21") {
    // "17: 21-28" (no issue)
    return [vol, pages ? ": " + pages : ""].join("").trim();
  }
  if (vol_style === "Vol.17 No.2 p.21") {
    const parts = [];
    if (vol)   parts.push("Vol." + vol);
    if (issue) parts.push("No."  + issue);
    if (pages) parts.push("p."   + pages);
    return parts.join(" ");
  }
  // Default: "17(2):21-28"
  const issuePart = issue ? "(" + issue + ")" : "";
  const pagesPart = pages ? ":" + pages       : "";
  return vol + issuePart + pagesPart;
}

// Format a reference.
// mode: "text"  — plain text (used for DOCX body, JSON preview card)
//       "html"  — HTML string with <em> for italic journal (used for HTML export & UI preview)
//       "runs"  — returns array of {text, italic, bold} segments (used for DOCX runs)
function formatReference(ref, fmtArg, mode) {
  mode = mode || "text";
  const fmt = resolveRefFormat(fmtArg);

  // --- Authors ---
  const authors = Array.isArray(ref.authors) ? ref.authors : [];
  let authorStr = "";
  if (authors.length > 0) {
    const max = fmt.author_max === 0 ? authors.length : fmt.author_max;
    if (authors.length > fmt.etal_from - 1 && fmt.author_max !== 0) {
      authorStr = authors.slice(0, max).join(", ") + ", et al.";
    } else {
      authorStr = authors.join(", ");
    }
  }

  // --- Build field segments ---
  const segments = {}; // key -> { text, italic }
  segments.authors  = authorStr ? { text: authorStr + ".", italic: false } : null;
  segments.year     = ref.year  ? { text: ref.year + ".",  italic: false } : null;
  segments.title    = (fmt.show_title && ref.title)
                        ? { text: ref.title + ".", italic: false } : null;
  segments.journal  = ref.journal
                        ? { text: ref.journal + ".", italic: fmt.journal_italic } : null;
  segments.locator  = (() => {
    const loc = buildLocator(ref, fmt.vol_style);
    return loc ? { text: loc + ".", italic: false } : null;
  })();
  segments.doi      = (fmt.show_doi && ref.doi)
                        ? { text: "doi:" + ref.doi, italic: false } : null;
  segments.pmid     = (fmt.show_pmid && ref.pmid)
                        ? { text: "PMID:" + ref.pmid, italic: false } : null;

  const order = fmt.field_order || ["authors","year","title","journal","locator","doi","pmid"];

  if (mode === "runs") {
    // Return array of run objects for DOCX
    const runs = [];
    order.forEach((key, i) => {
      const seg = segments[key];
      if (!seg) return;
      runs.push({ text: (i > 0 ? " " : "") + seg.text, italic: seg.italic });
    });
    return runs;
  }

  if (mode === "html") {
    const parts = [];
    order.forEach(key => {
      const seg = segments[key];
      if (!seg) return;
      const escaped = seg.text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      parts.push(seg.italic ? "<em>" + escaped + "</em>" : escaped);
    });
    return parts.join(" ").replace(/\s{2,}/g, " ").trim();
  }

  // Plain text (default)
  const parts = [];
  order.forEach(key => {
    const seg = segments[key];
    if (seg) parts.push(seg.text);
  });
  return parts.join(" ").replace(/\s{2,}/g, " ").trim();
}

// Renumber references by order of appearance in all paragraphs
// Returns a mapping { oldId -> newId } and updates doc in place
function renumberReferencesByAppearance(doc) {
  const ordered = [];
  const seen = new Set();

  for (const section of doc.content.sections) {
    for (const sub of section.subsections) {
      for (const para of sub.paragraphs) {
        for (const cid of para.citations) {
          if (!seen.has(cid)) {
            seen.add(cid);
            ordered.push(cid);
          }
        }
      }
    }
  }

  // Build mapping: oldId -> newId (position+1)
  const mapping = {};
  ordered.forEach((oldId, idx) => { mapping[oldId] = idx + 1; });

  // Any references not cited get appended at end
  let nextId = ordered.length + 1;
  doc.references.forEach(ref => {
    if (!mapping[ref.id]) {
      mapping[ref.id] = nextId++;
    }
  });

  // Apply mapping to references array (re-sort)
  doc.references = doc.references.map(ref => ({
    ...ref,
    id: mapping[ref.id] ?? ref.id
  })).sort((a, b) => a.id - b.id);

  // Apply mapping to all citations
  for (const section of doc.content.sections) {
    for (const sub of section.subsections) {
      for (const para of sub.paragraphs) {
        para.citations = para.citations.map(cid => mapping[cid] ?? cid);
      }
    }
  }

  return mapping;
}

// Get the next available reference ID
function nextRefId(doc) {
  if (!doc.references.length) return 1;
  return Math.max(...doc.references.map(r => r.id)) + 1;
}

// Remove a reference and clean up citations
function deleteReference(doc, refId) {
  doc.references = doc.references.filter(r => r.id !== refId);
  for (const section of doc.content.sections) {
    for (const sub of section.subsections) {
      for (const para of sub.paragraphs) {
        para.citations = para.citations.filter(c => c !== refId);
      }
    }
  }
}
