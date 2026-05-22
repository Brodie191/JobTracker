"""
Generate 800 synthetic job posting examples via Claude.
Run: python ml/generate_data.py
Requires: ANTHROPIC_API_KEY in environment.
"""

import anthropic
import json
import random
from pathlib import Path

client = anthropic.Anthropic(timeout=30.0)

COMPANIES = [
    "Stripe", "Anthropic", "Vercel", "Linear", "Figma", "Notion",
    "Supabase", "Hugging Face", "Modal", "Replicate", "Datadog",
    "Sentry", "Cloudflare", "Brex", "Ramp", "DeepMind", "Cohere",
    "Databricks", "Snowflake", "Plaid",
]
ROLES = [
    "Software Engineer", "Senior Software Engineer", "Full-Stack Engineer",
    "Frontend Engineer", "Backend Engineer", "ML Engineer",
    "Research Engineer", "Platform Engineer", "Site Reliability Engineer",
    "Engineering Manager",
]
LOCATIONS = [
    "San Francisco, CA", "New York, NY", "London, UK", "Remote",
    "Berlin, Germany", "Toronto, Canada", "Hybrid - London",
    "Remote (US only)", "Dublin, Ireland",
]
SALARIES = [
    "$120k - $160k", "$150,000 - $200,000", "70,000 - 95,000",
    "$180k+", "Competitive", "90,000 - 120,000",
    None, None, None,  # salary often missing
]
EMPLOYMENT = ["Full-time", "Part-time", "Contract", "Internship"]

PROMPT_TEMPLATE = """Generate a realistic job posting body text (no headers, no formatting, just prose) that includes these exact field values somewhere in the text:

Company: {company}
Role: {role}
Location: {location}
Salary: {salary}
Employment type: {employment}

The text should read like a real job posting - include responsibilities, requirements, and benefits. 200-400 words. Do not include section headers like "About Us" - write continuous prose. Use the exact values above verbatim somewhere in the text."""


def generate_one():
    company = random.choice(COMPANIES)
    role = random.choice(ROLES)
    location = random.choice(LOCATIONS)
    salary = random.choice(SALARIES)
    employment = random.choice(EMPLOYMENT)

    prompt = PROMPT_TEMPLATE.format(
        company=company, role=role, location=location,
        salary=salary or "not mentioned", employment=employment,
    )

    msg = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=800,
        messages=[{"role": "user", "content": prompt}],
    )
    text = msg.content[0].text

    return {
        "text": text,
        "labels": {
            "company": company, "role": role, "location": location,
            "salary": salary, "employment": employment,
        },
    }


if __name__ == "__main__":
    out = Path("ml/data/synthetic.jsonl")
    out.parent.mkdir(parents=True, exist_ok=True)

    already = sum(1 for _ in out.open()) if out.exists() else 0
    print(f"Resuming from {already}/800")

    with out.open("a") as f:
        for i in range(already, 800):
            try:
                example = generate_one()
                f.write(json.dumps(example) + "\n")
                f.flush()
                if i % 50 == 0:
                    print(f"Generated {i}/800")
            except Exception as e:
                print(f"Error at {i}: {e} — retrying once")
                try:
                    example = generate_one()
                    f.write(json.dumps(example) + "\n")
                    f.flush()
                except Exception as e2:
                    print(f"Skipping {i}: {e2}")

    print("Done - ml/data/synthetic.jsonl")
