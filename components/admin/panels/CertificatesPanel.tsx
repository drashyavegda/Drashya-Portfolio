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
  SelectField,
  TextField,
  TextAreaField,
  useToast,
} from '../ui';
import { AdminApiError, createItem, deleteItem, updateItem } from '@/lib/admin-api';
import type { Certificate, LearningTopic } from '@/lib/types';
import { formatDate } from '@/lib/utils';

type Mode = 'list' | 'edit-cert' | 'new-cert' | 'edit-topic' | 'new-topic';

export default function CertificatesPanel({ snap, applySnapshot }: PanelProps) {
  const toast = useToast();
  const [mode, setMode] = useState<Mode>('list');
  const [certId, setCertId] = useState<string | null>(null);
  const [topicId, setTopicId] = useState<string | null>(null);
  const [certForm, setCertForm] = useState<Omit<Certificate, 'id'>>({ title: '', org: '', date: null, file: null, kind: 'image' });
  const [topicForm, setTopicForm] = useState<Omit<LearningTopic, 'id'>>({ title: '', note: '' });
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<{ type: 'cert' | 'topic'; id: string; title: string } | null>(null);

  const startNewCert = () => {
    setCertForm({ title: '', org: '', date: null, file: null, kind: 'image' });
    setCertId(null);
    setMode('new-cert');
  };
  const startEditCert = (c: Certificate) => {
    const { id, ...rest } = c;
    setCertForm(rest);
    setCertId(id);
    setMode('edit-cert');
  };
  const startNewTopic = () => {
    setTopicForm({ title: '', note: '' });
    setTopicId(null);
    setMode('new-topic');
  };
  const startEditTopic = (t: LearningTopic) => {
    const { id, ...rest } = t;
    setTopicForm(rest);
    setTopicId(id);
    setMode('edit-topic');
  };

  const saveCert = async () => {
    if (!certForm.title.trim()) {
      toast('error', 'Certificate title is required.');
      return;
    }
    setSaving(true);
    try {
      const snapshot = certId
        ? await updateItem('certificates', certId, certForm)
        : await createItem('certificates', certForm);
      applySnapshot(snapshot);
      toast('success', certId ? 'Certificate updated.' : 'Certificate added.');
      setMode('list');
    } catch (err) {
      toast('error', err instanceof AdminApiError ? err.message : 'Failed to save certificate.');
    } finally {
      setSaving(false);
    }
  };

  const saveTopic = async () => {
    if (!topicForm.title.trim()) {
      toast('error', 'Topic title is required.');
      return;
    }
    setSaving(true);
    try {
      const snapshot = topicId ? await updateItem('learning', topicId, topicForm) : await createItem('learning', topicForm);
      applySnapshot(snapshot);
      toast('success', topicId ? 'Learning topic updated.' : 'Learning topic added.');
      setMode('list');
    } catch (err) {
      toast('error', err instanceof AdminApiError ? err.message : 'Failed to save topic.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      const entity = toDelete.type === 'cert' ? 'certificates' : 'learning';
      const snapshot = await deleteItem(entity, toDelete.id);
      applySnapshot(snapshot);
      toast('success', `Deleted "${toDelete.title}".`);
    } catch (err) {
      toast('error', err instanceof AdminApiError ? err.message : 'Failed to delete.');
    } finally {
      setToDelete(null);
    }
  };

  if (mode === 'new-cert' || mode === 'edit-cert') {
    return (
      <div className="space-y-6">
        <button type="button" onClick={() => setMode('list')} className="inline-flex items-center gap-2 font-mono text-xs text-muted hover:text-neon">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to certificates
        </button>
        <AdminCard title={certId ? 'Edit participation certificate' : 'Add participation certificate'} description="Only upload genuine certificates (PDF, JPG or PNG).">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TextField label="Title" value={certForm.title} onChange={(v) => setCertForm((f) => ({ ...f, title: v }))} required placeholder="e.g. Agentic AI — Participation Certificate" />
            </div>
            <TextField label="Issuing organization" value={certForm.org} onChange={(v) => setCertForm((f) => ({ ...f, org: v }))} placeholder="Event organizer / platform" />
            <TextField label="Date" type="date" value={certForm.date ?? ''} onChange={(v) => setCertForm((f) => ({ ...f, date: v || null }))} />
            <SelectField
              label="File type"
              value={certForm.kind}
              onChange={(v) => setCertForm((f) => ({ ...f, kind: v as 'pdf' | 'image' }))}
              options={[
                { value: 'image', label: 'Image (JPG / PNG / WebP)' },
                { value: 'pdf', label: 'PDF document' },
              ]}
            />
            <div className="sm:col-span-2">
              <FileUploadField
                label="Certificate file"
                value={certForm.file}
                onChange={(url) => setCertForm((f) => ({ ...f, file: url, kind: url?.toLowerCase().endsWith('.pdf') ? 'pdf' : f.kind }))}
                folder="certificates"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                kind={certForm.kind}
              />
            </div>
          </div>
          <SaveBar saving={saving} onSave={() => void saveCert()} onCancel={() => setMode('list')} />
        </AdminCard>
      </div>
    );
  }

  if (mode === 'new-topic' || mode === 'edit-topic') {
    return (
      <div className="space-y-6">
        <button type="button" onClick={() => setMode('list')} className="inline-flex items-center gap-2 font-mono text-xs text-muted hover:text-neon">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to certificates
        </button>
        <AdminCard title={topicId ? 'Edit learning topic' : 'Add learning topic'} description="Learning topics are displayed honestly as in-progress — never as completed certifications.">
          <div className="grid gap-5">
            <TextField label="Topic title" value={topicForm.title} onChange={(v) => setTopicForm((f) => ({ ...f, title: v }))} required placeholder="e.g. Machine Learning" />
            <TextAreaField label="Note" value={topicForm.note} onChange={(v) => setTopicForm((f) => ({ ...f, note: v }))} rows={2} />
          </div>
          <SaveBar saving={saving} onSave={() => void saveTopic()} onCancel={() => setMode('list')} />
        </AdminCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Certificates Management</h1>
        <p className="mt-1 text-sm text-muted">Participation certificates and active learning topics — kept clearly separate.</p>
      </header>

      <AdminCard
        title={`A · Participation Certificates (${snap.certificates.length})`}
        description="Upload PDFs or images. Public site offers View + Download once a file exists."
        action={
          <button type="button" onClick={startNewCert} className="btn-primary !px-3.5 !py-2 text-xs">
            <Plus className="h-3.5 w-3.5" aria-hidden /> Add certificate
          </button>
        }
      >
        {snap.certificates.length === 0 ? (
          <EmptyRow message="No certificates yet." />
        ) : (
          <ul className="space-y-2">
            {snap.certificates.map((c) => (
              <ItemRow
                key={c.id}
                title={c.title}
                subtitle={`${c.org || 'org pending'}${c.date ? ` · ${formatDate(c.date)}` : ''}`}
                badges={
                  c.file ? (
                    <a href={c.file} target="_blank" rel="noopener noreferrer" className="chip !px-2 !py-0.5 font-mono text-[10px] !text-emerald-400">
                      {c.kind === 'pdf' ? 'PDF ↗' : 'file ↗'}
                    </a>
                  ) : (
                    <span className="chip !px-2 !py-0.5 font-mono text-[10px] !text-amber-400">file pending</span>
                  )
                }
                onEdit={() => startEditCert(c)}
                onDelete={() => setToDelete({ type: 'cert', id: c.id, title: c.title })}
              />
            ))}
          </ul>
        )}
      </AdminCard>

      <AdminCard
        title={`B · Learning Topics (${snap.learning.length})`}
        description="Shown under “Learning & Certifications” with an explicit in-progress label. Add genuine certifications here once completed."
        action={
          <button type="button" onClick={startNewTopic} className="btn-ghost !px-3.5 !py-2 text-xs">
            <Plus className="h-3.5 w-3.5" aria-hidden /> Add topic
          </button>
        }
      >
        {snap.learning.length === 0 ? (
          <EmptyRow message="No learning topics yet." />
        ) : (
          <ul className="space-y-2">
            {snap.learning.map((t) => (
              <ItemRow
                key={t.id}
                title={t.title}
                subtitle={t.note || undefined}
                onEdit={() => startEditTopic(t)}
                onDelete={() => setToDelete({ type: 'topic', id: t.id, title: t.title })}
              />
            ))}
          </ul>
        )}
      </AdminCard>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={`Delete this ${toDelete?.type === 'cert' ? 'certificate' : 'learning topic'}?`}
        message={`"${toDelete?.title}" will be permanently removed.`}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
