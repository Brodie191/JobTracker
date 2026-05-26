'use server';

import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { profileSchema, passwordSchema } from '@/lib/schemas';
import { authLimiter, mutationLimiter, checkRateLimit } from '@/lib/rate-limit';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const rl = await checkRateLimit(mutationLimiter, user.id);
  if (!rl.ok) return { error: rl.error };

  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ display_name: parsed.data.display_name || null })
    .eq('id', user.id);

  if (error) return { error: error.message };
  revalidatePath('/settings');
  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const ip = (await headers()).get('x-forwarded-for') ?? 'unknown';
  const rl = await checkRateLimit(authLimiter, ip);
  if (!rl.ok) return { error: rl.error };

  const parsed = passwordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: 'Not authenticated' };

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.current_password,
  });
  if (signInError) return { error: 'Current password is incorrect' };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.new_password });
  if (error) return { error: error.message };
  return { success: true };
}

type DefaultView = 'table' | 'board';
type Theme = 'light' | 'dark' | 'system';

export async function updatePreference(
  key: 'default_view' | 'theme',
  value: DefaultView | Theme
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const rl = await checkRateLimit(mutationLimiter, user.id);
  if (!rl.ok) return { error: rl.error };

  const allowedKeys = ['default_view', 'theme'] as const;
  if (!allowedKeys.includes(key)) return { error: 'Invalid preference key' };

  const { error } = await supabase
    .from('profiles')
    .update({ [key]: value })
    .eq('id', user.id);

  if (error) return { error: error.message };
  revalidatePath('/settings');
  return { success: true };
}
