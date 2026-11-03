'use client';

import { useState } from 'react';
import { Bot, CheckCircle2, Database, Github, Mail, XCircle } from 'lucide-react';
import type { PanelProps } from '../AdminDashboard';
import { AdminCard, CheckboxField, SaveBar, SelectField, TextAreaField, TextField, FileUploadField, useToast } from '../ui';
import { AdminApiError, patchSite } from '@/lib/admin-api';
import type { AvailabilityStatus } from '@/lib/types';

export default function SettingsPanel({ snap, meta, applySnapshot }: PanelProps) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [socials, setSocials] = useState({ ...snap.profile.socials });
  const [availability, setAvailability] = useState({ ...snap.availability });
  const [settings, setSettings] = useState({ ...snap.settings });

  const dirty =
    JSON.stringify(socials) !== JSON.stringify(snap.profile.socials) ||
    JSON.stringify(availability) !== JSON.stringify(snap.availability) ||
    JSON.stringify(settings) !== JSON.stringify(snap.settings);

  const save = async () => {
    setSaving(true);
    try {
      const snapshot = await patchSite({ profile: { socials }, availability, settings });
      applySnapshot(snapshot);
      toast('success', 'Site settings saved.');
    } catch (err) {
      toast('error', err instanceof AdminApiError ? err.message : 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const integrations = [
    {
      label: 'Supabase (database, auth, storage)',
      configured: meta.supabaseConfigured,
      icon: Database,
      hint: 'Env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY — see README §Supabase setup.',
      current: meta.mode === 'supabase' ? 'Active — changes persist in PostgreSQL.' : 'Not configured — using local JSON store.',
    },
    {
      label: 'AI provider (chatbot)',
      configured: meta.aiConfigured,
      icon: Bot,
      hint: 'Env: OPENAI_API_KEY or GEMINI_API_KEY (server-side only, never exposed to the browser).',
      current: meta.aiConfigured
        ? 'Active — assistant answers with the live LLM + verified portfolio context.'
        : 'Not configured — the built-in verified-knowledge engine answers instead (honest fallback, no invention).',
    },
    {
      label: 'Email delivery (Resend)',
      configured: meta.emailConfigured,
      icon: Mail,
      hint: 'Env: RESEND_API_KEY, RESEND_FROM_EMAIL (verified sender domain).',
      current: meta.emailConfigured
        ? 'Active — contact messages are emailed to you and stored in the inbox.'
        : 'Not configured — contact messages are still stored in the admin inbox (delivery is never faked).',
    },
    {
      label: 'GitHub personal token (optional)',
      configured: meta.githubTokenConfigured,
      icon: Github,
      hint: 'Env: GITHUB_PERSONAL_TOKEN — raises the public API rate limit for the GitHub section.',
      current: meta.githubTokenConfigured ? 'Active — higher rate limits for repo data.' : 'Not configured — using the public API with caching.',
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Site Settings</h1>
        <p className="mt-1 text-sm text-muted">Social links, availability badge, SEO defaults and integration status.</p>
      </header>

      <AdminCard title="Availability badge" description="Only the status selected here is displayed publicly. Nothing is assumed.">
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            label="Status"
            value={availability.status}
            onChange={(v) => setAvailability((a) => ({ ...a, status: v as AvailabilityStatus }))}
            options={[
              { value: 'hidden', label: 'Hidden (no status shown)' },
              { value: 'internships', label: 'Open to Internships' },
              { value: 'hackathons', label: 'Open to Hackathons' },
              { value: 'collaborations', label: 'Open to Collaborations' },
              { value: 'unavailable', label: 'Not Currently Available' },
            ]}
          />
          <div className="flex items-end pb-1">
            <CheckboxField
              label="Show badge on the site"
              checked={availability.visible && availability.status !== 'hidden'}
              onChange={(v) => setAvailability((a) => ({ ...a, visible: v }))}
              hint="Displayed in the navbar and hero."
            />
          </div>
        </div>
      </AdminCard>

      <AdminCard title="Social links" description="Used in the hero, navbar, footer, contact section and structured data.">
        <div className="grid gap-5">
          <TextField label="GitHub profile URL" type="url" value={socials.github} onChange={(v) => setSocials((s) => ({ ...s, github: v }))} />
          <TextField label="LinkedIn profile URL" type="url" value={socials.linkedin} onChange={(v) => setSocials((s) => ({ ...s, linkedin: v }))} />
          <TextField label="Vercel profile URL" type="url" value={socials.vercel} onChange={(v) => setSocials((s) => ({ ...s, vercel: v }))} hint='Powers the "Explore All Projects on Vercel" button.' />
        </div>
      </AdminCard>

      <AdminCard title="SEO defaults" description="Applied to metadata, Open Graph tags and search snippets site-wide.">
        <div className="grid gap-5">
          <TextField label="Site title" value={settings.seoTitle} onChange={(v) => setSettings((s) => ({ ...s, seoTitle: v }))} />
          <TextAreaField label="Meta description" value={settings.seoDescription} onChange={(v) => setSettings((s) => ({ ...s, seoDescription: v }))} rows={3} />
          <TextField label="Keywords (comma separated)" value={settings.seoKeywords} onChange={(v) => setSettings((s) => ({ ...s, seoKeywords: v }))} />
          <FileUploadField
            label="Open Graph image (1200×630 recommended)"
            value={settings.ogImage}
            onChange={(url) => setSettings((s) => ({ ...s, ogImage: url || '/og.png' }))}
            folder="blog"
            accept="image/png,image/jpeg,image/webp"
            kind="image"
          />
        </div>
      </AdminCard>

      <AdminCard title="Integrations" description="Honest status of external services. Configure via environment variables — secrets never appear in client code.">
        <ul className="space-y-3">
          {integrations.map(({ label, configured, icon: Icon, hint, current }) => (
            <li key={label} className="rounded-xl border border-line/12 bg-raised/40 p-4">
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border ${configured ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400' : 'border-line/20 bg-raised text-muted'}`}>
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    {label}
                    {configured ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-emerald-400">
                        <CheckCircle2 className="h-2.5 w-2.5" aria-hidden /> configured
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-line/25 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted">
                        <XCircle className="h-2.5 w-2.5" aria-hidden /> not configured
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{current}</p>
                  <p className="mt-1 font-mono text-[10px] leading-relaxed text-muted/60">{hint}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </AdminCard>

      <SaveBar saving={saving} onSave={() => void save()} dirty={dirty} />
    </div>
  );
}
