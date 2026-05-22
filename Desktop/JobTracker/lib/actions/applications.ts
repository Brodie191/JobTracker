'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { applicationSchema } from '@/lib/schemas';
import { mutationLimiter, checkRateLimit } from '@/lib/rate-limit';
import type { ApplicationStatus } from '@/lib/types';

export async function createApplication(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const rl = await checkRateLimit(mutationLimiter, user.id);
  if (!rl.ok) return { error: rl.error };

  const parsed = applicationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const { data: maxRow } = await supabase
    .from('applications')
    .select('position')
    .eq('user_id', user.id)
    .eq('status', 'applied')
    .order('position', { ascending: false })
    .limit(1)
    .single();

  const nextPosition = (maxRow?.position ?? -1) + 1;

  const { error } = await supabase.from('applications').insert({
    ...parsed.data,
    location: parsed.data.location || null,
    salary_range: parsed.data.salary_range || null,
    job_url: parsed.data.job_url || null,
    notes: parsed.data.notes || null,
    position: nextPosition,
  });

  if (error) return { error: error.message };
  revalidatePath('/applications');
  revalidatePath('/board');
  return { success: true };
}

export async function updateApplication(
  id: string,
  updates: Partial<{
    company: string;
    role: string;
    status: ApplicationStatus;
    location: string | null;
    salary_range: string | null;
    job_url: string | null;
    notes: string | null;
    applied_at: string;
    position: number;
  }>
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const rl = await checkRateLimit(mutationLimiter, user.id);
  if (!rl.ok) return { error: rl.error };

  const { error } = await supabase
    .from('applications')
    .update(updates)
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/applications');
  revalidatePath('/board');
  return { success: true };
}

export async function deleteApplication(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const rl = await checkRateLimit(mutationLimiter, user.id);
  if (!rl.ok) return { error: rl.error };

  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/applications');
  revalidatePath('/board');
  return { success: true };
}

export async function moveApplication(
  id: string,
  newStatus: ApplicationStatus,
  newPosition: number
) {
  return updateApplication(id, { status: newStatus, position: newPosition });
}
