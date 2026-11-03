import { NextResponse } from 'next/server';
import { getStore } from '@/lib/db';
import { clientIp, rateLimit, startCleanup } from '@/lib/ratelimit';
import { deviceFromUA } from '@/lib/utils';
import type { AnalyticsEvent } from '@/lib/db/store';

export const dynamic = 'force-dynamic';
startCleanup();

const VALID_TYPES = new Set(['page_view', 'project_view', 'section_view', 'blog_view']);

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const limit = rateLimit(`track:${ip}`, 60, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ ok: false, error: 'Too many requests.' }, { status: 429 });
  }

  let body: { events?: Array<{ type?: string; key?: string; device?: string }> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON.' }, { status: 400 });
  }

  const events = Array.isArray(body.events) ? body.events.slice(0, 20) : [];
  const device = deviceFromUA(req.headers.get('user-agent') || '');
  const now = new Date().toISOString();

  const clean: AnalyticsEvent[] = events
    .filter((e): e is { type: string; key: string; device?: string } =>
      Boolean(e) && typeof e.key === 'string' && VALID_TYPES.has(String(e.type)) && e.key.length <= 200)
    .map((e) => ({
      type: e.type as AnalyticsEvent['type'],
      key: e.key,
      device: (['desktop', 'mobile', 'tablet'] as const).includes(e.device as never)
        ? (e.device as AnalyticsEvent['device'])
        : device,
      createdAt: now,
    }));

  if (!clean.length) {
    return NextResponse.json({ ok: true, recorded: 0 });
  }

  try {
    const store = await getStore();
    await store.recordEvents(clean);
    return NextResponse.json({ ok: true, recorded: clean.length });
  } catch {
    // Analytics must never surface errors to visitors.
    return NextResponse.json({ ok: true, recorded: 0 });
  }
}
