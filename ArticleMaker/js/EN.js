// EN.js — All English UI strings
// Keys must match JN.js exactly.

const LANG_EN = {
  lang: "en",
  appName: "ArticleMaker",
  appSubtitle: "Academic Writing System",
  langToggle: "日本語",

  // Toolbar
  btnNew: "New",
  btnLoad: "Load JSON",
  btnSave: "Save JSON",
  btnUndo: "Undo",
  btnRedo: "Redo",

  // Left panel
  outlineTitle: "Outline",
  addSection: "+ Add Section",
  structLabel: "Structure:",
  structIMRaD: "IMRaD",
  structFree: "Free",
  dragHint: "Drag to reorder",

  // Center editor
  sectionTitlePlaceholder: "Section title",
  subsectionTitlePlaceholder: "Subsection title",
  addSubsection: "+ Add Subsection",
  addParagraph: "+ Add Paragraph",
  toggleSubsections: "Subsections",
  deleteSection: "Delete Section",
  moveUp: "▲",
  moveDown: "▼",
  paragraphPlaceholders: {
    abstract: "Provide a concise summary of the study...",
    introduction: "Describe background and rationale...",
    methods: "Describe study design, participants, and procedures...",
    results: "Present key findings...",
    discussion: "Interpret findings in context of prior work...",
    conclusion: "Summarize main conclusions...",
    acknowledgments: "Acknowledge funding sources, contributors...",
    references: "",
    default: "Write paragraph here..."
  },
  insertCitation: "Cite",
  boldBtn: "B",
  italicBtn: "I",
  subBtn: "sub",
  supBtn: "sup",

  // Right panel tabs
  tabMeta: "Metadata",
  tabRefs: "References",
  tabSettings: "Settings",

  // Metadata
  metaTitleLabel: "Article Title",
  metaTitlePH: "Enter article title",
  metaKeywordsLabel: "Keywords",
  metaKeywordsPH: "keyword1, keyword2, ...",
  metaKeywordsHint: "Separate with commas",
  metaTypeLabel: "Article Type",
  metaTypes: [
    { value: "original", label: "Original Article" },
    { value: "review", label: "Review Article" },
    { value: "case", label: "Case Report" },
    { value: "letter", label: "Letter" },
    { value: "other", label: "Other" }
  ],
  authorsLabel: "Authors",
  addAuthor: "+ Add Author",
  authorNamePH: "Full name",
  authorOrcidPH: "ORCID (optional)",
  authorEmailPH: "email@example.com",
  authorCorresponding: "Corresponding author",
  removeAuthor: "✕",
  affiliationsLabel: "Affiliations",
  addAffiliation: "+ Add Affiliation",
  affiliationPH: "Institution name, city, country",
  removeAffiliation: "✕",
  affiliationLink: "Affil. #",

  // References
  refsTitle: "References",
  addRef: "+ Add Reference",
  importCSV: "Import CSV",
  searchRefsPH: "Search references...",
  refOrderLabel: "Order:",
  refOrderAppearance: "By appearance",
  refOrderManual: "Manual",
  noRefs: "No references. Add manually or import CSV.",
  csvHelp: "CSV columns: authors (semicolon-separated), year, title, journal, volume, issue, pages, doi, pmid",
  duplicateWarning: "⚠ Possible duplicate",
  refAuthorsPH: "Author1; Author2; ...",
  refYearPH: "Year",
  refTitlePH: "Article title",
  refJournalPH: "Journal name",
  refVolPH: "Vol",
  refIssuePH: "Issue",
  refPagesPH: "Pages",
  refDOIPH: "DOI",
  refPMIDPH: "PMID",
  deleteRef: "✕",
  insertRef: "Insert",

  // Settings / Export
  settingsTitle: "Settings",
  citeFormatLabel: "Citation format:",
  citeSuperscript: "Superscript ¹",
  citeBracket: "Bracket [1]",
  citeParen: "Paren (1)",
  refStyleLabel: "Reference style:",
  refStyleVancouver: "Vancouver",
  numberingLabel: "Section numbering:",
  numberingOn: "On",
  numberingOff: "Off",
  doubleSpaceLabel: "Double spacing (DOCX):",
  fontTitleLabel: "Title font:",
  fontBodyLabel: "Body font:",
  fontRefsLabel: "Refs font:",
  exportTitle: "Export",
  exportJSON: "Export JSON",
  exportHTML: "Export HTML",
  exportDOCX: "Export DOCX",
  autoSaveOn: "Auto-save: ON",

  // Citation dialog
  citeDlgTitle: "Insert Citation",
  citeDlgSearch: "Search references...",
  citeDlgInsert: "Insert",
  citeDlgCancel: "Cancel",
  citeDlgNone: "No references found.",

  // Confirm messages
  confirmNewDoc: "Start a new document? Unsaved changes will be lost.",
  confirmDeleteSection: "Delete this section?",
  confirmDeleteRef: "Delete this reference? Citations will be removed.",
  confirmDeleteAuthor: "Remove this author?",
};
