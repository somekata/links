// JN.js — すべての日本語UIテキスト
// キーはEN.jsと完全に一致させること。

const LANG_JA = {
  lang: "ja",
  appName: "ArticleMaker",
  appSubtitle: "学術論文作成支援システム",
  langToggle: "English",

  // ツールバー
  btnNew: "新規",
  btnLoad: "JSON読込",
  btnSave: "JSON保存",
  btnUndo: "元に戻す",
  btnRedo: "やり直し",

  // 左パネル
  outlineTitle: "アウトライン",
  addSection: "＋ セクション追加",
  structLabel: "構成：",
  structIMRaD: "IMRaD",
  structFree: "自由構成",
  dragHint: "ドラッグで並替",

  // 中央エディタ
  sectionTitlePlaceholder: "セクションタイトル",
  subsectionTitlePlaceholder: "小見出しタイトル",
  addSubsection: "＋ 小見出し追加",
  addParagraph: "＋ 段落追加",
  toggleSubsections: "小見出し",
  deleteSection: "セクション削除",
  moveUp: "▲",
  moveDown: "▼",
  paragraphPlaceholders: {
    abstract: "研究の概要を簡潔に記述してください…",
    introduction: "背景と研究目的を記述してください…",
    methods: "研究デザイン・対象・手順を記述してください…",
    results: "主な結果を記述してください…",
    discussion: "先行研究との比較・解釈を記述してください…",
    conclusion: "主な結論を記述してください…",
    acknowledgments: "資金源・貢献者への謝辞を記述してください…",
    references: "",
    default: "本文を入力してください…"
  },
  insertCitation: "引用",
  boldBtn: "B",
  italicBtn: "I",
  subBtn: "下付",
  supBtn: "上付",

  // 右パネルタブ
  tabMeta: "メタデータ",
  tabRefs: "参考文献",
  tabSettings: "設定",

  // メタデータ
  metaTitleLabel: "論文タイトル",
  metaTitlePH: "タイトルを入力",
  metaKeywordsLabel: "キーワード",
  metaKeywordsPH: "キーワード1、キーワード2、…",
  metaKeywordsHint: "コンマまたは読点で区切ってください",
  metaTypeLabel: "論文種別",
  metaTypes: [
    { value: "original", label: "原著論文" },
    { value: "review",   label: "総説" },
    { value: "case",     label: "症例報告" },
    { value: "letter",   label: "レター" },
    { value: "other",    label: "その他" }
  ],
  authorsLabel: "著者",
  addAuthor: "＋ 著者追加",
  authorNamePH: "氏名（フルネーム）",
  authorOrcidPH: "ORCID（任意）",
  authorEmailPH: "email@example.com",
  authorCorresponding: "責任著者",
  removeAuthor: "✕",
  affiliationsLabel: "所属機関",
  addAffiliation: "＋ 所属追加",
  affiliationPH: "機関名、都市、国",
  removeAffiliation: "✕",
  affiliationLink: "所属 #",

  // 参考文献
  refsTitle: "参考文献",
  addRef: "＋ 文献追加",
  importCSV: "CSV読込",
  searchRefsPH: "文献を検索…",
  refOrderLabel: "順序：",
  refOrderAppearance: "出現順",
  refOrderManual: "手動",
  noRefs: "文献がありません。手動追加またはCSVから読込んでください。",
  csvHelp: "CSV列：著者（セミコロン区切り）、年、タイトル、雑誌名、巻、号、ページ、DOI、PMID",
  duplicateWarning: "⚠ 重複の可能性",
  refAuthorsPH: "著者1; 著者2; …",
  refYearPH: "年",
  refTitlePH: "論文タイトル",
  refJournalPH: "雑誌名",
  refVolPH: "巻",
  refIssuePH: "号",
  refPagesPH: "ページ",
  refDOIPH: "DOI",
  refPMIDPH: "PMID",
  deleteRef: "✕",
  insertRef: "挿入",

  // 設定・出力
  settingsTitle: "設定",
  citeFormatLabel: "引用形式：",
  citeSuperscript: "上付き文字 ¹",
  citeBracket: "角括弧 [1]",
  citeParen: "丸括弧 (1)",
  refStyleLabel: "文献スタイル：",
  refStyleVancouver: "バンクーバー方式",
  numberingLabel: "章番号：",
  numberingOn: "あり",
  numberingOff: "なし",
  doubleSpaceLabel: "ダブルスペース（DOCX）：",
  fontTitleLabel: "タイトルフォント：",
  fontBodyLabel: "本文フォント：",
  fontRefsLabel: "文献フォント：",
  exportTitle: "エクスポート",
  exportJSON: "JSONで保存",
  exportHTML: "HTMLで保存",
  exportDOCX: "DOCXで保存",
  autoSaveOn: "自動保存：ON",

  // 引用ダイアログ
  citeDlgTitle: "引用文献の挿入",
  citeDlgSearch: "文献を検索…",
  citeDlgInsert: "挿入",
  citeDlgCancel: "キャンセル",
  citeDlgNone: "該当する文献がありません。",

  // 確認メッセージ
  confirmNewDoc: "新規ドキュメントを作成しますか？未保存の変更は失われます。",
  confirmDeleteSection: "このセクションを削除しますか？",
  confirmDeleteRef: "この文献を削除しますか？関連する引用も削除されます。",
  confirmDeleteAuthor: "この著者を削除しますか？",
};
