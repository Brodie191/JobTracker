import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — Job Tracker',
};

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-10">
      <h2 className="text-xs font-bold tracking-widest mb-4">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 font-mono">
      <div className="mb-10">
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          ← Back
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-xs text-muted-foreground mb-12">Last updated: 2 June 2026</p>

      <Section id="who-we-are" title="1. WHO WE ARE">
        <p>
          Job Tracker is an independent application that helps you track job applications. For any
          privacy-related queries, contact us at{' '}
          <a href="mailto:babhairsalim33@gmail.com" className="underline underline-offset-2 hover:text-foreground">
            babhairsalim33@gmail.com
          </a>.
        </p>
        <p>
          As a small-scale operator not engaged in large-scale systematic processing of special
          category data, we are not required to appoint a Data Protection Officer under UK GDPR
          Article 37.
        </p>
      </Section>

      <Section id="data-collected" title="2. WHAT DATA WE COLLECT">
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Account data:</strong> email address, display name (optional)</li>
          <li><strong>Application data:</strong> job applications you create — company, role, status, notes, dates, salary</li>
          <li><strong>Preferences:</strong> default view (board or table), colour theme</li>
          <li><strong>Technical data:</strong> authentication session tokens stored in HTTP-only cookies</li>
        </ul>
        <p>
          We do not collect IP addresses, device fingerprints, behavioural analytics, or any
          special category data.
        </p>
      </Section>

      <Section id="how-we-use" title="3. HOW WE USE YOUR DATA">
        <ul className="list-disc list-inside space-y-1">
          <li>Providing and operating the Job Tracker service</li>
          <li>Authenticating your account and maintaining a secure session</li>
          <li>Storing your application records so you can access them across devices</li>
          <li>Applying your preferences (theme, default view)</li>
        </ul>
        <p>
          <strong>Legal basis:</strong> Contract performance (UK GDPR Art. 6(1)(b)) — processing
          is necessary to deliver the service you signed up for. We have no other legal basis and
          do not use your data for marketing or profiling.
        </p>
      </Section>

      <Section id="retention" title="4. DATA RETENTION">
        <p>
          Your data is retained for as long as your account is active. When you delete your
          account via <Link href="/settings" className="underline underline-offset-2 hover:text-foreground">Settings → Danger Zone</Link>, all
          personal data — your profile, email address, and all job applications — is permanently
          and immediately deleted from our database.
        </p>
        <p>
          Supabase (our database provider) may retain infrastructure-level transaction logs for
          up to 30 days for operational integrity. These logs do not contain your application data.
        </p>
      </Section>

      <Section id="security" title="5. DATA SECURITY">
        <p>
          All data is stored in Supabase (PostgreSQL) hosted within the EU. Security measures include:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Encryption at rest (AES-256) and in transit (TLS 1.2+)</li>
          <li>Row-level security (RLS) policies so each user can only access their own records</li>
          <li>Authentication via JWT tokens delivered in HTTP-only, Secure, SameSite cookies</li>
          <li>No plaintext passwords stored — Supabase uses bcrypt hashing</li>
        </ul>
      </Section>

      <Section id="third-parties" title="6. THIRD PARTIES">
        <p>We use the following sub-processors:</p>
        <div className="space-y-4">
          <div>
            <strong>Supabase Inc.</strong> (supabase.com) — database, authentication, and file
            storage. Operates as a data processor under our instruction. EU data residency
            available.{' '}
            <a
              href="https://supabase.com/privacy"
              className="underline underline-offset-2 hover:text-foreground"
              target="_blank"
              rel="noreferrer"
            >
              Supabase Privacy Policy ↗
            </a>
          </div>
          <div>
            <strong>Vercel Inc.</strong> (vercel.com) — application hosting and CDN. Processes
            HTTP request metadata transiently to serve the application.{' '}
            <a
              href="https://vercel.com/legal/privacy-policy"
              className="underline underline-offset-2 hover:text-foreground"
              target="_blank"
              rel="noreferrer"
            >
              Vercel Privacy Policy ↗
            </a>
          </div>
        </div>
        <p>
          No data is sold, rented, or shared with advertisers, analytics providers, or any other
          third party beyond the sub-processors listed above.
        </p>
      </Section>

      <Section id="your-rights" title="7. YOUR RIGHTS (UK GDPR)">
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Right of access:</strong> export your data as CSV from{' '}
            <Link href="/settings" className="underline underline-offset-2 hover:text-foreground">Settings → Data → Export</Link>
          </li>
          <li>
            <strong>Right to rectification:</strong> update your email or display name in{' '}
            <Link href="/settings" className="underline underline-offset-2 hover:text-foreground">Settings → Profile</Link>
          </li>
          <li>
            <strong>Right to erasure ("Right to be Forgotten"):</strong> permanently delete your
            account and all associated data in{' '}
            <Link href="/settings" className="underline underline-offset-2 hover:text-foreground">Settings → Danger Zone → Delete account</Link>
          </li>
          <li>
            <strong>Right to data portability:</strong> download your application data as CSV from
            Settings → Data
          </li>
          <li>
            <strong>Right to object or restrict processing:</strong> contact us at{' '}
            <a href="mailto:babhairsalim33@gmail.com" className="underline underline-offset-2 hover:text-foreground">
              babhairsalim33@gmail.com
            </a>
          </li>
        </ul>
        <p>
          You also have the right to lodge a complaint with the{' '}
          <a
            href="https://ico.org.uk/make-a-complaint/"
            className="underline underline-offset-2 hover:text-foreground"
            target="_blank"
            rel="noreferrer"
          >
            Information Commissioner's Office (ICO) ↗
          </a>
          , the UK supervisory authority for data protection.
        </p>
      </Section>

      <Section id="cookies" title="8. COOKIES">
        <p>
          We use only strictly necessary cookies for authentication. See our{' '}
          <Link href="/cookie-policy" className="underline underline-offset-2 hover:text-foreground">
            Cookie Policy
          </Link>{' '}
          for a full list of cookies, their purposes, and how to control them.
        </p>
      </Section>

      <Section id="changes" title="9. CHANGES TO THIS POLICY">
        <p>
          If we make material changes to this policy, we will update the "last updated" date
          above. Continued use of the service after changes constitutes acceptance.
        </p>
      </Section>

      <Section id="contact" title="10. CONTACT">
        <p>
          For any privacy questions, data requests, or to exercise your rights:{' '}
          <a href="mailto:babhairsalim33@gmail.com" className="underline underline-offset-2 hover:text-foreground">
            babhairsalim33@gmail.com
          </a>
        </p>
      </Section>
    </div>
  );
}
