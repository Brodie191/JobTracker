export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ApplicationsTable } from '@/components/applications-table';
import type { Application } from '@/lib/types';

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: applications } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="font-mono text-[10px] tracking-widest text-muted-foreground mb-1">01</p>
        <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
      </div>
      <ApplicationsTable applications={(applications as Application[]) ?? []} />
    </div>
  );
}
