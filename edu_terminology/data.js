const medicalData = [

  // ─── 動詞：調査・実施 ───────────────────────────────────────
  {
    type: 'verb', level: 'basic', category: '調査・実施',
    term: 'conduct / perform',
    meaning: '研究や解析を「実施する」',
    nuance: '研究全体・手順の実行を表す最も汎用的な動詞。conduct は計画的な実施、perform はより技術的・手技的な実施に使われる傾向がある。',
    imrad: ['Methods'],
    synonyms: ['carry out', 'undertake', 'execute'],
    antonyms: ['abandon', 'halt'],
    example: 'We conducted a prospective cohort study to evaluate the efficacy of [intervention] in patients with [condition].'
  },
  {
    type: 'verb', level: 'basic', category: '調査・実施',
    term: 'enroll / recruit',
    meaning: '被験者を「登録・リクルートする」',
    nuance: 'enroll は正式な登録、recruit は積極的な勧誘・募集のニュアンス。両者はほぼ同義で使われる。',
    imrad: ['Methods'],
    synonyms: ['include', 'register', 'invite'],
    antonyms: ['exclude', 'withdraw'],
    example: 'A total of 120 patients were enrolled between January 2022 and December 2023.'
  },
  {
    type: 'verb', level: 'basic', category: '調査・実施',
    term: 'exclude',
    meaning: '基準外の対象を「除外する」',
    nuance: 'inclusion criteria（選択基準）と対になるexclusion criteria（除外基準）に基づく操作。Methods冒頭で必ず登場する。',
    imrad: ['Methods'],
    synonyms: ['omit', 'remove', 'eliminate'],
    antonyms: ['include', 'enroll'],
    example: 'Patients with severe renal impairment were excluded from the analysis.'
  },
  {
    type: 'verb', level: 'basic', category: '調査・実施',
    term: 'assign / allocate',
    meaning: '対象を群に「割り当てる」',
    nuance: 'RCTで必ず登場。randomly assignedは「ランダムに割り付けられた」の定型表現。allocateはリソースの配分にも使われる。',
    imrad: ['Methods'],
    synonyms: ['randomize', 'distribute', 'stratify'],
    antonyms: ['pool', 'combine'],
    example: 'Participants were randomly assigned to either the treatment group or the placebo group.'
  },
  {
    type: 'verb', level: 'basic', category: '調査・実施',
    term: 'administer',
    meaning: '薬剤などを「投与する」',
    nuance: '薬剤・治療の投与に特化した動詞。「管理する・運営する」の意味もあるが医学論文ではほぼ投与の意。',
    imrad: ['Methods'],
    synonyms: ['give', 'prescribe', 'apply'],
    antonyms: ['withhold', 'discontinue'],
    example: 'The drug was administered orally at a dose of 10 mg once daily for 12 weeks.'
  },
  {
    type: 'verb', level: 'intermediate', category: '調査・実施',
    term: 'stratify',
    meaning: 'グループを「層別化する」',
    nuance: '交絡因子の影響を制御するために集団を複数のサブグループに分ける操作。「stratified by age and sex」の形が頻出。',
    imrad: ['Methods', 'Results'],
    synonyms: ['subgroup', 'categorize', 'classify'],
    antonyms: ['pool', 'aggregate'],
    example: 'Patients were stratified by disease severity and age before randomization.'
  },
  {
    type: 'verb', level: 'intermediate', category: '調査・実施',
    term: 'adjust',
    meaning: '交絡因子などを「調整する」',
    nuance: '多変量解析での「調整済みオッズ比（adjusted OR）」など。統計モデルで共変量を制御することを指す。',
    imrad: ['Methods', 'Results'],
    synonyms: ['control for', 'correct', 'calibrate'],
    antonyms: ['ignore', 'disregard'],
    example: 'All analyses were adjusted for age, sex, and comorbidities.'
  },
  {
    type: 'verb', level: 'advanced', category: '調査・実施',
    term: 'extrapolate',
    meaning: '結果を他集団・状況へ「外挿する」',
    nuance: '得られた知見を研究外の集団や状況へ拡大解釈すること。「外挿できない」という限界の提示でも使われる。',
    imrad: ['Discussion'],
    synonyms: ['generalize', 'project', 'extend'],
    antonyms: ['restrict', 'limit'],
    example: 'These findings cannot be directly extrapolated to pediatric populations.'
  },

  // ─── 動詞：結果の提示 ──────────────────────────────────────
  {
    type: 'verb', level: 'basic', category: '結果の提示',
    term: 'show / demonstrate',
    meaning: '明確に「示す・証明する」',
    nuance: 'showは中立的。demonstrateはより強い証明のニュアンスがあり、エビデンスレベルが高いときに好まれる。',
    imrad: ['Results', 'Discussion'],
    synonyms: ['reveal', 'indicate', 'prove'],
    antonyms: ['conceal', 'contradict'],
    example: 'The results demonstrate a significant reduction in mortality among the treated group.'
  },
  {
    type: 'verb', level: 'basic', category: '結果の提示',
    term: 'indicate / suggest',
    meaning: 'データが「示す・示唆する」',
    nuance: 'indicateはより直接的な含意、suggestは「可能性がある」という不確実性を伴う。証拠の強さで使い分ける。',
    imrad: ['Results', 'Discussion'],
    synonyms: ['imply', 'show', 'point to'],
    antonyms: ['contradict', 'refute'],
    example: 'These findings suggest that inflammation may play a key role in disease progression.'
  },
  {
    type: 'verb', level: 'basic', category: '結果の提示',
    term: 'reveal',
    meaning: '隠れていた事実を「明らかにする」',
    nuance: '以前は知られていなかった情報を開示するニュアンスが強い。新発見・新知見を提示するときに適切。',
    imrad: ['Results', 'Introduction'],
    synonyms: ['uncover', 'disclose', 'expose'],
    antonyms: ['conceal', 'mask'],
    example: 'Subgroup analysis revealed that elderly patients showed a notably stronger response.'
  },
  {
    type: 'verb', level: 'intermediate', category: '結果の提示',
    term: 'observe',
    meaning: '現象を「認める・観察する」',
    nuance: '研究者が直接見た・記録した事実を述べるときに使う。「we observed that...」は主観を含まない客観的記述として好まれる。',
    imrad: ['Results'],
    synonyms: ['note', 'find', 'detect'],
    antonyms: ['overlook', 'miss'],
    example: 'A dose-dependent response was observed across all treatment groups.'
  },
  {
    type: 'verb', level: 'intermediate', category: '結果の提示',
    term: 'identify',
    meaning: '原因・因子・群を「特定する」',
    nuance: '漠然とした状態から具体的な対象を絞り込む意味合い。「identified as a risk factor」などの形で頻出。',
    imrad: ['Results', 'Discussion'],
    synonyms: ['determine', 'pinpoint', 'ascertain'],
    antonyms: ['overlook', 'miss'],
    example: 'Multivariate analysis identified hypertension as an independent predictor of adverse outcomes.'
  },
  {
    type: 'verb', level: 'advanced', category: '結果の提示',
    term: 'elucidate',
    meaning: 'メカニズム・機序を「解明する」',
    nuance: '単なるデータ提示を超えて機序・原理を明らかにすることを指す格調高い語。Discussionでよく使われる。',
    imrad: ['Introduction', 'Discussion'],
    synonyms: ['clarify', 'explain', 'illuminate'],
    antonyms: ['obscure', 'confound'],
    example: 'The present study aimed to elucidate the molecular mechanisms underlying treatment resistance.'
  },

  // ─── 動詞：比較・分析 ──────────────────────────────────────
  {
    type: 'verb', level: 'basic', category: '比較・分析',
    term: 'evaluate / assess',
    meaning: '効果や質を「評価・査定する」',
    nuance: 'evaluateはより包括的・定性的な評価、assessはより具体的・定量的な測定に近いが、ほぼ同義として使われる。',
    imrad: ['Methods', 'Results'],
    synonyms: ['measure', 'appraise', 'examine'],
    antonyms: ['ignore', 'overlook'],
    example: 'The primary endpoint was to assess overall survival at 12 months post-treatment.'
  },
  {
    type: 'verb', level: 'basic', category: '比較・分析',
    term: 'compare',
    meaning: 'AとBを「比較する」',
    nuance: '最も基本的な比較動詞。「compared with / to」の前置詞の選択に注意（with = 並置、to = 対比）。',
    imrad: ['Methods', 'Results'],
    synonyms: ['contrast', 'juxtapose'],
    antonyms: ['pool', 'combine'],
    example: 'Outcomes were compared between the intervention and control groups using the chi-square test.'
  },
  {
    type: 'verb', level: 'intermediate', category: '比較・分析',
    term: 'correlate / associate',
    meaning: '因子間に「相関・関連がある」',
    nuance: 'correlate は統計的相関（r値など）に使い、associate は疫学的関連（OR, RRなど）に使う傾向がある。因果関係は含意しない。',
    imrad: ['Results', 'Discussion'],
    synonyms: ['relate', 'link', 'connect'],
    antonyms: ['dissociate', 'unlink'],
    example: 'Elevated CRP levels were significantly associated with 30-day readmission.'
  },
  {
    type: 'verb', level: 'advanced', category: '比較・分析',
    term: 'quantify',
    meaning: '性質や変化を「数値化・定量化する」',
    nuance: '定性的な観察を数値として表現する操作。「quantify the magnitude of effect」などメタ解析でも頻出。',
    imrad: ['Methods', 'Results'],
    synonyms: ['measure', 'enumerate', 'calculate'],
    antonyms: ['estimate roughly', 'approximate'],
    example: 'We sought to quantify the burden of antibiotic-resistant infections in tertiary hospitals.'
  },

  // ─── 動詞：影響・因果 ──────────────────────────────────────
  {
    type: 'verb', level: 'basic', category: '影響・因果',
    term: 'affect / influence',
    meaning: '〜に「影響を与える」',
    nuance: 'affectはより直接的・客観的、influenceは長期的・間接的なニュアンス。結果変数に対して使われることが多い。',
    imrad: ['Results', 'Discussion'],
    synonyms: ['impact', 'alter', 'modify'],
    antonyms: ['spare', 'leave unchanged'],
    example: 'Comorbid conditions significantly affected the rate of postoperative complications.'
  },
  {
    type: 'verb', level: 'basic', category: '影響・因果',
    term: 'inhibit / suppress',
    meaning: '反応・機能を「抑制・阻害する」',
    nuance: 'inhibit は特定の酵素・受容体への作用（IC50など）で使い、suppress はより広い意味での抑制（免疫抑制など）に使う。',
    imrad: ['Results', 'Discussion'],
    synonyms: ['block', 'reduce', 'attenuate'],
    antonyms: ['promote', 'activate', 'enhance'],
    example: 'The compound inhibited tumor cell proliferation in a dose-dependent manner.'
  },
  {
    type: 'verb', level: 'intermediate', category: '影響・因果',
    term: 'exacerbate',
    meaning: '症状や状態を「悪化させる」',
    nuance: '既存の問題をさらに悪くするという強い含意。「worsen」より学術的。',
    imrad: ['Discussion'],
    synonyms: ['worsen', 'aggravate', 'deteriorate'],
    antonyms: ['alleviate', 'ameliorate', 'mitigate'],
    example: 'Delayed treatment was found to exacerbate inflammatory responses and worsen prognosis.'
  },
  {
    type: 'verb', level: 'intermediate', category: '影響・因果',
    term: 'alleviate / ameliorate',
    meaning: '苦痛や状態を「緩和・改善する」',
    nuance: 'alleviateは症状・苦痛の軽減、ameliorateは状態全体の改善。どちらも根治ではなく緩和・改善を指す。',
    imrad: ['Results', 'Discussion'],
    synonyms: ['reduce', 'relieve', 'improve'],
    antonyms: ['exacerbate', 'worsen'],
    example: 'Early intervention effectively alleviated pain and improved functional outcomes.'
  },
  {
    type: 'verb', level: 'advanced', category: '影響・因果',
    term: 'mediate',
    meaning: '因子が作用を「仲介・媒介する」',
    nuance: '因果経路の中間に位置するメカニズムを示す。「X mediates the effect of A on B」という構文で使われる。統計でも媒介分析（mediation analysis）の文脈で登場。',
    imrad: ['Discussion'],
    synonyms: ['intermediate', 'bridge', 'relay'],
    antonyms: ['directly cause'],
    example: 'Oxidative stress was found to mediate the cytotoxic effects of the compound on cardiac cells.'
  },
  {
    type: 'verb', level: 'advanced', category: '影響・因果',
    term: 'modulate',
    meaning: '機能・応答を「調節・変調する」',
    nuance: '増減どちらにも変化させるというニュアンスで、promotionともinhibitionとも異なる。免疫調節・神経変調などで好まれる。',
    imrad: ['Results', 'Discussion'],
    synonyms: ['regulate', 'adjust', 'fine-tune'],
    antonyms: ['disrupt', 'destabilize'],
    example: 'Gut microbiota can modulate systemic immune responses via multiple signaling pathways.'
  },

  // ─── 動詞：考察・主張 ──────────────────────────────────────
  {
    type: 'verb', level: 'basic', category: '考察・主張',
    term: 'conclude',
    meaning: '最終的な「結論を出す」',
    nuance: 'Discussionの末尾や要旨で使う。「we conclude that...」は根拠に基づく主張として強い確信を示す。',
    imrad: ['Discussion'],
    synonyms: ['determine', 'establish', 'infer'],
    antonyms: ['question', 'dispute'],
    example: 'In conclusion, the present findings suggest that early screening may reduce disease burden.'
  },
  {
    type: 'verb', level: 'intermediate', category: '考察・主張',
    term: 'postulate / hypothesize',
    meaning: '仮説を「立てる・前提とする」',
    nuance: 'postulate はより確信度高く前提として置く、hypothesize は検証を前提とした仮説提示。Introductionで目的・仮説を述べる際に使う。',
    imrad: ['Introduction', 'Discussion'],
    synonyms: ['propose', 'speculate', 'assume'],
    antonyms: ['confirm', 'verify'],
    example: 'We hypothesized that early administration would result in improved survival outcomes.'
  },
  {
    type: 'verb', level: 'intermediate', category: '考察・主張',
    term: 'confirm / validate',
    meaning: '妥当性・仮説を「確認・検証する」',
    nuance: 'confirmは既知の事実の再確認、validateはツールや方法の妥当性検証に使われることが多い。',
    imrad: ['Results', 'Discussion'],
    synonyms: ['verify', 'corroborate', 'support'],
    antonyms: ['refute', 'contradict'],
    example: 'These results confirm the findings of previous randomized controlled trials.'
  },
  {
    type: 'verb', level: 'advanced', category: '考察・主張',
    term: 'warrant',
    meaning: 'さらなる調査・研究を「必要とする・正当化する」',
    nuance: '「warrant further investigation」は研究の限界を述べつつ今後の展望を示す定型表現。Discussionの末尾に頻出。',
    imrad: ['Discussion'],
    synonyms: ['justify', 'necessitate', 'merit'],
    antonyms: ['preclude', 'discourage'],
    example: 'The inconsistency in our results warrants further investigation in larger prospective studies.'
  },
  {
    type: 'verb', level: 'advanced', category: '考察・主張',
    term: 'speculate',
    meaning: '根拠のある「論理的推測を行う」',
    nuance: '証拠のみでは断言できない場合に使う。「we speculate that...」は推測であることを明示する誠実な表現。使いすぎると論証力が低下する。',
    imrad: ['Discussion'],
    synonyms: ['conjecture', 'suppose', 'theorize'],
    antonyms: ['confirm', 'demonstrate'],
    example: 'We speculate that the observed difference may reflect underlying genetic heterogeneity.'
  },

  // ─── 形容詞：重要性 ───────────────────────────────────────
  {
    type: 'adj', level: 'basic', category: '重要性',
    term: 'significant',
    meaning: '統計的に「有意な」・量的に「重要な」',
    nuance: '医学論文では主にstatistically significant（p<0.05など）の意で使う。「clinically significant」は臨床的重要性を指し区別が重要。',
    imrad: ['Results', 'Discussion'],
    synonyms: ['substantial', 'meaningful', 'marked'],
    antonyms: ['negligible', 'marginal', 'trivial'],
    example: 'The intervention resulted in a statistically significant reduction in systolic blood pressure (p = 0.003).'
  },
  {
    type: 'adj', level: 'basic', category: '重要性',
    term: 'substantial / considerable',
    meaning: '数量・影響が「かなりの・相当な」',
    nuance: 'statisticallyを伴わず量的な大きさを表す際に使う。「substantial improvement」は統計検定なしに大きな改善を示す。',
    imrad: ['Results', 'Discussion'],
    synonyms: ['notable', 'marked', 'appreciable'],
    antonyms: ['minimal', 'modest', 'slight'],
    example: 'A substantial reduction in hospitalization rates was observed in the intervention arm.'
  },
  {
    type: 'adj', level: 'intermediate', category: '重要性',
    term: 'pivotal / crucial',
    meaning: '結論を左右する「極めて重要な」',
    nuance: 'pivotal は転換点・分岐点となるニュアンス（pivotal trial）、crucial は欠くことのできない必須性を強調する。',
    imrad: ['Introduction', 'Discussion'],
    synonyms: ['critical', 'key', 'essential'],
    antonyms: ['trivial', 'secondary', 'peripheral'],
    example: 'This pivotal trial established the new standard of care for metastatic colorectal cancer.'
  },
  {
    type: 'adj', level: 'advanced', category: '重要性',
    term: 'seminal',
    meaning: '後続研究に影響を与えた「画期的・先駆的な」',
    nuance: '他の研究に多大な影響を与えた先行論文を指す。「seminal work/study/paper」の形で使われる称賛の語。',
    imrad: ['Introduction'],
    synonyms: ['landmark', 'groundbreaking', 'pioneering'],
    antonyms: ['derivative', 'marginal'],
    example: 'The seminal work by Smith et al. first described the molecular basis of this pathway.'
  },

  // ─── 形容詞：関連性 ───────────────────────────────────────
  {
    type: 'adj', level: 'basic', category: '関連性',
    term: 'consistent',
    meaning: '先行研究・他のデータと「一致している」',
    nuance: '「consistent with previous findings」は先行研究との整合性を示す定型表現。Discussion で自分の結果を位置づける際に必須。',
    imrad: ['Discussion'],
    synonyms: ['concordant', 'aligned', 'in line with'],
    antonyms: ['inconsistent', 'contradictory', 'discordant'],
    example: 'These results are consistent with those of prior meta-analyses on the same topic.'
  },
  {
    type: 'adj', level: 'intermediate', category: '関連性',
    term: 'robust',
    meaning: '統計的・科学的に「強固な・信頼できる」',
    nuance: '感度分析やサブグループ解析でも結果が変わらないことを示す。「robust findings」は結論の安定性を強調する。',
    imrad: ['Results', 'Discussion'],
    synonyms: ['strong', 'solid', 'reliable'],
    antonyms: ['fragile', 'unstable', 'weak'],
    example: 'The association remained robust across multiple sensitivity analyses.'
  },
  {
    type: 'adj', level: 'advanced', category: '関連性',
    term: 'confounded',
    meaning: '「交絡のある・バイアスを受けた」',
    nuance: '交絡因子（confounder）によって真の関連が歪められた状態。「confounded by...」という形でMethodsやLimitationsで登場する。',
    imrad: ['Methods', 'Discussion'],
    synonyms: ['biased', 'distorted', 'influenced by'],
    antonyms: ['adjusted', 'controlled', 'unbiased'],
    example: 'The observed association may be confounded by socioeconomic status, which was not measured.'
  },

  // ─── 形容詞：正確性 ───────────────────────────────────────
  {
    type: 'adj', level: 'basic', category: '正確性',
    term: 'valid',
    meaning: '論理的に「妥当な・有効な」',
    nuance: 'validity（妥当性）はinternal validity（内的妥当性）とexternal validity（外的妥当性）に分かれる。methodsの妥当性評価に必須の語。',
    imrad: ['Methods', 'Discussion'],
    synonyms: ['sound', 'justified', 'appropriate'],
    antonyms: ['invalid', 'flawed', 'spurious'],
    example: 'The diagnostic criteria used in this study have been validated in multiple clinical settings.'
  },
  {
    type: 'adj', level: 'intermediate', category: '正確性',
    term: 'stringent',
    meaning: '基準や条件が「厳格な・厳しい」',
    nuance: 'inclusion/exclusion criteriaが厳しい場合に使う。外的妥当性が下がる一方、内的妥当性が上がるトレードオフを示す文脈でよく出てくる。',
    imrad: ['Methods'],
    synonyms: ['strict', 'rigorous', 'demanding'],
    antonyms: ['lenient', 'loose', 'flexible'],
    example: 'Stringent inclusion criteria were applied to ensure a homogeneous study population.'
  },
  {
    type: 'adj', level: 'advanced', category: '正確性',
    term: 'definitive',
    meaning: '疑いようのない「決定的な・確定的な」',
    nuance: '「definitive evidence/answer」は最終的な結論となるエビデンスを示す。安易に使うと過信と見なされるため、使う際は証拠の質が高い場合に限る。',
    imrad: ['Discussion'],
    synonyms: ['conclusive', 'unequivocal', 'authoritative'],
    antonyms: ['preliminary', 'tentative', 'inconclusive'],
    example: 'While promising, these pilot data do not yet provide definitive evidence of efficacy.'
  },

  // ─── 形容詞：臨床・疫学 ──────────────────────────────────
  {
    type: 'adj', level: 'basic', category: '臨床状態',
    term: 'adverse',
    meaning: '副作用・結果が「有害な・不良な」',
    nuance: '「adverse events（有害事象）」「adverse effects（副作用）」は臨床試験の安全性評価で必須の語。',
    imrad: ['Results', 'Methods'],
    synonyms: ['unfavorable', 'harmful', 'negative'],
    antonyms: ['favorable', 'beneficial', 'positive'],
    example: 'Adverse events were recorded and graded according to CTCAE version 5.0.'
  },
  {
    type: 'adj', level: 'basic', category: '臨床状態',
    term: 'eligible',
    meaning: '選択基準に「合致した・適格な」',
    nuance: '「eligible patients」はStudy flow diagramに必ず登場。eligibility criteria（適格基準）を満たす対象を指す。',
    imrad: ['Methods', 'Results'],
    synonyms: ['qualified', 'suitable', 'meeting criteria'],
    antonyms: ['ineligible', 'excluded'],
    example: 'Of the 850 screened patients, 312 were eligible for inclusion in the final analysis.'
  },
  {
    type: 'adj', level: 'intermediate', category: '臨床状態',
    term: 'comorbid',
    meaning: '主疾患と「併存している（疾患）」',
    nuance: 'comorbidity（併存疾患）の形容詞形。交絡因子として調整が必要なことが多く、Methods・Resultsの患者背景表（Table 1）に頻出。',
    imrad: ['Methods', 'Results'],
    synonyms: ['coexisting', 'concurrent', 'accompanying'],
    antonyms: ['isolated', 'sole'],
    example: 'Patients with comorbid cardiovascular disease were analyzed as a separate subgroup.'
  },
  {
    type: 'adj', level: 'advanced', category: '臨床状態',
    term: 'refractory',
    meaning: '治療に「難治性の・抵抗性の」',
    nuance: '標準治療に反応しない状態を指す。「refractory to [drug/therapy]」という形で使われる。治療抵抗性の疾患カテゴリーを示す。',
    imrad: ['Introduction', 'Methods'],
    synonyms: ['resistant', 'treatment-unresponsive', 'intractable'],
    antonyms: ['responsive', 'treatment-sensitive', 'manageable'],
    example: 'This study focused on patients with refractory inflammatory bowel disease who had failed conventional therapy.'
  },

  // ─── 副詞：確信度 ─────────────────────────────────────────
  {
    type: 'adv', level: 'basic', category: '確信度',
    term: 'significantly',
    meaning: '「有意に・著しく」',
    nuance: '統計的有意性を伴う結果の提示に使う。p値やCIと共に使う場合と単独で「著しく」の意で使う場合がある。',
    imrad: ['Results'],
    synonyms: ['markedly', 'substantially', 'considerably'],
    antonyms: ['marginally', 'negligibly', 'slightly'],
    example: 'The treatment group showed significantly lower rates of recurrence compared with controls (p < 0.001).'
  },
  {
    type: 'adv', level: 'basic', category: '確信度',
    term: 'notably / markedly',
    meaning: '「顕著に・際立って」',
    nuance: 'statisticallyを伴わず質的な顕著さを示す。「markedly elevated」「notably absent」のように知見の際立った特徴を強調する。',
    imrad: ['Results', 'Discussion'],
    synonyms: ['remarkably', 'strikingly', 'prominently'],
    antonyms: ['slightly', 'marginally', 'barely'],
    example: 'Mortality was markedly higher in the untreated cohort during the first year of follow-up.'
  },
  {
    type: 'adv', level: 'intermediate', category: '確信度',
    term: 'apparently / seemingly',
    meaning: '「一見〜に見える・表面上は」',
    nuance: '実際には異なる可能性があることを示唆する慎重な表現。「apparently contradictory」は見かけ上の矛盾を示す。',
    imrad: ['Discussion'],
    synonyms: ['ostensibly', 'seemingly', 'on the surface'],
    antonyms: ['definitively', 'clearly', 'undoubtedly'],
    example: 'The apparently paradoxical finding may be explained by differences in patient selection.'
  },

  // ─── 副詞：限定・特定 ────────────────────────────────────
  {
    type: 'adv', level: 'basic', category: '限定・特定',
    term: 'respectively',
    meaning: 'AとBは「それぞれ」（順番通りに対応）',
    nuance: '「Group A and B showed 60% and 40% response rates, respectively」のように複数の値を対応させて示す際に必須。',
    imrad: ['Results'],
    synonyms: ['correspondingly', 'in that order', 'each'],
    antonyms: [],
    example: 'The 1-year and 5-year survival rates were 82% and 54%, respectively.'
  },
  {
    type: 'adv', level: 'basic', category: '限定・特定',
    term: 'primarily / largely',
    meaning: '「第一に・主に」',
    nuance: '完全にではないが主要な部分を占めることを示す。「primarily composed of」「largely attributable to」などの形で使う。',
    imrad: ['Methods', 'Discussion'],
    synonyms: ['predominantly', 'mainly', 'chiefly'],
    antonyms: ['secondarily', 'partially', 'marginally'],
    example: 'The cohort was primarily composed of male patients over the age of 60.'
  },
  {
    type: 'adv', level: 'intermediate', category: '比較・論理',
    term: 'conversely',
    meaning: '「逆に・一方では」（対照的な内容を提示）',
    nuance: '前文と反対の内容を導入する接続副詞。「in contrast」より硬い表現で、Discussion での議論構造を明確にする。',
    imrad: ['Discussion'],
    synonyms: ['in contrast', 'on the contrary', 'inversely'],
    antonyms: ['similarly', 'likewise', 'correspondingly'],
    example: 'Earlier studies reported protective effects; conversely, our findings suggest potential harm at high doses.'
  },
  {
    type: 'adv', level: 'advanced', category: '比較・論理',
    term: 'paradoxically',
    meaning: '「逆説的に・矛盾するように見えるが」',
    nuance: '期待と反対の結果が得られた際や、一見矛盾する事実を提示する際に使う。読者の注意を引く効果がある。',
    imrad: ['Results', 'Discussion'],
    synonyms: ['counterintuitively', 'unexpectedly', 'ironically'],
    antonyms: ['predictably', 'expectedly', 'as anticipated'],
    example: 'Paradoxically, higher adherence to the diet was associated with worse metabolic outcomes in this subgroup.'
  },

  // ─── 熟語：因果関係 ───────────────────────────────────────
  {
    type: 'phrase', level: 'basic', category: '因果関係',
    term: 'lead to / result in',
    meaning: '〜という結果・状態につながる',
    nuance: 'lead toは過程を、result inは結果を強調。どちらも因果の方向性（原因→結果）を示すが、医学論文では「intervention leads to outcome」の形が多い。',
    imrad: ['Results', 'Discussion'],
    synonyms: ['give rise to', 'cause', 'produce'],
    antonyms: ['prevent', 'inhibit', 'preclude'],
    example: 'Delayed diagnosis often leads to more advanced disease and poorer prognosis.'
  },
  {
    type: 'phrase', level: 'basic', category: '因果関係',
    term: 'be associated with',
    meaning: '〜と統計的・疫学的に「関連している」',
    nuance: '因果関係ではなく関連を示す。交絡調整後でも使える表現。観察研究では「causes」の代わりにこれを使うべき場面が多い。',
    imrad: ['Results', 'Discussion'],
    synonyms: ['correlate with', 'link to', 'relate to'],
    antonyms: ['be unrelated to', 'be independent of'],
    example: 'Elevated fasting glucose was significantly associated with incident cardiovascular events.'
  },
  {
    type: 'phrase', level: 'intermediate', category: '因果関係',
    term: 'attribute A to B',
    meaning: 'A（結果）の原因はB（要因）にあると判断する',
    nuance: '「attribute the improvement to early intervention」のように、結果の原因を帰属させる表現。受動態「A is attributed to B」でも使う。',
    imrad: ['Discussion'],
    synonyms: ['ascribe A to B', 'explain A by B'],
    antonyms: ['dissociate from'],
    example: 'The authors attribute the favorable outcomes to the early initiation of combination therapy.'
  },
  {
    type: 'phrase', level: 'advanced', category: '因果関係',
    term: 'give rise to',
    meaning: '新しい事態・状況を「生じさせる」',
    nuance: '「lead to」より文語的でやや格調が高い。複雑なメカニズムや多段階の因果関係を示す文脈に合う。',
    imrad: ['Discussion'],
    synonyms: ['generate', 'produce', 'bring about'],
    antonyms: ['prevent', 'inhibit'],
    example: 'Chronic inflammation can give rise to a microenvironment conducive to tumor growth.'
  },

  // ─── 熟語：根拠・参照 ────────────────────────────────────
  {
    type: 'phrase', level: 'basic', category: '根拠・参照',
    term: 'based on',
    meaning: '〜を根拠・基盤として',
    nuance: '最も汎用的な根拠の提示表現。「based on these findings」「based on previous evidence」など幅広く使える。',
    imrad: ['Methods', 'Discussion'],
    synonyms: ['on the basis of', 'grounded in', 'drawing from'],
    antonyms: ['regardless of', 'despite'],
    example: 'Based on the available evidence, we recommend early screening for high-risk populations.'
  },
  {
    type: 'phrase', level: 'basic', category: '根拠・参照',
    term: 'consistent with',
    meaning: '先行研究・理論と「一致している」',
    nuance: '自分の結果が先行研究や理論と矛盾しないことを示す。Discussion で必ず使う表現の一つ。',
    imrad: ['Discussion'],
    synonyms: ['in line with', 'in accordance with', 'aligned with'],
    antonyms: ['at odds with', 'contrary to', 'inconsistent with'],
    example: 'Our findings are consistent with the hypothesis that early treatment modifies disease trajectory.'
  },
  {
    type: 'phrase', level: 'intermediate', category: '根拠・参照',
    term: 'in light of',
    meaning: '〜を踏まえると・〜を考慮すると',
    nuance: '新しい証拠や文脈を踏まえた考察・解釈を導入する。「in light of these findings」は Discussion の締めくくりや新たな解釈の提示に使う。',
    imrad: ['Discussion'],
    synonyms: ['given', 'considering', 'in view of'],
    antonyms: ['ignoring', 'disregarding'],
    example: 'In light of these findings, a revised clinical guideline may be warranted.'
  },
  {
    type: 'phrase', level: 'advanced', category: '根拠・参照',
    term: 'to the best of our knowledge',
    meaning: '「我々の知る限りでは」（新規性の強調）',
    nuance: '自分の研究が初めての試みであることを控えめに主張するための慣用表現。過信を避けつつ新規性を示す。',
    imrad: ['Introduction', 'Discussion'],
    synonyms: ['as far as we are aware', 'to our knowledge'],
    antonyms: [],
    example: 'To the best of our knowledge, this is the first study to evaluate this combination in a pediatric cohort.'
  },

  // ─── 熟語：比較・対照 ────────────────────────────────────
  {
    type: 'phrase', level: 'basic', category: '比較・対照',
    term: 'compared with / compared to',
    meaning: '〜と比較して',
    nuance: '「compared with」が学術的推奨。「compared to」はやや文学的で「類似点」を強調するニュアンス。医学論文では with が標準。',
    imrad: ['Results', 'Discussion'],
    synonyms: ['relative to', 'versus', 'in comparison with'],
    antonyms: [],
    example: 'Complication rates were significantly lower compared with the historical control group.'
  },
  {
    type: 'phrase', level: 'basic', category: '比較・対照',
    term: 'in contrast to / in contrast',
    meaning: '〜とは対照的に',
    nuance: '前述と反対の事実や他研究との相違を際立たせる。接続副詞として「In contrast, our study found...」という文頭の使い方も多い。',
    imrad: ['Discussion'],
    synonyms: ['conversely', 'on the other hand', 'unlike'],
    antonyms: ['similarly', 'likewise', 'consistently'],
    example: 'In contrast to previous reports, we found no significant difference between the two groups.'
  },
  {
    type: 'phrase', level: 'intermediate', category: '比較・対照',
    term: 'regardless of',
    meaning: '〜に関わらず（条件に依存しない）',
    nuance: 'サブグループ解析で「一貫して効果がある」ことを示す際に使う。「regardless of age, sex, or disease severity」などの形が典型。',
    imrad: ['Results', 'Discussion'],
    synonyms: ['irrespective of', 'independent of', 'notwithstanding'],
    antonyms: ['depending on', 'contingent upon'],
    example: 'The survival benefit was observed regardless of the stage at diagnosis.'
  },

  // ─── 熟語：考察・結論 ────────────────────────────────────
  {
    type: 'phrase', level: 'basic', category: '考察・結論',
    term: 'in conclusion / in summary',
    meaning: '「結論として・要約すると」（締めの定型句）',
    nuance: 'Discussion の最終段落または Abstract の末尾でよく使う。「In conclusion」は研究全体の結論、「In summary」は要点の列挙に使われる。',
    imrad: ['Discussion'],
    synonyms: ['to summarize', 'taken together', 'overall'],
    antonyms: [],
    example: 'In conclusion, this study provides evidence supporting the use of X as a first-line treatment option.'
  },
  {
    type: 'phrase', level: 'basic', category: '考察・結論',
    term: 'on the other hand',
    meaning: '「一方で・他方では」',
    nuance: '二つの対立する視点を並列するときに使う。前文を否定するのではなく、別の側面を提示するニュアンスがある。',
    imrad: ['Discussion'],
    synonyms: ['conversely', 'alternatively', 'by contrast'],
    antonyms: ['similarly', 'in addition'],
    example: 'The drug showed strong efficacy; on the other hand, adverse effects limited its tolerability.'
  },
  {
    type: 'phrase', level: 'intermediate', category: '考察・結論',
    term: 'take into account / take into consideration',
    meaning: '〜を考慮に入れる',
    nuance: '交絡因子・限界・臨床的文脈など「重要だが単純化されがちな要素」を考慮に入れた上で議論することを示す。',
    imrad: ['Methods', 'Discussion'],
    synonyms: ['consider', 'account for', 'factor in'],
    antonyms: ['ignore', 'overlook', 'disregard'],
    example: 'When taking into account the small sample size, these results should be interpreted with caution.'
  },
  {
    type: 'phrase', level: 'intermediate', category: '考察・結論',
    term: 'further research is needed',
    meaning: '「さらなる研究が必要である」（今後の展望の定型句）',
    nuance: 'Discussionの末尾で研究の限界を認めつつ今後の方向性を示す定型表現。ただし使いすぎると独自性が薄れる。具体的な研究デザインを示すとより質が上がる。',
    imrad: ['Discussion'],
    synonyms: ['warrants further investigation', 'future studies should address', 'additional work is required'],
    antonyms: [],
    example: 'Further research is needed to determine the optimal dosing regimen in elderly patients.'
  },
  {
    type: 'phrase', level: 'advanced', category: '考察・結論',
    term: 'it remains to be determined / it remains unclear',
    meaning: '「〜はいまだ明らかではない」（知識のギャップの提示）',
    nuance: 'Introductionで研究の必要性・知識のギャップを示す際の定型表現。「it remains to be elucidated」も同義でよく使われる。',
    imrad: ['Introduction', 'Discussion'],
    synonyms: ['is yet to be established', 'remains uncertain', 'has not been elucidated'],
    antonyms: ['has been established', 'is well-known'],
    example: 'It remains to be determined whether these findings in animal models translate to clinical outcomes in humans.'
  },

  // ─── 熟語：手法・実施 ────────────────────────────────────
  {
    type: 'phrase', level: 'basic', category: '手法・実施',
    term: 'aim to / be designed to',
    meaning: '〜を目的とする・〜するように設計された',
    nuance: '「This study aimed to evaluate...」はMethodsの目的記述の定型表現。Abstractで「aimed to」、Introduction で「was designed to」が使われることが多い。',
    imrad: ['Introduction', 'Methods'],
    synonyms: ['intend to', 'seek to', 'be intended to'],
    antonyms: [],
    example: 'The present study was designed to evaluate the long-term safety of the novel compound.'
  },
  {
    type: 'phrase', level: 'basic', category: '手法・実施',
    term: 'range from A to B',
    meaning: '範囲がAからBにわたる',
    nuance: '年齢・値・期間などの範囲を示す定型表現。「ages ranged from 18 to 75 years」のような形で頻出。',
    imrad: ['Results'],
    synonyms: ['span from A to B', 'extend from A to B'],
    antonyms: [],
    example: 'Follow-up duration ranged from 6 to 36 months, with a median of 18 months.'
  },
  {
    type: 'phrase', level: 'intermediate', category: '手法・実施',
    term: 'be restricted to',
    meaning: '〜に限定・制限される',
    nuance: '「limited to」「confined to」とほぼ同義。研究の対象や範囲を明示するときに使う。Limitationsでも「findings may be restricted to」と使う。',
    imrad: ['Methods', 'Discussion'],
    synonyms: ['be limited to', 'be confined to', 'apply only to'],
    antonyms: ['extend beyond', 'generalize to'],
    example: 'The analysis was restricted to patients with complete follow-up data.'
  },
  {
    type: 'phrase', level: 'advanced', category: '手法・実施',
    term: 'propensity score matching',
    meaning: '傾向スコアマッチングによる群間調整',
    nuance: '観察研究でランダム化に代わる交絡調整法。「propensity score–matched analysis」「matched cohort」などの形で使われる。RCTのエミュレーションとして近年増加。',
    imrad: ['Methods'],
    synonyms: ['covariate adjustment', 'inverse probability weighting'],
    antonyms: ['unadjusted analysis', 'crude comparison'],
    example: 'To minimize selection bias, patients were matched using propensity score matching in a 1:1 ratio.'
  },
];
