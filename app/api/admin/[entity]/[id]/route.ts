import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { getStore } from '@/lib/db';
import { ENTITY_KEYS, type EntityKey } from '@/lib/types';
import { validateEntity } from '@/lib/validation';

export const dynamic = 'force-dynamic';

function entityOf(params: { entity: string }): EntityKey | null {
  const entity = params.entity as EntityKey;
  return ENTITY_KEYS.includes(entity) ? entity : null;
}

/** PATCH — update an item. */
export async function PATCH(req: Request, { params }: { params: { entity: string; id: string } }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const entity = entityOf(params);
  if (!entity) return NextResponse.json({ ok: false, error: 'Unknown entity.' }, { status: 400 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON.' }, { status: 400 });
  }

  try {
    const store = await getStore();
    const snapshot = await store.getSnapshot();
    // Merge with existing so validation sees a complete object.
    const existing = (snapshot[entity] as unknown as Array<Record<string, unknown>>).find((r) => r.id === params.id);
    if (!existing) return NextResponse.json({ ok: false, error: 'Item not found.' }, { status: 404 });
    const merged = { ...existing, ...body };
    const validation = validateEntity(entity, merged, snapshot, params.id);
    if (!validation.ok) return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });
    const updated = await store.updateItem(entity, params.id, validation.data);
    return NextResponse.json({ ok: true, snapshot: updated });
  } catch (err) {
    console.error('Update error:', err);
    return NextResponse.json({ ok: false, error: 'Failed to update item.' }, { status: 500 });
  }
}

/** DELETE — remove an item. */
export async function DELETE(_req: Request, { params }: { params: { entity: string; id: string } }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const entity = entityOf(params);
  if (!entity) return NextResponse.json({ ok: false, error: 'Unknown entity.' }, { status: 400 });

  try {
    const store = await getStore();
    const snapshot = await store.getSnapshot();
    const existing = (snapshot[entity] as unknown as Array<Record<string, unknown>>).find((r) => r.id === params.id);
    if (!existing) return NextResponse.json({ ok: false, error: 'Item not found.' }, { status: 404 });
    const updated = await store.deleteItem(entity, params.id);

    // Best-effort storage cleanup so deleted certificates don't leave orphan files.
    if (store.deleteUpload) {
      const fileUrls: string[] = [];
      if (entity === 'certificates' && typeof existing.file === 'string') fileUrls.push(existing.file);
      if (entity === 'hackathons' && typeof existing.certificate_file === 'string') fileUrls.push(existing.certificate_file);
      for (const url of fileUrls) {
        try {
          await store.deleteUpload(url);
        } catch (cleanupErr) {
          console.warn('Storage cleanup failed (item was still deleted):', cleanupErr);
        }
      }
    }

    return NextResponse.json({ ok: true, snapshot: updated });
  } catch (err) {
    console.error('Delete error:', err);
    return NextResponse.json({ ok: false, error: 'Failed to delete item.' }, { status: 500 });
  }
}
