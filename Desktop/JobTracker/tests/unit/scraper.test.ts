import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scrapeJobPosting } from '@/lib/scraper';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function makeResponse(html: string, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(html),
  });
}

beforeEach(() => {
  mockFetch.mockReset();
});

//Lever 

const leverHtml = `
<html><body>
  <div class="main-header page-full-width section-wrapper">
    <div class="main-header-content">
      <a href="https://jobs.lever.co/acme" class="main-header-logo">
        <img alt="Acme Corp logo" src="/logo.png">
      </a>
    </div>
  </div>
  <div class="posting-headline">
    <h2>Software Engineer</h2>
    <div class="posting-categories">
      <div class="location">London</div>
    </div>
  </div>
  <div data-qa="job-description">We need a great engineer.</div>
</body></html>`;

describe('scrapeLever', () => {
  it('extracts role, company, and location', async () => {
    mockFetch.mockReturnValueOnce(makeResponse(leverHtml));
    const result = await scrapeJobPosting('https://jobs.lever.co/acme/abc-123');
    expect(result.source).toBe('lever');
    expect(result.role).toBe('Software Engineer');
    expect(result.company).toBe('Acme Corp');
    expect(result.location).toBe('London');
  });

  it('strips " logo" suffix from company name', async () => {
    mockFetch.mockReturnValueOnce(makeResponse(leverHtml));
    const result = await scrapeJobPosting('https://jobs.lever.co/acme/abc-123');
    expect(result.company).not.toContain('logo');
  });

  it('falls back to URL slug when no logo alt text', async () => {
    const noAltHtml = leverHtml.replace('alt="Acme Corp logo"', '');
    mockFetch.mockReturnValueOnce(makeResponse(noAltHtml));
    const result = await scrapeJobPosting('https://jobs.lever.co/acme/abc-123');
    expect(result.company).toBe('acme');
  });

  it('includes job description text', async () => {
    mockFetch.mockReturnValueOnce(makeResponse(leverHtml));
    const result = await scrapeJobPosting('https://jobs.lever.co/acme/abc-123');
    expect(result.text).toContain('great engineer');
  });
});

//Greenhouse 

const greenhouseHtml = `
<html><body>
  <h1 class="app-title">Backend Engineer</h1>
  <div class="company-name">at TechCorp</div>
  <div class="location">San Francisco, CA</div>
  <div id="content">Looking for a backend engineer with 3+ years experience.</div>
</body></html>`;

describe('scrapeGreenhouse', () => {
  it('extracts role, company, and location', async () => {
    mockFetch.mockReturnValueOnce(makeResponse(greenhouseHtml));
    const result = await scrapeJobPosting('https://boards.greenhouse.io/techcorp/jobs/123');
    expect(result.source).toBe('greenhouse');
    expect(result.role).toBe('Backend Engineer');
    expect(result.company).toBe('TechCorp');
    expect(result.location).toBe('San Francisco, CA');
  });

  it('strips leading "at " from company name', async () => {
    mockFetch.mockReturnValueOnce(makeResponse(greenhouseHtml));
    const result = await scrapeJobPosting('https://boards.greenhouse.io/techcorp/jobs/123');
    expect(result.company).not.toMatch(/^at /i);
  });
});

//JSON-LD 

const jsonLdHtml = `
<html>
<head>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": "Data Engineer",
    "hiringOrganization": { "name": "DataCo" },
    "jobLocation": { "address": { "addressLocality": "New York" } },
    "description": "<p>Join our data team.</p>"
  }
  </script>
</head>
<body></body>
</html>`;

describe('scrapeJsonLd', () => {
  it('extracts fields from JSON-LD JobPosting schema', async () => {
    mockFetch.mockReturnValueOnce(makeResponse(jsonLdHtml));
    const result = await scrapeJobPosting('https://careers.example.com/jobs/456');
    expect(result.source).toBe('jsonld');
    expect(result.role).toBe('Data Engineer');
    expect(result.company).toBe('DataCo');
    expect(result.location).toBe('New York');
  });

  it('strips HTML tags from description', async () => {
    mockFetch.mockReturnValueOnce(makeResponse(jsonLdHtml));
    const result = await scrapeJobPosting('https://careers.example.com/jobs/456');
    expect(result.text).not.toContain('<p>');
    expect(result.text).toContain('Join our data team');
  });

  it('returns source=unknown when no JSON-LD JobPosting present', async () => {
    mockFetch.mockReturnValueOnce(makeResponse('<html><body>just some text</body></html>'));
    const result = await scrapeJobPosting('https://random.example.com/job');
    expect(result.source).toBe('unknown');
  });
});

//Routing 

describe('scrapeJobPosting routing', () => {
  it('routes lever.co to Lever scraper', async () => {
    mockFetch.mockReturnValueOnce(makeResponse(leverHtml));
    const result = await scrapeJobPosting('https://jobs.lever.co/company/uuid');
    expect(result.source).toBe('lever');
  });

  it('routes greenhouse.io to Greenhouse scraper', async () => {
    mockFetch.mockReturnValueOnce(makeResponse(greenhouseHtml));
    const result = await scrapeJobPosting('https://boards.greenhouse.io/co/jobs/1');
    expect(result.source).toBe('greenhouse');
  });

  it('throws on non-2xx response', async () => {
    mockFetch.mockReturnValueOnce(makeResponse('', 404));
    await expect(scrapeJobPosting('https://jobs.lever.co/co/uuid')).rejects.toThrow('404');
  });
});
