import 'server-only';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

function makeRatelimit(prefix: string, limit: number, window: string) {
  const url = (process.env.UPSTASH_REDIS_REST_URL ?? '').replace(/^["']+|["']+$/g, '');
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN ?? '').replace(/^["']+|["']+$/g, '');
  if (!url.startsWith('https://') || !token) return null;
  try {
    return new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(limit, window as Parameters<typeof Ratelimit.slidingWindow>[1]),
      analytics: true,
      prefix,
    });
  } catch {
    return null;
  }
}

// Auth endpoints — limited by IP (user not yet known)
export const authLimiter = makeRatelimit('rl:auth', 5, '1 m');

// Mutations — limited by user ID
export const mutationLimiter = makeRatelimit('rl:mutation', 30, '1 m');

// Expensive operations — limited by user ID
export const expensiveLimiter = makeRatelimit('rl:expensive', 5, '1 m');

export async function checkRateLimit(
  limiter: ReturnType<typeof makeRatelimit>,
  identifier: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!limiter) return { ok: true };
  try {
    const { success, reset } = await limiter.limit(identifier);
    if (!success) {
      const seconds = Math.ceil((reset - Date.now()) / 1000);
      return { ok: false, error: `Too many attempts. Try again in ${seconds}s.` };
    }
    return { ok: true };
  } catch {
    return { ok: true };
  }
}
