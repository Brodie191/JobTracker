"""
Interactive labeling helper for validation set.
"""

import json
from pathlib import Path

scraped_file = Path("ml/data/scraped_for_labeling.jsonl")
out_file = Path("ml/data/validation.jsonl")

if not scraped_file.exists():
    print(f"Missing {scraped_file}. Scrape URLs first and save to that path.")
    print("Each line should be: {\"url\": \"...\", \"text\": \"...\"}")
    exit(1)

with scraped_file.open() as f:
    examples = [json.loads(l) for l in f]

print(f"Labeling {len(examples)} examples. Press Enter to skip a field.")

with out_file.open("w") as fout:
    for i, ex in enumerate(examples):
        print(f"\n{'='*60}")
        print(f"[{i+1}/{len(examples)}] {ex.get('url', '')}")
        print(f"{'='*60}")
        print(ex["text"][:600] + ("..." if len(ex["text"]) > 600 else ""))
        print()

        fields = {}
        for field in ["company", "role", "location", "salary", "employment"]:
            val = input(f"  {field}: ").strip()
            fields[field] = val if val else None

        fout.write(json.dumps({
            "text": ex["text"],
            "labels": fields,
            "url": ex.get("url", ""),
        }) + "\n")
        print(f"  Saved.")

print(f"\nDone - {out_file}")
