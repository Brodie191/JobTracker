import 'server-only';

export const authLimiter = null;
export const mutationLimiter = null;
export const expensiveLimiter = null;

export async function checkRateLimit(
  _limiter: null,
  _identifier: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  return { ok: true };
}
