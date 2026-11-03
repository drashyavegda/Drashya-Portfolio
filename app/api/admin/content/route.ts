import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { getStore, supabaseConfigured } from '@/lib/db';
import { localAuthConfigured } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** Full content snapshot + capability flags for the admin dashboard. */
export async function GET() {
  const admin = await getAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const store = await getStore();
    const snapshot = await store.getSnapshot();
    return NextResponse.json({
      ok: true,
      admin,
      snapshot,
      meta: {
        mode: store.mode,
        supabaseConfigured: supabaseConfigured(),
        localAuthConfigured: localAuthConfigured(),
        aiConfigured: Boolean(process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY),
        emailConfigured: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL),
        githubTokenConfigured: Boolean(process.env.GITHUB_PERSONAL_TOKEN),
        persistenceWarning:
          store.mode === 'local' && process.env.VERCEL === '1'
            ? 'Running on Vercel without Supabase: edits are kept in this server instance’s temporary storage and will be lost on redeploy or when Vercel scales to a new instance. Configure Supabase (README “Supabase Setup”) for permanent storage.'
            : null,
      },
    });
  } catch (err) {
    console.error('Admin content error:', err);
    return NextResponse.json({ ok: false, error: 'Failed to load content.' }, { status: 500 });
  }
}
