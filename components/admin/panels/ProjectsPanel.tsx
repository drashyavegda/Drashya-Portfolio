'use client';

import { useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowUp, ExternalLink, Github, Plus, Star } from 'lucide-react';
import type { PanelProps } from '../AdminDashboard';
import {
  AdminCard,
  CheckboxField,
  ConfirmDialog,
  EmptyRow,
  FileUploadField,
  ItemRow,
  ListEditor,
  SaveBar,
  TextAreaField,
  TextField,
  useToast,
} from '../ui';
import { AdminApiError, createItem, deleteItem, updateItem, uploadFile } from '@/lib/admin-api';
import type { Project } from '@/lib/types';
import { Loader2, X } from 'lucide-react';

const EMPTY: Omit<Project, 'id'> = {
  slug: '',
  title: '',
  category: '',
  description: '',
  featured: false,
  order: 99,
  highlights: [],
  technologies: [],
  demoUrl: null,
  githubUrl: null,
  screenshots: [],
  caseStudy: { problem: '', solution: '', process: '', challenges: '', results: '' },
  seoTitle: '',
  seoDescription: '',
};

function ScreenshotsEditor({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  return (
    <div>
      <span className="admin-label">Screenshots ({value.length}/8)</span>
      {value.length > 0 && (
        <ul className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {value.map((src, i) => (
            <li key={src + i} className="relative overflow-hidden rounded-lg border border-line/15">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-20 w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                aria-label="Remove screenshot"
                className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/70 text-white hover:bg-red-500"
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      {value.length < 8 && (
        <>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/png,image/jpeg,image/webp,image/gif';
              input.onchange = async () => {
                const file = input.files?.[0];
                if (!file) return;
                setBusy(true);
                try {
                  const url = await uploadFile(file, 'projects');
                  onChange([...value, url]);
                  toast('success', 'Screenshot uploaded. Remember to save.');
                } catch (err) {
                  toast('error', err instanceof Error ? err.message : 'Upload failed.');
                } finally {
                  setBusy(false);
                }
              };
              input.click();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line/30 bg-raised/30 p-3.5 font-mono text-xs text-muted transition-colors hover:border-neon/40 hover:text-neon disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />}
            {busy ? 'Uploading…' : 'Add screenshot'}
          </button>
        </>
      )}
    </div>
  );
}

export default function ProjectsPanel({ snap, applySnapshot }: PanelProps) {
  const toast = useToast();
  const projects = [...snap.projects].sort((a, b) => a.order - b.order);
  const [editing, setEditing] = useState<Project | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<Project, 'id'>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<Project | null>(null);

  const startCreate = () => {
    setForm({ ...EMPTY, order: projects.length + 1 });
    setCreating(true);
    setEditing(null);
  };
  const startEdit = (p: Project) => {
    const { id: _id, ...rest } = p;
    void _id;
    setForm(rest);
    setEditing(p);
    setCreating(false);
  };

  const save = async () => {
    if (!form.title.trim()) {
      toast('error', 'Project title is required.');
      return;
    }
    setSaving(true);
    try {
      const snapshot = editing ? await updateItem('projects', editing.id, form) : await createItem('projects', form);
      applySnapshot(snapshot);
      toast('success', editing ? 'Project updated.' : 'Project created.');
      setEditing(null);
      setCreating(false);
    } catch (err) {
      toast('error', err instanceof AdminApiError ? err.message : 'Failed to save project.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      const snapshot = await deleteItem('projects', toDelete.id);
      applySnapshot(snapshot);
      toast('success', `Deleted "${toDelete.title.split('–')[0].trim()}".`);
    } catch (err) {
      toast('error', err instanceof AdminApiError ? err.message : 'Failed to delete project.');
    } finally {
      setToDelete(null);
    }
  };

  const move = async (p: Project, dir: -1 | 1) => {
    const idx = projects.findIndex((x) => x.id === p.id);
    const swapWith = projects[idx + dir];
    if (!swapWith) return;
    try {
      let snapshot = await updateItem('projects', p.id, { order: swapWith.order });
      snapshot = await updateItem('projects', swapWith.id, { order: p.order });
      applySnapshot(snapshot);
    } catch (err) {
      toast('error', err instanceof AdminApiError ? err.message : 'Reorder failed.');
    }
  };

  if (creating || editing) {
    return (
      <div className="space-y-6">
        <button type="button" onClick={() => { setCreating(false); setEditing(null); }} className="inline-flex items-center gap-2 font-mono text-xs text-muted hover:text-neon">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to projects
        </button>

        <AdminCard title={editing ? `Edit — ${editing.title.split('–')[0].trim()}` : 'New project'}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TextField label="Full title" value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} required placeholder="WasteFlow AI – AI-Powered …" />
            </div>
            <TextField label="URL slug" value={form.slug} onChange={(v) => setForm((f) => ({ ...f, slug: v }))} placeholder="auto-generated from title if empty" hint={`Public URL: /projects/${form.slug || '…'}`} />
            <TextField label="Category" value={form.category} onChange={(v) => setForm((f) => ({ ...f, category: v }))} placeholder="AI / Sustainability" />
            <div className="sm:col-span-2">
              <TextAreaField label="Description" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} rows={4} />
            </div>
            <TextField label="Display order" type="number" value={String(form.order)} onChange={(v) => setForm((f) => ({ ...f, order: Number(v) || 99 }))} />
            <div className="flex items-end pb-1">
              <CheckboxField label="Featured project" checked={form.featured} onChange={(v) => setForm((f) => ({ ...f, featured: v }))} hint="Shown in the Featured Projects row." />
            </div>
            <TextField label="Live demo URL" type="url" value={form.demoUrl ?? ''} onChange={(v) => setForm((f) => ({ ...f, demoUrl: v || null }))} placeholder="https://… (leave empty if not published)" />
            <TextField label="GitHub repository URL" type="url" value={form.githubUrl ?? ''} onChange={(v) => setForm((f) => ({ ...f, githubUrl: v || null }))} placeholder="https://github.com/… (leave empty if private)" />
            <div className="sm:col-span-2">
              <ListEditor label="Key highlights / features" items={form.highlights} onChange={(v) => setForm((f) => ({ ...f, highlights: v }))} placeholder="e.g. AI-powered waste classification" />
            </div>
            <div className="sm:col-span-2">
              <ListEditor label="Technologies used" items={form.technologies} onChange={(v) => setForm((f) => ({ ...f, technologies: v }))} placeholder="e.g. Next.js" hint="Only list what is genuinely used." />
            </div>
            <div className="sm:col-span-2">
              <ScreenshotsEditor value={form.screenshots} onChange={(v) => setForm((f) => ({ ...f, screenshots: v }))} />
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Case study" description="Shown on the project detail page. Leave a field empty to display an honest “pending” note — never invent results.">
          <div className="grid gap-5">
            <TextAreaField label="Problem statement" value={form.caseStudy.problem} onChange={(v) => setForm((f) => ({ ...f, caseStudy: { ...f.caseStudy, problem: v } }))} rows={3} />
            <TextAreaField label="Proposed solution" value={form.caseStudy.solution} onChange={(v) => setForm((f) => ({ ...f, caseStudy: { ...f.caseStudy, solution: v } }))} rows={3} />
            <TextAreaField label="Development process" value={form.caseStudy.process} onChange={(v) => setForm((f) => ({ ...f, caseStudy: { ...f.caseStudy, process: v } }))} rows={3} />
            <TextAreaField label="Challenges faced" value={form.caseStudy.challenges} onChange={(v) => setForm((f) => ({ ...f, caseStudy: { ...f.caseStudy, challenges: v } }))} rows={3} />
            <TextAreaField label="Results & learning" value={form.caseStudy.results} onChange={(v) => setForm((f) => ({ ...f, caseStudy: { ...f.caseStudy, results: v } }))} rows={3} hint="Only genuine outcomes — no unverified metrics." />
          </div>
        </AdminCard>

        <AdminCard title="SEO metadata" description="Used for search engines and social sharing of /projects/{slug}.">
          <div className="grid gap-5">
            <TextField label="SEO title" value={form.seoTitle} onChange={(v) => setForm((f) => ({ ...f, seoTitle: v }))} placeholder="Defaults to project title" />
            <TextAreaField label="SEO description" value={form.seoDescription} onChange={(v) => setForm((f) => ({ ...f, seoDescription: v }))} rows={2} placeholder="Defaults to project description" />
          </div>
        </AdminCard>

        <SaveBar saving={saving} onSave={() => void save()} onCancel={() => { setCreating(false); setEditing(null); }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Projects Management</h1>
          <p className="mt-1 text-sm text-muted">{projects.length} projects · {projects.filter((p) => p.featured).length} featured · ordered by display order.</p>
        </div>
        <button type="button" onClick={startCreate} className="btn-primary !px-4 !py-2.5 text-xs">
          <Plus className="h-3.5 w-3.5" aria-hidden /> Add project
        </button>
      </header>

      <AdminCard title="All projects" description="Use the arrows to change display order on the public site.">
        {projects.length === 0 ? (
          <EmptyRow message="No projects yet." />
        ) : (
          <ul className="space-y-2">
            {projects.map((p, i) => (
              <li key={p.id} className="flex items-center gap-2">
                <div className="flex flex-col gap-0.5">
                  <button type="button" onClick={() => void move(p, -1)} disabled={i === 0} aria-label={`Move ${p.title} up`} className="grid h-5 w-5 place-items-center rounded text-muted transition-colors hover:text-neon disabled:opacity-25">
                    <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  <button type="button" onClick={() => void move(p, 1)} disabled={i === projects.length - 1} aria-label={`Move ${p.title} down`} className="grid h-5 w-5 place-items-center rounded text-muted transition-colors hover:text-neon disabled:opacity-25">
                    <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <ItemRow
                    title={p.title.split('–')[0].trim()}
                    subtitle={`/projects/${p.slug} · ${p.category || 'uncategorized'}`}
                    badges={
                      <>
                        {p.featured && (
                          <span className="chip !px-2 !py-0.5 font-mono text-[10px] !text-amber-300">
                            <Star className="h-3 w-3 fill-current" aria-hidden /> featured
                          </span>
                        )}
                        {p.demoUrl && (
                          <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" className="chip !px-2 !py-0.5 font-mono text-[10px] !text-neon">
                            <ExternalLink className="h-3 w-3" aria-hidden /> demo
                          </a>
                        )}
                        {p.githubUrl && (
                          <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="chip !px-2 !py-0.5 font-mono text-[10px]">
                            <Github className="h-3 w-3" aria-hidden /> code
                          </a>
                        )}
                        {p.screenshots.length === 0 && <span className="chip !px-2 !py-0.5 font-mono text-[10px]">no screenshots</span>}
                      </>
                    }
                    onEdit={() => startEdit(p)}
                    onDelete={() => setToDelete(p)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this project?"
        message={`"${toDelete?.title.split('–')[0].trim()}" and its case study will be permanently removed. This cannot be undone.`}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
