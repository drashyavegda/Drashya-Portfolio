/**
 * Seeds a fresh Supabase project with the portfolio's starter content.
 * Usage:  npx tsx scripts/seed-supabase.ts
 * Requires env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * (reads .env.local automatically when present via process env — export them
 * first, e.g. `set -a; source .env.local; set +a; npx tsx scripts/seed-supabase.ts`)
 */
import { createClient } from '@supabase/supabase-js';
import { SEED } from '../lib/seed';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

async function main() {
  console.log('Seeding site_state…');
  const { error: stateErr } = await supabase.from('site_state').upsert({
    id: 1,
    profile: SEED.profile,
    availability: SEED.availability,
    education: SEED.education,
    resume: SEED.resume,
    settings: SEED.settings,
    updated_at: new Date().toISOString(),
  });
  if (stateErr) throw stateErr;

  const collections: Array<[string, Array<Record<string, unknown>>, (i: Record<string, unknown>) => Record<string, unknown>]> = [
    ['skills', SEED.skills as unknown as Array<Record<string, unknown>>, (i) => ({ name: i.name, category: i.category, description: i.description, learning: i.learning })],
    [
      'projects',
      SEED.projects as unknown as Array<Record<string, unknown>>,
      (i) => ({
        slug: i.slug, title: i.title, category: i.category, description: i.description,
        featured: i.featured, position: i.order, highlights: i.highlights, technologies: i.technologies,
        demo_url: i.demoUrl, github_url: i.githubUrl, screenshots: i.screenshots,
        case_study: i.caseStudy, seo_title: i.seoTitle, seo_description: i.seoDescription,
      }),
    ],
    [
      'hackathons',
      SEED.hackathons as unknown as Array<Record<string, unknown>>,
      (i) => ({
        name: i.name, date: i.date, project: i.project, technologies: i.technologies,
        status: i.status, certificate_file: i.certificateFile, certificate_link: i.certificateLink, notes: i.notes,
      }),
    ],
    ['certificates', SEED.certificates as unknown as Array<Record<string, unknown>>, (i) => ({ title: i.title, org: i.org, date: i.date, file: i.file, kind: i.kind })],
    ['learning_topics', SEED.learning as unknown as Array<Record<string, unknown>>, (i) => ({ title: i.title, note: i.note })],
    [
      'posts',
      SEED.posts as unknown as Array<Record<string, unknown>>,
      (i) => ({
        slug: i.slug, title: i.title, excerpt: i.excerpt, content: i.content, cover_image: i.coverImage,
        category: i.category, language: i.language, published_at: i.publishedAt, status: i.status,
        seo_title: i.seoTitle, seo_description: i.seoDescription,
      }),
    ],
    ['testimonials', SEED.testimonials as unknown as Array<Record<string, unknown>>, (i) => ({ name: i.name, role: i.role, feedback: i.feedback, image: i.image, linkedin: i.linkedin })],
  ];

  for (const [table, items, mapper] of collections) {
    const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if ((count ?? 0) > 0) {
      console.log(`  ${table}: already has ${count} rows — skipping (no overwrite).`);
      continue;
    }
    if (!items.length) continue;
    const rows = items.map((item, idx) => ({ id: String(item.id), ...mapper(item), position: idx + 1, created_at: new Date().toISOString() }));
    const { error } = await supabase.from(table).insert(rows);
    if (error) throw error;
    console.log(`  ${table}: inserted ${rows.length} rows.`);
  }

  console.log('Seed complete. Remember to create the admin user under Authentication → Users.');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
