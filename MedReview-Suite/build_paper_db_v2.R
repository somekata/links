# ============================================================
#  build_paper_db_v2.R
#  v2変更点:
#    - セクション帰属を「ページ単位fill down」→「行単位スキャン」に変更
#    - ヘッダー/フッター行の除去（短すぎる行・URLのみの行）
#    - ノイズワードフィルタを追加
#    - セクション帰属のデバッグ出力を追加
# ============================================================

library(pdftools)
library(tidytext)
library(tidyverse)
library(jsonlite)
library(stringr)

# ============================================================
#  0. 設定
# ============================================================

PDF_DIR       <- "pdfs"
OUT_DIR       <- "output"
STUDY_TYPE    <- "cohort"      # ← 今回のPDF群は観察研究なので変更推奨
MIN_WORD_FREQ <- 2             # 7件なので2に下げる
DATA_JSON     <- "data.json"

# ヘッダー/フッター除去: この文字数以下の行は見出し候補にしない
MIN_LINE_CHARS <- 20

# ノイズワード（セクション帰属改善後も残るメタデータ語）
NOISE_WORDS <- c(
  "gmail","yahoo","copyright","creative","commons","license","attribution",
  "distributed","reproduction","permits","access","terms","org","https",
  "doi","mdpi","crossref","correspondence","editor","article","open",
  "clin","infect","dis","med","crit","sm","al","pp","fig","table",
  "pubmed","central","springer","elsevier","wiley","volume","issue","pages"
)

# ============================================================
#  1. data.json 読み込み
# ============================================================

if (!file.exists(DATA_JSON)) stop("data.json が見つかりません")
base_db         <- fromJSON(DATA_JSON, simplifyVector = FALSE)
section_patterns <- base_db$section_patterns

# ============================================================
#  2. PDF読み込み → 行単位に分解
# ============================================================

dir.create(OUT_DIR, showWarnings = FALSE)

pdf_files <- list.files(PDF_DIR, pattern = "\\.pdf$", full.names = TRUE)
if (!length(pdf_files)) stop(sprintf("'%s' にPDFが見つかりません", PDF_DIR))
message(sprintf("✓ %d 件のPDFを検出", length(pdf_files)))

# ページテキスト → 行テキストに展開
raw_lines <- map_dfr(pdf_files, function(path) {
  fname <- basename(path)
  message(sprintf("  読み込み中: %s", fname))
  tryCatch({
    pages <- pdf_text(path)
    map_dfr(seq_along(pages), function(pg) {
      lines <- str_split(pages[pg], "\n")[[1]]
      tibble(
        file     = fname,
        page     = pg,
        line_num = seq_along(lines),
        line     = lines
      )
    })
  }, error = function(e) {
    warning(sprintf("  ✗ エラー: %s — %s", fname, e$message))
    NULL
  })
})

message(sprintf("✓ 合計 %d 行を抽出", nrow(raw_lines)))

# ============================================================
#  3. 行単位セクション帰属
#     各行を上から順にスキャンし、セクション見出しにマッチしたら
#     それ以降の行のセクションを更新する
# ============================================================

# 見出し判定関数: 行がセクション見出しかどうかを返す
detect_section_from_line <- function(line_text) {
  trimmed <- str_trim(line_text)
  if (nchar(trimmed) < 2)                    return(NA_character_)
  if (str_detect(trimmed, "^https?://"))     return(NA_character_)
  if (str_detect(trimmed, "^\\d+\\.?\\s*$")) return(NA_character_)  # 数字のみ

  lower <- str_to_lower(trimmed)

  for (sec_name in names(section_patterns)) {
    pats <- section_patterns[[sec_name]]
    for (pat in pats) {
      # 見出し行の条件（いずれか1つにマッチすればOK）:
      #   (a) 完全一致                    "Methods"
      #   (b) 番号付き見出し              "2. Methods" / "2 Methods"
      #   (c) 大文字完全一致              "METHODS"
      #   (d) 末尾コロン付き              "Methods:"
      #   (e) 行頭一致かつ短い行（60文字以下）— 上記で拾えない複合形用
      full_match    <- sprintf("^%s[:\\s]*$", pat)
      numbered      <- sprintf("^\\d+[\\. ]\\s*%s[:\\s]*$", pat)
      short_heading <- nchar(trimmed) <= 60 && str_detect(lower, sprintf("^%s", pat))

      if (str_detect(lower, full_match) ||
          str_detect(lower, numbered)   ||
          short_heading) {
        return(sec_name)
      }
    }
  }
  return(NA_character_)
}

# 各ファイルごとに行順にスキャンしてセクションを割り当て
assign_sections <- function(df) {
  current_section <- NA_character_
  sections <- character(nrow(df))

  for (i in seq_len(nrow(df))) {
    detected <- detect_section_from_line(df$line[i])
    if (!is.na(detected)) current_section <- detected
    sections[i] <- current_section
  }
  df$section <- sections
  df
}

message("セクション帰属を実行中...")
corpus_lines <- raw_lines %>%
  group_by(file) %>%
  group_modify(~ assign_sections(.x)) %>%
  ungroup() %>%
  mutate(section = replace_na(section, "Preamble"))

# ============================================================
#  4. デバッグ: セクション帰属の確認（各ファイルの最初の帰属行）
# ============================================================

cat("\n===== セクション帰属チェック（各ファイル×セクションの最初の行）=====\n")
corpus_lines %>%
  filter(section != "Preamble", str_trim(line) != "") %>%
  group_by(file, section) %>%
  slice(1) %>%
  ungroup() %>%
  arrange(file, page, line_num) %>%
  mutate(preview = str_trunc(str_trim(line), 80)) %>%
  select(file, page, section, preview) %>%
  print(n = 100)

# ============================================================
#  5. Preamble除去・短行除去・本文テキストの結合
# ============================================================

corpus_clean <- corpus_lines %>%
  filter(
    section != "Preamble",
    nchar(str_trim(line)) >= MIN_LINE_CHARS,          # 短すぎる行を除去
    !str_detect(line, "^\\s*https?://"),              # URLのみの行を除去
    !str_detect(line, "^\\s*\\d+\\s*$"),              # ページ番号のみを除去
    !str_detect(line, "©|Creative Commons|CC BY")     # 著作権表記を除去
  )

# ============================================================
#  6. キーワード抽出（セクション × TF-IDF）
# ============================================================

data(stop_words)

tokens_uni <- corpus_clean %>%
  rename(text = line) %>%
  unnest_tokens(word, text) %>%
  anti_join(stop_words, by = "word") %>%
  filter(
    str_detect(word, "^[a-z][a-z\\-]{2,}$"),
    !str_detect(word, "^\\d+$"),
    !word %in% NOISE_WORDS
  )

# セクション × ファイル別 TF-IDF
tfidf_by_section <- tokens_uni %>%
  count(section, word, name = "n") %>%
  bind_tf_idf(word, section, n) %>%
  arrange(section, desc(tf_idf))

# 論文単位の出現率
word_doc_freq <- tokens_uni %>%
  distinct(file, word) %>%
  count(word, name = "doc_freq") %>%
  mutate(
    doc_total = n_distinct(corpus_clean$file),
    doc_rate  = round(doc_freq / doc_total, 2)
  )

section_keywords <- tfidf_by_section %>%
  left_join(word_doc_freq, by = "word") %>%
  filter(doc_freq >= MIN_WORD_FREQ) %>%
  group_by(section) %>%
  slice_max(tf_idf, n = 30) %>%
  ungroup()

# ============================================================
#  7. バイグラム抽出
# ============================================================

bigrams <- corpus_clean %>%
  rename(text = line) %>%
  unnest_tokens(bigram, text, token = "ngrams", n = 2) %>%
  separate(bigram, into = c("w1","w2"), sep = " ") %>%
  filter(
    !w1 %in% stop_words$word, !w2 %in% stop_words$word,
    !w1 %in% NOISE_WORDS,     !w2 %in% NOISE_WORDS,
    str_detect(w1, "^[a-z]{2,}$"),
    str_detect(w2, "^[a-z]{2,}$")
  ) %>%
  unite(bigram, w1, w2, sep = " ") %>%
  count(section, bigram, name = "n") %>%
  filter(n >= MIN_WORD_FREQ) %>%
  group_by(section) %>%
  slice_max(n, n = 20) %>%
  ungroup()

# ============================================================
#  8. セクション検出率
# ============================================================

section_presence <- corpus_lines %>%
  filter(section != "Preamble") %>%
  distinct(file, section) %>%
  count(section, name = "papers_with_section") %>%
  mutate(
    total_papers  = n_distinct(corpus_lines$file),
    presence_rate = round(papers_with_section / total_papers, 2)
  ) %>%
  arrange(desc(presence_rate))

# ============================================================
#  9. Figure / Table 統計
# ============================================================

fig_table_stats <- raw_lines %>%
  group_by(file) %>%
  summarise(full_text = paste(line, collapse = " "), .groups = "drop") %>%
  mutate(
    fig_count   = str_count(str_to_lower(full_text), "fig\\.|figure\\s*\\d"),
    table_count = str_count(str_to_lower(full_text), "table\\s*\\d"),
    word_count  = str_count(full_text, "\\S+")
  )

fig_summary <- fig_table_stats %>%
  summarise(across(c(fig_count, table_count, word_count),
                   list(median = median, q1 = ~quantile(.,0.25), q3 = ~quantile(.,0.75)),
                   .names = "{.col}_{.fn}"),
            n_papers = n())

# ============================================================
# 10. JSON組み立て & 書き出し
# ============================================================

build_kw_list <- function(sec) {
  df <- section_keywords %>% filter(section == sec)
  if (!nrow(df)) return(list())
  map(seq_len(nrow(df)), ~list(term = df$word[.x],
                                weight   = round(df$tf_idf[.x], 4),
                                doc_rate = df$doc_rate[.x]))
}

build_bg_list <- function(sec) {
  df <- bigrams %>% filter(section == sec)
  if (!nrow(df)) return(list())
  map(seq_len(nrow(df)), ~list(phrase = df$bigram[.x], count = df$n[.x]))
}

all_sections <- unique(c(section_keywords$section, bigrams$section))

paper_db <- list(
  meta = list(
    version      = "0.2",
    created      = format(Sys.Date()),
    study_type   = STUDY_TYPE,
    n_papers     = n_distinct(corpus_clean$file),
    source_files = basename(pdf_files)
  ),
  figure_table_norms = list(
    fig_median   = fig_summary$fig_count_median,
    fig_q1       = fig_summary$fig_count_q1,
    fig_q3       = fig_summary$fig_count_q3,
    table_median = fig_summary$table_count_median,
    table_q1     = fig_summary$table_count_q1,
    table_q3     = fig_summary$table_count_q3,
    word_median  = fig_summary$word_count_median
  ),
  section_presence = setNames(
    as.list(section_presence$presence_rate),
    section_presence$section
  ),
  keyword_profiles = setNames(
    map(all_sections, ~list(keywords = build_kw_list(.x),
                             bigrams  = build_bg_list(.x))),
    all_sections
  )
)

out_path <- file.path(OUT_DIR,
  sprintf("paper_db_%s_%s.json", STUDY_TYPE, format(Sys.Date(), "%Y%m%d")))
write_json(paper_db, out_path, pretty = TRUE, auto_unbox = TRUE, null = "null")
message(sprintf("\n✓ 完了: %s", out_path))

# ============================================================
# 11. コンソールサマリー
# ============================================================

cat("\n===== セクション検出率 =====\n")
print(section_presence, n = 20)

cat("\n===== セクション別キーワード上位5語 =====\n")
section_keywords %>%
  group_by(section) %>%
  slice_max(tf_idf, n = 5) %>%
  select(section, word, tf_idf, doc_rate) %>%
  print(n = 100)

cat("\n===== Figure / Table サマリー =====\n")
print(fig_table_stats %>% select(file, fig_count, table_count, word_count))
