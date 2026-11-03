import { NextResponse } from 'next/server';
import { getStore } from '@/lib/db';

export const dynamic = 'force-dynamic';

/** Deployment health probe: /api/health — useful after deploying to Vercel. */
export async function GET() {
  try {
    const store = await getStore();
    await store.getSnapshot(); // resolves (and caches) the storage tier in this bundle
    let storage: string;
    if (store.mode === 'supabase') {
      storage = 'Supabase (persistent)';
    } else {
      const { localStoreMode } = await import('@/lib/db/local');
      const tier = localStoreMode();
      storage =
        tier === 'cwd'
          ? 'local JSON file (writable disk)'
          : tier === 'tmp'
            ? 'temporary /tmp storage (read-only host — configure Supabase for persistence)'
            : 'in-memory only (nothing writable — configure Supabase for persistence)';
    }
    return NextResponse.json({ ok: true, store: store.mode, storage, timestamp: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'unknown' },
      { status: 500 },
    );
  }
}
