import { cookies } from 'next/headers';
import { supabaseConfigured } from './db';

/**
 * Admin authentication.
 *
 * - Supabase mode (recommended): uses Supabase Auth email/password. Create the
 *   admin user in the Supabase dashboard (Authentication → Users → Add user).
 * - Local/demo mode: credentials come from ADMIN_EMAIL / ADMIN_PASSWORD env vars
 *   (server-side only — never exposed to the client). Sessions are signed
 *   httpOnly cookies (HMAC-SHA256).
 *
 * No password is ever hardcoded in this repository.
 */

export const ADMIN_COOKIE = 'dv_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

async function hmac(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Buffer.from(sig).toString('base64url');
}

function localSecret(): string {
  return process.env.AUTH_SECRET || `dv-fallback::${process.env.ADMIN_PASSWORD || ''}`;
}

export function localAuthConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export async function login(email: string, password: string): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
  if (supabaseConfigured()) {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } },
    );
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      return { ok: false, error: error?.message || 'Invalid credentials.' };
    }
    return { ok: true, token: `sb.${data.session.access_token}` };
  }

  if (!localAuthConfigured()) {
    return {
      ok: false,
      error:
        'Admin login is not configured. Set ADMIN_PASSWORD (and optionally ADMIN_EMAIL) in .env.local — see README.md.',
    };
  }
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@localhost';
  const adminPassword = process.env.ADMIN_PASSWORD!;
  const emailOk = safeEqual(email.trim().toLowerCase(), adminEmail.trim().toLowerCase());
  const passOk = safeEqual(password, adminPassword);
  if (!emailOk || !passOk) {
    return { ok: false, error: 'Invalid email or password.' };
  }
  const payload = Buffer.from(
    JSON.stringify({ email: adminEmail, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS }),
  ).toString('base64url');
  const sig = await hmac(localSecret(), payload);
  return { ok: true, token: `local.${payload}.${sig}` };
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  const { timingSafeEqual } = require('crypto') as typeof import('crypto');
  return timingSafeEqual(ba, bb);
}

export async function verifySession(token: string | undefined | null): Promise<{ email: string } | null> {
  if (!token) return null;
  try {
    if (token.startsWith('local.')) {
      const [, payload, sig] = token.split('.');
      if (!payload || !sig) return null;
      const expected = await hmac(localSecret(), payload);
      if (!safeEqual(sig, expected)) return null;
      const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
        email: string;
        exp: number;
      };
      if (data.exp * 1000 < Date.now()) return null;
      return { email: data.email };
    }
    if (token.startsWith('sb.')) {
      if (!supabaseConfigured()) return null;
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } },
      );
      const { data, error } = await supabase.auth.getUser(token.slice(3));
      if (error || !data.user) return null;
      return { email: data.user.email || 'admin' };
    }
  } catch {
    return null;
  }
  return null;
}

/** Server-side guard for pages/route handlers. Returns the admin or null. */
export async function getAdmin(): Promise<{ email: string } | null> {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  return verifySession(token);
}

export async function requireAdmin(): Promise<{ email: string }> {
  const admin = await getAdmin();
  if (!admin) throw new Error('UNAUTHORIZED');
  return admin;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  };
}
