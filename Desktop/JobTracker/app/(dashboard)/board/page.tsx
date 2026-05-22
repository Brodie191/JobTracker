export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Board } from '@/components/board/board';
import type { Application } from '@/lib/types';

export default async function BoardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: applications } = await supabase
    .from('applications')
    .select('*')
    .order('position', { ascending: true });

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="font-mono text-[10px] tracking-widest text-muted-foreground mb-1">02</p>
        <h1 className="text-3xl font-bold tracking-tight">Board</h1>
      </div>
      <Board initialApplications={(applications as Application[]) ?? []} />
    </div>
  );
}
