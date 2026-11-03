import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { getStore } from '@/lib/db';

export const dynamic = 'force-dynamic';

/** GET — private analytics summary (admin only). */
export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const store = await getStore();
    const summary = await store.getAnalytics();
    return NextResponse.json({ ok: true, summary });
  } catch (err) {
    console.error('Analytics error:', err);
    return NextResponse.json({ ok: false, error: 'Failed to load analytics.' }, { status: 500 });
  }
}
