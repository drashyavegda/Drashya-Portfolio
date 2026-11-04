import { cache } from 'react';
import type { Store } from './store';

let cached: Store | null = null;

export function supabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Next.js 14 caches fetch GETs by default during page renders (fetchCache 'auto').
 * Supabase reads MUST always hit the network, or the site serves stale content and
 * the self-seed check gets frozen on an outdated response. Force no-store.
 */
const noStoreFetch: typeof fetch = (input, init) => fetch(input, { ...init, cache: 'no-store' });

/** Returns the active store: Supabase when configured, local JSON fallback otherwise. */
export async function getStore(): Promise<Store> {
  if (cached) return cached;
  if (supabaseConfigured()) {
    const { createClient } = await import('@supabase/supabase-js');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const readClient = createClient(url, anon, {
      auth: { persistSession: false },
      global: { fetch: noStoreFetch },
    });
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const writeClient = serviceKey
      ? createClient(url, serviceKey, { auth: { persistSession: false }, global: { fetch: noStoreFetch } })
      : readClient;
    const { makeSupabaseStore } = await import('./supabase');
    cached = makeSupabaseStore(readClient, writeClient);
  } else {
    const { localStore } = await import('./local');
    cached = localStore;
  }
  return cached;
}

/** Per-request deduplicated snapshot fetch (React cache). */
export const getSnapshot = cache(async () => {
  const store = await getStore();
  return store.getSnapshot();
});
