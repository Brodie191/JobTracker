import 'server-only';

/**
 * Demo mode runs the real app against a single shared Supabase account so a
 * visitor can look around without signing up. It is off unless DEMO_MODE is
 * explicitly "true" AND both credentials are present, so a normal deployment
 * that never sets these vars behaves exactly as before.
 */
export function demoConfig() {
  const email = process.env.DEMO_EMAIL?.trim();
  const password = process.env.DEMO_PASSWORD;

  return {
    enabled: process.env.DEMO_MODE === 'true' && !!email && !!password,
    email,
    password,
  };
}

/**
 * True only when demo mode is on AND the caller is authenticated as the demo
 * account. Every demo-only branch is gated on this, so a real user signed in to
 * the same deployment keeps the unmodified behaviour.
 */
export function isDemoSession(user: { email?: string | null } | null | undefined) {
  const { enabled, email } = demoConfig();
  if (!enabled || !email || !user?.email) return false;
  return user.email.toLowerCase() === email.toLowerCase();
}

/** Message returned by actions that are disabled on the shared demo account. */
export const DEMO_BLOCKED =
  'Disabled in the demo so the shared sandbox stays usable for the next visitor.';
