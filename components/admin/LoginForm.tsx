'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, KeyRound, Loader2, Lock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (res.ok && data.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'Login failed.');
      }
    } catch {
      setError('Network error — please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-svh place-items-center px-5 py-16">
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-60" aria-hidden />
      <div className="pointer-events-none fixed left-1/4 top-1/4 h-72 w-72 rounded-full bg-neon/10 blur-[100px]" aria-hidden />
      <div className="pointer-events-none fixed bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-violet/10 blur-[100px]" aria-hidden />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-neon/30 bg-raised/70 font-display text-xl font-bold gradient-text shadow-glow">
            DV
          </span>
          <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
          <p className="mt-1.5 font-mono text-xs text-muted">Private area — owner authentication required</p>
        </div>

        <form onSubmit={onSubmit} className="glass-card p-6 sm:p-8">
          <label htmlFor="admin-email" className="admin-label">Email</label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input mb-4"
            placeholder="admin@example.com"
            autoComplete="username"
            required
          />

          <label htmlFor="admin-password" className="admin-label">Password</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input mb-5"
            placeholder="••••••••••••"
            autoComplete="current-password"
            required
          />

          {error && (
            <p className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-300" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:cursor-wait disabled:opacity-70">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <KeyRound className="h-4 w-4" aria-hidden />}
            {loading ? 'Verifying…' : 'Sign in'}
          </button>

          <div className="mt-6 space-y-2 border-t border-line/12 pt-5 text-[11px] leading-relaxed text-muted/80">
            <p className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neon" aria-hidden />
              <span>
                <strong className="text-ink">Supabase mode:</strong> sign in with the admin user created under
                Authentication → Users in your Supabase project.
              </span>
            </p>
            <p className="flex items-start gap-2">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet" aria-hidden />
              <span>
                <strong className="text-ink">Local/demo mode:</strong> credentials come from <code className="font-mono text-neon">ADMIN_EMAIL</code> /{' '}
                <code className="font-mono text-neon">ADMIN_PASSWORD</code> in <code className="font-mono">.env.local</code> (server-side only).
              </span>
            </p>
          </div>
        </form>

        <Link href="/" className="mt-6 flex items-center justify-center gap-2 font-mono text-xs text-muted transition-colors hover:text-neon">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to portfolio
        </Link>
      </div>
    </div>
  );
}
