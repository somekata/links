# 各菌種の群間比較 (ANOVA)
fungi_species <- c("Malassezia_globosa", "Malassezia_restricta", 
                   "Candida_albicans", "Aspergillus_fumigatus", 
                   "Cryptococcus_neoformans", "Trichophyton_rubrum")

# ANOVA と Tukey の多重比較
for (fungus in fungi_species) {
  cat("\n###", fungus, "###\n")
  anova_result <- aov(as.formula(paste(fungus, "~ Group")), data = data)
  print(summary(anova_result))
  print(TukeyHSD(anova_result))
}

library(corrplot)

# 菌種データ抽出
fungi_data <- data[, fungi_species]

# 相関行列の作成
cor_data <- cor(fungi_data, method = "spearman")

# ヒートマップで可視化
corrplot(cor_data, method = "circle", type = "upper",
         title = "Fungal Species Correlation", tl.col = "black", tl.srt = 45)

library(tidyverse)
library(caret)
library(pROC)  # ROC解析用

# Sarcoidosisを1、その他を0に変換
trainData <- trainData %>%
  mutate(Group_binary = ifelse(Group == "Sarcoidosis", 1, 0))

testData <- testData %>%
  mutate(Group_binary = ifelse(Group == "Sarcoidosis", 1, 0))

# ロジスティック回帰モデル
model <- glm(Group_binary ~ Malassezia_globosa + Malassezia_restricta, 
             data = trainData, 
             family = binomial)

# モデルのサマリー
summary(model)

# 予測
testData$Pred <- predict(model, testData, type = "response")
testData$Pred_class <- ifelse(testData$Pred > 0.5, 1, 0)

# 混同行列 (Confusion Matrix)
confusionMatrix(as.factor(testData$Pred_class), 
                as.factor(testData$Group_binary), 
                positive = "1")

# ROC曲線とAUCの描画
roc_curve <- roc(testData$Group_binary, testData$Pred)
plot(roc_curve, col = "blue", main = "ROC Curve for Logistic Regression")
cat("AUC: ", auc(roc_curve), "\n")

# ダミーの臨床データ (例: CRP, KL-6)
set.seed(42)
data$CRP <- runif(120, min = 0.1, max = 10)  # CRP値 (例)
data$KL6 <- runif(120, min = 100, max = 2000) # KL-6値 (例)

# Malassezia と CRP の回帰分析
lm_model <- lm(CRP ~ Malassezia_globosa, data = data)
summary(lm_model)

# 散布図で可視化
ggplot(data, aes(x = Malassezia_globosa, y = CRP)) +
  geom_point(aes(color = Group)) +
  geom_smooth(method = "lm", se = FALSE) +
  labs(title = "Malassezia vs CRP", x = "Malassezia_globosa (%)", y = "CRP (mg/dL)") +
  theme_minimal()
