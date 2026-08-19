import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { demoConfig } from '@/lib/demo';
import { seedDemoApplications } from '@/lib/demo-seed';

export const dynamic = 'force-dynamic';

/**
 * Signs the visitor in to the shared demo account and drops them on the board.
 *
 * The auth cookies are written straight onto the redirect response (the same
 * pattern as lib/supabase/proxy.ts) rather than via next/headers cookies(),
 * because cookies set through that API are not guaranteed to survive a
 * NextResponse.redirect() returned from a route handler.
 */
export async function GET(request: NextRequest) {
  const { enabled, email, password } = demoConfig();

  if (!enabled) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  const response = NextResponse.redirect(new URL('/board', request.url));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email!,
    password: password!,
  });

  if (error || !data.user) {
    return NextResponse.redirect(new URL('/auth/login?demo=unavailable', request.url));
  }

  // First visit after deploying: seed the account so nobody ever lands on an
  // empty board. Existing data is left alone — resetting is the banner's job.
  const { count } = await supabase
    .from('applications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', data.user.id);

  if (!count) {
    await seedDemoApplications(supabase, data.user.id);
  }

  return response;
}
