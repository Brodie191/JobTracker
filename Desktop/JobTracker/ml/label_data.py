"""
Convert synthetic.jsonl + validation.jsonl to BIO-labeled format for training.
"""

import json
from pathlib import Path
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")

LABEL_LIST = [
    "O",
    "B-COMPANY", "I-COMPANY",
    "B-ROLE", "I-ROLE",
    "B-LOCATION", "I-LOCATION",
    "B-SALARY", "I-SALARY",
    "B-EMPLOYMENT", "I-EMPLOYMENT",
]
LABEL2ID = {l: i for i, l in enumerate(LABEL_LIST)}


def label_example(text: str, fields: dict) -> dict:
    encoding = tokenizer(
        text,
        return_offsets_mapping=True,
        truncation=True,
        max_length=512,
    )
    offsets = encoding["offset_mapping"]
    labels = ["O"] * len(offsets)

    for field_name, value in fields.items():
        if not value:
            continue
        upper = field_name.upper()
        start = text.lower().find(value.lower())
        if start == -1:
            continue
        end = start + len(value)
        first = True
        for i, (tok_start, tok_end) in enumerate(offsets):
            if tok_start >= start and tok_end <= end:
                labels[i] = f"B-{upper}" if first else f"I-{upper}"
                first = False

    return {
        "input_ids": encoding["input_ids"],
        "attention_mask": encoding["attention_mask"],
        "labels": [LABEL2ID[l] for l in labels],
    }


def process_file(src: str, dst: str):
    src_path = Path(src)
    dst_path = Path(dst)
    if not src_path.exists():
        print(f"Skipping {src} - not found")
        return

    count = 0
    with src_path.open() as fin, dst_path.open("w") as fout:
        for line in fin:
            ex = json.loads(line)
            out = label_example(ex["text"], ex["labels"])
            fout.write(json.dumps(out) + "\n")
            count += 1

    print(f"Labeled {count} examples -> {dst}")


if __name__ == "__main__":
    process_file("ml/data/synthetic.jsonl", "ml/data/synthetic_labeled.jsonl")
    process_file("ml/data/validation.jsonl", "ml/data/validation_labeled.jsonl")
