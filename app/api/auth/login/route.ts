import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, login, sessionCookieOptions } from '@/lib/auth';
import { clientIp, rateLimit, startCleanup } from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';
startCleanup();

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const limit = rateLimit(`login:${ip}`, 5, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: `Too many login attempts. Try again in ${Math.ceil(limit.retryAfterSec / 60)} min.` },
      { status: 429 },
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const email = String(body.email || '').trim();
  const password = String(body.password || '');
  if (!email || !password) {
    return NextResponse.json({ ok: false, error: 'Email and password are required.' }, { status: 400 });
  }

  const result = await login(email, password);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, result.token, sessionCookieOptions());
  return res;
}
