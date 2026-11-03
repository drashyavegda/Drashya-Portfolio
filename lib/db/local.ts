import { promises as fs } from 'fs';
import path from 'path';
import { SEED } from '../seed';
import type { EntityKey, Message, Snapshot } from '../types';
import type { AnalyticsEvent, AnalyticsSummary, SitePatch, Store } from './store';
import { newId, summarizeEvents } from './store';

/**
 * Local JSON-file store — the zero-config fallback.
 * Works out of the box for local development and demos. On serverless hosts
 * (Vercel) the filesystem is ephemeral, so configure Supabase for production
 * persistence (see README.md).
 */

const DATA_DIR = path.join(process.cwd(), 'data');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_EVENTS = 20000;

let writeChain: Promise<unknown> = Promise.resolve();

function serialize<T>(task: () => Promise<T>): Promise<T> {
  const result = writeChain.then(task, task);
  writeChain = result.catch(() => undefined);
  return result;
}

async function ensureFiles(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  try {
    await fs.access(CONTENT_FILE);
  } catch {
    await fs.writeFile(CONTENT_FILE, JSON.stringify(SEED, null, 2), 'utf8');
  }
}

async function readContent(): Promise<Snapshot> {
  await ensureFiles();
  const raw = await fs.readFile(CONTENT_FILE, 'utf8');
  const parsed = JSON.parse(raw) as Snapshot;
  // Defensive merge so newly added seed fields exist on older data files.
  return {
    ...SEED,
    ...parsed,
    profile: { ...SEED.profile, ...parsed.profile },
    settings: { ...SEED.settings, ...parsed.settings },
    availability: { ...SEED.availability, ...parsed.availability },
    education: { ...SEED.education, ...parsed.education },
    resume: { ...SEED.resume, ...parsed.resume },
  };
}

async function writeContent(snapshot: Snapshot): Promise<Snapshot> {
  snapshot.updatedAt = new Date().toISOString();
  await fs.writeFile(CONTENT_FILE, JSON.stringify(snapshot, null, 2), 'utf8');
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
  await ensureFiles();
  try {
    const raw = await fs.readFile(ANALYTICS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AnalyticsEvent[]) : [];
  } catch {
    return [];
  }
}

export const localStore: Store = {
  mode: 'local',

  async getSnapshot() {
    return readContent();
  },

  async updateSite(patch: SitePatch) {
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
    return serialize(async () => {
      const current = await readContent();
      const meta = ENTITY_META[entity];
      const record = { ...meta.defaults, ...item, id: newId(meta.prefix) } as never;
      const list = [...(current[entity] as unknown[]), record];
      return writeContent({ ...current, [entity]: list } as Snapshot);
    });
  },

  async updateItem(entity: EntityKey, id: string, patch: Record<string, unknown>) {
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
    return serialize(async () => {
      const current = await readContent();
      const list = (current[entity] as Array<{ id: string }>).filter((row) => row.id !== id);
      return writeContent({ ...current, [entity]: list } as Snapshot);
    });
  },

  async addMessage(msg) {
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
    await serialize(async () => {
      const existing = await readAnalytics();
      const next = [...existing, ...events].slice(-MAX_EVENTS);
      await fs.writeFile(ANALYTICS_FILE, JSON.stringify(next), 'utf8');
    });
  },

  async getAnalytics(): Promise<AnalyticsSummary> {
    return summarizeEvents(await readAnalytics());
  },

  async saveUpload(file: File, folder: string) {
    const dir = path.join(UPLOADS_DIR, folder);
    await fs.mkdir(dir, { recursive: true });
    const ext = path.extname(file.name).toLowerCase() || '.bin';
    const safeName = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(dir, safeName), buffer);
    return `/uploads/${folder}/${safeName}`;
  },
};
