"""
Scrape 100 real job postings from Greenhouse + Lever for the validation set.
Uses the Greenhouse JSON API and Lever JSON API to find job URLs,
then scrapes each posting for full text and auto-labels fields.
"""

import json
import re
import time
import random
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import URLError


GREENHOUSE_COMPANIES = [
    "stripe", "figma", "brex", "anthropic", "cloudflare",
    "gusto", "airtable", "mongodb", "verkada",
    "chime", "navan", "vanta", "lattice", "deel",
    "amplitude", "mixpanel", "pendo", "productboard",
    "datadog", "okta", "box", "dropbox", "asana",
    "palantir", "scale", "dbtlabs", "hex", "modal",
]

LEVER_COMPANIES = [
    "netflix", "lyft", "plaid", "robinhood", "duolingo",
    "gitlab", "hashicorp", "asana", "intercom", "twilio",
]


def fetch(url: str, timeout=12) -> str:
    req = Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; JobTracker/1.0)"})
    with urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", errors="ignore")


def fetch_json(url: str) -> dict:
    return json.loads(fetch(url))


def strip_html(html: str) -> str:
    text = re.sub(r'<[^>]+>', ' ', html)
    text = re.sub(r'&nbsp;', ' ', text)
    text = re.sub(r'&amp;', '&', text)
    text = re.sub(r'&lt;', '<', text)
    text = re.sub(r'&gt;', '>', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def infer_employment(text: str) -> str | None:
    t = text.lower()
    if "internship" in t or "intern " in t:
        return "Internship"
    if "part-time" in t or "part time" in t:
        return "Part-time"
    if "contract" in t and "full-time" not in t and "full time" not in t:
        return "Contract"
    if "full-time" in t or "full time" in t:
        return "Full-time"
    return None


def greenhouse_jobs(company: str, limit=8) -> list[dict]:
    try:
        data = fetch_json(f"https://boards-api.greenhouse.io/v1/boards/{company}/jobs?content=true")
    except Exception as e:
        print(f"    API error: {e}")
        return []

    results = []
    for job in data.get("jobs", [])[:limit]:
        desc = strip_html(job.get("content", ""))
        if len(desc) < 100:
            continue
        loc = job.get("location", {}).get("name")
        employment = infer_employment(desc)
        results.append({
            "url": job.get("absolute_url", ""),
            "text": desc,
            "labels": {
                "company": company.title(),
                "role": job.get("title"),
                "location": loc,
                "salary": None,
                "employment": employment,
            },
        })
    return results


def lever_jobs(company: str, limit=8) -> list[dict]:
    try:
        data = fetch_json(f"https://api.lever.co/v0/postings/{company}?mode=json")
    except Exception as e:
        print(f"    API error: {e}")
        return []

    results = []
    for job in data[:limit]:
        lists = job.get("lists", [])
        desc_parts = [job.get("descriptionBody", "")]
        for lst in lists:
            desc_parts.append(lst.get("content", ""))
        desc = strip_html(" ".join(desc_parts))
        if len(desc) < 100:
            continue
        categories = job.get("categories", {})
        loc = categories.get("location") or categories.get("allLocations", [None])[0]
        employment = categories.get("commitment") or infer_employment(desc)
        results.append({
            "url": job.get("hostedUrl", ""),
            "text": desc,
            "labels": {
                "company": job.get("company") or company.title(),
                "role": job.get("text"),
                "location": loc,
                "salary": None,
                "employment": employment,
            },
        })
    return results


def main():
    out_val = Path("ml/data/validation.jsonl")
    out_val.parent.mkdir(parents=True, exist_ok=True)

    results = []

    print("Fetching Greenhouse jobs via API...")
    for company in GREENHOUSE_COMPANIES:
        print(f"  {company}...", end=" ", flush=True)
        jobs = greenhouse_jobs(company, limit=8)
        print(f"{len(jobs)} jobs")
        for j in jobs:
            print(f"    {j['labels']['role']} | {j['labels']['location']} | {j['labels']['employment']}")
        results.extend(jobs)
        time.sleep(random.uniform(0.3, 0.7))
        if len(results) >= 70:
            break

    print(f"\nFetching Lever jobs via API... (have {len(results)} so far)")
    for company in LEVER_COMPANIES:
        print(f"  {company}...", end=" ", flush=True)
        jobs = lever_jobs(company, limit=8)
        print(f"{len(jobs)} jobs")
        for j in jobs:
            print(f"    {j['labels']['role']} | {j['labels']['location']} | {j['labels']['employment']}")
        results.extend(jobs)
        time.sleep(random.uniform(0.3, 0.7))
        if len(results) >= 100:
            break

    random.shuffle(results)
    results = results[:100]

    # Merge with any previously scraped examples
    existing = []
    if out_val.exists():
        with out_val.open() as f:
            existing = [json.loads(l) for l in f if l.strip()]

    seen_urls = {r["url"] for r in existing}
    new_results = [r for r in results if r["url"] not in seen_urls]
    results = (existing + new_results)[:100]

    with out_val.open("w") as f:
        for r in results:
            f.write(json.dumps({"text": r["text"], "labels": r["labels"], "url": r["url"]}) + "\n")

    print(f"\nValidation set: {len(results)} examples -> {out_val}")

    labeled = sum(1 for r in results if r["labels"].get("role") and r["labels"].get("company"))
    print(f"Company+role labeled: {labeled}/{len(results)}")
    emp = sum(1 for r in results if r["labels"].get("employment"))
    print(f"Employment labeled:   {emp}/{len(results)}")


if __name__ == "__main__":
    main()
