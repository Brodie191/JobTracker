import 'server-only';

import { parse } from 'node-html-parser';

export interface ScrapedJob {
  source: 'greenhouse' | 'lever' | 'jsonld' | 'unknown';
  url: string;
  company?: string;
  role?: string;
  location?: string;
  text: string;
}

export async function scrapeJobPosting(url: string): Promise<ScrapedJob> {
  const parsed = new URL(url);
  const host = parsed.hostname;
  if (host.includes('greenhouse.io')) return scrapeGreenhouse(url);
  if (host.includes('lever.co')) return scrapeLever(url);
  return scrapeJsonLd(url);
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JobTracker/1.0)' },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.text();
}

async function scrapeGreenhouse(url: string): Promise<ScrapedJob> {
  const html = await fetchHtml(url);
  const doc = parse(html);
  return {
    source: 'greenhouse',
    url,
    role: doc.querySelector('.app-title')?.textContent?.trim(),
    company: doc.querySelector('.company-name')?.textContent?.trim().replace(/^at\s+/i, ''),
    location: doc.querySelector('.location')?.textContent?.trim(),
    text: doc.querySelector('#content')?.textContent?.trim() ?? '',
  };
}

async function scrapeLever(url: string): Promise<ScrapedJob> {
  const html = await fetchHtml(url);
  const doc = parse(html);
  const logoAlt = doc.querySelector('a.main-header-logo img')?.getAttribute('alt');
  const company = logoAlt
    ? logoAlt.replace(/\s*logo$/i, '').trim()
    : new URL(url).pathname.split('/')[1];
  return {
    source: 'lever',
    url,
    role: doc.querySelector('.posting-headline h2')?.textContent?.trim(),
    company,
    location: doc.querySelector('.posting-categories .location')?.textContent?.trim(),
    text: doc.querySelector('[data-qa="job-description"]')?.textContent?.trim() ?? '',
  };
}

async function scrapeJsonLd(url: string): Promise<ScrapedJob> {
  const html = await fetchHtml(url);
  const doc = parse(html);
  const scripts = doc.querySelectorAll('script[type="application/ld+json"]');

  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent ?? '');
      const blocks = Array.isArray(data) ? data : [data];
      for (const block of blocks) {
        if (block['@type'] === 'JobPosting') {
          return {
            source: 'jsonld',
            url,
            role: block.title,
            company: block.hiringOrganization?.name,
            location:
              block.jobLocation?.address?.addressLocality ??
              (block.jobLocationType === 'TELECOMMUTE' ? 'Remote' : undefined),
            text: stripHtml(block.description ?? ''),
          };
        }
      }
    } catch {
      continue;
    }
  }

  return {
    source: 'unknown',
    url,
    text: doc.querySelector('body')?.textContent?.trim() ?? '',
  };
}

function stripHtml(html: string): string {
  return parse(html).textContent?.trim() ?? '';
}

export async function callExtractionEndpoint(text: string) {
  const url = process.env.MODAL_EXTRACT_URL;
  if (!url) return null;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.MODAL_EXTRACT_SECRET
        ? { 'X-Secret': process.env.MODAL_EXTRACT_SECRET }
        : {}),
    },
    body: JSON.stringify({ text }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) throw new Error('Extraction failed');
  const data = await res.json();

  return {
    company: data.company ?? undefined,
    role: data.role ?? undefined,
    location: data.location ?? undefined,
    salary_range: data.salary ?? undefined,
  };
}
