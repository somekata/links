# ライブラリ読み込み
set.seed(42)
library(tidyverse)

# グループとサンプル数の指定
groups <- rep(c("Sarcoidosis", "ITP", "CTD-ILD", "Misc"), each = 30)

# 菌種名
fungi_species <- c("Malassezia_globosa", "Malassezia_restricta",
                   "Candida_albicans", "Aspergillus_fumigatus",
                   "Cryptococcus_neoformans", "Trichophyton_rubrum")

# 各菌種のベースとなるデータ生成（データフレーム形式に変更）
generate_data <- function(group) {
  data <- runif(6, min = 5, max = 25)  # 基本的な分布
  if (group == "Sarcoidosis") {
    data[1] <- runif(1, min = 40, max = 70)  # Sarcoidosis群ではMalassezia_globosaを高めに
  }
  data <- data / sum(data) * 100  # 相対頻度として100%になるように正規化
  data_frame <- as.data.frame(t(data))  # データフレーム形式に変換
  colnames(data_frame) <- fungi_species
  return(data_frame)
}

# ダミーデータフレームの作成
dummy_data <- data.frame(
  Sample = paste0("Sample_", 1:120),
  Group = groups
)

# 真菌データの追加
fungi_data <- map_dfr(dummy_data$Group, generate_data)

# サンプル情報と結合
dummy_data <- cbind(dummy_data, fungi_data)

# データの確認
head(dummy_data)

# CSVとして保存 (オプション)
write.csv(dummy_data, "Mycobiome_Analysis_Dummy_Data.csv", row.names = FALSE)
