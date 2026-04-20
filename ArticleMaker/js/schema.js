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

// Format a reference as Vancouver plain text (no HTML)
// Output is pure text — used for export and display
function formatReference(ref) {
  const authors = Array.isArray(ref.authors) ? ref.authors : [];
  let authorStr = "";
  if (authors.length > 0) {
    if (authors.length <= 6) {
      authorStr = authors.join(", ");
    } else {
      authorStr = authors.slice(0, 6).join(", ") + ", et al";
    }
  }
  const year  = ref.year   ? ref.year + "."       : "";
  const title = ref.title  ? ref.title + "."       : "";
  const jour  = ref.journal ? ref.journal + "."    : "";
  const vol   = ref.volume  ? ref.volume            : "";
  const issue = ref.issue   ? "(" + ref.issue + ")" : "";
  const pages = ref.pages   ? ":" + ref.pages + "." : "";
  const doi   = ref.doi     ? " doi:" + ref.doi     : "";
  const pmid  = ref.pmid    ? " PMID:" + ref.pmid   : "";
  return [authorStr, year, title, jour, vol + issue + pages, doi, pmid]
    .filter(Boolean).join(" ").replace(/\s{2,}/g, " ").trim();
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
