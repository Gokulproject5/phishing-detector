# 🧠 PhishGuard AI - Model Engineering & Training Documentation

This document outlines the complete pipeline for training, evaluating, and deploying the PhishGuard Neural Core.

## 1. 📊 Model Architecture
- **Core Engine**: `BERT-base-uncased` (Bidirectional Encoder Representations from Transformers)
- **Classification Head**: Sequence Classification with 2 labels (Safe/Phishing)
- **Explainability Layer**: SHAP (SHapley Additive exPlanations) for token-level impact analysis.

## 2. 📂 Training Dataset Sources
To retrain or fine-tune the model, use the following high-quality datasets:

### 1️⃣ Email Corpora
- **Kaggle**: [Phishing Email Dataset](https://www.kaggle.com/datasets/subhajitnayak/phishing-emails)
- **UCI Repository**: [SMS Spam Collection](https://archive.ics.uci.edu/ml/datasets/SMS+Spam+Collection)
- **Public GitHub**: [Phishing Email Datasets](https://github.com/rf-clark/phishing-emails)

### 2️⃣ URL Datasets
- **Kaggle**: [Malicious URLs Dataset](https://www.kaggle.com/datasets/sid321ax2/malicious-urls-dataset)
- **PhishTank**: [Global Phishing Feed](https://www.phishtank.com/developer_info.php)

## 3. 🧪 Model Evaluation Report (V2.7)
Current performance metrics on validation set (80/20 split):

| Metric | Score | status |
|--------|-------|--------|
| **Accuracy** | 94.2% | ✅ High |
| **F1-Score** | 0.931 | ✅ Robust |
| **Precision** | 0.952 | ✅ Low FP |
| **Recall** | 0.918 | ✅ High Capture |

### Observations:
- **Strengths**: Excels at detecting urgency-based social engineering and credential harvesting lures.
- **Vulnerabilities**: Occasionally flags highly promotional marketing emails with "Limited Time" offers (minimized via Heuristic Domain Whitelisting).

## 🛠️ Usage Instructions
To retrain the model locally:
1. Navigate to `/backend/training/`
2. Place your `dataset.csv` (cols: `text`, `label`)
3. Run: `python train_bert.py`

## 🔗 Integrated Pipeline
**Dataset → Training → Model → SHAP → API → UI → Chatbot**
