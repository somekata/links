library(tidyverse)

set.seed(123)

# レコード数の指定
record_number <- 10000  # ここを変更するだけでレコード数を変更可能

# 欠損値を1%以下にする関数
add_na <- function(x, prob = 0.01) {
  x[sample(1:length(x), size = round(length(x) * prob))] <- NA
  return(x)
}

# 年収データ生成
income_data <- rlnorm(record_number, meanlog = log(5000000), sdlog = 1.2)
income_data <- round(ifelse(income_data > 1e8, 1e8, income_data), -4)

# ダミーデータ生成
dummy_data <- tibble(
  id = 1:record_number,
  name = paste0("Person_", 1:record_number),
  age = add_na(sample(18:90, record_number, replace = TRUE)),
  gender = add_na(sample(c("Male", "Female", "Other"), record_number, replace = TRUE, prob = c(0.48, 0.48, 0.04))),
  belongs = add_na(sample(c("Company A", "Company B", "Company C", "University", "Other"), record_number, replace = TRUE)),
  weight = add_na(round(runif(record_number, 45, 100), 1)),
  height = add_na(round(runif(record_number, 150, 200), 1)),
  BMI = round(weight / ((height / 100) ^ 2), 1),
  blood_type = add_na(sample(c("A", "B", "O", "AB"), record_number, replace = TRUE)),
  heart_rate = add_na(sample(60:100, record_number, replace = TRUE)),
  blood_pressure_systolic = add_na(sample(100:180, record_number, replace = TRUE)),
  blood_pressure_diastolic = add_na(sample(60:120, record_number, replace = TRUE)),
  cholesterol_level = add_na(round(runif(record_number, 150, 250), 1)),
  smoker = add_na(sample(c("Yes", "No"), record_number, replace = TRUE, prob = c(0.3, 0.7))),
  alcohol_intake = add_na(round(runif(record_number, 0, 20), 1)),
  exercise_frequency = add_na(sample(0:7, record_number, replace = TRUE)),
  sleep_hours = add_na(round(runif(record_number, 4, 9), 1)),
  diet_type = add_na(sample(c("Balanced", "Vegetarian", "Fast Food", "Keto", "Other"), record_number, replace = TRUE)),
  screen_time = add_na(round(runif(record_number, 1, 10), 1)),
  income = add_na(income_data),
  marital_status = add_na(sample(c("Single", "Married", "Divorced", "Widowed"), record_number, replace = TRUE))
)

# データの確認
summary(dummy_data$income)

# 欠損値の確認
map_df(dummy_data, ~sum(is.na(.))) %>% 
  gather(key = "Variable", value = "Missing Count")

