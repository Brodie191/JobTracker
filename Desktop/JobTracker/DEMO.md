# Demo mode

This branch adds a shareable, no-signup demo. A visitor opens `/demo`, gets signed
in to a single shared Supabase account, and lands on a board pre-seeded with 32
sample applications. Everything is live — drag-and-drop, the URL parser, analytics,
CSV/JSON export — because the demo runs the real app against a real account rather
than a mock layer.

Demo mode is **off** unless `DEMO_MODE=true` and both credentials are set, so the
`main` deployment is unaffected.

## Setup (one time, ~5 minutes)

**1. Create the demo user in Supabase**

Dashboard → Authentication → Users → **Add user** → *Create new user*:

- Email: `demo@yourdomain.com` (anything you like)
- Password: generate a long random one
- **Tick "Auto Confirm User"** — otherwise the account can't sign in

The `on_auth_user_created` trigger in [supabase/schema.sql](supabase/schema.sql)
creates the matching `profiles` row automatically.

**2. Set the environment variables**

Locally in `.env.local`, and in Vercel → Project → Settings → Environment Variables:

```
DEMO_MODE=true
DEMO_EMAIL=demo@yourdomain.com
DEMO_PASSWORD=the-password-from-step-1
```

**3. Deploy this branch**

Push it and let Vercel build the preview, or promote it to production. Then open
`/demo` once — the account is empty on first visit, so the route seeds it
automatically.

**4. Optional: make the board the demo's landing view**

Settings → Preferences → Default view → Board, while signed in as the demo user.
`/demo` already redirects to `/board` directly, so this only affects `/`.

## The link to send

```
https://<your-deployment>/demo
```

That's the whole thing — no credentials to pass along. If they land on the root
instead, the login page shows a **View the live demo** button.

## Keeping the demo tidy

Visitors share one account, so edits persist between them. The demo banner at the
top of every page has a **RESET DEMO DATA** button that wipes and re-seeds the 32
sample applications with fresh dates. Click it before sending the link out, and
again afterwards if you like.

Dates in the seed set are stored as offsets from today
([lib/demo-data.ts](lib/demo-data.ts)), not fixed dates, so the analytics charts
never look stale no matter when someone opens the link.

## What's disabled on the demo account

Blocked server-side in the actions themselves, not just hidden in the UI:

| Action | Why |
| --- | --- |
| Delete account | Would delete the demo account outright |
| Delete all applications | Would leave the next visitor an empty board |
| Change password | Would break the `/demo` auto-login |

Everything else — create, edit, delete a single application, drag between columns,
parse a job URL, export, change theme and default view — works normally.

## How it works

| File | Role |
| --- | --- |
| [app/demo/route.ts](app/demo/route.ts) | Signs in with the demo credentials, writes auth cookies onto the redirect response, seeds on first visit, redirects to `/board` |
| [lib/demo.ts](lib/demo.ts) | `demoConfig()` and `isDemoSession(user)` — the single gate every demo-only branch checks |
| [lib/demo-data.ts](lib/demo-data.ts) | The 32 seed applications, with dates as day-offsets |
| [lib/demo-seed.ts](lib/demo-seed.ts) | Wipe-and-reseed, run as the signed-in demo user so RLS scopes the delete |
| [lib/actions/demo.ts](lib/actions/demo.ts) | `resetDemoData()` server action behind the `isDemoSession` guard |
| [components/demo-banner.tsx](components/demo-banner.tsx) | The banner, the reset button, and the "what can I try?" tour |

Two notes on the implementation:

- The seed and reset paths use the visitor's **authenticated** client, not the
  service-role client. The delete is therefore scoped by the existing
  `"Users can manage own applications"` RLS policy — a non-demo session that
  somehow reached the code still couldn't touch another user's rows.
- `/demo` had to be added to the public-path list in
  [lib/supabase/proxy.ts](lib/supabase/proxy.ts), since it must be reachable
  without a session. `/privacy-policy` and `/cookie-policy` were added at the same
  time — they were previously redirected to login for signed-out visitors, which
  defeats the point of publishing them.

## Turning it off

Remove `DEMO_MODE` (or set it to anything other than `true`) and redeploy. `/demo`
then redirects to the login page and the banner, CTA, and demo guards all go quiet.
The demo user itself can be deleted from the Supabase dashboard.
