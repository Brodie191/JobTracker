export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProfileForm, PasswordForm } from './profile-form';
import { PreferencesForm } from './preferences-form';
import { ExportButtons } from './export-buttons';
import { DangerZone } from './danger-zone';
import { isDemoSession } from '@/lib/demo';

function Section({
  label,
  note,
  children,
}: {
  label: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-8">
      <h2 className="font-mono text-xs tracking-wider text-muted-foreground mb-6">{label}</h2>
      {note && (
        <p className="-mt-3 mb-6 border-l-2 border-border pl-3 text-xs text-muted-foreground">
          {note}
        </p>
      )}
      {children}
    </section>
  );
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const isDemo = isDemoSession(user);

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

      <Section
        label="SECURITY"
        note={
          isDemo
            ? 'Password changes are switched off on the demo account — it would break the shared demo link.'
            : undefined
        }
      >
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

      <Section
        label="DANGER ZONE"
        note={
          isDemo
            ? 'Both actions are blocked on the demo account. The confirmation flow still works — use "Reset demo data" in the banner to restore the sample set.'
            : undefined
        }
      >
        <DangerZone />
      </Section>
    </div>
  );
}
