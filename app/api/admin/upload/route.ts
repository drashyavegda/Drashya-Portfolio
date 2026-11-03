import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { getStore } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ALLOWED_FOLDERS = new Set(['certificates', 'projects', 'blog', 'avatar', 'resume', 'hackathons', 'testimonials']);
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const MIME_WHITELIST: Record<string, string[]> = {
  certificates: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
  hackathons: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
  projects: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  blog: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  avatar: ['image/jpeg', 'image/png', 'image/webp'],
  testimonials: ['image/jpeg', 'image/png', 'image/webp'],
  resume: ['application/pdf'],
};

/** POST multipart: fields `file` and `folder`. Admin-only. */
export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: 'Expected multipart form data.' }, { status: 400 });
  }

  const file = formData.get('file');
  const folder = String(formData.get('folder') || '');

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'No file provided.' }, { status: 400 });
  }
  if (!ALLOWED_FOLDERS.has(folder)) {
    return NextResponse.json({ ok: false, error: 'Invalid upload folder.' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: 'File too large (max 10 MB).' }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ ok: false, error: 'File is empty.' }, { status: 400 });
  }
  const allowed = MIME_WHITELIST[folder] || [];
  if (!allowed.includes(file.type)) {
    return NextResponse.json(
      { ok: false, error: `File type "${file.type || 'unknown'}" is not allowed here. Allowed: ${allowed.join(', ')}.` },
      { status: 400 },
    );
  }

  try {
    const store = await getStore();
    const url = await store.saveUpload(file, folder);
    return NextResponse.json({ ok: true, url });
  } catch (err) {
    console.error('Upload error:', err);
    const message = err instanceof Error ? err.message : 'Upload failed.';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
