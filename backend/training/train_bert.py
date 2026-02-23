import pandas as pd
from sklearn.model_selection import train_test_split
from datasets import Dataset
from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer
import numpy as np
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
import os

# Create results directory
if not os.path.exists("./results"):
    os.makedirs("./results")

def train_model(dataset_path="dataset.csv"):
    if not os.path.exists(dataset_path):
        print(f"Error: {dataset_path} not found. Please provide a CSV with 'text' and 'label' columns.")
        return

    # Load dataset
    df = pd.read_csv(dataset_path)

    # Train test split
    train_df, val_df = train_test_split(df, test_size=0.2, stratify=df["label"])

    train_dataset = Dataset.from_pandas(train_df)
    val_dataset = Dataset.from_pandas(val_df)

    # Tokenizer
    model_name = "bert-base-uncased"
    tokenizer = AutoTokenizer.from_pretrained(model_name)

    def tokenize(example):
        return tokenizer(example["text"], padding="max_length", truncation=True)

    train_dataset = train_dataset.map(tokenize, batched=True)
    val_dataset = val_dataset.map(tokenize, batched=True)

    train_dataset.set_format(type="torch", columns=["input_ids","attention_mask","label"])
    val_dataset.set_format(type="torch", columns=["input_ids","attention_mask","label"])

    # Model
    model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=2)

    # Metrics
    def compute_metrics(pred):
        logits, labels = pred
        preds = np.argmax(logits, axis=1)
        precision, recall, f1, _ = precision_recall_fscore_support(labels, preds, average="binary")
        acc = accuracy_score(labels, preds)
        return {"accuracy": acc, "f1": f1, "precision": precision, "recall": recall}

    # Training config
    training_args = TrainingArguments(
        output_dir="./results",
        learning_rate=2e-5,
        per_device_train_batch_size=16,
        num_train_epochs=3,
        evaluation_strategy="epoch",
        logging_dir='./logs',
        save_strategy="epoch",
        load_best_model_at_end=True
    )

    # Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        compute_metrics=compute_metrics
    )

    print("Starting Training Sequence...")
    trainer.train()
    
    print("Evaluating Model Performance...")
    metrics = trainer.evaluate()
    print(metrics)

    # Save model
    output_dir = "phishing_model_v2"
    trainer.save_model(output_dir)
    tokenizer.save_pretrained(output_dir)
    print(f"Model and tokenizer saved to {output_dir}")

if __name__ == "__main__":
    # To run this script, ensure you have a dataset.csv in the same directory
    # columns: text, label (0 for legitimate, 1 for phishing)
    train_model()
