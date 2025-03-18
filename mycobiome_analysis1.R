library(tidyverse)

# データの読み込み
data <- read_csv("Mycobiome_Analysis_Dummy_Data.csv")

# データ確認
glimpse(data)

# 欠損値の確認
sum(is.na(data))

# グループごとの件数確認
table(data$Group)

library(vegan)

# Shannon指数の計算
data$Shannon <- diversity(data[, 3:8], index = "shannon")

# Boxplotで可視化
library(ggplot2)
ggplot(data, aes(x = Group, y = Shannon, fill = Group)) +
  geom_boxplot() +
  labs(title = "Shannon Diversity Index", y = "Shannon Index") +
  theme_minimal()

# PCAの実行
pca_result <- prcomp(data[, 3:8], center = TRUE, scale. = TRUE)

# PCAプロット用データ作成
pca_data <- as.data.frame(pca_result$x)
pca_data$Group <- data$Group

# PCAプロット
ggplot(pca_data, aes(x = PC1, y = PC2, color = Group)) +
  geom_point(size = 3) +
  labs(title = "PCA Plot", x = "PC1", y = "PC2") +
  theme_minimal()

t_test_result <- t.test(data$Malassezia_globosa ~ data$Group == "Sarcoidosis")
print(t_test_result)

anova_result <- aov(Malassezia_globosa ~ Group, data = data)
summary(anova_result)

# ANOVAの結果が有意なら、Tukeyの多重比較を実施
TukeyHSD(anova_result)

ggplot(data, aes(x = Group, y = Malassezia_globosa, fill = Group)) +
  geom_boxplot() +
  labs(title = "Malassezia_globosa Abundance by Group", y = "Relative Abundance (%)") +
  theme_minimal()

