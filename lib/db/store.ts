import type { EntityKey, Message, Snapshot } from '../types';

export type SitePatch = Partial<
  Pick<Snapshot, 'profile' | 'education' | 'availability' | 'resume' | 'settings'>
>;

export interface AnalyticsEvent {
  type: 'page_view' | 'project_view' | 'section_view' | 'blog_view';
  key: string;
  device: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  createdAt: string;
}

export interface AnalyticsSummary {
  totalVisits: number;
  today: number;
  byPath: Record<string, number>;
  byProject: Record<string, number>;
  bySection: Record<string, number>;
  byBlogPost: Record<string, number>;
  byDevice: Record<string, number>;
  byDay: Record<string, number>;
}

export interface Store {
  mode: 'local' | 'supabase';
  getSnapshot(): Promise<Snapshot>;
  updateSite(patch: SitePatch): Promise<Snapshot>;
  createItem(entity: EntityKey, item: Record<string, unknown>): Promise<Snapshot>;
  updateItem(entity: EntityKey, id: string, patch: Record<string, unknown>): Promise<Snapshot>;
  deleteItem(entity: EntityKey, id: string): Promise<Snapshot>;
  addMessage(msg: Omit<Message, 'id' | 'read' | 'createdAt'>): Promise<Message>;
  setMessagesState(updates: Array<{ id: string; read?: boolean; remove?: boolean }>): Promise<void>;
  recordEvents(events: AnalyticsEvent[]): Promise<void>;
  getAnalytics(): Promise<AnalyticsSummary>;
  /** Save an uploaded file and return its public URL/path. */
  saveUpload(file: File, folder: string): Promise<string>;
}

export function summarizeEvents(events: AnalyticsEvent[]): AnalyticsSummary {
  const summary: AnalyticsSummary = {
    totalVisits: 0,
    today: 0,
    byPath: {},
    byProject: {},
    bySection: {},
    byBlogPost: {},
    byDevice: {},
    byDay: {},
  };
  const today = new Date().toISOString().slice(0, 10);
  for (const e of events) {
    const day = (e.createdAt || '').slice(0, 10);
    if (day) summary.byDay[day] = (summary.byDay[day] || 0) + 1;
    if (day === today) summary.today += 1;
    summary.byDevice[e.device] = (summary.byDevice[e.device] || 0) + 1;
    switch (e.type) {
      case 'page_view':
        summary.totalVisits += 1;
        summary.byPath[e.key] = (summary.byPath[e.key] || 0) + 1;
        break;
      case 'project_view':
        summary.byProject[e.key] = (summary.byProject[e.key] || 0) + 1;
        break;
      case 'section_view':
        summary.bySection[e.key] = (summary.bySection[e.key] || 0) + 1;
        break;
      case 'blog_view':
        summary.byBlogPost[e.key] = (summary.byBlogPost[e.key] || 0) + 1;
        break;
    }
  }
  return summary;
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
