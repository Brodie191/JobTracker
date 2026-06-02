import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cookie Policy — Job Tracker',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xs font-bold tracking-widest mb-4">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function CookiePolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 font-mono">
      <div className="mb-10">
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          ← Back
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
      <p className="text-xs text-muted-foreground mb-12">Last updated: 2 June 2026</p>

      <Section title="OVERVIEW">
        <p>
          This policy explains what cookies Job Tracker sets, why, and how you can control them.
          It is issued under the UK Privacy and Electronic Communications Regulations (PECR) and
          the UK GDPR. For broader data practices see our{' '}
          <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-foreground">
            Privacy Policy
          </Link>.
        </p>
      </Section>

      <Section title="WHAT ARE COOKIES?">
        <p>
          Cookies are small text files that a website stores in your browser when you visit. They
          allow the site to remember information across page loads and sessions. Cookies set by
          the site you are visiting are called "first-party"; those set by external services are
          "third-party".
        </p>
      </Section>

      <Section title="COOKIES WE USE">
        <div>
          <h3 className="text-xs font-bold tracking-wider mb-2 text-foreground">
            STRICTLY NECESSARY — always active
          </h3>
          <p className="mb-4">
            These cookies are required for core site functionality (signing in and staying signed
            in). Without them the service cannot work. Under PECR, strictly necessary cookies are
            exempt from the consent requirement.
          </p>
          <div className="border border-border rounded overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left font-normal text-muted-foreground">Cookie name</th>
                  <th className="p-3 text-left font-normal text-muted-foreground">Set by</th>
                  <th className="p-3 text-left font-normal text-muted-foreground">Purpose</th>
                  <th className="p-3 text-left font-normal text-muted-foreground">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-3 font-mono break-all">sb-&lt;ref&gt;-auth-token</td>
                  <td className="p-3">Supabase</td>
                  <td className="p-3">
                    Stores your encrypted JWT session so you remain signed in. HTTP-only and
                    Secure flags prevent JavaScript access.
                  </td>
                  <td className="p-3 whitespace-nowrap">1 hour (auto-refreshed)</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono break-all">sb-&lt;ref&gt;-auth-token.0</td>
                  <td className="p-3">Supabase</td>
                  <td className="p-3">
                    Overflow chunk of the auth token when it exceeds the 4 KB browser cookie
                    limit. Same security flags as above.
                  </td>
                  <td className="p-3 whitespace-nowrap">1 hour (auto-refreshed)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-xs font-bold tracking-wider mb-2 text-foreground">
            ANALYTICS &amp; ADVERTISING — none
          </h3>
          <p>
            Job Tracker does <strong>not</strong> use Google Analytics, Meta Pixel, or any other
            analytics, advertising, or tracking cookies. No third-party tracking scripts are loaded.
          </p>
        </div>
      </Section>

      <Section title="LOCAL STORAGE (NOT COOKIES)">
        <p>
          We also use <code>localStorage</code> — browser storage that never leaves your device
          and is not transmitted to our servers. We store:
        </p>
        <div className="border border-border rounded overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left font-normal text-muted-foreground">Key</th>
                <th className="p-3 text-left font-normal text-muted-foreground">Purpose</th>
                <th className="p-3 text-left font-normal text-muted-foreground">Expires</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 font-mono">cookie_consent</td>
                <td className="p-3">
                  Records whether you accepted or rejected non-essential cookies so the banner
                  does not reappear on every visit.
                </td>
                <td className="p-3">Until you clear browser storage</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="YOUR CONSENT CHOICES">
        <p>
          When you first visit Job Tracker you are shown a cookie banner with two equally prominent
          options:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>Accept all</strong> — records consent for any non-essential cookies we may add
            in the future. The strictly necessary Supabase auth cookies load regardless.
          </li>
          <li>
            <strong>Reject all</strong> — records that you do not consent to non-essential cookies.
            Strictly necessary auth cookies still load (they are exempt from PECR consent).
          </li>
        </ul>
        <p>
          Your choice is stored in <code>localStorage</code> under the key{' '}
          <code>cookie_consent</code>. To withdraw or change your consent, clear your browser's
          localStorage for this site and reload — the banner will reappear.
        </p>
      </Section>

      <Section title="HOW TO CONTROL OR DELETE COOKIES">
        <p>
          You can also manage cookies directly through your browser. Note that blocking the
          Supabase auth cookies will prevent you from signing in.
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <a
              href="https://support.google.com/chrome/answer/95647"
              className="underline underline-offset-2 hover:text-foreground"
              target="_blank"
              rel="noreferrer"
            >
              Google Chrome ↗
            </a>
          </li>
          <li>
            <a
              href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
              className="underline underline-offset-2 hover:text-foreground"
              target="_blank"
              rel="noreferrer"
            >
              Mozilla Firefox ↗
            </a>
          </li>
          <li>
            <a
              href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"
              className="underline underline-offset-2 hover:text-foreground"
              target="_blank"
              rel="noreferrer"
            >
              Apple Safari ↗
            </a>
          </li>
          <li>
            <a
              href="https://support.microsoft.com/en-gb/windows/manage-cookies-in-microsoft-edge-168dab11-0753-043d-7c16-ede5947fc64d"
              className="underline underline-offset-2 hover:text-foreground"
              target="_blank"
              rel="noreferrer"
            >
              Microsoft Edge ↗
            </a>
          </li>
        </ul>
      </Section>

      <Section title="CONTACT">
        <p>
          Questions about this policy:{' '}
          <a
            href="mailto:babhairsalim33@gmail.com"
            className="underline underline-offset-2 hover:text-foreground"
          >
            babhairsalim33@gmail.com
          </a>
        </p>
      </Section>
    </div>
  );
}
