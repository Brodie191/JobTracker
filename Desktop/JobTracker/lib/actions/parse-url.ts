'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { scrapeJobPosting, callExtractionEndpoint } from '@/lib/scraper';
import { expensiveLimiter, checkRateLimit } from '@/lib/rate-limit';

const urlSchema = z.string().url().max(2000);

export async function parseJobUrl(url: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const parsed = urlSchema.safeParse(url);
  if (!parsed.success) return { error: 'Invalid URL' };

  const rl = await checkRateLimit(expensiveLimiter, user.id);
  if (!rl.ok) return { error: rl.error };

  try {
    const scraped = await scrapeJobPosting(parsed.data);

    if (scraped.company && scraped.role && scraped.location) {
      return { success: true, fields: scraped, modelUsed: false };
    }

    const extracted = await callExtractionEndpoint(scraped.text);
    if (extracted) {
      return {
        success: true,
        fields: { ...scraped, ...extracted },
        modelUsed: true,
      };
    }

    return { success: true, fields: scraped, modelUsed: false };
  } catch {
    return { error: 'Could not parse this URL. Try Greenhouse, Lever, or a page with structured data.' };
  }
}
