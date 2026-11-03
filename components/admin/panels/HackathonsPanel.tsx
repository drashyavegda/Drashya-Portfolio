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
  ListEditor,
  SaveBar,
  SelectField,
  TextAreaField,
  TextField,
  useToast,
} from '../ui';
import { AdminApiError, createItem, deleteItem, updateItem } from '@/lib/admin-api';
import type { Hackathon } from '@/lib/types';
import { formatDate } from '@/lib/utils';

const EMPTY: Omit<Hackathon, 'id'> = {
  name: '',
  date: null,
  project: null,
  technologies: [],
  status: 'participated',
  certificateFile: null,
  certificateLink: null,
  notes: '',
};

export default function HackathonsPanel({ snap, applySnapshot }: PanelProps) {
  const toast = useToast();
  const [editing, setEditing] = useState<Hackathon | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<Hackathon, 'id'>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<Hackathon | null>(null);

  const startCreate = () => {
    setForm(EMPTY);
    setCreating(true);
    setEditing(null);
  };
  const startEdit = (h: Hackathon) => {
    const { id, ...rest } = h;
    void id;
    setForm(rest);
    setEditing(h);
    setCreating(false);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast('error', 'Event name is required.');
      return;
    }
    setSaving(true);
    try {
      const snapshot = editing ? await updateItem('hackathons', editing.id, form) : await createItem('hackathons', form);
      applySnapshot(snapshot);
      toast('success', editing ? 'Event updated.' : 'Event added.');
      setEditing(null);
      setCreating(false);
    } catch (err) {
      toast('error', err instanceof AdminApiError ? err.message : 'Failed to save event.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      const snapshot = await deleteItem('hackathons', toDelete.id);
      applySnapshot(snapshot);
      toast('success', `Deleted "${toDelete.name}".`);
    } catch (err) {
      toast('error', err instanceof AdminApiError ? err.message : 'Failed to delete event.');
    } finally {
      setToDelete(null);
    }
  };

  if (creating || editing) {
    return (
      <div className="space-y-6">
        <button type="button" onClick={() => { setCreating(false); setEditing(null); }} className="inline-flex items-center gap-2 font-mono text-xs text-muted hover:text-neon">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to events
        </button>
        <AdminCard
          title={editing ? `Edit — ${editing.name}` : 'Add hackathon / competition'}
          description="Preserve official event names. Status must reflect reality — participation is participation; wins only when verified."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TextField label="Official event name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} required placeholder="e.g. Agentic AI" />
            </div>
            <TextField label="Event date" type="date" value={form.date ?? ''} onChange={(v) => setForm((f) => ({ ...f, date: v || null }))} />
            <SelectField
              label="Participation status"
              value={form.status}
              onChange={(v) => setForm((f) => ({ ...f, status: v as Hackathon['status'] }))}
              options={[
                { value: 'participated', label: 'Participated' },
                { value: 'finalist', label: 'Finalist (verified)' },
                { value: 'winner', label: 'Winner (verified)' },
              ]}
              hint="Only select finalist/winner when genuinely achieved."
            />
            <div className="sm:col-span-2">
              <TextField label="Project developed at the event" value={form.project ?? ''} onChange={(v) => setForm((f) => ({ ...f, project: v || null }))} placeholder="Optional — leave empty if not specified" />
            </div>
            <div className="sm:col-span-2">
              <ListEditor label="Technologies used" items={form.technologies} onChange={(v) => setForm((f) => ({ ...f, technologies: v }))} />
            </div>
            <div className="sm:col-span-2">
              <FileUploadField
                label="Participation certificate (PDF / JPG / PNG)"
                value={form.certificateFile}
                onChange={(url) => setForm((f) => ({ ...f, certificateFile: url }))}
                folder="hackathons"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                kind={form.certificateFile?.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image'}
              />
            </div>
            <div className="sm:col-span-2">
              <TextField label="Certificate verification link (optional)" type="url" value={form.certificateLink ?? ''} onChange={(v) => setForm((f) => ({ ...f, certificateLink: v || null }))} placeholder="https://…" />
            </div>
            <div className="sm:col-span-2">
              <TextAreaField label="Notes (optional)" value={form.notes} onChange={(v) => setForm((f) => ({ ...f, notes: v }))} rows={2} />
            </div>
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
          <h1 className="font-display text-2xl font-bold">Hackathons Management</h1>
          <p className="mt-1 text-sm text-muted">
            {snap.hackathons.length} events listed · {snap.hackathons.filter((h) => h.certificateFile).length} with certificate files
          </p>
        </div>
        <button type="button" onClick={startCreate} className="btn-primary !px-4 !py-2.5 text-xs">
          <Plus className="h-3.5 w-3.5" aria-hidden /> Add event
        </button>
      </header>

      <AdminCard title="Events" description="Official names preserved exactly as on the certificates.">
        {snap.hackathons.length === 0 ? (
          <EmptyRow message="No events yet." />
        ) : (
          <ul className="space-y-2">
            {snap.hackathons.map((h) => (
              <ItemRow
                key={h.id}
                title={h.name}
                subtitle={h.date ? formatDate(h.date) : 'date pending'}
                badges={
                  <>
                    <span
                      className={`chip !px-2 !py-0.5 font-mono text-[10px] ${
                        h.status === 'winner'
                          ? '!text-amber-300 border-amber-300/40'
                          : h.status === 'finalist'
                            ? '!text-violet border-violet/40'
                            : '!text-neon border-neon/30'
                      }`}
                    >
                      {h.status}
                    </span>
                    {h.certificateFile ? (
                      <a href={h.certificateFile} target="_blank" rel="noopener noreferrer" className="chip !px-2 !py-0.5 font-mono text-[10px] !text-emerald-400">
                        certificate ↗
                      </a>
                    ) : (
                      <span className="chip !px-2 !py-0.5 font-mono text-[10px] !text-amber-400">certificate pending</span>
                    )}
                  </>
                }
                onEdit={() => startEdit(h)}
                onDelete={() => setToDelete(h)}
              />
            ))}
          </ul>
        )}
      </AdminCard>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this event?"
        message={`"${toDelete?.name}" will be permanently removed from the experience section.`}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
