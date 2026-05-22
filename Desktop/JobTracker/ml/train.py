"""
Fine-tune DistilBERT for job posting NER.
Run locally (Apple Silicon MPS) or in Google Colab.

Setup:
  pip install transformers datasets evaluate seqeval torch accelerate

Usage:
  KMP_DUPLICATE_LIB_OK=TRUE python ml/train.py
"""

import os
import json
import numpy as np
import evaluate
import torch
from datasets import Dataset, Features, Sequence, Value
from transformers import (
    AutoTokenizer,
    AutoModelForTokenClassification,
    TrainingArguments,
    Trainer,
    DataCollatorForTokenClassification,
)

os.environ.setdefault("KMP_DUPLICATE_LIB_OK", "TRUE")

MODEL_NAME = "distilbert-base-uncased"
LABEL_LIST = [
    "O",
    "B-COMPANY", "I-COMPANY",
    "B-ROLE", "I-ROLE",
    "B-LOCATION", "I-LOCATION",
    "B-SALARY", "I-SALARY",
    "B-EMPLOYMENT", "I-EMPLOYMENT",
]
ID2LABEL = {i: l for i, l in enumerate(LABEL_LIST)}
LABEL2ID = {l: i for i, l in enumerate(LABEL_LIST)}

FEATURES = Features({
    "input_ids": Sequence(Value("int32")),
    "attention_mask": Sequence(Value("int8")),
    "labels": Sequence(Value("int64")),
})


def load_jsonl(path: str) -> Dataset:
    with open(path) as f:
        rows = [json.loads(l) for l in f]
    # Cast to correct types
    ds = Dataset.from_list(rows, features=FEATURES)
    ds.set_format("torch")
    return ds


tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForTokenClassification.from_pretrained(
    MODEL_NAME,
    num_labels=len(LABEL_LIST),
    id2label=ID2LABEL,
    label2id=LABEL2ID,
)

train_ds = load_jsonl("ml/data/synthetic_labeled.jsonl")
val_ds = load_jsonl("ml/data/validation_labeled.jsonl")

print(f"Train: {len(train_ds)} | Val: {len(val_ds)}")

seqeval = evaluate.load("seqeval")


def compute_metrics(p):
    predictions, labels = p
    predictions = np.argmax(predictions, axis=2)
    true_predictions = [
        [LABEL_LIST[p] for (p, l) in zip(pred, lab) if l != -100]
        for pred, lab in zip(predictions, labels)
    ]
    true_labels = [
        [LABEL_LIST[l] for (p, l) in zip(pred, lab) if l != -100]
        for pred, lab in zip(predictions, labels)
    ]
    results = seqeval.compute(predictions=true_predictions, references=true_labels)
    return {
        "precision": results["overall_precision"],
        "recall": results["overall_recall"],
        "f1": results["overall_f1"],
        "accuracy": results["overall_accuracy"],
    }


training_args = TrainingArguments(
    output_dir="./ml/model_output",
    learning_rate=2e-5,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    num_train_epochs=5,
    weight_decay=0.01,
    eval_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
    metric_for_best_model="f1",
    logging_steps=25,
    dataloader_pin_memory=False,  # MPS doesn't support pin_memory
)

data_collator = DataCollatorForTokenClassification(tokenizer=tokenizer)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_ds,
    eval_dataset=val_ds,
    data_collator=data_collator,
    processing_class=tokenizer,
    compute_metrics=compute_metrics,
)

if __name__ == "__main__":
    trainer.train()
    trainer.save_model("./ml/model_final")
    tokenizer.save_pretrained("./ml/model_final")
    print("\nModel saved to ml/model_final")
    print("To push to Hugging Face Hub:")
    print("  trainer.push_to_hub('YOUR_USERNAME/job-posting-ner')")
