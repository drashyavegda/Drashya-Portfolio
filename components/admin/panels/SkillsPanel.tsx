'use client';

import { useState } from 'react';
import { ArrowLeft, BookOpen, Plus } from 'lucide-react';
import type { PanelProps } from '../AdminDashboard';
import { AdminCard, CheckboxField, ConfirmDialog, EmptyRow, ItemRow, SaveBar, TextAreaField, TextField, useToast } from '../ui';
import { AdminApiError, createItem, deleteItem, updateItem } from '@/lib/admin-api';
import type { Skill } from '@/lib/types';

const EMPTY: Omit<Skill, 'id'> = { name: '', category: 'Programming Languages', description: '', learning: false };

export default function SkillsPanel({ snap, applySnapshot }: PanelProps) {
  const toast = useToast();
  const [editing, setEditing] = useState<Skill | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<Skill, 'id'>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<Skill | null>(null);

  const categories = Array.from(new Set(snap.skills.map((s) => s.category)));

  const startCreate = () => {
    setForm(EMPTY);
    setCreating(true);
    setEditing(null);
  };
  const startEdit = (skill: Skill) => {
    setForm({ name: skill.name, category: skill.category, description: skill.description, learning: skill.learning });
    setEditing(skill);
    setCreating(false);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast('error', 'Skill name is required.');
      return;
    }
    setSaving(true);
    try {
      const snapshot = editing
        ? await updateItem('skills', editing.id, form)
        : await createItem('skills', form);
      applySnapshot(snapshot);
      toast('success', editing ? 'Skill updated.' : 'Skill added.');
      setEditing(null);
      setCreating(false);
    } catch (err) {
      toast('error', err instanceof AdminApiError ? err.message : 'Failed to save skill.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      const snapshot = await deleteItem('skills', toDelete.id);
      applySnapshot(snapshot);
      toast('success', `Removed "${toDelete.name}".`);
    } catch (err) {
      toast('error', err instanceof AdminApiError ? err.message : 'Failed to delete skill.');
    } finally {
      setToDelete(null);
    }
  };

  if (creating || editing) {
    return (
      <div className="space-y-6">
        <button type="button" onClick={() => { setCreating(false); setEditing(null); }} className="inline-flex items-center gap-2 font-mono text-xs text-muted hover:text-neon">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to skills
        </button>
        <AdminCard title={editing ? `Edit skill — ${editing.name}` : 'Add a new skill'}>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField label="Skill name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} required placeholder="e.g. Python" />
            <label className="block">
              <span className="admin-label">Category</span>
              <input
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                list="skill-categories"
                className="input"
                placeholder="Choose or type a new category"
              />
              <datalist id="skill-categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>
            <div className="sm:col-span-2">
              <TextAreaField
                label="Proficiency description"
                value={form.description}
                onChange={(v) => setForm((f) => ({ ...f, description: v }))}
                rows={2}
                placeholder="An honest one-liner, e.g. “Practiced through coursework and personal projects.”"
                hint="Never a fake percentage — describe real practice instead."
              />
            </div>
            <div className="sm:col-span-2">
              <CheckboxField
                label="Currently learning this skill"
                checked={form.learning}
                onChange={(v) => setForm((f) => ({ ...f, learning: v }))}
                hint="Shows a “Learning” badge on the public site."
              />
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
          <h1 className="font-display text-2xl font-bold">Skills Management</h1>
          <p className="mt-1 text-sm text-muted">{snap.skills.length} skills across {categories.length} categories.</p>
        </div>
        <button type="button" onClick={startCreate} className="btn-primary !px-4 !py-2.5 text-xs">
          <Plus className="h-3.5 w-3.5" aria-hidden /> Add skill
        </button>
      </header>

      {categories.map((cat) => {
        const items = snap.skills.filter((s) => s.category === cat);
        if (!items.length) return null;
        return (
          <AdminCard key={cat} title={cat} description={`${items.length} item${items.length > 1 ? 's' : ''}`}>
            <ul className="space-y-2">
              {items.map((s) => (
                <ItemRow
                  key={s.id}
                  title={s.name}
                  subtitle={s.description || undefined}
                  badges={
                    s.learning ? (
                      <span className="chip !px-2 !py-0.5 font-mono text-[10px] !text-violet">
                        <BookOpen className="h-3 w-3" aria-hidden /> learning
                      </span>
                    ) : undefined
                  }
                  onEdit={() => startEdit(s)}
                  onDelete={() => setToDelete(s)}
                />
              ))}
            </ul>
          </AdminCard>
        );
      })}

      {snap.skills.length === 0 && <EmptyRow message="No skills yet — add the first one." />}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this skill?"
        message={`"${toDelete?.name}" will be permanently removed from the public skills section.`}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
