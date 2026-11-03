import { promises as fs } from 'fs';
import path from 'path';
import { SEED } from '../seed';
import type { EntityKey, Message, Snapshot } from '../types';
import type { AnalyticsEvent, AnalyticsSummary, SitePatch, Store } from './store';
import { newId, summarizeEvents } from './store';

/**
 * Local JSON-file store — the zero-config fallback.
 *
 * SERVERLESS-SAFE, three storage tiers (probed once, cached):
 *   1. `cwd/data`     — normal local development (durable on disk)
 *   2. `/tmp/...`     — read-only hosts like Vercel (persists per warm
 *                       instance, shared by all route bundles)
 *   3. in-memory     — last resort if nothing is writable
 *
 * File uploads require tier 1 or Supabase Storage; on serverless hosts the
 * API returns a clear, actionable error instead of crashing.
 *
 * For durable production storage on Vercel, configure Supabase (README).
 * FORCE_READONLY_STORE=true simulates a read-only host locally (tier 2).
 */

const CWD_DATA_DIR = path.join(process.cwd(), 'data');
const TMP_DATA_DIR = '/tmp/dv-portfolio-data';
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_EVENTS = 20000;

type FsTier = 'cwd' | 'tmp' | 'memory';
let tier: FsTier | 'unknown' = 'unknown';
let writeChain: Promise<unknown> = Promise.resolve();
let memSnapshot: Snapshot | null = null;
let memEvents: AnalyticsEvent[] = [];

function serialize<T>(task: () => Promise<T>): Promise<T> {
  const result = writeChain.then(task, task);
  writeChain = result.catch(() => undefined);
  return result;
}

function cloneSeed(): Snapshot {
  return JSON.parse(JSON.stringify(SEED)) as Snapshot;
}

async function dirIsWritable(dir: string): Promise<boolean> {
  try {
    await fs.mkdir(dir, { recursive: true });
    const probe = path.join(dir, '.write-probe');
    await fs.writeFile(probe, 'ok');
    await fs.unlink(probe);
    return true;
  } catch {
    return false;
  }
}

async function resolveTier(): Promise<FsTier> {
  if (tier !== 'unknown') return tier;
  const simulateReadonly = process.env.FORCE_READONLY_STORE === 'true';
  if (!simulateReadonly && (await dirIsWritable(CWD_DATA_DIR))) {
    tier = 'cwd';
  } else if (await dirIsWritable(TMP_DATA_DIR)) {
    tier = 'tmp';
  } else {
    tier = 'memory';
  }
  return tier;
}

/** Current storage tier — surfaced by /api/health and the admin dashboard. */
export function localStoreMode(): FsTier | 'unknown' {
  return tier;
}

function dataDir(): string | null {
  if (tier === 'cwd') return CWD_DATA_DIR;
  if (tier === 'tmp') return TMP_DATA_DIR;
  return null;
}

async function readContent(): Promise<Snapshot> {
  const base = dataDir();
  if (!base) {
    if (!memSnapshot) memSnapshot = cloneSeed();
    return memSnapshot;
  }
  const file = path.join(base, 'content.json');
  try {
    const raw = await fs.readFile(file, 'utf8');
    const parsed = JSON.parse(raw) as Snapshot;
    return {
      ...SEED,
      ...parsed,
      profile: { ...SEED.profile, ...parsed.profile },
      settings: { ...SEED.settings, ...parsed.settings },
      availability: { ...SEED.availability, ...parsed.availability },
      education: { ...SEED.education, ...parsed.education },
      resume: { ...SEED.resume, ...parsed.resume },
    };
  } catch {
    const fresh = cloneSeed();
    try {
      await fs.mkdir(base, { recursive: true });
      await fs.writeFile(file, JSON.stringify(fresh, null, 2), 'utf8');
    } catch {
      memSnapshot = fresh;
    }
    return fresh;
  }
}

async function writeContent(snapshot: Snapshot): Promise<Snapshot> {
  snapshot.updatedAt = new Date().toISOString();
  const base = dataDir();
  if (!base) {
    memSnapshot = snapshot;
    return snapshot;
  }
  try {
    await fs.mkdir(base, { recursive: true });
    await fs.writeFile(path.join(base, 'content.json'), JSON.stringify(snapshot, null, 2), 'utf8');
  } catch {
    memSnapshot = snapshot; // disk vanished mid-run — keep serving from memory
  }
  return snapshot;
}

interface EntityMeta {
  prefix: string;
  defaults: Record<string, unknown>;
}

const ENTITY_META: Record<EntityKey, EntityMeta> = {
  skills: { prefix: 'sk', defaults: { name: '', category: 'Programming Languages', description: '', learning: false } },
  projects: {
    prefix: 'pj',
    defaults: {
      slug: '', title: '', category: '', description: '', featured: false, order: 99,
      highlights: [], technologies: [], demoUrl: null, githubUrl: null, screenshots: [],
      caseStudy: { problem: '', solution: '', process: '', challenges: '', results: '' },
      seoTitle: '', seoDescription: '',
    },
  },
  hackathons: {
    prefix: 'hk',
    defaults: { name: '', date: null, project: null, technologies: [], status: 'participated', certificateFile: null, certificateLink: null, notes: '' },
  },
  certificates: { prefix: 'ct', defaults: { title: '', org: '', date: null, file: null, kind: 'image' } },
  learning: { prefix: 'lt', defaults: { title: '', note: '' } },
  posts: {
    prefix: 'post',
    defaults: {
      slug: '', title: '', excerpt: '', content: '', coverImage: null,
      category: 'Programming', language: 'en', publishedAt: null, status: 'draft',
      seoTitle: '', seoDescription: '',
    },
  },
  testimonials: { prefix: 'tm', defaults: { name: '', role: '', feedback: '', image: null, linkedin: null } },
};

async function readAnalytics(): Promise<AnalyticsEvent[]> {
  const base = dataDir();
  if (!base) return memEvents;
  try {
    const raw = await fs.readFile(path.join(base, 'analytics.json'), 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AnalyticsEvent[]) : [];
  } catch {
    return [];
  }
}

export const localStore: Store = {
  mode: 'local',

  async getSnapshot() {
    await resolveTier();
    return readContent();
  },

  async updateSite(patch: SitePatch) {
    await resolveTier();
    return serialize(async () => {
      const current = await readContent();
      const next: Snapshot = {
        ...current,
        ...(patch.profile ? { profile: { ...current.profile, ...patch.profile } } : {}),
        ...(patch.education ? { education: { ...current.education, ...patch.education } } : {}),
        ...(patch.availability ? { availability: { ...current.availability, ...patch.availability } } : {}),
        ...(patch.resume ? { resume: { ...current.resume, ...patch.resume } } : {}),
        ...(patch.settings ? { settings: { ...current.settings, ...patch.settings } } : {}),
      };
      return writeContent(next);
    });
  },

  async createItem(entity: EntityKey, item: Record<string, unknown>) {
    await resolveTier();
    return serialize(async () => {
      const current = await readContent();
      const meta = ENTITY_META[entity];
      const record = { ...meta.defaults, ...item, id: newId(meta.prefix) } as never;
      const list = [...(current[entity] as unknown[]), record];
      return writeContent({ ...current, [entity]: list } as Snapshot);
    });
  },

  async updateItem(entity: EntityKey, id: string, patch: Record<string, unknown>) {
    await resolveTier();
    return serialize(async () => {
      const current = await readContent();
      const list = current[entity] as unknown as Array<Record<string, unknown>>;
      const idx = list.findIndex((row) => row.id === id);
      if (idx === -1) throw new Error(`Item ${id} not found in ${entity}`);
      list[idx] = { ...list[idx], ...patch, id };
      return writeContent({ ...current, [entity]: [...list] } as Snapshot);
    });
  },

  async deleteItem(entity: EntityKey, id: string) {
    await resolveTier();
    return serialize(async () => {
      const current = await readContent();
      const list = (current[entity] as Array<{ id: string }>).filter((row) => row.id !== id);
      return writeContent({ ...current, [entity]: list } as Snapshot);
    });
  },

  async addMessage(msg) {
    await resolveTier();
    return serialize(async () => {
      const current = await readContent();
      const record: Message = {
        ...msg,
        id: newId('msg'),
        read: false,
        createdAt: new Date().toISOString(),
      };
      await writeContent({ ...current, messages: [record, ...current.messages] });
      return record;
    });
  },

  async setMessagesState(updates) {
    await resolveTier();
    await serialize(async () => {
      const current = await readContent();
      let messages = [...current.messages];
      for (const u of updates) {
        if (u.remove) {
          messages = messages.filter((m) => m.id !== u.id);
        } else if (typeof u.read === 'boolean') {
          messages = messages.map((m) => (m.id === u.id ? { ...m, read: u.read! } : m));
        }
      }
      await writeContent({ ...current, messages });
    });
  },

  async recordEvents(events: AnalyticsEvent[]) {
    await resolveTier();
    await serialize(async () => {
      const base = dataDir();
      if (!base) {
        memEvents = [...memEvents, ...events].slice(-MAX_EVENTS);
        return;
      }
      try {
        const existing = await readAnalytics();
        await fs.writeFile(path.join(base, 'analytics.json'), JSON.stringify([...existing, ...events].slice(-MAX_EVENTS)));
      } catch {
        memEvents = [...memEvents, ...events].slice(-MAX_EVENTS);
      }
    });
  },

  async getAnalytics(): Promise<AnalyticsSummary> {
    await resolveTier();
    return summarizeEvents(await readAnalytics());
  },

  async saveUpload(file: File, folder: string) {
    await resolveTier();
    if (tier !== 'cwd') {
      throw new Error(
        'File uploads need persistent storage on serverless hosts — connect Supabase (README “Supabase Setup”); uploads then use Supabase Storage automatically.',
      );
    }
    const dir = path.join(UPLOADS_DIR, folder);
    await fs.mkdir(dir, { recursive: true });
    const ext = path.extname(file.name).toLowerCase() || '.bin';
    const safeName = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(dir, safeName), buffer);
    return `/uploads/${folder}/${safeName}`;
  },
};
