'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { seedDemoApplications } from '@/lib/demo-seed';
import { isDemoSession } from '@/lib/demo';

/** Wipes and re-seeds the shared demo account. Demo session only. */
export async function resetDemoData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  if (!isDemoSession(user)) return { error: 'Not available' };

  const result = await seedDemoApplications(supabase, user.id);
  if ('error' in result) return { error: result.error };

  revalidatePath('/applications');
  revalidatePath('/board');
  revalidatePath('/analytics');
  revalidatePath('/settings');

  return { success: true, count: result.count };
}
