'use client';

/** Typed client helpers for the admin API. All calls require the admin session cookie. */

import type { EntityKey, Snapshot } from './types';

export interface AdminContentResponse {
  ok: boolean;
  snapshot: Snapshot;
  meta: {
    mode: 'local' | 'supabase';
    supabaseConfigured: boolean;
    localAuthConfigured: boolean;
    aiConfigured: boolean;
    emailConfigured: boolean;
    githubTokenConfigured: boolean;
    persistenceWarning: string | null;
  };
  error?: string;
}

export class AdminApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  let data: T & { error?: string };
  try {
    data = (await res.json()) as T & { error?: string };
  } catch {
    throw new AdminApiError('Unexpected server response.', res.status);
  }
  if (!res.ok || (data as { ok?: boolean }).ok === false) {
    throw new AdminApiError(data.error || `Request failed (${res.status})`, res.status);
  }
  return data;
}

export async function fetchContent(): Promise<AdminContentResponse> {
  return request<AdminContentResponse>('/api/admin/content');
}

export async function patchSite(patch: Record<string, unknown>): Promise<Snapshot> {
  const data = await request<{ ok: true; snapshot: Snapshot }>('/api/admin/site', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  return data.snapshot;
}

export async function createItem(entity: EntityKey, item: Record<string, unknown>): Promise<Snapshot> {
  const data = await request<{ ok: true; snapshot: Snapshot }>(`/api/admin/${entity}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  return data.snapshot;
}

export async function updateItem(entity: EntityKey, id: string, patch: Record<string, unknown>): Promise<Snapshot> {
  const data = await request<{ ok: true; snapshot: Snapshot }>(`/api/admin/${entity}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  return data.snapshot;
}

export async function deleteItem(entity: EntityKey, id: string): Promise<Snapshot> {
  const data = await request<{ ok: true; snapshot: Snapshot }>(`/api/admin/${entity}/${id}`, { method: 'DELETE' });
  return data.snapshot;
}

export async function uploadFile(file: File, folder: string): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('folder', folder);
  const data = await request<{ ok: true; url: string }>('/api/admin/upload', { method: 'POST', body: form });
  return data.url;
}

export async function updateMessages(updates: Array<{ id: string; read?: boolean; remove?: boolean }>): Promise<void> {
  await request<{ ok: true }>('/api/admin/messages', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ updates }),
  });
}

export interface AnalyticsSummaryClient {
  totalVisits: number;
  today: number;
  byPath: Record<string, number>;
  byProject: Record<string, number>;
  bySection: Record<string, number>;
  byBlogPost: Record<string, number>;
  byDevice: Record<string, number>;
  byDay: Record<string, number>;
}

export async function fetchAnalytics(): Promise<AnalyticsSummaryClient> {
  const data = await request<{ ok: true; summary: AnalyticsSummaryClient }>('/api/admin/analytics');
  return data.summary;
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' });
}
