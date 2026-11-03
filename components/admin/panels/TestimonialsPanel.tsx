'use client';

import { useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import type { PanelProps } from '../AdminDashboard';
import {
  AdminCard,
  ConfirmDialog,
  EmptyRow,
  FileUploadField,
  ItemRow,
  SaveBar,
  TextAreaField,
  TextField,
  useToast,
} from '../ui';
import { AdminApiError, createItem, deleteItem, updateItem } from '@/lib/admin-api';
import type { Testimonial } from '@/lib/types';

const EMPTY: Omit<Testimonial, 'id'> = { name: '', role: '', feedback: '', image: null, linkedin: null };

export default function TestimonialsPanel({ snap, applySnapshot }: PanelProps) {
  const toast = useToast();
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<Testimonial, 'id'>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<Testimonial | null>(null);

  const save = async () => {
    if (!form.name.trim() || !form.feedback.trim()) {
      toast('error', 'Name and feedback are required.');
      return;
    }
    setSaving(true);
    try {
      const snapshot = editing ? await updateItem('testimonials', editing.id, form) : await createItem('testimonials', form);
      applySnapshot(snapshot);
      toast('success', editing ? 'Testimonial updated.' : 'Testimonial added.');
      setEditing(null);
      setCreating(false);
    } catch (err) {
      toast('error', err instanceof AdminApiError ? err.message : 'Failed to save testimonial.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      const snapshot = await deleteItem('testimonials', toDelete.id);
      applySnapshot(snapshot);
      toast('success', `Removed testimonial from "${toDelete.name}".`);
    } catch (err) {
      toast('error', err instanceof AdminApiError ? err.message : 'Failed to delete.');
    } finally {
      setToDelete(null);
    }
  };

  if (creating || editing) {
    return (
      <div className="space-y-6">
        <button type="button" onClick={() => { setCreating(false); setEditing(null); }} className="inline-flex items-center gap-2 font-mono text-xs text-muted hover:text-neon">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to testimonials
        </button>
        <AdminCard title={editing ? `Edit — ${editing.name}` : 'Add testimonial'} description="Only add genuine feedback with the person's consent.">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField label="Person's name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} required />
            <TextField label="Role / relation" value={form.role} onChange={(v) => setForm((f) => ({ ...f, role: v }))} placeholder="e.g. Teammate at Code Variant hackathon" />
            <div className="sm:col-span-2">
              <TextAreaField label="Feedback" value={form.feedback} onChange={(v) => setForm((f) => ({ ...f, feedback: v }))} rows={4} required />
            </div>
            <FileUploadField label="Profile image (optional)" value={form.image} onChange={(url) => setForm((f) => ({ ...f, image: url }))} folder="testimonials" accept="image/png,image/jpeg,image/webp" kind="image" />
            <TextField label="LinkedIn URL (optional)" type="url" value={form.linkedin ?? ''} onChange={(v) => setForm((f) => ({ ...f, linkedin: v || null }))} placeholder="https://linkedin.com/in/…" />
          </div>
          <SaveBar saving={saving} onSave={() => void save()} onCancel={() => { setCreating(false); setEditing(null); }} />
        </AdminCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Testimonials Management</h1>
          <p className="mt-1 text-sm text-muted">
            {snap.testimonials.length === 0
              ? 'None published — the public section shows an honest empty state until genuine feedback is added.'
              : `${snap.testimonials.length} genuine testimonial(s) published.`}
          </p>
        </div>
        <button type="button" onClick={() => { setForm(EMPTY); setCreating(true); }} className="btn-primary !px-4 !py-2.5 text-xs">
          <Plus className="h-3.5 w-3.5" aria-hidden /> Add testimonial
        </button>
      </header>

      <AdminCard title="All testimonials">
        {snap.testimonials.length === 0 ? (
          <EmptyRow message="No testimonials yet — nothing fabricated is ever shown." />
        ) : (
          <ul className="space-y-2">
            {snap.testimonials.map((t) => (
              <ItemRow
                key={t.id}
                title={t.name}
                subtitle={t.role || undefined}
                onEdit={() => { const { id, ...rest } = t; void id; setForm(rest); setEditing(t); }}
                onDelete={() => setToDelete(t)}
              />
            ))}
          </ul>
        )}
      </AdminCard>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Remove this testimonial?"
        message={`The testimonial from "${toDelete?.name}" will be permanently removed.`}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
