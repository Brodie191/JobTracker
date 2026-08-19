export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/dashboard-shell';
import { isDemoSession } from '@/lib/demo';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <DashboardShell email={user.email ?? ''} isDemo={isDemoSession(user)}>
      {children}
    </DashboardShell>
  );
}
