import { createClient } from '@/lib/supabase/server';

export interface ApplicationStats {
  total: number;
  active: number;
  offers: number;
  rejected: number;
  interviewing: number;
  applied: number;
  response_rate: number;
}

export interface WeeklyPoint {
  week_start: string;
  count: number;
}

export interface StageTiming {
  stage: 'applied_to_interviewing' | 'interviewing_to_offer';
  avg_days: number | null;
}

export async function getStats(): Promise<ApplicationStats | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('application_stats')
    .select('*')
    .single();
  return data;
}

export async function getWeekly(weeksBack = 12): Promise<WeeklyPoint[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc('applications_by_week', {
    weeks_back: weeksBack,
  });
  return data ?? [];
}

export async function getStageTiming(): Promise<StageTiming[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc('stage_timing');
  return data ?? [];
}
