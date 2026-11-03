'use client';

import { useState } from 'react';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import type { PanelProps } from '../AdminDashboard';
import { AdminCard, ListEditor, SaveBar, TextField, TextAreaField, useToast } from '../ui';
import { AdminApiError, patchSite } from '@/lib/admin-api';
import type { Achievement, Education, TimelineItem } from '@/lib/types';

export default function EducationPanel({ snap, applySnapshot }: PanelProps) {
  const toast = useToast();
  const [form, setForm] = useState<Education>({ ...snap.education });
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(snap.education);

  const set = <K extends keyof Education>(key: K, value: Education[K]) => setForm((f) => ({ ...f, [key]: value }));

  const updateTimelineItem = (id: string, patch: Partial<TimelineItem>) =>
    set('timeline', form.timeline.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const addTimelineItem = () =>
    set('timeline', [
      ...form.timeline,
      { id: `tl-${Date.now().toString(36)}`, year: '', title: '', description: '' },
    ]);

  const updateAchievement = (id: string, patch: Partial<Achievement>) =>
    set('achievements', form.achievements.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  const addAchievement = () =>
    set('achievements', [
      ...form.achievements,
      { id: `ach-${Date.now().toString(36)}`, title: '', description: '', date: null },
    ]);

  const save = async () => {
    if (!form.college.trim()) {
      toast('error', 'College name is required.');
      return;
    }
    if (form.graduationYear < form.admissionYear) {
      toast('error', 'Graduation year cannot be before admission year.');
      return;
    }
    setSaving(true);
    try {
      const snapshot = await patchSite({ education: form });
      applySnapshot(snapshot);
      toast('success', 'Education details updated.');
    } catch (err) {
      toast('error', err instanceof AdminApiError ? err.message : 'Failed to save education.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Education Management</h1>
        <p className="mt-1 text-sm text-muted">Academic details, the public timeline, achievements and coursework. Only add genuine, verifiable information.</p>
      </header>

      <AdminCard title="Academic details">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <TextField label="College" value={form.college} onChange={(v) => set('college', v)} required />
          </div>
          <TextField label="Degree" value={form.degree} onChange={(v) => set('degree', v)} />
          <TextField label="Branch" value={form.branch} onChange={(v) => set('branch', v)} />
          <TextField label="Admission year" type="number" value={String(form.admissionYear)} onChange={(v) => set('admissionYear', Number(v) || form.admissionYear)} />
          <TextField label="Expected graduation year" type="number" value={String(form.graduationYear)} onChange={(v) => set('graduationYear', Number(v) || form.graduationYear)} />
          <TextField label="Current year" value={form.currentYear} onChange={(v) => set('currentYear', v)} placeholder="e.g. Second Year" />
          <TextField label="Current semester" value={form.currentSemester} onChange={(v) => set('currentSemester', v)} placeholder="e.g. Third Semester" />
        </div>
      </AdminCard>

      <AdminCard
        title="Education timeline"
        description="Rendered as the vertical timeline in the About section."
        action={
          <button type="button" onClick={addTimelineItem} className="btn-ghost !px-3.5 !py-2 text-xs">
            <Plus className="h-3.5 w-3.5" aria-hidden /> Add entry
          </button>
        }
      >
        <ul className="space-y-4">
          {form.timeline.map((item, i) => (
            <li key={item.id} className="rounded-xl border border-line/12 bg-raised/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 font-mono text-[11px] text-muted">
                  <GripVertical className="h-3.5 w-3.5" aria-hidden /> Entry {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => set('timeline', form.timeline.filter((t) => t.id !== item.id))}
                  aria-label={`Remove timeline entry ${i + 1}`}
                  className="grid h-7 w-7 place-items-center rounded-lg text-muted transition-colors hover:bg-red-400/10 hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
                <TextField label="Year / period" value={item.year} onChange={(v) => updateTimelineItem(item.id, { year: v })} placeholder="2025" />
                <TextField label="Title" value={item.title} onChange={(v) => updateTimelineItem(item.id, { title: v })} />
                <div className="sm:col-span-2">
                  <TextAreaField label="Description" value={item.description} onChange={(v) => updateTimelineItem(item.id, { description: v })} rows={2} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </AdminCard>

      <AdminCard
        title="Academic achievements"
        description="Empty by default — add SPI/CGPA/awards only when genuine and verifiable."
        action={
          <button type="button" onClick={addAchievement} className="btn-ghost !px-3.5 !py-2 text-xs">
            <Plus className="h-3.5 w-3.5" aria-hidden /> Add achievement
          </button>
        }
      >
        {form.achievements.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line/25 p-5 text-center text-xs text-muted">
            No achievements listed — this section stays hidden on the public site until something genuine is added.
          </p>
        ) : (
          <ul className="space-y-4">
            {form.achievements.map((a, i) => (
              <li key={a.id} className="rounded-xl border border-line/12 bg-raised/40 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-muted">Achievement {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => set('achievements', form.achievements.filter((x) => x.id !== a.id))}
                    aria-label={`Remove achievement ${i + 1}`}
                    className="grid h-7 w-7 place-items-center rounded-lg text-muted transition-colors hover:bg-red-400/10 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
                  <TextField label="Title" value={a.title} onChange={(v) => updateAchievement(a.id, { title: v })} />
                  <TextField label="Date (optional)" value={a.date ?? ''} onChange={(v) => updateAchievement(a.id, { date: v || null })} placeholder="e.g. May 2026" />
                  <div className="sm:col-span-2">
                    <TextAreaField label="Description" value={a.description} onChange={(v) => updateAchievement(a.id, { description: v })} rows={2} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>

      <AdminCard title="Coursework" description="Relevant subjects — shown as chips under the timeline when non-empty.">
        <ListEditor label="Courses" items={form.coursework} onChange={(v) => set('coursework', v)} placeholder="e.g. Data Structures" />
      </AdminCard>

      <SaveBar saving={saving} onSave={() => void save()} dirty={dirty} />
    </div>
  );
}
