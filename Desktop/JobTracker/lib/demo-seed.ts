import 'server-only';
import { addDays, format, subDays } from 'date-fns';
import type { SupabaseClient } from '@supabase/supabase-js';
import { DEMO_APPLICATIONS } from '@/lib/demo-data';
import type { ApplicationStatus } from '@/lib/types';

/**
 * Replaces the demo account's applications with a freshly dated seed set.
 *
 * Deliberately takes the caller's authenticated client rather than the
 * service-role one: the delete is scoped by RLS ("Users can manage own
 * applications"), so this can only ever affect the signed-in user's own rows.
 */
export async function seedDemoApplications(supabase: SupabaseClient, userId: string) {
  const { error: deleteError } = await supabase
    .from('applications')
    .delete()
    .eq('user_id', userId);

  if (deleteError) return { error: deleteError.message };

  const now = new Date();
  const positions: Partial<Record<ApplicationStatus, number>> = {};

  const rows = DEMO_APPLICATIONS.map((application) => {
    const { daysAgo, progressDays, ...fields } = application;
    const appliedAt = subDays(now, daysAgo);
    const position = positions[application.status] ?? 0;
    positions[application.status] = position + 1;

    return {
      ...fields,
      user_id: userId,
      position,
      applied_at: format(appliedAt, 'yyyy-MM-dd'),
      created_at: appliedAt.toISOString(),
      // stage_timing() averages (updated_at - created_at), so this gap is what
      // gives the Analytics timing panel something to report.
      updated_at: addDays(appliedAt, progressDays).toISOString(),
    };
  });

  const { error: insertError } = await supabase.from('applications').insert(rows);
  if (insertError) return { error: insertError.message };

  return { count: rows.length };
}
