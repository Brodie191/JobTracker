"""
Run F1 evaluation on Modal (cloud) — nothing heavy runs locally.

Usage:
  modal run ml/eval_f1.py
"""

import modal
from pathlib import Path

app = modal.App("job-ner-eval")

image = (
    modal.Image.debian_slim()
    .pip_install("transformers[torch]", "torch", "evaluate", "datasets", "seqeval", "numpy", "accelerate>=1.1.0")
)

MODEL_DIR = Path(__file__).parent / "model_final"
VAL_DATA   = Path(__file__).parent / "data" / "validation_labeled.jsonl"

LABEL_LIST = [
    "O",
    "B-COMPANY", "I-COMPANY",
    "B-ROLE",    "I-ROLE",
    "B-LOCATION","I-LOCATION",
    "B-SALARY",  "I-SALARY",
    "B-EMPLOYMENT","I-EMPLOYMENT",
]


@app.function(
    image=image,
    timeout=300,
    cpu=2,
)
def run_eval(model_files: dict[str, bytes], val_jsonl: str) -> dict:
    import json, tempfile, numpy as np, evaluate
    from pathlib import Path
    from datasets import Dataset, Features, Sequence, Value
    from transformers import (
        AutoTokenizer, AutoModelForTokenClassification,
        Trainer, DataCollatorForTokenClassification,
    )

    # Write model files to a temp dir
    with tempfile.TemporaryDirectory() as tmpdir:
        model_path = Path(tmpdir) / "model"
        model_path.mkdir()
        for name, data in model_files.items():
            (model_path / name).write_bytes(data)

        tokenizer = AutoTokenizer.from_pretrained(str(model_path))
        model = AutoModelForTokenClassification.from_pretrained(str(model_path))

        FEATURES = Features({
            "input_ids":      Sequence(Value("int32")),
            "attention_mask": Sequence(Value("int8")),
            "labels":         Sequence(Value("int64")),
        })
        rows = [json.loads(l) for l in val_jsonl.splitlines()]
        val_ds = Dataset.from_list(rows, features=FEATURES)
        val_ds.set_format("torch")

        seqeval = evaluate.load("seqeval")

        def compute_metrics(p):
            predictions, labels = p
            predictions = np.argmax(predictions, axis=2)
            true_preds = [
                [LABEL_LIST[pp] for (pp, l) in zip(pred, lab) if l != -100]
                for pred, lab in zip(predictions, labels)
            ]
            true_labs = [
                [LABEL_LIST[l] for (pp, l) in zip(pred, lab) if l != -100]
                for pred, lab in zip(predictions, labels)
            ]
            return seqeval.compute(predictions=true_preds, references=true_labs)

        trainer = Trainer(
            model=model,
            processing_class=tokenizer,
            data_collator=DataCollatorForTokenClassification(tokenizer),
            compute_metrics=compute_metrics,
        )
        results = trainer.evaluate(val_ds)

    return results


@app.local_entrypoint()
def main():
    import json

    # Load model files locally (small, just weights + config)
    model_files = {
        f.name: f.read_bytes()
        for f in MODEL_DIR.iterdir()
        if f.is_file()
    }
    val_jsonl = VAL_DATA.read_text()

    print("Sending to Modal for evaluation...")
    results = run_eval.remote(model_files, val_jsonl)

    print("\n=== F1 Results ===")
    overall_keys = ["eval_overall_f1", "eval_overall_precision", "eval_overall_recall", "eval_overall_accuracy"]
    for k in overall_keys:
        if k in results:
            label = k.replace("eval_overall_", "").capitalize()
            print(f"  {label:12s}: {results[k]:.4f}")

    print("\n--- Per-entity F1 ---")
    for k, v in sorted(results.items()):
        if "_f1" in k and "overall" not in k:
            entity = k.replace("eval_", "").replace("_f1", "").upper()
            print(f"  {entity:12s}: {v:.4f}")

    # Save to file for the report
    out = {k: v for k, v in results.items() if not k.startswith("eval_runtime")}
    with open("ml/f1_results.json", "w") as f:
        json.dump(out, f, indent=2)
    print("\nSaved to ml/f1_results.json")
