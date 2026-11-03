import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { getStore } from '@/lib/db';
import { ENTITY_KEYS, type EntityKey } from '@/lib/types';
import { validateEntity } from '@/lib/validation';

export const dynamic = 'force-dynamic';

/** POST — create a new item in a collection entity. */
export async function POST(req: Request, { params }: { params: { entity: string } }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const entity = params.entity as EntityKey;
  if (!ENTITY_KEYS.includes(entity)) {
    return NextResponse.json({ ok: false, error: 'Unknown entity.' }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON.' }, { status: 400 });
  }

  try {
    const store = await getStore();
    const snapshot = await store.getSnapshot();
    const validation = validateEntity(entity, body, snapshot);
    if (!validation.ok) {
      return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });
    }
    const updated = await store.createItem(entity, validation.data);
    return NextResponse.json({ ok: true, snapshot: updated });
  } catch (err) {
    console.error('Create error:', err);
    return NextResponse.json({ ok: false, error: 'Failed to create item.' }, { status: 500 });
  }
}
