'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { parseJobUrl } from '@/lib/actions/parse-url';

interface ParsedFields {
  company?: string;
  role?: string;
  location?: string;
  salary_range?: string;
  job_url?: string;
}

interface UrlParseRowProps {
  onFieldsExtracted: (fields: ParsedFields) => void;
}

export function UrlParseRow({ onFieldsExtracted }: UrlParseRowProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleParse() {
    if (!url) return;
    setLoading(true);
    const result = await parseJobUrl(url);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.success && result.fields) {
      onFieldsExtracted({
        company: result.fields.company,
        role: result.fields.role,
        location: result.fields.location,
        salary_range: (result.fields as { salary_range?: string }).salary_range,
        job_url: url,
      });
      toast.success(
        result.modelUsed ? 'Extracted via ML model' : 'Extracted from structured data'
      );
    }
  }

  return (
    <div className="border-b border-border pb-4 mb-2">
      <div className="font-mono text-xs text-muted-foreground tracking-wider mb-2">
        QUICK FILL
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Paste a Greenhouse, Lever, or other job URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleParse()}
          disabled={loading}
          type="url"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleParse}
          disabled={loading || !url}
        >
          {loading ? 'Parsing...' : 'Extract'}
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1.5 font-mono">
        Supports Greenhouse, Lever, and most pages with structured data.
      </p>
    </div>
  );
}
