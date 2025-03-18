library(reshape2)

# データの整形
melted_data <- melt(dummy_data, id.vars = c("Sample", "Group"))

# Stacked Bar Plot
ggplot(melted_data, aes(x = Sample, y = value, fill = variable)) +
  geom_bar(stat = "identity") +
  facet_wrap(~ Group, scales = "free_x") +
  labs(title = "Mycobiome Composition", y = "Relative Abundance (%)") +
  theme_minimal() +
  theme(axis.text.x = element_text(angle = 90, hjust = 1))

# 各菌種のp値を取得 (ANOVA)
p_values <- sapply(fungi_species, function(fungus) {
  anova_result <- aov(as.formula(paste(fungus, "~ Group")), data = data)
  p_value <- summary(anova_result)[[1]][["Pr(>F)"]][1]  # 直接数値として抽出
  return(as.numeric(p_value))  # 数値変換でエラー回避
})

# FDR補正の実施
p_adjusted <- p.adjust(p_values, method = "fdr")

# 結果の表示
p_results <- data.frame(
  Fungus = fungi_species,
  P_value = p_values,
  P_adjusted = p_adjusted
)

print(p_results)

