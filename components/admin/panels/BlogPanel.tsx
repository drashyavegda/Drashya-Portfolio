'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Eye, Globe2, PenLine, Plus, RotateCcw, Trash2 } from 'lucide-react';
import type { PanelProps } from '../AdminDashboard';
import {
  AdminCard,
  ConfirmDialog,
  EmptyRow,
  FileUploadField,
  ItemRow,
  SaveBar,
  SelectField,
  TextAreaField,
  TextField,
  useToast,
} from '../ui';
import { AdminApiError, createItem, deleteItem, updateItem } from '@/lib/admin-api';
import { BLOG_CATEGORIES, LANGUAGE_LABELS, type BlogPost } from '@/lib/types';
import { formatDate } from '@/lib/utils';

type FormState = Omit<BlogPost, 'id'>;

const EMPTY: FormState = {
  slug: '',
  title: '',
  excerpt: '',
  content: '',
  coverImage: null,
  category: 'Programming',
  language: 'en',
  publishedAt: new Date().toISOString().slice(0, 10),
  status: 'draft',
  seoTitle: '',
  seoDescription: '',
};

function draftKey(post: BlogPost | null) {
  return `dv-post-draft-${post ? post.id : 'new'}`;
}

export default function BlogPanel({ snap, applySnapshot }: PanelProps) {
  const toast = useToast();
  const posts = [...snap.posts].sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<BlogPost | null>(null);
  const [savedDraft, setSavedDraft] = useState<FormState | null>(null);
  const [autosaveNote, setAutosaveNote] = useState<string | null>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const inEditor = creating || Boolean(editing);

  // Detect a locally autosaved draft when opening the editor.
  useEffect(() => {
    if (!inEditor) return;
    try {
      const raw = localStorage.getItem(draftKey(editing));
      if (raw) {
        const parsed = JSON.parse(raw) as FormState;
        let current: Record<string, unknown> = EMPTY;
        if (editing) {
          const { id: _id, ...rest } = editing;
          void _id;
          current = rest;
        }
        if (JSON.stringify(parsed) !== JSON.stringify(current)) {
          setSavedDraft(parsed);
        }
      }
    } catch {
      /* ignore corrupted drafts */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creating, editing]);

  // Debounced local autosave while editing.
  useEffect(() => {
    if (!inEditor) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(draftKey(editing), JSON.stringify(form));
        setAutosaveNote(`Draft autosaved locally at ${new Date().toLocaleTimeString('en-IN')}`);
      } catch {
        /* storage full/unavailable */
      }
    }, 1500);
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [form, inEditor, editing]);

  const startCreate = () => {
    setForm(EMPTY);
    setCreating(true);
    setEditing(null);
    setSavedDraft(null);
    setAutosaveNote(null);
  };

  const startEdit = (post: BlogPost) => {
    const { id: _id, ...rest } = post;
    void _id;
    setForm(rest);
    setEditing(post);
    setCreating(false);
    setSavedDraft(null);
    setAutosaveNote(null);
  };

  const closeEditor = () => {
    setCreating(false);
    setEditing(null);
    setSavedDraft(null);
    setAutosaveNote(null);
  };

  const save = async () => {
    if (!form.title.trim()) {
      toast('error', 'Post title is required.');
      return;
    }
    setSaving(true);
    try {
      const snapshot = editing ? await updateItem('posts', editing.id, form) : await createItem('posts', form);
      applySnapshot(snapshot);
      try {
        localStorage.removeItem(draftKey(editing));
      } catch {
        /* ignore */
      }
      toast('success', editing ? 'Post updated.' : form.status === 'published' ? 'Post created and published.' : 'Draft created.');
      closeEditor();
    } catch (err) {
      toast('error', err instanceof AdminApiError ? err.message : 'Failed to save post.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      const snapshot = await deleteItem('posts', toDelete.id);
      applySnapshot(snapshot);
      try {
        localStorage.removeItem(draftKey(toDelete));
      } catch {
        /* ignore */
      }
      toast('success', `Deleted "${toDelete.title}".`);
    } catch (err) {
      toast('error', err instanceof AdminApiError ? err.message : 'Failed to delete post.');
    } finally {
      setToDelete(null);
    }
  };

  if (inEditor) {
    return (
      <div className="space-y-6">
        <button type="button" onClick={closeEditor} className="inline-flex items-center gap-2 font-mono text-xs text-muted hover:text-neon">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to posts
        </button>

        {savedDraft && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-violet/30 bg-violet/10 p-4 text-xs text-violet">
            <RotateCcw className="h-4 w-4 shrink-0" aria-hidden />
            <span className="flex-1">An unsaved local draft exists for this post.</span>
            <button type="button" className="rounded-lg bg-violet/20 px-3 py-1.5 font-semibold hover:bg-violet/30" onClick={() => { setForm(savedDraft); setSavedDraft(null); toast('success', 'Local draft restored.'); }}>
              Restore draft
            </button>
            <button type="button" className="rounded-lg border border-line/25 px-3 py-1.5 hover:text-ink" onClick={() => setSavedDraft(null)}>
              Discard
            </button>
          </div>
        )}

        <AdminCard title={editing ? `Edit — ${editing.title}` : 'New blog post'} description="Multilingual: write in English, Hindi or Gujarati. Markdown is supported in the content field.">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TextField label="Title" value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} required />
            </div>
            <TextField label="Slug" value={form.slug} onChange={(v) => setForm((f) => ({ ...f, slug: v }))} placeholder="auto-generated if empty" hint={`Public URL: /blog/${form.slug || '…'}`} />
            <SelectField
              label="Language"
              value={form.language}
              onChange={(v) => setForm((f) => ({ ...f, language: v as BlogPost['language'] }))}
              options={Object.entries(LANGUAGE_LABELS).map(([value, label]) => ({ value, label }))}
            />
            <label className="block">
              <span className="admin-label">Category</span>
              <input
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                list="blog-categories"
                className="input"
              />
              <datalist id="blog-categories">
                {BLOG_CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>
            <SelectField
              label="Status"
              value={form.status}
              onChange={(v) => setForm((f) => ({ ...f, status: v as BlogPost['status'] }))}
              options={[
                { value: 'draft', label: 'Draft (private)' },
                { value: 'published', label: 'Published (public)' },
              ]}
            />
            <TextField label="Publication date" type="date" value={form.publishedAt ?? ''} onChange={(v) => setForm((f) => ({ ...f, publishedAt: v || null }))} />
            <div className="sm:col-span-2">
              <FileUploadField label="Cover image" value={form.coverImage} onChange={(url) => setForm((f) => ({ ...f, coverImage: url }))} folder="blog" accept="image/png,image/jpeg,image/webp,image/gif" kind="image" />
            </div>
            <div className="sm:col-span-2">
              <TextAreaField label="Excerpt" value={form.excerpt} onChange={(v) => setForm((f) => ({ ...f, excerpt: v }))} rows={2} placeholder="Shown on blog cards and in search results." />
            </div>
            <div className="sm:col-span-2">
              <TextAreaField
                label="Content (Markdown)"
                value={form.content}
                onChange={(v) => setForm((f) => ({ ...f, content: v }))}
                rows={18}
                mono
                placeholder={'## Heading\n\nParagraph with **bold**, *italic*, `code` and [links](https://…)\n\n```js\nconsole.log("code blocks supported");\n```'}
                hint="Supports headings, lists, quotes, links, images and fenced code blocks. All HTML is escaped for safety."
              />
            </div>
            <TextField label="SEO title" value={form.seoTitle} onChange={(v) => setForm((f) => ({ ...f, seoTitle: v }))} placeholder="Defaults to post title" />
            <TextAreaField label="SEO description" value={form.seoDescription} onChange={(v) => setForm((f) => ({ ...f, seoDescription: v }))} rows={2} placeholder="Defaults to excerpt" />
          </div>
          {autosaveNote && <p className="mt-3 font-mono text-[10.5px] text-muted/70">{autosaveNote}</p>}
          <SaveBar saving={saving} onSave={() => void save()} onCancel={closeEditor} />
        </AdminCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Blog Management</h1>
          <p className="mt-1 text-sm text-muted">
            {posts.length} posts · {posts.filter((p) => p.status === 'published').length} published · languages: EN / HI / GU
          </p>
        </div>
        <button type="button" onClick={startCreate} className="btn-primary !px-4 !py-2.5 text-xs">
          <Plus className="h-3.5 w-3.5" aria-hidden /> New post
        </button>
      </header>

      <AdminCard title="All posts">
        {posts.length === 0 ? (
          <EmptyRow message="No posts yet — create the first article (drafts stay private until published)." />
        ) : (
          <ul className="space-y-2">
            {posts.map((p) => (
              <ItemRow
                key={p.id}
                title={p.title}
                subtitle={`/blog/${p.slug} · ${p.publishedAt ? formatDate(p.publishedAt) : 'no date'}`}
                badges={
                  <>
                    <span className={`chip !px-2 !py-0.5 font-mono text-[10px] ${p.status === 'published' ? '!text-emerald-400 border-emerald-400/30' : '!text-amber-400 border-amber-400/30'}`}>
                      {p.status === 'published' ? <Eye className="h-3 w-3" aria-hidden /> : <PenLine className="h-3 w-3" aria-hidden />} {p.status}
                    </span>
                    <span className="chip !px-2 !py-0.5 font-mono text-[10px]">
                      <Globe2 className="h-3 w-3" aria-hidden /> {LANGUAGE_LABELS[p.language]}
                    </span>
                    <span className="chip !px-2 !py-0.5 font-mono text-[10px]">{p.category}</span>
                    {p.status === 'published' && (
                      <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" className="chip !px-2 !py-0.5 font-mono text-[10px] !text-neon">
                        view ↗
                      </a>
                    )}
                  </>
                }
                onEdit={() => startEdit(p)}
                onDelete={() => setToDelete(p)}
              />
            ))}
          </ul>
        )}
      </AdminCard>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this post?"
        message={`"${toDelete?.title}" will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete post"
        onConfirm={() => void confirmDelete()}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
