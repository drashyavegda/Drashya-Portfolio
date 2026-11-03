'use client';

import { useState } from 'react';
import type { PanelProps } from '../AdminDashboard';
import { AdminCard, FileUploadField, ListEditor, SaveBar, TextAreaField, TextField, useToast } from '../ui';
import { patchSite, AdminApiError } from '@/lib/admin-api';
import type { Profile } from '@/lib/types';

export default function ProfilePanel({ snap, applySnapshot }: PanelProps) {
  const toast = useToast();
  const [form, setForm] = useState<Profile>({ ...snap.profile });
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(snap.profile);

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    if (!form.name.trim()) {
      toast('error', 'Name cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      const snapshot = await patchSite({ profile: form });
      applySnapshot(snapshot);
      toast('success', 'Profile updated — the public site reflects this immediately.');
    } catch (err) {
      toast('error', err instanceof AdminApiError ? err.message : 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Profile Management</h1>
        <p className="mt-1 text-sm text-muted">Edit the identity shown in the hero, navbar, footer and SEO metadata.</p>
      </header>

      <AdminCard title="Identity" description="Name, title and avatar used across the site.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Full name" value={form.name} onChange={(v) => set('name', v)} required />
          <TextField label="Professional title" value={form.title} onChange={(v) => set('title', v)} placeholder="IT Engineering Student | …" />
          <div className="sm:col-span-2">
            <TextAreaField label="Introduction" value={form.intro} onChange={(v) => set('intro', v)} rows={3} />
          </div>
          <TextField label="Location" value={form.location} onChange={(v) => set('location', v)} />
          <TextField label="Footer tagline" value={form.tagline} onChange={(v) => set('tagline', v)} />
          <div className="sm:col-span-2">
            <FileUploadField
              label="Profile avatar (illustration used until a real photo is uploaded)"
              value={form.avatar}
              onChange={(url) => set('avatar', url)}
              folder="avatar"
              accept="image/png,image/jpeg,image/webp"
              kind="image"
            />
          </div>
        </div>
      </AdminCard>

      <AdminCard title="Contact email" description="Used by the contact section, chatbot and terminal. Social links are under Site Settings.">
        <TextField label="Email address" type="email" value={form.email} onChange={(v) => set('email', v)} required />
      </AdminCard>

      <AdminCard title="Story & personality" description="Journey text, typing roles, interests, qualities and career goals.">
        <div className="grid gap-5">
          <TextAreaField label="Programming journey" value={form.journey} onChange={(v) => set('journey', v)} rows={3} />
          <ListEditor label="Typing animation roles (hero)" items={form.typingRoles} onChange={(v) => set('typingRoles', v)} placeholder="e.g. AI Enthusiast" />
          <ListEditor label="Spoken languages" items={form.languages} onChange={(v) => set('languages', v)} />
          <ListEditor label="Personal interests" items={form.interests} onChange={(v) => set('interests', v)} />
          <ListEditor label="Strongest qualities" items={form.qualities} onChange={(v) => set('qualities', v)} />
          <ListEditor label="Career goals" items={form.careerGoals} onChange={(v) => set('careerGoals', v)} />
        </div>
      </AdminCard>

      <SaveBar saving={saving} onSave={() => void save()} dirty={dirty} />
    </div>
  );
}
