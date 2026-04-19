/* ================================================================
   phrase_db.js — Medical Academic Phrase Dictionary  v2.0
   収録：IMRaD定型・統計・感染症・抗菌薬・研究デザイン 約500語句
   構造：
     ja        : 日本語訳・意味
     note      : ニュアンス・使用文脈
     section   : 主な出現セクション ['I','M','R','D']
     synonyms  : 類義語・類似フレーズ
     antonyms  : 対義語・対比表現
     paraphrase: 言い換え表現
     templates : 用例テンプレート（{変数}形式）
   ================================================================ */

const PHRASE_DB = {

/* ════════════════════════════════════════════
   INTRODUCTION — 知識欠落・研究目的
════════════════════════════════════════════ */

  "remains unclear": {
    ja: "依然として不明である・解明されていない",
    note: "知識の欠落（knowledge gap）を示す典型表現。Introductionで研究の必要性を正当化するために使う。",
    section: ["I"],
    synonyms: ["is not well established","has not been fully elucidated","is poorly understood","is yet to be determined","is not fully characterized","is incompletely understood"],
    antonyms: ["is well established","is well characterized","has been clearly demonstrated","is widely recognized","is well defined"],
    paraphrase: ["has not been fully elucidated","is not well understood","is yet to be determined"],
    templates: [
      "However, the {mechanism/role/impact} of {X} remains unclear.",
      "The relationship between {A} and {B} remains unclear.",
      "Whether {X} contributes to {outcome} remains unclear.",
    ],
  },

  "has not been fully elucidated": {
    ja: "十分に解明されていない",
    note: "remains unclearよりやや格調のある表現。メカニズムの不明を示す際に用いる。",
    section: ["I"],
    synonyms: ["remains unclear","is poorly understood","is not well established","has not been clarified"],
    antonyms: ["has been well established","has been clearly elucidated","is well understood"],
    paraphrase: ["remains to be elucidated","is incompletely understood","has not been characterized"],
    templates: [
      "The precise mechanism by which {X} causes {outcome} has not been fully elucidated.",
      "The role of {X} in {disease} has not been fully elucidated.",
    ],
  },

  "limited data": {
    ja: "データが限られている・エビデンスが少ない",
    note: "研究の必要性を示す根拠として使う。特にまれな疾患・新興病原体の論文で頻出。",
    section: ["I","D"],
    synonyms: ["scarce data","insufficient evidence","few studies","limited evidence","sparse data","paucity of data"],
    antonyms: ["abundant data","extensive evidence","numerous studies","well-documented","robust evidence"],
    paraphrase: ["insufficient data are available","data are scarce","evidence is limited","a paucity of data exists"],
    templates: [
      "However, limited data are available regarding {X} in {population}.",
      "There are limited data on the {outcome} of patients with {condition}.",
      "Limited data exist regarding the {efficacy/safety} of {treatment} for {disease}.",
    ],
  },

  "paucity of data": {
    ja: "データの乏しさ・エビデンスの不足",
    note: "limited dataより強調度が高い。系統的レビューのIntroductionで特に使われる。",
    section: ["I","D"],
    synonyms: ["limited data","scarce evidence","insufficient data","lack of evidence"],
    antonyms: ["abundance of data","extensive data","robust evidence"],
    paraphrase: ["a lack of sufficient data","insufficient evidence","limited available evidence"],
    templates: [
      "Due to the paucity of data on {X}, we conducted this {systematic review/meta-analysis}.",
      "There is a paucity of data regarding {X} in {immunocompromised/pediatric} patients.",
    ],
  },

  "to our knowledge": {
    ja: "われわれの知る限り",
    note: "先行研究がない・本研究が初である点を強調する慣用句。Introductionの末尾やDiscussionに置く。",
    section: ["I","D"],
    synonyms: ["to the best of our knowledge","as far as we are aware","to date"],
    antonyms: [],
    paraphrase: ["as far as we are aware","to the best of our knowledge"],
    templates: [
      "To our knowledge, this is the first study to {demonstrate/report/evaluate} {X}.",
      "To our knowledge, no previous study has {investigated/reported} {X} in {population}.",
    ],
  },

  "to the best of our knowledge": {
    ja: "われわれの知る限り（強調形）",
    note: "to our knowledgeと同義だが、よりフォーマル。",
    section: ["I","D"],
    synonyms: ["to our knowledge","as far as we are aware"],
    antonyms: [],
    paraphrase: ["to our knowledge","as far as we know"],
    templates: [
      "To the best of our knowledge, this is the largest cohort study of {X}.",
      "To the best of our knowledge, no randomized controlled trial has evaluated {X}.",
    ],
  },

  "is associated with": {
    ja: "〜と関連している",
    note: "観察研究での相関関係を示す。因果を主張しない点が重要。'is caused by'より保守的。",
    section: ["I","R","D"],
    synonyms: ["is linked to","is related to","is correlated with","is connected to","predicts","is independently associated with"],
    antonyms: ["is not associated with","is independent of","is unrelated to","is not correlated with"],
    paraphrase: ["is linked to","is correlated with","shows an association with"],
    templates: [
      "{X} was significantly associated with {outcome} (OR {value}, 95% CI {range}).",
      "Higher {X} levels were associated with increased risk of {outcome}.",
      "{Condition} was independently associated with {outcome} in multivariate analysis.",
    ],
  },

  "previous studies": {
    ja: "先行研究・これまでの研究",
    note: "先行研究を参照する際の総称表現。複数形が基本。",
    section: ["I","D"],
    synonyms: ["prior studies","earlier studies","previous reports","earlier reports","existing literature","prior investigations"],
    antonyms: ["the current study","the present study","this study","our study"],
    paraphrase: ["prior studies","earlier investigations","the existing literature"],
    templates: [
      "Previous studies have reported that {X} is associated with {outcome}.",
      "However, previous studies have yielded conflicting results.",
      "In contrast to previous studies, we found that {X}.",
    ],
  },

  "growing evidence": {
    ja: "増加するエビデンス・蓄積されつつあるエビデンス",
    note: "Introductionでトピックの重要性が増していることを示す表現。",
    section: ["I"],
    synonyms: ["increasing evidence","accumulating evidence","emerging evidence","mounting evidence"],
    antonyms: ["limited evidence","scarce evidence"],
    paraphrase: ["accumulating evidence","emerging data","increasing body of evidence"],
    templates: [
      "There is growing evidence that {X} plays a role in {outcome}.",
      "Growing evidence suggests that {treatment} may be effective for {condition}.",
    ],
  },

  "emerging evidence": {
    ja: "新たに生まれつつあるエビデンス",
    note: "比較的新しいトピックに使う。growing evidenceよりも「新出」のニュアンス。",
    section: ["I"],
    synonyms: ["growing evidence","accumulating evidence","recent evidence","new evidence"],
    antonyms: ["established evidence","well-documented evidence"],
    paraphrase: ["recently accumulating data","newly available evidence"],
    templates: [
      "Emerging evidence suggests that {X} may {contribute to/be associated with} {outcome}.",
    ],
  },

  "knowledge gap": {
    ja: "知識の欠落・未解明の領域",
    note: "研究の必要性を正当化するキーコンセプト。Introductionで問題提起に使う。",
    section: ["I"],
    synonyms: ["gap in knowledge","unresolved question","unanswered question","area of uncertainty"],
    antonyms: ["established knowledge","well-characterized area"],
    paraphrase: ["gap in the current literature","unresolved clinical question","area requiring further investigation"],
    templates: [
      "To address this knowledge gap, we conducted a {study type} of {population}.",
      "This study aims to fill the knowledge gap regarding {X}.",
    ],
  },

  "risk factor": {
    ja: "危険因子・リスク因子",
    note: "転帰の悪化に寄与する因子。independent risk factor（独立危険因子）が重要。",
    section: ["I","R","D"],
    synonyms: ["predictor","independent predictor","determinant","prognostic factor","risk predictor"],
    antonyms: ["protective factor","favorable factor","protective predictor"],
    paraphrase: ["predictor of {outcome}","factor associated with {outcome}","prognostic factor"],
    templates: [
      "We identified {X} as an independent risk factor for {outcome}.",
      "{X} was a significant risk factor for {outcome} (adjusted OR {value}).",
      "Independent risk factors for {outcome} included {A}, {B}, and {C}.",
    ],
  },

  "the aim of this study": {
    ja: "本研究の目的",
    note: "Introductionの末尾に置く研究目的の導入句。",
    section: ["I"],
    synonyms: ["the objective of this study","the purpose of this study","we aimed to","we sought to"],
    antonyms: [],
    paraphrase: ["the objective of the present study","the purpose of the current study"],
    templates: [
      "The aim of this study was to {evaluate/compare/determine} {X} in {population}.",
      "The aim of this study was to identify independent risk factors for {outcome}.",
    ],
  },

  "aimed to": {
    ja: "〜を目的とした・〜を目指した",
    note: "Introductionの末尾に置く研究目的の定型句。we sought to / we investigated も同義。",
    section: ["I"],
    synonyms: ["sought to","investigated","evaluated","assessed","was designed to","the objective was to"],
    antonyms: [],
    paraphrase: ["sought to","was designed to","the objective of this study was to"],
    templates: [
      "This study aimed to {evaluate/compare/determine} {X} in patients with {condition}.",
      "We aimed to identify risk factors for {outcome} in {population}.",
    ],
  },

  "we sought to": {
    ja: "〜を試みた・〜を目指した",
    note: "aimed toと同義だがやや文学的。Introductionの目的提示に使う。",
    section: ["I"],
    synonyms: ["aimed to","we attempted to","we investigated","we evaluated"],
    antonyms: [],
    paraphrase: ["we aimed to","we attempted to","we endeavored to"],
    templates: [
      "We sought to determine whether {X} is associated with {outcome}.",
      "We sought to evaluate the {efficacy/safety} of {treatment} in {population}.",
    ],
  },

  "major public health concern": {
    ja: "重大な公衆衛生上の問題",
    note: "感染症・耐性菌などの社会的重要性を強調する表現。Introductionで頻出。",
    section: ["I"],
    synonyms: ["public health threat","public health problem","global health concern","global health threat"],
    antonyms: [],
    paraphrase: ["a significant public health threat","an important global health issue"],
    templates: [
      "{Disease/Pathogen} has emerged as a major public health concern worldwide.",
      "Antimicrobial resistance is a major public health concern that requires urgent attention.",
    ],
  },

/* ════════════════════════════════════════════
   METHODS — 研究デザイン
════════════════════════════════════════════ */

  "retrospective": {
    ja: "後向き（研究）・後ろ向き",
    note: "診療記録等を過去に遡って解析する研究デザイン。バイアスが入りやすい欠点がある。",
    section: ["M"],
    synonyms: ["retrospective cohort","chart review","historical cohort","retrospective analysis","retrospective observational"],
    antonyms: ["prospective","randomized","longitudinal","interventional","prospective cohort"],
    paraphrase: ["retrospective cohort study","chart-based review","historical analysis"],
    templates: [
      "We conducted a retrospective study of patients with {condition} between {year} and {year}.",
      "This was a single-center retrospective cohort study.",
      "A retrospective analysis of medical records was performed.",
    ],
  },

  "prospective": {
    ja: "前向き（研究）・プロスペクティブ",
    note: "研究開始時点から将来に向けてデータを収集する研究デザイン。後向き研究より質が高い。",
    section: ["M"],
    synonyms: ["prospective cohort","longitudinal","observational prospective","forward-looking"],
    antonyms: ["retrospective","historical","chart-based","retrospective cohort"],
    paraphrase: ["prospective cohort study","longitudinal study","forward-looking study"],
    templates: [
      "A prospective observational study was conducted at {institution}.",
      "Patients were prospectively enrolled from {date} to {date}.",
    ],
  },

  "randomized controlled trial": {
    ja: "ランダム化比較試験（RCT）",
    note: "介入研究の最高水準のデザイン。盲検化（blinding）・割付隠蔽（allocation concealment）が重要。",
    section: ["M","I"],
    synonyms: ["RCT","randomized clinical trial","randomized trial","controlled trial"],
    antonyms: ["observational study","retrospective study","cohort study","non-randomized study"],
    paraphrase: ["RCT","randomized clinical trial","controlled randomized study"],
    templates: [
      "We conducted a randomized controlled trial comparing {A} with {B} in patients with {condition}.",
      "Patients were randomly assigned to {treatment} or {control} in a 1:1 ratio.",
    ],
  },

  "observational study": {
    ja: "観察研究",
    note: "介入を行わず自然経過を観察する研究デザイン。因果関係の推定に限界がある。",
    section: ["M","D"],
    synonyms: ["non-interventional study","cohort study","epidemiological study"],
    antonyms: ["randomized controlled trial","interventional study","experimental study"],
    paraphrase: ["non-interventional study","epidemiological cohort study"],
    templates: [
      "This observational study included {N} patients with {condition}.",
      "As an observational study, causality cannot be established.",
    ],
  },

  "cohort study": {
    ja: "コホート研究",
    note: "共通の特性をもつ集団を追跡する研究。前向きと後向きがある。",
    section: ["M"],
    synonyms: ["cohort analysis","longitudinal study","follow-up study","prospective cohort","retrospective cohort"],
    antonyms: ["case-control study","cross-sectional study","randomized controlled trial"],
    paraphrase: ["longitudinal cohort study","follow-up study"],
    templates: [
      "A retrospective cohort study was conducted at {hospital} between {year} and {year}.",
      "This prospective cohort study enrolled patients with {condition} over {duration}.",
    ],
  },

  "case-control study": {
    ja: "症例対照研究",
    note: "アウトカムの有無で対象を分けて後向きにリスク因子を評価する研究デザイン。",
    section: ["M"],
    synonyms: ["matched case-control","nested case-control"],
    antonyms: ["cohort study","randomized controlled trial","prospective study"],
    paraphrase: ["case-control design","matched case-control study"],
    templates: [
      "A matched case-control study was performed with {N} cases and {N} controls.",
      "Cases were matched to controls by {age/sex/comorbidities}.",
    ],
  },

  "systematic review": {
    ja: "システマティックレビュー・系統的レビュー",
    note: "事前に設定した基準に基づいて文献を網羅的に収集・評価する研究手法。メタ解析と組み合わせることが多い。",
    section: ["M","I"],
    synonyms: ["systematic literature review","structured review","comprehensive review"],
    antonyms: ["narrative review","traditional review","unsystematic review"],
    paraphrase: ["structured systematic literature review","comprehensive systematic review"],
    templates: [
      "We conducted a systematic review and meta-analysis of studies reporting {outcome} in {population}.",
      "The systematic review was performed according to PRISMA guidelines.",
    ],
  },

  "meta-analysis": {
    ja: "メタ解析・メタアナリシス",
    note: "複数の独立した研究の結果を統合して定量的に解析する手法。システマティックレビューと組み合わせる。",
    section: ["M","I"],
    synonyms: ["pooled analysis","quantitative synthesis","statistical pooling"],
    antonyms: ["narrative synthesis","qualitative review"],
    paraphrase: ["pooled quantitative analysis","statistical synthesis of study results"],
    templates: [
      "A meta-analysis was performed using a random-effects model.",
      "Pooled estimates were calculated using DerSimonian–Laird random-effects meta-analysis.",
      "Heterogeneity was assessed using the I² statistic and Cochran's Q test.",
    ],
  },

  "inclusion criteria": {
    ja: "適格基準・組み入れ基準",
    note: "研究対象者を選定するための条件。exclusion criteriaとセットで記述する。",
    section: ["M"],
    synonyms: ["eligibility criteria","selection criteria","enrollment criteria","enrollment requirements"],
    antonyms: ["exclusion criteria","exclusionary criteria"],
    paraphrase: ["eligibility criteria","criteria for enrollment","selection criteria"],
    templates: [
      "Inclusion criteria were: (1) {criterion 1}, (2) {criterion 2}, and (3) {criterion 3}.",
      "Patients who met the following inclusion criteria were enrolled: {criteria}.",
    ],
  },

  "exclusion criteria": {
    ja: "除外基準",
    note: "研究から対象者を除外するための条件。inclusion criteriaとセットで記述する。",
    section: ["M"],
    synonyms: ["criteria for exclusion","exclusionary criteria"],
    antonyms: ["inclusion criteria","eligibility criteria"],
    paraphrase: ["criteria for exclusion","exclusionary conditions"],
    templates: [
      "Patients were excluded if they had {condition} or {condition}.",
      "Exclusion criteria included {A}, {B}, and {C}.",
    ],
  },

  "medical records": {
    ja: "診療記録・カルテ",
    note: "後向き研究でのデータソース。electronic medical records（電子カルテ）も同義。",
    section: ["M"],
    synonyms: ["clinical records","patient records","electronic medical records","EMR","electronic health records","EHR"],
    antonyms: [],
    paraphrase: ["electronic medical records (EMR)","clinical charts","patient charts"],
    templates: [
      "Data were collected from medical records of patients admitted between {year} and {year}.",
      "We reviewed the medical records of all patients with {condition}.",
    ],
  },

  "data collection": {
    ja: "データ収集",
    note: "研究データの取得プロセス。変数の定義とともに記述する。",
    section: ["M"],
    synonyms: ["data extraction","data abstraction","information collection"],
    antonyms: [],
    paraphrase: ["data extraction","data abstraction","collection of clinical data"],
    templates: [
      "Data collection was performed by two independent reviewers.",
      "The following data were collected: {demographics}, {clinical variables}, and {outcomes}.",
    ],
  },

  "primary outcome": {
    ja: "主要エンドポイント・主要アウトカム",
    note: "研究で最も重要視する転帰指標。検出力計算の基準となる。",
    section: ["M","R"],
    synonyms: ["primary endpoint","main outcome","primary study endpoint"],
    antonyms: ["secondary outcome","secondary endpoint","exploratory outcome"],
    paraphrase: ["primary study endpoint","main outcome measure","principal outcome"],
    templates: [
      "The primary outcome was {30-day all-cause mortality/clinical cure/readmission}.",
      "The primary endpoint was defined as {outcome} within {timeframe}.",
    ],
  },

  "secondary outcome": {
    ja: "副次エンドポイント・副次アウトカム",
    note: "主要アウトカムを補完する転帰指標。多重比較の問題に注意する。",
    section: ["M","R"],
    synonyms: ["secondary endpoint","additional outcome","exploratory outcome"],
    antonyms: ["primary outcome","primary endpoint"],
    paraphrase: ["secondary study endpoint","additional outcome measure"],
    templates: [
      "Secondary outcomes included {A}, {B}, and {C}.",
      "As a secondary outcome, we assessed {X} at {timepoint}.",
    ],
  },

  "clinical outcome": {
    ja: "臨床アウトカム・臨床転帰",
    note: "患者に対する治療・介入の結果。primary outcome / secondary outcomeに分けて報告する。",
    section: ["M","R","D"],
    synonyms: ["outcome","patient outcome","clinical endpoint","endpoint","treatment outcome"],
    antonyms: [],
    paraphrase: ["clinical endpoint","patient outcome","treatment outcome"],
    templates: [
      "The primary clinical outcome was {30-day mortality/clinical cure/readmission}.",
      "Secondary clinical outcomes included {A}, {B}, and {C}.",
      "{X} was independently associated with poor clinical outcome.",
    ],
  },

  "informed consent": {
    ja: "インフォームドコンセント・説明と同意",
    note: "倫理的研究実施の要件。後向き研究では免除されることが多い（waived）。",
    section: ["M"],
    synonyms: ["written informed consent","patient consent","written consent"],
    antonyms: [],
    paraphrase: ["written consent","patient authorization"],
    templates: [
      "Written informed consent was obtained from all patients.",
      "The requirement for informed consent was waived due to the retrospective nature of the study.",
    ],
  },

  "ethics committee": {
    ja: "倫理委員会・施設内審査委員会（IRB）",
    note: "研究の倫理審査機関。論文のMethods冒頭に記載する。",
    section: ["M"],
    synonyms: ["institutional review board","IRB","ethics review board","research ethics committee","ethical committee"],
    antonyms: [],
    paraphrase: ["institutional review board (IRB)","ethics review board"],
    templates: [
      "This study was approved by the ethics committee of {institution} (approval number: {number}).",
      "The study protocol was approved by the Institutional Review Board of {institution}.",
    ],
  },

  "waived": {
    ja: "（倫理審査・インフォームドコンセントが）免除された",
    note: "後向き研究では個人識別情報を扱わない場合にICやIRB審査が免除されることがある。",
    section: ["M"],
    synonyms: ["exempted","not required","dispensed with"],
    antonyms: ["required","obtained","mandatory"],
    paraphrase: ["exempted from the requirement","not required due to the retrospective design"],
    templates: [
      "The requirement for informed consent was waived because of the retrospective nature of the study.",
      "IRB review was waived for this minimal-risk study.",
    ],
  },

  "follow-up": {
    ja: "追跡・フォローアップ",
    note: "患者の追跡観察期間。median follow-upで中央値を報告することが多い。",
    section: ["M","R"],
    synonyms: ["follow-up period","observation period","follow-up duration","surveillance period"],
    antonyms: ["baseline","enrollment"],
    paraphrase: ["observation period","surveillance duration","post-enrollment follow-up"],
    templates: [
      "The median follow-up period was {X} days (IQR {lower}–{upper}).",
      "Patients were followed up for a minimum of {X} {days/months}.",
      "All-cause mortality was assessed at {30/90}-day follow-up.",
    ],
  },

  "propensity score matching": {
    ja: "傾向スコアマッチング",
    note: "観察研究で選択バイアスを減らすための統計的手法。交絡を調整する目的で使う。",
    section: ["M"],
    synonyms: ["PSM","propensity score analysis","inverse probability weighting","IPW"],
    antonyms: ["unadjusted comparison","crude comparison"],
    paraphrase: ["propensity score–based matching","PS-matched analysis"],
    templates: [
      "Propensity score matching was performed to reduce confounding between groups.",
      "After propensity score matching, {N} pairs were included in the analysis.",
    ],
  },

/* ════════════════════════════════════════════
   METHODS / RESULTS — 統計・数値表現
════════════════════════════════════════════ */

  "multivariate analysis": {
    ja: "多変量解析",
    note: "複数の変数を同時に調整して独立した関連を評価する統計手法。univariate analysisで有意だった変数を投入することが多い。",
    section: ["M","R"],
    synonyms: ["multivariable analysis","multiple regression analysis","adjusted analysis","multivariate logistic regression","multivariable logistic regression"],
    antonyms: ["univariate analysis","unadjusted analysis","bivariate analysis"],
    paraphrase: ["multivariable regression analysis","adjusted regression analysis","multiple logistic regression"],
    templates: [
      "Multivariate logistic regression analysis was performed to identify independent risk factors.",
      "Variables with p < {value} in univariate analysis were included in multivariate analysis.",
      "After multivariate adjustment, {X} remained independently associated with {outcome}.",
    ],
  },

  "univariate analysis": {
    ja: "単変量解析",
    note: "変数を1つずつ個別に評価する解析。多変量解析の前段階として実施する。",
    section: ["M","R"],
    synonyms: ["unadjusted analysis","bivariate analysis","simple regression"],
    antonyms: ["multivariate analysis","multivariable analysis","adjusted analysis"],
    paraphrase: ["unadjusted analysis","simple logistic regression"],
    templates: [
      "Univariate analysis was first performed to identify candidate variables.",
      "Variables significant at p < {value} in univariate analysis were entered into multivariate analysis.",
    ],
  },

  "odds ratio": {
    ja: "オッズ比（OR）",
    note: "症例対照研究や多変量解析でよく使用される効果量の指標。95%信頼区間（95% CI）とともに報告する。",
    section: ["M","R"],
    synonyms: ["OR","adjusted odds ratio","aOR","unadjusted odds ratio","crude odds ratio"],
    antonyms: ["risk ratio","hazard ratio","rate ratio","relative risk"],
    paraphrase: ["OR","adjusted OR","aOR"],
    templates: [
      "{X} was significantly associated with {outcome} (OR {value}, 95% CI {lower}–{upper}, p = {p}).",
      "The adjusted odds ratio for {outcome} was {value} (95% CI {lower}–{upper}).",
    ],
  },

  "hazard ratio": {
    ja: "ハザード比（HR）",
    note: "生存時間解析（Cox比例ハザードモデル）で使用される効果量。HR > 1はリスク増加を示す。",
    section: ["M","R"],
    synonyms: ["HR","adjusted HR","aHR","Cox regression","time-to-event analysis"],
    antonyms: ["odds ratio","risk ratio"],
    paraphrase: ["HR","adjusted hazard ratio","aHR"],
    templates: [
      "Cox proportional hazards regression showed that {X} was associated with {outcome} (HR {value}, 95% CI {lower}–{upper}).",
      "The hazard ratio for {outcome} in patients with {X} was {value} (95% CI {lower}–{upper}).",
    ],
  },

  "relative risk": {
    ja: "相対リスク（RR）・リスク比",
    note: "曝露群と非曝露群のリスクの比。コホート研究で用いられる。odds ratioと混同しないよう注意。",
    section: ["M","R"],
    synonyms: ["RR","risk ratio","rate ratio"],
    antonyms: ["absolute risk","absolute risk reduction","ARR"],
    paraphrase: ["RR","risk ratio","rate ratio"],
    templates: [
      "The relative risk of {outcome} was {value} (95% CI {lower}–{upper}) in the {exposed} group.",
    ],
  },

  "confidence interval": {
    ja: "信頼区間（CI）",
    note: "推定値の精度を示す区間。通常95%信頼区間（95% CI）を使用。区間が1をまたがない場合、統計学的有意性を示す。",
    section: ["M","R"],
    synonyms: ["CI","95% CI","confidence limits","95% confidence interval"],
    antonyms: [],
    paraphrase: ["95% CI","confidence limits"],
    templates: [
      "(OR {value}, 95% CI {lower}–{upper})",
      "(HR {value}, 95% CI {lower}–{upper}, p = {p})",
      "A two-sided 95% confidence interval was calculated for all estimates.",
    ],
  },

  "p value": {
    ja: "p値・有意確率",
    note: "帰無仮説のもとで観測データ以上に極端な結果が得られる確率。p < 0.05が有意水準の慣例。",
    section: ["M","R"],
    synonyms: ["p","p-value","significance level","probability value","two-sided p value"],
    antonyms: [],
    paraphrase: ["probability value","significance level"],
    templates: [
      "A p value of less than 0.05 was considered statistically significant.",
      "Statistical significance was defined as a two-sided p value of less than 0.05.",
      "All tests were two-sided, and p < 0.05 was considered significant.",
    ],
  },

  "statistically significant": {
    ja: "統計学的に有意（な）",
    note: "p値が設定した有意水準（通常0.05）を下回ることを示す。significant単独でも同義に使われる。",
    section: ["R"],
    synonyms: ["significant","significantly","p < 0.05","reached statistical significance","statistically significant difference"],
    antonyms: ["not significant","non-significant","p ≥ 0.05","did not reach statistical significance","no significant difference"],
    paraphrase: ["reached statistical significance","was significant (p < 0.05)","differed significantly"],
    templates: [
      "The difference was statistically significant (p = {value}).",
      "{X} was significantly higher in {group A} than in {group B} (p < {value}).",
      "No statistically significant difference was observed between {groups} (p = {value}).",
    ],
  },

  "logistic regression": {
    ja: "ロジスティック回帰（解析）",
    note: "2値アウトカム（死亡/生存等）の予測因子を同定するための統計手法。",
    section: ["M","R"],
    synonyms: ["logistic regression analysis","binary logistic regression","multivariable logistic regression","logistic model"],
    antonyms: ["linear regression","Cox regression","Poisson regression"],
    paraphrase: ["logistic regression analysis","binary logistic regression model"],
    templates: [
      "Multivariable logistic regression was performed to identify independent predictors of {outcome}.",
      "Logistic regression analysis identified {X} as an independent predictor (OR {value}, 95% CI {range}).",
    ],
  },

  "cox proportional hazards": {
    ja: "Cox比例ハザード（モデル）",
    note: "生存時間解析の代表的な統計モデル。ハザード比（HR）を算出する。",
    section: ["M","R"],
    synonyms: ["Cox regression","Cox model","proportional hazards model","survival analysis"],
    antonyms: [],
    paraphrase: ["Cox proportional hazards regression","Cox survival model"],
    templates: [
      "Cox proportional hazards regression was used to assess the association between {X} and {outcome}.",
      "Time to {outcome} was analyzed using Cox proportional hazards regression.",
    ],
  },

  "kaplan-meier": {
    ja: "カプランマイヤー（法）・生存曲線",
    note: "生存時間解析で生存曲線を描く非パラメトリック法。log-rank検定で群間比較する。",
    section: ["M","R"],
    synonyms: ["Kaplan–Meier analysis","survival curve","Kaplan-Meier estimator","KM curve"],
    antonyms: [],
    paraphrase: ["Kaplan–Meier survival analysis","cumulative survival curve"],
    templates: [
      "Kaplan–Meier curves were constructed and compared using the log-rank test.",
      "Kaplan–Meier analysis showed significantly better survival in patients with {X} (log-rank p = {value}).",
    ],
  },

  "median": {
    ja: "中央値",
    note: "外れ値に影響されにくい代表値。四分位範囲（IQR）と組み合わせて報告する。",
    section: ["R"],
    synonyms: ["median value","50th percentile","middle value"],
    antonyms: ["mean","average","arithmetic mean"],
    paraphrase: ["50th percentile","midpoint value"],
    templates: [
      "The median {age/duration/value} was {X} (IQR {lower}–{upper}).",
      "Median follow-up was {X} days (IQR {lower}–{upper}).",
    ],
  },

  "mean": {
    ja: "平均値・平均",
    note: "正規分布するデータに適した代表値。標準偏差（SD）とともに報告する。",
    section: ["R"],
    synonyms: ["average","arithmetic mean","mean value"],
    antonyms: ["median","mode"],
    paraphrase: ["arithmetic mean","average value"],
    templates: [
      "The mean {±} SD {variable} was {value} ± {SD}.",
      "Mean {age/duration} was {X} ± {SD} years.",
    ],
  },

  "interquartile range": {
    ja: "四分位範囲（IQR）",
    note: "第25〜75百分位の範囲。中央値とともに非正規分布データを記述するために使う。",
    section: ["R"],
    synonyms: ["IQR","quartile range","25th–75th percentile","Q1–Q3"],
    antonyms: ["standard deviation","SD","range"],
    paraphrase: ["IQR","25th to 75th percentile","Q1–Q3"],
    templates: [
      "Median {X} was {value} (IQR {lower}–{upper}).",
      "Data are presented as median (IQR) for continuous variables.",
    ],
  },

  "standard deviation": {
    ja: "標準偏差（SD）",
    note: "正規分布するデータのばらつきを示す指標。平均値とともに報告する。",
    section: ["R"],
    synonyms: ["SD","standard error","SE"],
    antonyms: ["IQR","interquartile range"],
    paraphrase: ["SD","measure of variability"],
    templates: [
      "Results are expressed as mean ± SD.",
      "Data are presented as mean (SD) for normally distributed variables.",
    ],
  },

  "heterogeneity": {
    ja: "異質性・ヘテロジェニティ",
    note: "メタ解析で研究間のばらつきを示す。I²統計量で定量化し、I² > 50%を高い異質性とみなすことが多い。",
    section: ["M","R"],
    synonyms: ["statistical heterogeneity","between-study heterogeneity","inconsistency","variability"],
    antonyms: ["homogeneity","consistency"],
    paraphrase: ["between-study variability","inter-study heterogeneity"],
    templates: [
      "Heterogeneity was assessed using the I² statistic and Cochran's Q test.",
      "Substantial heterogeneity was observed across studies (I² = {value}%).",
      "A random-effects model was used due to significant heterogeneity (I² > 50%).",
    ],
  },

  "random effects model": {
    ja: "ランダム効果モデル",
    note: "異質性が高い場合のメタ解析で使用するモデル。研究間のばらつきを考慮する。",
    section: ["M","R"],
    synonyms: ["random-effects model","DerSimonian–Laird model","RE model"],
    antonyms: ["fixed effects model","fixed-effect model"],
    paraphrase: ["random-effects meta-analytic model"],
    templates: [
      "Pooled estimates were calculated using a random-effects model.",
      "A DerSimonian–Laird random-effects model was used for pooling.",
    ],
  },

  "sensitivity analysis": {
    ja: "感度分析",
    note: "主解析の頑健性を確認するために、特定の仮定や対象を変えて繰り返す補足的解析。",
    section: ["M","R"],
    synonyms: ["robustness analysis","leave-one-out analysis","subgroup sensitivity analysis"],
    antonyms: ["primary analysis","main analysis"],
    paraphrase: ["robustness analysis","exploratory sensitivity analysis"],
    templates: [
      "Sensitivity analyses were performed by excluding {criteria}.",
      "A leave-one-out sensitivity analysis confirmed the robustness of our findings.",
    ],
  },

  "subgroup analysis": {
    ja: "サブグループ解析",
    note: "特定の患者層に限定した解析。多重比較の問題があるため、事前設定（pre-specified）であることを明記する。",
    section: ["R","D"],
    synonyms: ["subset analysis","stratified analysis","exploratory analysis","pre-specified subgroup analysis"],
    antonyms: ["primary analysis","overall analysis","main analysis"],
    paraphrase: ["subset analysis","stratified analysis","exploratory subgroup analysis"],
    templates: [
      "In subgroup analysis, {X} was significantly associated with {outcome} only in {subgroup}.",
      "Subgroup analyses were performed by {age/sex/disease severity}.",
    ],
  },

  "incidence": {
    ja: "発生率・罹患率",
    note: "一定期間内に新たに発症した症例の割合。prevalence（有病率）と区別する。",
    section: ["I","R","D"],
    synonyms: ["incidence rate","attack rate","occurrence rate","incidence density"],
    antonyms: ["prevalence","point prevalence","period prevalence"],
    paraphrase: ["incidence rate","rate of occurrence","new case rate"],
    templates: [
      "The incidence of {disease} was {X} per {1000/100,000} person-years.",
      "The annual incidence of {condition} increased from {X}% to {Y}% during the study period.",
    ],
  },

  "prevalence": {
    ja: "有病率・罹患割合",
    note: "ある時点における罹患者の割合。incidence（発生率）と区別する。",
    section: ["I","R","D"],
    synonyms: ["prevalence rate","point prevalence","period prevalence","proportion"],
    antonyms: ["incidence","incidence rate","new case rate"],
    paraphrase: ["prevalence rate","proportion of cases"],
    templates: [
      "The prevalence of {condition} was {X}% in the study population.",
      "The overall prevalence of {X} among {population} was {value}%.",
    ],
  },

  "sensitivity": {
    ja: "感度（診断精度指標）",
    note: "真陽性率。検査が疾患患者を正しく陽性と判定する割合。specificityと対で報告する。",
    section: ["M","R"],
    synonyms: ["true positive rate","recall","detection rate","TPR"],
    antonyms: ["specificity","positive predictive value","negative predictive value","true negative rate"],
    paraphrase: ["true positive rate","detection sensitivity"],
    templates: [
      "The sensitivity and specificity of {test} were {X}% and {Y}%, respectively.",
      "Sensitivity was {X}% (95% CI {range}) and specificity was {Y}% (95% CI {range}).",
    ],
  },

  "specificity": {
    ja: "特異度（診断精度指標）",
    note: "真陰性率。検査が非疾患者を正しく陰性と判定する割合。sensitivityと対で報告する。",
    section: ["M","R"],
    synonyms: ["true negative rate","selectivity","TNR"],
    antonyms: ["sensitivity","recall","true positive rate"],
    paraphrase: ["true negative rate"],
    templates: [
      "The sensitivity and specificity of {test} were {X}% and {Y}%, respectively.",
    ],
  },

  "area under the curve": {
    ja: "曲線下面積（AUC）",
    note: "ROC曲線の下の面積。診断精度を示す指標で、0.5（無意味）〜1.0（完全）の範囲をとる。",
    section: ["M","R"],
    synonyms: ["AUC","AUROC","c-statistic","receiver operating characteristic","ROC curve"],
    antonyms: [],
    paraphrase: ["AUC","AUROC","c-statistic"],
    templates: [
      "The area under the ROC curve (AUC) was {value} (95% CI {range}).",
      "Receiver operating characteristic analysis showed an AUC of {value} for {predictor}.",
    ],
  },

  "number needed to treat": {
    ja: "治療必要数（NNT）",
    note: "1例の有益なアウトカムを得るために治療が必要な患者数。小さいほど効果的。",
    section: ["R","D"],
    synonyms: ["NNT","number needed to harm","NNH"],
    antonyms: [],
    paraphrase: ["NNT","treatment needed per benefit"],
    templates: [
      "The number needed to treat (NNT) was {value} to prevent one {outcome}.",
    ],
  },

/* ════════════════════════════════════════════
   RESULTS — 記述・比較表現
════════════════════════════════════════════ */

  "mortality": {
    ja: "死亡率・致死率",
    note: "all-cause mortality（全死因死亡率）とattributable mortality（帰属死亡率）を区別する。",
    section: ["R","D"],
    synonyms: ["death rate","case fatality rate","fatality","all-cause mortality","attributable mortality","in-hospital mortality","30-day mortality"],
    antonyms: ["survival","survival rate","overall survival","case fatality"],
    paraphrase: ["death rate","case fatality","overall survival"],
    templates: [
      "The {30-day/in-hospital} mortality was {X}% in patients with {condition}.",
      "All-cause mortality was significantly higher in the {group} group ({X}% vs {Y}%, p = {value}).",
      "Attributable mortality was estimated at {X}%.",
    ],
  },

  "attributable mortality": {
    ja: "帰属死亡率・原因帰属死亡率",
    note: "特定の病原体・疾患が原因とみなされる死亡の割合。全死因死亡率（all-cause mortality）と区別する。",
    section: ["R","D"],
    synonyms: ["infection-attributable mortality","disease-attributable death","excess mortality","infection-related mortality"],
    antonyms: ["all-cause mortality","overall mortality","unrelated mortality"],
    paraphrase: ["infection-related mortality","excess mortality attributable to {X}"],
    templates: [
      "The attributable mortality of {infection} was estimated at {X}%.",
      "Attributable mortality was significantly higher in the {drug-resistant} group.",
    ],
  },

  "survival": {
    ja: "生存（率）・サバイバル",
    note: "overall survival（全生存率）、disease-free survival（無病生存率）などの種類がある。",
    section: ["R","D"],
    synonyms: ["overall survival","survival rate","disease-free survival","event-free survival","OS"],
    antonyms: ["mortality","death","fatality","case fatality"],
    paraphrase: ["overall survival rate","cumulative survival"],
    templates: [
      "The {30-day} survival rate was {X}% in the {group} group.",
      "Kaplan–Meier analysis showed significantly better survival in patients with {X} (log-rank p = {value}).",
    ],
  },

  "significantly higher": {
    ja: "有意に高い",
    note: "統計的有意差を伴う比較表現。",
    section: ["R"],
    synonyms: ["markedly higher","substantially higher","considerably higher","statistically higher","significantly elevated","significantly greater"],
    antonyms: ["significantly lower","significantly reduced","not significantly different","comparable"],
    paraphrase: ["markedly elevated","substantially greater","considerably higher"],
    templates: [
      "{X} was significantly higher in the {group A} group than in the {group B} group ({value} vs {value}, p = {p}).",
      "The {mortality/rate/level} was significantly higher among {patients with X}.",
    ],
  },

  "significantly lower": {
    ja: "有意に低い",
    note: "統計的有意差を伴う比較表現（低値方向）。",
    section: ["R"],
    synonyms: ["markedly lower","substantially lower","considerably lower","significantly reduced","significantly decreased"],
    antonyms: ["significantly higher","significantly elevated","significantly increased"],
    paraphrase: ["markedly reduced","substantially lower","considerably decreased"],
    templates: [
      "{X} was significantly lower in the {treatment} group compared to the {control} group (p = {value}).",
      "The {mortality/rate} was significantly lower after {intervention}.",
    ],
  },

  "compared to": {
    ja: "〜と比較して・〜に対して",
    note: "2群間の比較を示す。compared with も同義でよく用いられる。",
    section: ["R","D"],
    synonyms: ["compared with","in comparison with","versus","relative to","as opposed to","as compared to"],
    antonyms: [],
    paraphrase: ["compared with","in comparison to","relative to","versus"],
    templates: [
      "{X} was significantly higher compared to {control group} ({value} vs {value}, p = {p}).",
      "Patients in {group A} had better outcomes compared to those in {group B}.",
    ],
  },

  "independent predictor": {
    ja: "独立予測因子・独立した予測因子",
    note: "多変量解析で他の変数と独立して有意に関連した因子。",
    section: ["R","D"],
    synonyms: ["independent risk factor","independent prognostic factor","independent determinant","significant predictor"],
    antonyms: ["confounding factor","dependent variable","non-significant variable"],
    paraphrase: ["independent risk factor","independent prognostic factor","independent determinant"],
    templates: [
      "Multivariate analysis identified {X} as an independent predictor of {outcome} (OR {value}, 95% CI {range}).",
      "{X} was an independent predictor of {30-day mortality/readmission} in our cohort.",
    ],
  },

  "no significant difference": {
    ja: "有意差なし・有意な差は認めない",
    note: "2群間に統計学的有意差がないことを示す。p値とともに報告する。",
    section: ["R"],
    synonyms: ["not significantly different","comparable","similar","no statistically significant difference","no difference was observed"],
    antonyms: ["significant difference","statistically significant","significant association"],
    paraphrase: ["not significantly different","comparable between groups","similar between groups"],
    templates: [
      "No significant difference was observed in {X} between {group A} and {group B} (p = {value}).",
      "{X} was not significantly different between the two groups ({value} vs {value}, p = {value}).",
    ],
  },

  "table shows": {
    ja: "表は〜を示している",
    note: "Resultsで表の内容を参照する際の定型表現。",
    section: ["R"],
    synonyms: ["as shown in table","as summarized in table","table presents","table lists"],
    antonyms: [],
    paraphrase: ["as shown in Table {N}","as presented in Table {N}"],
    templates: [
      "Table {N} shows the baseline characteristics of the study population.",
      "As shown in Table {N}, {X} was significantly higher in {group A}.",
    ],
  },

  "figure shows": {
    ja: "図は〜を示している",
    note: "Resultsで図の内容を参照する際の定型表現。",
    section: ["R"],
    synonyms: ["as shown in figure","as illustrated in figure","figure presents","figure depicts"],
    antonyms: [],
    paraphrase: ["as shown in Figure {N}","as illustrated in Figure {N}"],
    templates: [
      "Figure {N} shows the Kaplan–Meier survival curves for {outcome}.",
      "As shown in Figure {N}, the {rate/proportion} of {X} increased over time.",
    ],
  },

/* ════════════════════════════════════════════
   DISCUSSION — 考察・限界
════════════════════════════════════════════ */

  "consistent with": {
    ja: "〜と一致する・〜と合致する",
    note: "自分の結果と先行研究・理論が一致することを示す表現。",
    section: ["D"],
    synonyms: ["in line with","in agreement with","concordant with","similar to","corroborates","in keeping with"],
    antonyms: ["inconsistent with","contrary to","in contrast to","at odds with","contradicts","discordant with"],
    paraphrase: ["in line with previous reports","in agreement with prior findings","corroborates earlier data"],
    templates: [
      "These findings are consistent with previous reports showing that {X}.",
      "Our results are consistent with those of {Author et al.}, who reported that {X}.",
    ],
  },

  "in contrast": {
    ja: "対照的に・一方",
    note: "先行研究との相違を示す接続表現。In contrast to XXX, we found...の形が多い。",
    section: ["D"],
    synonyms: ["in contrast to","conversely","however","on the contrary","unlike","whereas","by contrast"],
    antonyms: ["similarly","likewise","in line with","consistently","in agreement with"],
    paraphrase: ["conversely","on the other hand","in opposition to this"],
    templates: [
      "In contrast to {Author et al.}, we found that {X} was not significantly associated with {outcome}.",
      "In contrast, patients in our cohort showed {finding}.",
    ],
  },

  "in line with": {
    ja: "〜と一致して・〜と合致して",
    note: "consistent withとほぼ同義。先行報告との一致を示す。",
    section: ["D"],
    synonyms: ["consistent with","in agreement with","in keeping with","concordant with"],
    antonyms: ["in contrast to","inconsistent with","contrary to"],
    paraphrase: ["consistent with","in agreement with","concordant with"],
    templates: [
      "Our findings are in line with those of previous studies reporting {X}.",
      "This is in line with the hypothesis that {X} contributes to {outcome}.",
    ],
  },

  "limitation": {
    ja: "限界・制限（研究の）",
    note: "研究の弱点を客観的に述べる必須項目。Several limitations should be acknowledged.で導入するのが定型。",
    section: ["D"],
    synonyms: ["weakness","caveat","shortcoming","drawback","constraint"],
    antonyms: ["strength","advantage","strong point"],
    paraphrase: ["shortcoming","caveat","weakness of the study"],
    templates: [
      "This study has several limitations. First, {limitation 1}. Second, {limitation 2}.",
      "A major limitation of this study is its retrospective design.",
      "These results should be interpreted with caution given the limitations of {design/sample size}.",
    ],
  },

  "should be interpreted with caution": {
    ja: "慎重に解釈すべきである",
    note: "Discussionの限界事項で頻出する表現。研究の限界を認めつつも結果を否定しない姿勢を示す。",
    section: ["D"],
    synonyms: ["should be viewed with caution","must be interpreted cautiously","warrant caution","should be taken with caution","should be interpreted carefully"],
    antonyms: ["can be firmly concluded","definitively demonstrates","provides definitive evidence"],
    paraphrase: ["warrants cautious interpretation","should be viewed with caution","must be interpreted carefully"],
    templates: [
      "These findings should be interpreted with caution due to the {retrospective design/small sample size}.",
      "The results should be interpreted with caution, as {limitation}.",
    ],
  },

  "further studies": {
    ja: "さらなる研究・今後の研究",
    note: "Discussionの末尾で将来の研究課題を提示する表現。",
    section: ["D"],
    synonyms: ["future studies","additional studies","prospective studies are needed","further investigation","future research"],
    antonyms: [],
    paraphrase: ["future investigations","additional research","prospective studies"],
    templates: [
      "Further studies are needed to {validate/confirm/elucidate} {X}.",
      "Prospective studies are warranted to {clarify/determine} the {role/mechanism} of {X}.",
      "Further large-scale studies are needed to confirm these findings.",
    ],
  },

  "our findings": {
    ja: "われわれの結果・本研究の知見",
    note: "自分たちの研究結果を指す表現。Our results / The present studyも同義。",
    section: ["D"],
    synonyms: ["our results","the present study","the current study","our data","these results","our observations"],
    antonyms: ["previous reports","prior studies","earlier findings"],
    paraphrase: ["our results","these data","the results of the present study"],
    templates: [
      "Our findings suggest that {X} may play a role in {outcome}.",
      "Our findings are consistent with those of {Author et al.}.",
      "Our findings indicate that {X} is an independent predictor of {outcome}.",
    ],
  },

  "suggest": {
    ja: "示唆する・示す",
    note: "断言（demonstrate/prove）より控えめな表現。観察研究では因果を主張しないためsuggestを使うことが多い。",
    section: ["D"],
    synonyms: ["indicate","imply","demonstrate","show","support the hypothesis that","point to"],
    antonyms: ["disprove","refute","contradict","argue against"],
    paraphrase: ["indicate","imply","support the notion that"],
    templates: [
      "These findings suggest that {X} may {play a role in/contribute to} {outcome}.",
      "Our data suggest that {treatment} may be beneficial for {population}.",
    ],
  },

  "strengths": {
    ja: "強み・長所（研究の）",
    note: "Discussionで研究の強みを述べる。limitationsとセットで記述することが多い。",
    section: ["D"],
    synonyms: ["advantages","strong points","merits"],
    antonyms: ["limitations","weaknesses","shortcomings"],
    paraphrase: ["advantages of this study","strong aspects"],
    templates: [
      "The strengths of this study include {large sample size/multicenter design/prospective enrollment}.",
      "This study has several strengths, including {A} and {B}.",
    ],
  },

  "generalizability": {
    ja: "一般化可能性・外的妥当性",
    note: "研究結果が他の集団・設定に適用できるかどうか。外的妥当性（external validity）とも呼ばれる。",
    section: ["D"],
    synonyms: ["external validity","applicability","generalisability","transferability"],
    antonyms: ["internal validity","local validity"],
    paraphrase: ["external validity","applicability to other populations"],
    templates: [
      "The generalizability of our findings may be limited due to the {single-center design/specific population}.",
      "Our results may not be generalizable to {other settings/populations}.",
    ],
  },

  "selection bias": {
    ja: "選択バイアス",
    note: "研究対象者の選定方法によって生じるバイアス。後向き研究では特に注意が必要。",
    section: ["D"],
    synonyms: ["sampling bias","referral bias","enrollment bias"],
    antonyms: ["random sampling","representative sample"],
    paraphrase: ["bias in patient selection","non-representative sampling"],
    templates: [
      "Selection bias may have influenced our results, as patients were recruited from a single center.",
      "To minimize selection bias, we included all consecutive patients meeting the eligibility criteria.",
    ],
  },

  "confounding": {
    ja: "交絡・交絡因子",
    note: "アウトカムと曝露の両方に関連し、真の関連を歪める因子。多変量解析で調整する。",
    section: ["D"],
    synonyms: ["confounding factor","confounder","confounding variable","residual confounding"],
    antonyms: [],
    paraphrase: ["confounding variable","confounding factor"],
    templates: [
      "Residual confounding cannot be excluded, as this was an observational study.",
      "We attempted to control for confounding by including {variables} in the multivariate model.",
    ],
  },

  "clinical implications": {
    ja: "臨床的意義・臨床への示唆",
    note: "研究結果が実臨床に与える示唆。Discussionの後半で述べる。",
    section: ["D"],
    synonyms: ["clinical significance","clinical relevance","practical implications","clinical importance"],
    antonyms: [],
    paraphrase: ["clinical significance","practical relevance","implications for clinical practice"],
    templates: [
      "These findings have important clinical implications for the management of {condition}.",
      "The clinical implications of our findings are that {X} should be considered in {patient population}.",
    ],
  },

  "in conclusion": {
    ja: "結論として・以上をまとめると",
    note: "Discussionの最終段落を導く表現。In summary / To summarizeも同義。",
    section: ["D"],
    synonyms: ["in summary","to summarize","taken together","overall","in closing"],
    antonyms: [],
    paraphrase: ["in summary","to summarize","taken together"],
    templates: [
      "In conclusion, {X} was independently associated with {outcome} in patients with {condition}.",
      "In conclusion, our study demonstrates that {X} is a significant risk factor for {outcome}.",
    ],
  },

  "taken together": {
    ja: "総合すると・これらをまとめると",
    note: "複数の結果・議論をまとめる際の表現。Discussionの末尾で使う。",
    section: ["D"],
    synonyms: ["in conclusion","collectively","overall","together","in summary"],
    antonyms: [],
    paraphrase: ["collectively","overall","in sum"],
    templates: [
      "Taken together, these findings suggest that {X} plays an important role in {outcome}.",
      "Taken together, our results support the notion that {X}.",
    ],
  },

/* ════════════════════════════════════════════
   感染症・抗菌薬・真菌関連
════════════════════════════════════════════ */

  "antimicrobial resistance": {
    ja: "抗菌薬耐性（AMR）",
    note: "微生物が抗菌薬に対して抵抗性を示す性質。antibiotic resistanceより広義で合成抗菌薬も含む。",
    section: ["I","D"],
    synonyms: ["antibiotic resistance","drug resistance","antimicrobial drug resistance","AMR","multidrug resistance","MDR"],
    antonyms: ["susceptibility","antimicrobial susceptibility","drug susceptibility"],
    paraphrase: ["drug resistance","resistance to antimicrobial agents","AMR"],
    templates: [
      "Antimicrobial resistance has emerged as a major public health concern worldwide.",
      "The prevalence of antimicrobial resistance among {organism} isolates was {X}%.",
    ],
  },

  "multidrug resistant": {
    ja: "多剤耐性（MDR）",
    note: "3種類以上の抗菌薬カテゴリに耐性を示す菌。MRSA・MDR-ABなどが代表例。",
    section: ["I","M","R","D"],
    synonyms: ["MDR","extensively drug-resistant","XDR","pan-drug-resistant","PDR","drug-resistant"],
    antonyms: ["susceptible","drug-susceptible","non-resistant"],
    paraphrase: ["MDR","drug-resistant strain","resistant isolate"],
    templates: [
      "Multidrug-resistant {organism} infection was associated with higher mortality.",
      "The proportion of multidrug-resistant isolates increased from {X}% to {Y}% during the study period.",
    ],
  },

  "minimum inhibitory concentration": {
    ja: "最小発育阻止濃度（MIC）",
    note: "細菌の増殖を阻止する抗菌薬の最低濃度。耐性判定のブレイクポイントに使用する。",
    section: ["M","R"],
    synonyms: ["MIC","MIC90","MIC50","inhibitory concentration"],
    antonyms: [],
    paraphrase: ["MIC","inhibitory concentration"],
    templates: [
      "The minimum inhibitory concentration (MIC) was determined by broth microdilution.",
      "MIC breakpoints were defined according to CLSI/EUCAST guidelines.",
      "The MIC90 for {antimicrobial agent} was {value} mg/L.",
    ],
  },

  "breakpoint": {
    ja: "ブレイクポイント（耐性判定基準値）",
    note: "CLSI・EUCASTが定めるMICの閾値。S（感受性）・I（中等度）・R（耐性）の区分に使う。",
    section: ["M"],
    synonyms: ["susceptibility breakpoint","clinical breakpoint","CLSI breakpoint","EUCAST breakpoint"],
    antonyms: [],
    paraphrase: ["clinical susceptibility breakpoint","resistance threshold"],
    templates: [
      "Susceptibility was determined according to CLSI/EUCAST breakpoints.",
      "Isolates were classified as susceptible, intermediate, or resistant based on EUCAST breakpoints.",
    ],
  },

  "bloodstream infection": {
    ja: "血流感染症・菌血症",
    note: "bacteremia（菌血症）やfungemia（真菌血症）を含む総称。BSIと略す。",
    section: ["I","M","R","D"],
    synonyms: ["bacteremia","fungemia","septicemia","BSI","blood culture positive infection"],
    antonyms: [],
    paraphrase: ["BSI","bacteremia","systemic infection"],
    templates: [
      "Bloodstream infection was defined as {definition}.",
      "The incidence of bloodstream infection caused by {organism} was {X} per 1,000 patient-days.",
    ],
  },

  "bacteremia": {
    ja: "菌血症",
    note: "血液中に細菌が存在する状態。bloodstream infectionとほぼ同義。真菌の場合はfungemia。",
    section: ["I","M","R","D"],
    synonyms: ["bloodstream infection","BSI","blood culture bacteremia"],
    antonyms: ["fungemia","viremia"],
    paraphrase: ["bloodstream infection","blood culture–positive infection"],
    templates: [
      "{Organism} bacteremia was diagnosed when {organism} was isolated from {≥1/≥2} blood culture(s).",
      "The 30-day mortality of {organism} bacteremia was {X}%.",
    ],
  },

  "fungemia": {
    ja: "真菌血症",
    note: "血液中に真菌が存在する状態。Candidemia（カンジダ血症）が最も多い。",
    section: ["I","M","R","D"],
    synonyms: ["candidemia","invasive candidiasis","fungal bloodstream infection"],
    antonyms: ["bacteremia","viremia"],
    paraphrase: ["fungal bloodstream infection","invasive fungal infection of the bloodstream"],
    templates: [
      "Candidemia was defined as growth of {Candida} species from {≥1} blood culture(s).",
      "The incidence of candidemia was {X} per 1,000 hospital admissions.",
    ],
  },

  "candidemia": {
    ja: "カンジダ血症",
    note: "Candida属菌による血流感染症。ICU患者・免疫不全患者で重篤になる。",
    section: ["I","M","R","D"],
    synonyms: ["Candida bloodstream infection","invasive candidiasis","fungemia"],
    antonyms: [],
    paraphrase: ["Candida bloodstream infection","invasive Candida infection"],
    templates: [
      "Candidemia was defined as isolation of {Candida} species from {≥1/≥2} blood culture(s).",
      "All-cause 30-day mortality of candidemia was {X}%.",
      "Non-<i>albicans Candida</i> species accounted for {X}% of candidemia cases.",
    ],
  },

  "sepsis": {
    ja: "敗血症",
    note: "感染に対する生体反応によって生命を脅かす臓器障害が生じた状態（Sepsis-3定義）。",
    section: ["I","M","R","D"],
    synonyms: ["septicemia","systemic inflammatory response syndrome","SIRS","septic shock"],
    antonyms: [],
    paraphrase: ["life-threatening organ dysfunction caused by infection","systemic infection with organ failure"],
    templates: [
      "Sepsis was defined according to the Sepsis-3 criteria.",
      "Septic shock was diagnosed when {vasopressors were required/MAP < 65 mmHg}.",
      "{X}% of patients developed sepsis during the study period.",
    ],
  },

  "septic shock": {
    ja: "敗血症性ショック",
    note: "敗血症のうち、昇圧薬を必要とする循環不全と乳酸上昇を伴う状態（Sepsis-3定義）。",
    section: ["I","M","R","D"],
    synonyms: ["refractory septic shock","vasopressor-dependent sepsis"],
    antonyms: [],
    paraphrase: ["vasopressor-requiring septic shock","hemodynamically unstable sepsis"],
    templates: [
      "Septic shock was defined as sepsis with vasopressor requirement and lactate > 2 mmol/L.",
      "Septic shock occurred in {X}% of patients.",
    ],
  },

  "immunocompromised": {
    ja: "免疫不全・免疫抑制状態",
    note: "造血幹細胞移植・固形臓器移植・HIV感染・化学療法中などの状態。真菌感染症のリスク因子。",
    section: ["I","M","R","D"],
    synonyms: ["immunosuppressed","immunodeficient","immune-compromised","immunocompromised host"],
    antonyms: ["immunocompetent","immunologically normal"],
    paraphrase: ["immunosuppressed patients","patients with impaired immunity"],
    templates: [
      "Immunocompromised patients included those with {hematological malignancy/solid organ transplant/HIV}.",
      "The risk of invasive fungal infection is markedly elevated in immunocompromised hosts.",
    ],
  },

  "neutropenia": {
    ja: "好中球減少症",
    note: "好中球数 < 500/μLまたは < 1000/μLで500以下への減少が予期される状態。感染リスクが高い。",
    section: ["I","M","R","D"],
    synonyms: ["neutropenic","febrile neutropenia","granulocytopenia","agranulocytosis"],
    antonyms: ["neutrophilia","normal neutrophil count"],
    paraphrase: ["low neutrophil count","granulocytopenia"],
    templates: [
      "Neutropenia was defined as an absolute neutrophil count of less than {500/1000} cells/μL.",
      "Febrile neutropenia was present in {X}% of patients at the time of diagnosis.",
    ],
  },

  "central venous catheter": {
    ja: "中心静脈カテーテル（CVC）",
    note: "菌血症・カンジダ血症のリスク因子。カテーテル関連血流感染症（CRBSI）の原因となる。",
    section: ["M","R"],
    synonyms: ["CVC","central line","central venous line","CRBSI","catheter-related bloodstream infection"],
    antonyms: [],
    paraphrase: ["CVC","central line","intravascular catheter"],
    templates: [
      "Central venous catheter removal was performed within {X} hours of candidemia diagnosis.",
      "CVC presence was identified as an independent risk factor for {outcome}.",
    ],
  },

  "intensive care unit": {
    ja: "集中治療室（ICU）",
    note: "重篤患者の管理を行う特殊病棟。ICU入室はリスク因子として報告されることが多い。",
    section: ["I","M","R"],
    synonyms: ["ICU","critical care unit","ICU admission","intensive care","ICU stay"],
    antonyms: ["general ward","non-ICU","step-down unit"],
    paraphrase: ["ICU","critical care setting"],
    templates: [
      "Patients admitted to the intensive care unit (ICU) were included.",
      "ICU admission was identified as an independent risk factor for {outcome}.",
      "The median ICU length of stay was {X} days (IQR {lower}–{upper}).",
    ],
  },

  "length of stay": {
    ja: "在院日数・入院期間",
    note: "入院から退院までの日数。ICU在室期間（ICU length of stay）と区別する。",
    section: ["R"],
    synonyms: ["LOS","hospital stay","duration of hospitalization","days of hospitalization"],
    antonyms: [],
    paraphrase: ["LOS","duration of hospital admission","hospital length of stay"],
    templates: [
      "The median hospital length of stay was {X} days (IQR {lower}–{upper}).",
      "Infection with {organism} was associated with prolonged hospital length of stay.",
    ],
  },

  "antifungal therapy": {
    ja: "抗真菌療法・抗真菌薬治療",
    note: "真菌感染症に対する薬物療法の総称。echinocandin、アゾール、アムホテリシンBが主要薬。",
    section: ["M","R","D"],
    synonyms: ["antifungal treatment","antifungal agent","antifungal prophylaxis","empirical antifungal therapy"],
    antonyms: ["antibacterial therapy","antimicrobial therapy"],
    paraphrase: ["antifungal treatment","treatment with antifungal agents"],
    templates: [
      "Antifungal therapy was initiated within {X} hours of positive blood culture.",
      "Echinocandin-based antifungal therapy was administered as first-line treatment.",
      "Empirical antifungal therapy was started in {X}% of patients.",
    ],
  },

  "echinocandin": {
    ja: "エキノカンジン系抗真菌薬",
    note: "カンジダ血症のガイドライン推奨一次治療薬。カスポファンギン・ミカファンギン・アニデュラファンギンが含まれる。",
    section: ["M","R","D"],
    synonyms: ["caspofungin","micafungin","anidulafungin","echinocandin antifungal"],
    antonyms: ["azole","fluconazole","amphotericin B","triazole"],
    paraphrase: ["echinocandin antifungal agent","echinocandin class antifungal"],
    templates: [
      "An echinocandin was used as initial antifungal therapy in {X}% of patients.",
      "IDSA/ESCMID guidelines recommend echinocandin as first-line therapy for candidemia.",
    ],
  },

  "azole": {
    ja: "アゾール系抗真菌薬",
    note: "フルコナゾール・ボリコナゾール・イトラコナゾールなどを含む。CYP450阻害による薬物相互作用に注意。",
    section: ["M","R","D"],
    synonyms: ["triazole","fluconazole","voriconazole","itraconazole","posaconazole","isavuconazole"],
    antonyms: ["echinocandin","amphotericin B","polyene"],
    paraphrase: ["azole antifungal","triazole antifungal agent"],
    templates: [
      "Step-down therapy to oral fluconazole was performed after {X} days of echinocandin treatment.",
      "Azole resistance was detected in {X}% of {Candida} isolates.",
    ],
  },

  "amphotericin b": {
    ja: "アムホテリシンB",
    note: "ポリエン系抗真菌薬。広域スペクトルを持つが腎毒性が問題。liposomal製剤（L-AMB）が使用される。",
    section: ["M","R","D"],
    synonyms: ["AmB","liposomal amphotericin B","L-AMB","amphotericin B deoxycholate","polyene antifungal"],
    antonyms: ["echinocandin","azole","triazole"],
    paraphrase: ["AmB","liposomal amphotericin B (L-AMB)"],
    templates: [
      "Liposomal amphotericin B was used in patients with {echinocandin resistance/renal failure}.",
      "Amphotericin B deoxycholate was replaced by liposomal formulation due to nephrotoxicity.",
    ],
  },

  "source control": {
    ja: "ソースコントロール・感染源の制御",
    note: "感染巣の排除・カテーテル抜去・外科的ドレナージなどによる感染源の管理。",
    section: ["M","R","D"],
    synonyms: ["source removal","catheter removal","surgical drainage","infection source control"],
    antonyms: [],
    paraphrase: ["removal of the infectious source","elimination of the infection focus"],
    templates: [
      "Source control, including removal of the central venous catheter, was performed in {X}% of patients.",
      "Failure to achieve source control was associated with increased mortality.",
    ],
  },

  "drug-resistant": {
    ja: "薬剤耐性の・薬剤耐性を示す",
    note: "抗菌薬・抗真菌薬に耐性を持つ微生物を指す。",
    section: ["I","M","R","D"],
    synonyms: ["resistant","antimicrobial-resistant","antibiotic-resistant","multidrug-resistant","MDR"],
    antonyms: ["susceptible","drug-susceptible","sensitive"],
    paraphrase: ["antimicrobial-resistant","resistant to {drug}"],
    templates: [
      "Drug-resistant {organism} infection was associated with worse clinical outcomes.",
      "The proportion of drug-resistant isolates increased significantly over the study period.",
    ],
  },

  "blood culture": {
    ja: "血液培養",
    note: "菌血症・敗血症の診断の基本的な検査。採取タイミングと本数が重要。",
    section: ["M","R"],
    synonyms: ["blood culture result","positive blood culture","blood culture positivity"],
    antonyms: ["negative blood culture"],
    paraphrase: ["blood culture result","blood culture isolate"],
    templates: [
      "Bacteremia was confirmed by {≥1} positive blood culture(s) with {organism}.",
      "Blood cultures were obtained from all patients before initiation of {antimicrobial therapy}.",
    ],
  },

  "time to treatment": {
    ja: "治療開始までの時間",
    note: "診断または感染確定から適切な抗菌薬・抗真菌薬開始までの時間。転帰と関連することが多い。",
    section: ["M","R","D"],
    synonyms: ["time to appropriate therapy","time to effective treatment","treatment delay","time to antifungal therapy"],
    antonyms: [],
    paraphrase: ["time to initiation of appropriate therapy","delay to treatment"],
    templates: [
      "The median time to initiation of {antifungal/antimicrobial} therapy was {X} hours.",
      "Delayed treatment (> {X} hours) was an independent risk factor for {outcome}.",
    ],
  },

  "catheter-related": {
    ja: "カテーテル関連の",
    note: "中心静脈カテーテル（CVC）や尿道カテーテルに関連した感染症を指す。",
    section: ["I","M","R"],
    synonyms: ["catheter-associated","device-related","CRBSI","CAUTI","catheter-related bloodstream infection"],
    antonyms: ["community-acquired","non-catheter-related"],
    paraphrase: ["catheter-associated","device-related infection"],
    templates: [
      "Catheter-related bloodstream infection (CRBSI) was defined as {definition}.",
      "Catheter-related infection occurred in {X}% of patients.",
    ],
  },

  "healthcare-associated": {
    ja: "医療関連の・院内の",
    note: "医療機関での曝露に関連した感染症。hospital-acquired（院内感染）やnosocomial infectionと同義。",
    section: ["I","M","R"],
    synonyms: ["hospital-acquired","nosocomial","hospital-associated","healthcare-associated infection","HAI"],
    antonyms: ["community-acquired","community-onset"],
    paraphrase: ["nosocomial","hospital-acquired","hospital-associated"],
    templates: [
      "Healthcare-associated infections were defined as those occurring > {48} hours after admission.",
      "Healthcare-associated {bacteremia/candidemia} accounted for {X}% of all cases.",
    ],
  },

  "community-acquired": {
    ja: "市中感染・市中発症",
    note: "入院前または入院後48時間以内に発症した感染症。hospital-acquired（院内感染）と対比される。",
    section: ["I","M","R"],
    synonyms: ["community-onset","outpatient-acquired"],
    antonyms: ["healthcare-associated","hospital-acquired","nosocomial"],
    paraphrase: ["community-onset infection","outpatient-acquired infection"],
    templates: [
      "Community-acquired {infection} was defined as diagnosis within {48} hours of admission.",
      "Community-acquired {pneumonia/bacteremia} accounted for {X}% of cases.",
    ],
  },

  "empirical therapy": {
    ja: "経験的治療・経験的療法",
    note: "起因菌や感受性が判明する前に開始する治療。targeted therapyと対比される。",
    section: ["M","R","D"],
    synonyms: ["empirical treatment","empiric therapy","empiric treatment","initial therapy","presumptive therapy"],
    antonyms: ["targeted therapy","definitive therapy","pathogen-directed therapy"],
    paraphrase: ["empiric therapy","presumptive treatment","initial broad-spectrum treatment"],
    templates: [
      "Empirical {antimicrobial/antifungal} therapy was initiated before culture results were available.",
      "Appropriateness of empirical therapy was assessed based on {culture/susceptibility} results.",
    ],
  },

  "targeted therapy": {
    ja: "標的治療・感受性に基づく治療",
    note: "起因菌・感受性結果に基づいて選択された治療。empirical therapyから変更される。",
    section: ["M","R","D"],
    synonyms: ["definitive therapy","pathogen-directed therapy","de-escalation","step-down therapy"],
    antonyms: ["empirical therapy","empiric therapy","broad-spectrum therapy"],
    paraphrase: ["definitive therapy","culture-directed therapy","pathogen-specific treatment"],
    templates: [
      "Therapy was de-escalated to targeted treatment based on {culture/susceptibility} results.",
      "Targeted antifungal therapy was initiated after susceptibility testing.",
    ],
  },

/* ════════════════════════════════════════════
   接続表現・論理語
════════════════════════════════════════════ */

  "however": {
    ja: "しかしながら・しかし",
    note: "先行内容と対照的な内容を導く接続副詞。Introductionで知識欠落を示す前によく用いられる。",
    section: ["I","D"],
    synonyms: ["nevertheless","nonetheless","yet","despite this","on the other hand","in contrast","that said"],
    antonyms: ["furthermore","moreover","additionally","similarly","likewise"],
    paraphrase: ["nevertheless","despite this","on the other hand"],
    templates: [
      "However, {X} remains unclear.",
      "However, data on {X} are limited.",
      "However, no previous study has investigated {X} in {population}.",
    ],
  },

  "furthermore": {
    ja: "さらに・加えて",
    note: "前の内容に追加情報を加える接続副詞。",
    section: ["I","D"],
    synonyms: ["moreover","additionally","in addition","also","besides","what is more","additionally"],
    antonyms: ["however","in contrast","on the other hand","conversely"],
    paraphrase: ["moreover","in addition","additionally"],
    templates: [
      "Furthermore, {X} was associated with {outcome}.",
      "Furthermore, our study provides the first evidence that {X}.",
    ],
  },

  "moreover": {
    ja: "さらに・その上",
    note: "furthermoreとほぼ同義。前の議論に重要な追加情報を加える。",
    section: ["I","D"],
    synonyms: ["furthermore","additionally","in addition","also","besides"],
    antonyms: ["however","in contrast","conversely"],
    paraphrase: ["furthermore","in addition","additionally"],
    templates: [
      "Moreover, {X} was independently associated with {outcome}.",
      "Moreover, this association persisted after adjustment for {confounders}.",
    ],
  },

  "therefore": {
    ja: "したがって・そのため",
    note: "前の内容から論理的に導かれる結論を示す。thus / consequentlyも同義。",
    section: ["I","D"],
    synonyms: ["thus","consequently","hence","as a result","accordingly","for this reason"],
    antonyms: ["however","in contrast","despite"],
    paraphrase: ["thus","consequently","as a result"],
    templates: [
      "Therefore, we aimed to {investigate/evaluate/compare} {X}.",
      "Therefore, the aim of this study was to {clarify/determine} {X}.",
    ],
  },

  "notably": {
    ja: "注目すべきことに・特筆すべきは",
    note: "特に重要な発見や驚くべき結果を強調する際に用いる副詞。",
    section: ["R","D"],
    synonyms: ["importantly","remarkably","of note","interestingly","strikingly"],
    antonyms: [],
    paraphrase: ["importantly","of note","interestingly"],
    templates: [
      "Notably, {X} was significantly higher in {group} than in {group}.",
      "Notably, this is the first study to demonstrate {finding}.",
    ],
  },

  "interestingly": {
    ja: "興味深いことに",
    note: "予想外または示唆に富む結果を強調する副詞。Discussionで使いやすい。",
    section: ["R","D"],
    synonyms: ["notably","of interest","surprisingly","intriguingly","remarkably"],
    antonyms: [],
    paraphrase: ["of note","notably","remarkably"],
    templates: [
      "Interestingly, {X} was not associated with {outcome} in our cohort.",
      "Interestingly, the association between {A} and {B} was observed only in {subgroup}.",
    ],
  },

  "respectively": {
    ja: "それぞれ・各々",
    note: "複数の値・グループを対応させて記述する際の副詞。文末に置くことが多い。",
    section: ["R"],
    synonyms: ["in that order","correspondingly"],
    antonyms: [],
    paraphrase: ["in that order","correspondingly"],
    templates: [
      "The sensitivity and specificity were {X}% and {Y}%, respectively.",
      "Mortality was {X}%, {Y}%, and {Z}% in {groups A, B, and C}, respectively.",
    ],
  },

  "overall": {
    ja: "全体として・総じて・全体の",
    note: "集団全体の結果を示す副詞・形容詞。",
    section: ["R","D"],
    synonyms: ["in total","in aggregate","collectively","as a whole","in general"],
    antonyms: ["specifically","individually","per subgroup"],
    paraphrase: ["in total","as a whole","collectively"],
    templates: [
      "Overall, {X}% of patients experienced {outcome}.",
      "The overall {30-day mortality/survival rate} was {X}%.",
    ],
  },

};

/* ════════════════════════════════════════════
   ルックアップ関数
════════════════════════════════════════════ */

/**
 * lookupPhrase — 完全一致優先・部分一致は「関連フレーズ」として分離返却
 *
 * 返り値の構造:
 *   {
 *     matched     : string          // マッチしたDBキー（完全一致時 = phrase）
 *     ja, note, section, ...        // 辞書エントリ本体（完全一致時のみ）
 *     relatedPhrases: [             // 部分一致した関連フレーズ（補足情報）
 *       { key, ja, matchType }      // matchType: 'sub'(keyがphrase内) | 'super'(phraseがkey内)
 *     ]
 *   }
 *   完全一致なし かつ 関連なし → null
 *
 * ルール:
 *   1. 完全一致のみ → DBエントリをそのまま返す（relatedPhrasesは空）
 *   2. 部分一致のみ → entry本体はnull相当（ja/noteなし）、relatedPhrasesのみ返す
 *   3. 完全一致あり → entry本体 + 関連フレーズも付加
 *
 * ※ 単語レベル（unigram）の includes() 誤判定を防ぐため、
 *   部分一致は「単語境界」を考慮した照合に限定する。
 * @param {string} phrase
 * @returns {object|null}
 */
function lookupPhrase(phrase) {
  const key = phrase.toLowerCase().trim();

  // ── ヘルパー：単語境界付き部分一致 ──
  // "blood" が "bloodstream" にヒットしないよう、
  // マッチ前後が単語構成文字でないことを確認する
  function wordBoundaryIncludes(haystack, needle) {
    const idx = haystack.indexOf(needle);
    if (idx === -1) return false;
    const before = idx === 0             || !/\w/.test(haystack[idx - 1]);
    const after  = idx + needle.length === haystack.length || !/\w/.test(haystack[idx + needle.length]);
    return before && after;
  }

  // ── 1. 完全一致 ──
  const exactEntry = PHRASE_DB[key];

  // ── 2. 部分一致（関連フレーズ収集）──
  //   a. DBキーがフレーズに含まれる（sub: keyはphraseの部分）
  //   b. フレーズがDBキーに含まれる（super: phraseはkeyの部分）
  const related = [];
  for (const [k, v] of Object.entries(PHRASE_DB)) {
    if (k === key) continue; // 完全一致は除外
    if (wordBoundaryIncludes(key, k)) {
      // phrase が k を含む → kはsubphrase
      related.push({ key: k, ja: v.ja, matchType: 'sub' });
    } else if (wordBoundaryIncludes(k, key)) {
      // k が phrase を含む → phraseはkのsubword
      related.push({ key: k, ja: v.ja, matchType: 'super' });
    }
  }
  // 関連フレーズは長い順に並べる（より具体的なものを上位に）
  related.sort((a, b) => b.key.length - a.key.length);

  // ── 返却 ──
  if (exactEntry) {
    // 完全一致あり：エントリ本体 + 関連フレーズ
    return { ...exactEntry, matched: key, relatedPhrases: related };
  }
  if (related.length > 0) {
    // 部分一致のみ：エントリ本体なし、関連フレーズのみ返す
    return { matched: null, ja: null, note: null, section: [],
             synonyms: [], antonyms: [], paraphrase: [], templates: [],
             relatedPhrases: related };
  }
  return null;
}
