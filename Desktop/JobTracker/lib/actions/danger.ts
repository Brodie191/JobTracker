'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { expensiveLimiter, checkRateLimit } from '@/lib/rate-limit';

export async function deleteAllApplications() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const rl = await checkRateLimit(expensiveLimiter, user.id);
  if (!rl.ok) return { error: rl.error };

  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  revalidatePath('/applications');
  revalidatePath('/board');
  revalidatePath('/analytics');
  return { success: true };
}

export async function deleteAccount(confirmText: string) {
  if (confirmText !== 'DELETE MY ACCOUNT') {
    return { error: 'Confirmation text did not match' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const rl = await checkRateLimit(expensiveLimiter, user.id);
  if (!rl.ok) return { error: rl.error };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return { error: error.message };

  await supabase.auth.signOut();
  redirect('/auth/login');
}
