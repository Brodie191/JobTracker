'use server';

import { createClient } from '@/lib/supabase/server';
import { expensiveLimiter, checkRateLimit } from '@/lib/rate-limit';

export async function exportJson() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const rl = await checkRateLimit(expensiveLimiter, user.id);
  if (!rl.ok) return { error: rl.error };

  const { data, error } = await supabase
    .from('applications')
    .select('company, role, status, applied_at, location, salary_range, job_url, notes, created_at')
    .eq('user_id', user.id)
    .order('applied_at', { ascending: false });

  if (error) return { error: error.message };
  return {
    success: true,
    filename: `applications-${new Date().toISOString().slice(0, 10)}.json`,
    content: JSON.stringify(data, null, 2),
  };
}

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export async function exportCsv() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const rl = await checkRateLimit(expensiveLimiter, user.id);
  if (!rl.ok) return { error: rl.error };

  const { data, error } = await supabase
    .from('applications')
    .select('company, role, status, applied_at, location, salary_range, job_url, notes')
    .eq('user_id', user.id)
    .order('applied_at', { ascending: false });

  if (error) return { error: error.message };

  const headers = ['Company', 'Role', 'Status', 'Applied Date', 'Location', 'Salary Range', 'Job URL', 'Notes'];
  const rows = (data ?? []).map((row) =>
    [row.company, row.role, row.status, row.applied_at,
      row.location, row.salary_range, row.job_url, row.notes]
      .map(csvEscape).join(',')
  );

  return {
    success: true,
    filename: `applications-${new Date().toISOString().slice(0, 10)}.csv`,
    content: [headers.join(','), ...rows].join('\n'),
  };
}
