export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProfileForm, PasswordForm } from './profile-form';
import { PreferencesForm } from './preferences-form';
import { ExportButtons } from './export-buttons';
import { DangerZone } from './danger-zone';

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="py-8">
      <h2 className="font-mono text-xs tracking-wider text-muted-foreground mb-6">{label}</h2>
      {children}
    </section>
  );
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="px-8 py-8 max-w-2xl">
      <div className="mb-8">
        <p className="font-mono text-[10px] tracking-widest text-muted-foreground mb-1">04</p>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <div className="border-t border-border" />

      <Section label="PROFILE">
        <ProfileForm
          displayName={profile?.display_name ?? null}
          email={user.email ?? ''}
        />
      </Section>

      <div className="border-t border-border" />

      <Section label="SECURITY">
        <PasswordForm />
      </Section>

      <div className="border-t border-border" />

      <Section label="PREFERENCES">
        <PreferencesForm
          defaultView={profile?.default_view ?? 'table'}
          theme={profile?.theme ?? 'system'}
        />
      </Section>

      <div className="border-t border-border" />

      <Section label="DATA">
        <ExportButtons />
      </Section>

      <div className="border-t border-border" />

      <Section label="DANGER ZONE">
        <DangerZone />
      </Section>
    </div>
  );
}
