import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { getStore } from '@/lib/db';
import type { SitePatch } from '@/lib/db/store';
import { validateSitePatch } from '@/lib/validation';

export const dynamic = 'force-dynamic';

/** PATCH singletons: profile / education / availability / resume / settings. */
export async function PATCH(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON.' }, { status: 400 });
  }

  const validation = validateSitePatch(body);
  if (!validation.ok) {
    return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });
  }

  try {
    const store = await getStore();
    const snapshot = await store.updateSite(validation.data as SitePatch);
    return NextResponse.json({ ok: true, snapshot });
  } catch (err) {
    console.error('Site update error:', err);
    return NextResponse.json({ ok: false, error: 'Failed to save changes.' }, { status: 500 });
  }
}
