import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { getStore } from '@/lib/db';

export const dynamic = 'force-dynamic';

/** PATCH — mark messages read/unread or remove them. Body: { updates: [{ id, read?, remove? }] } */
export async function PATCH(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  let body: { updates?: Array<{ id?: string; read?: boolean; remove?: boolean }> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON.' }, { status: 400 });
  }

  const updates = Array.isArray(body.updates)
    ? body.updates
        .filter((u) => u && typeof u.id === 'string' && (typeof u.read === 'boolean' || u.remove === true))
        .slice(0, 100)
        .map((u) => ({ id: u.id as string, read: u.read, remove: u.remove }))
    : [];

  if (!updates.length) {
    return NextResponse.json({ ok: false, error: 'No valid updates.' }, { status: 400 });
  }

  try {
    const store = await getStore();
    await store.setMessagesState(updates);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Messages error:', err);
    return NextResponse.json({ ok: false, error: 'Failed to update messages.' }, { status: 500 });
  }
}
