import type { SupabaseClient } from '@supabase/supabase-js';
import { SEED } from '../seed';
import type { EntityKey, Message, Snapshot } from '../types';
import type { AnalyticsEvent, AnalyticsSummary, SitePatch, Store } from './store';
import { newId, summarizeEvents } from './store';

/**
 * Supabase-backed store (recommended for production on Vercel).
 * Activate by setting NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
 * and SUPABASE_SERVICE_ROLE_KEY. Run supabase/schema.sql first — see README.
 */

type Row = Record<string, unknown>;

interface EntityConfig {
  table: string;
  prefix: string;
  toRow: (item: Row) => Row;
  fromRow: (row: Row) => Row;
}

const passthrough = (keys: string[]) => ({
  toRow: (item: Row) => Object.fromEntries(keys.map((k) => [k, item[k] ?? null])),
  fromRow: (row: Row) => Object.fromEntries(keys.map((k) => [k, row[k] ?? null])),
});

const ENTITIES: Record<EntityKey, EntityConfig> = {
  skills: {
    table: 'skills',
    prefix: 'sk',
    toRow: (i) => ({ name: i.name ?? '', category: i.category ?? '', description: i.description ?? '', learning: Boolean(i.learning) }),
    fromRow: (r) => ({ id: r.id, name: r.name, category: r.category, description: r.description, learning: Boolean(r.learning) }),
  },
  projects: {
    table: 'projects',
    prefix: 'pj',
    toRow: (i) => ({
      slug: i.slug ?? '', title: i.title ?? '', category: i.category ?? '', description: i.description ?? '',
      featured: Boolean(i.featured), position: Number(i.order ?? 99),
      highlights: i.highlights ?? [], technologies: i.technologies ?? [],
      demo_url: i.demoUrl ?? null, github_url: i.githubUrl ?? null, screenshots: i.screenshots ?? [],
      case_study: i.caseStudy ?? { problem: '', solution: '', process: '', challenges: '', results: '' },
      seo_title: i.seoTitle ?? '', seo_description: i.seoDescription ?? '',
    }),
    fromRow: (r) => ({
      id: r.id, slug: r.slug, title: r.title, category: r.category, description: r.description,
      featured: Boolean(r.featured), order: Number(r.position ?? 99),
      highlights: r.highlights ?? [], technologies: r.technologies ?? [],
      demoUrl: r.demo_url ?? null, githubUrl: r.github_url ?? null, screenshots: r.screenshots ?? [],
      caseStudy: r.case_study ?? { problem: '', solution: '', process: '', challenges: '', results: '' },
      seoTitle: r.seo_title ?? '', seoDescription: r.seo_description ?? '',
    }),
  },
  hackathons: {
    table: 'hackathons',
    prefix: 'hk',
    toRow: (i) => ({
      name: i.name ?? '', date: i.date ?? null, project: i.project ?? null,
      technologies: i.technologies ?? [], status: i.status ?? 'participated',
      certificate_file: i.certificateFile ?? null, certificate_link: i.certificateLink ?? null, notes: i.notes ?? '',
    }),
    fromRow: (r) => ({
      id: r.id, name: r.name, date: r.date ?? null, project: r.project ?? null,
      technologies: r.technologies ?? [], status: r.status ?? 'participated',
      certificateFile: r.certificate_file ?? null, certificateLink: r.certificate_link ?? null, notes: r.notes ?? '',
    }),
  },
  certificates: {
    table: 'certificates',
    prefix: 'ct',
    toRow: (i) => ({ title: i.title ?? '', org: i.org ?? '', date: i.date ?? null, file: i.file ?? null, kind: i.kind ?? 'image' }),
    fromRow: (r) => ({ id: r.id, title: r.title, org: r.org, date: r.date ?? null, file: r.file ?? null, kind: r.kind ?? 'image' }),
  },
  learning: {
    table: 'learning_topics',
    prefix: 'lt',
    toRow: (i) => ({ title: i.title ?? '', note: i.note ?? '' }),
    fromRow: (r) => ({ id: r.id, title: r.title, note: r.note ?? '' }),
  },
  posts: {
    table: 'posts',
    prefix: 'post',
    toRow: (i) => ({
      slug: i.slug ?? '', title: i.title ?? '', excerpt: i.excerpt ?? '', content: i.content ?? '',
      cover_image: i.coverImage ?? null, category: i.category ?? 'Programming', language: i.language ?? 'en',
      published_at: i.publishedAt ?? null, status: i.status ?? 'draft',
      seo_title: i.seoTitle ?? '', seo_description: i.seoDescription ?? '',
    }),
    fromRow: (r) => ({
      id: r.id, slug: r.slug, title: r.title, excerpt: r.excerpt ?? '', content: r.content ?? '',
      coverImage: r.cover_image ?? null, category: r.category, language: r.language ?? 'en',
      publishedAt: r.published_at ?? null, status: r.status ?? 'draft',
      seoTitle: r.seo_title ?? '', seoDescription: r.seo_description ?? '',
    }),
  },
  testimonials: {
    table: 'testimonials',
    prefix: 'tm',
    toRow: (i) => ({ name: i.name ?? '', role: i.role ?? '', feedback: i.feedback ?? '', image: i.image ?? null, linkedin: i.linkedin ?? null }),
    fromRow: (r) => ({ id: r.id, name: r.name, role: r.role ?? '', feedback: r.feedback, image: r.image ?? null, linkedin: r.linkedin ?? null }),
  },
};

void passthrough; // helper retained for future simple entities

export function makeSupabaseStore(readClient: SupabaseClient, writeClient: SupabaseClient): Store {
  async function ensureSeeded(): Promise<void> {
    const { data } = await readClient.from('site_state').select('id').eq('id', 1).maybeSingle();
    if (data) return;
    // First run: insert the full seed so the site is never empty.
    await writeClient.from('site_state').upsert({
      id: 1,
      profile: SEED.profile,
      availability: SEED.availability,
      education: SEED.education,
      resume: SEED.resume,
      settings: SEED.settings,
      updated_at: new Date().toISOString(),
    });
    for (const key of Object.keys(ENTITIES) as EntityKey[]) {
      const cfg = ENTITIES[key];
      const rows = (SEED[key] as unknown as Row[]).map((item, idx) => ({
        id: String(item.id),
        ...cfg.toRow(item),
        position: idx + 1,
        created_at: new Date().toISOString(),
      }));
      if (rows.length) await writeClient.from(cfg.table).insert(rows);
    }
  }

  async function loadCollections(): Promise<Pick<Snapshot, 'skills' | 'projects' | 'hackathons' | 'certificates' | 'learning' | 'posts' | 'testimonials'>> {
    const results = await Promise.all(
      (Object.keys(ENTITIES) as EntityKey[]).map(async (key) => {
        const { data, error } = await readClient
          .from(ENTITIES[key].table)
          .select('*')
          .order('position', { ascending: true })
          .order('created_at', { ascending: true });
        if (error) throw new Error(`Supabase read failed (${ENTITIES[key].table}): ${error.message}`);
        return [key, (data ?? []).map((row) => ENTITIES[key].fromRow(row as Row))] as const;
      }),
    );
    return Object.fromEntries(results) as never;
  }

  return {
    mode: 'supabase',

    async getSnapshot(): Promise<Snapshot> {
      await ensureSeeded();
      const { data: state, error } = await readClient.from('site_state').select('*').eq('id', 1).maybeSingle();
      if (error) throw new Error(`Supabase read failed (site_state): ${error.message}`);
      const collections = await loadCollections();
      const { data: messages } = await readClient
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      const s = (state ?? {}) as Row;
      return {
        profile: { ...SEED.profile, ...((s.profile as Row) ?? {}) } as Snapshot['profile'],
        availability: { ...SEED.availability, ...((s.availability as Row) ?? {}) } as Snapshot['availability'],
        education: { ...SEED.education, ...((s.education as Row) ?? {}) } as Snapshot['education'],
        resume: { ...SEED.resume, ...((s.resume as Row) ?? {}) } as Snapshot['resume'],
        settings: { ...SEED.settings, ...((s.settings as Row) ?? {}) } as Snapshot['settings'],
        ...collections,
        messages: ((messages ?? []) as Row[]).map((m) => ({
          id: String(m.id),
          name: String(m.name ?? ''),
          email: String(m.email ?? ''),
          subject: String(m.subject ?? ''),
          message: String(m.message ?? ''),
          read: Boolean(m.read),
          createdAt: String(m.created_at ?? new Date().toISOString()),
        })),
        updatedAt: String(s.updated_at ?? new Date().toISOString()),
      };
    },

    async updateSite(patch: SitePatch): Promise<Snapshot> {
      const row: Row = { id: 1, updated_at: new Date().toISOString() };
      if (patch.profile) row.profile = patch.profile;
      if (patch.education) row.education = patch.education;
      if (patch.availability) row.availability = patch.availability;
      if (patch.resume) row.resume = patch.resume;
      if (patch.settings) row.settings = patch.settings;
      // Merge with current values for partial patches.
      const current = await this.getSnapshot();
      if (patch.profile) row.profile = { ...current.profile, ...patch.profile };
      if (patch.education) row.education = { ...current.education, ...patch.education };
      if (patch.availability) row.availability = { ...current.availability, ...patch.availability };
      if (patch.resume) row.resume = { ...current.resume, ...patch.resume };
      if (patch.settings) row.settings = { ...current.settings, ...patch.settings };
      const { error } = await writeClient.from('site_state').upsert(row);
      if (error) throw new Error(`Supabase write failed: ${error.message}`);
      return this.getSnapshot();
    },

    async createItem(entity: EntityKey, item: Row): Promise<Snapshot> {
      const cfg = ENTITIES[entity];
      const id = newId(cfg.prefix);
      const { count } = await writeClient.from(cfg.table).select('*', { count: 'exact', head: true });
      const { error } = await writeClient.from(cfg.table).insert({
        id,
        ...cfg.toRow(item),
        position: (count ?? 0) + 1,
        created_at: new Date().toISOString(),
      });
      if (error) throw new Error(`Supabase write failed: ${error.message}`);
      return this.getSnapshot();
    },

    async updateItem(entity: EntityKey, id: string, patch: Row): Promise<Snapshot> {
      const cfg = ENTITIES[entity];
      const row = cfg.toRow({ ...(patch as Row) });
      if ('order' in patch) row.position = Number(patch.order);
      const { error } = await writeClient.from(cfg.table).update(row).eq('id', id);
      if (error) throw new Error(`Supabase write failed: ${error.message}`);
      return this.getSnapshot();
    },

    async deleteItem(entity: EntityKey, id: string): Promise<Snapshot> {
      const cfg = ENTITIES[entity];
      const { error } = await writeClient.from(cfg.table).delete().eq('id', id);
      if (error) throw new Error(`Supabase write failed: ${error.message}`);
      return this.getSnapshot();
    },

    async addMessage(msg: Omit<Message, 'id' | 'read' | 'createdAt'>): Promise<Message> {
      const id = newId('msg');
      const { error } = await writeClient.from('messages').insert({
        id, ...msg, read: false, created_at: new Date().toISOString(),
      });
      if (error) throw new Error(`Supabase write failed: ${error.message}`);
      return { ...msg, id, read: false, createdAt: new Date().toISOString() };
    },

    async setMessagesState(updates) {
      for (const u of updates) {
        if (u.remove) {
          await writeClient.from('messages').delete().eq('id', u.id);
        } else if (typeof u.read === 'boolean') {
          await writeClient.from('messages').update({ read: u.read }).eq('id', u.id);
        }
      }
    },

    async recordEvents(events: AnalyticsEvent[]) {
      if (!events.length) return;
      await writeClient.from('analytics_events').insert(
        events.map((e) => ({ type: e.type, key: e.key, device: e.device, created_at: e.createdAt })),
      );
    },

    async getAnalytics(): Promise<AnalyticsSummary> {
      const { data, error } = await writeClient
        .from('analytics_events')
        .select('type, key, device, created_at')
        .order('created_at', { ascending: false })
        .limit(20000);
      if (error) throw new Error(`Supabase read failed: ${error.message}`);
      const events: AnalyticsEvent[] = ((data ?? []) as Row[]).map((r) => ({
        type: r.type as AnalyticsEvent['type'],
        key: String(r.key ?? ''),
        device: (r.device as AnalyticsEvent['device']) ?? 'unknown',
        createdAt: String(r.created_at ?? ''),
      }));
      return summarizeEvents(events);
    },

    async saveUpload(file: File, folder: string) {
      const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
      const key = `${folder}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      const { error } = await writeClient.storage.from('uploads').upload(key, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });
      if (error) throw new Error(`Supabase storage failed: ${error.message}`);
      const { data } = writeClient.storage.from('uploads').getPublicUrl(key);
      return data.publicUrl;
    },
  };
}
