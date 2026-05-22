"""
Modal deployment for the job posting NER model.

Setup:
  pip install modal
  modal token new

Load model into volume (run once after training):
  modal volume put job-model ./ml/model_final /job-posting-ner

Deploy:
  modal deploy ml/serve.py

Test:
  curl -X POST https://YOUR-URL.modal.run \
    -H "Content-Type: application/json" \
    -d '{"text": "We are hiring a Senior Software Engineer at Stripe in San Francisco..."}'
"""

import modal

app = modal.App("job-extractor")

image = (
    modal.Image.debian_slim()
    .pip_install("transformers", "torch", "fastapi")
)

volume = modal.Volume.from_name("job-model", create_if_missing=True)


@app.function(
    image=image,
    volumes={"/model": volume},
    timeout=60,
)
@modal.fastapi_endpoint(method="POST")
def extract(item: dict):
    import os
    from transformers import pipeline

    secret = os.environ.get("EXTRACT_SECRET")
    if secret and item.get("_secret") != secret:
        return {"error": "Unauthorized"}

    text = item.get("text", "")
    if not text:
        return {"error": "No text provided"}

    nlp = pipeline(
        "ner",
        model="/model/job-posting-ner",
        aggregation_strategy="simple",
    )

    raw = nlp(text[:4000])

    by_type: dict = {}
    for ent in raw:
        et = ent["entity_group"]
        if et not in by_type or ent["score"] > by_type[et]["score"]:
            by_type[et] = ent

    return {
        "company": by_type.get("COMPANY", {}).get("word"),
        "role": by_type.get("ROLE", {}).get("word"),
        "location": by_type.get("LOCATION", {}).get("word"),
        "salary": by_type.get("SALARY", {}).get("word"),
        "employment": by_type.get("EMPLOYMENT", {}).get("word"),
        "scores": {k: round(v["score"], 3) for k, v in by_type.items()},
    }
