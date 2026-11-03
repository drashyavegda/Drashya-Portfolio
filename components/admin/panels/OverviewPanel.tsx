'use client';

import { useEffect, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Circle,
  FileBadge,
  FolderKanban,
  Hammer,
  Inbox,
  PenLine,
  Code2,
  MessageSquareQuote,
} from 'lucide-react';
import type { PanelProps } from '../AdminDashboard';
import { fetchAnalytics } from '@/lib/admin-api';
import { formatDate } from '@/lib/utils';

export default function OverviewPanel({ snap, meta, goTab }: PanelProps) {
  const [visits, setVisits] = useState<number | null>(null);

  useEffect(() => {
    fetchAnalytics()
      .then((s) => setVisits(s.totalVisits))
      .catch(() => setVisits(null));
  }, []);

  const stats = [
    { label: 'Projects', value: snap.projects.length, sub: `${snap.projects.filter((p) => p.featured).length} featured`, icon: FolderKanban, tab: 'projects' as const },
    { label: 'Blog posts', value: snap.posts.length, sub: `${snap.posts.filter((p) => p.status === 'published').length} published`, icon: PenLine, tab: 'blog' as const },
    { label: 'Skills', value: snap.skills.length, sub: `${snap.skills.filter((s) => s.learning).length} learning`, icon: Code2, tab: 'skills' as const },
    { label: 'Certificates', value: snap.certificates.length, sub: `${snap.certificates.filter((c) => c.file).length} with files`, icon: FileBadge, tab: 'certificates' as const },
    { label: 'Hackathons', value: snap.hackathons.length, sub: 'verified participation', icon: Hammer, tab: 'hackathons' as const },
    { label: 'Testimonials', value: snap.testimonials.length, sub: 'genuine only', icon: MessageSquareQuote, tab: 'testimonials' as const },
    { label: 'Messages', value: snap.messages.length, sub: `${snap.messages.filter((m) => !m.read).length} unread`, icon: Inbox, tab: 'messages' as const },
    { label: 'Total visits', value: visits ?? '—', sub: 'since analytics began', icon: BarChart3, tab: 'analytics' as const },
  ];

  const checklist: Array<{ label: string; done: boolean; tab: PanelProps['goTab'] extends (t: infer T) => void ? T : never; note?: string }> = [
    { label: 'Upload resume PDF', done: Boolean(snap.resume.file), tab: 'resume', note: 'The Download Resume button appears automatically once uploaded.' },
    { label: 'Add project screenshots', done: snap.projects.every((p) => p.screenshots.length > 0), tab: 'projects' },
    { label: 'Add project demo / GitHub links', done: snap.projects.every((p) => p.demoUrl || p.githubUrl), tab: 'projects' },
    { label: 'Upload certificate files', done: snap.certificates.every((c) => Boolean(c.file)), tab: 'certificates' },
    { label: 'Add hackathon dates & projects', done: snap.hackathons.every((h) => h.date && h.project), tab: 'hackathons' },
    { label: 'Set availability badge', done: snap.availability.visible, tab: 'settings' },
    { label: 'Connect Supabase (persistent storage)', done: meta.supabaseConfigured, tab: 'settings', note: 'Required for production on Vercel — see README.' },
    { label: 'Connect AI provider (chatbot)', done: meta.aiConfigured, tab: 'settings', note: 'Optional — the built-in verified-knowledge engine works without it.' },
    { label: 'Connect email delivery (Resend)', done: meta.emailConfigured, tab: 'settings', note: 'Optional — messages are always saved to the admin inbox.' },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-muted">
          Content last updated {formatDate(snap.updatedAt)} · Storage mode:{' '}
          <span className={meta.mode === 'supabase' ? 'text-emerald-400' : 'text-amber-400'}>
            {meta.mode === 'supabase' ? 'Supabase (persistent)' : 'Local JSON (development/demo)'}
          </span>
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {stats.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => goTab(s.tab)}
            className="glass-card glass-card-hover p-4 text-left"
          >
            <s.icon className="mb-3 h-4.5 w-4.5 text-neon" aria-hidden />
            <p className="font-display text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium text-ink">{s.label}</p>
            <p className="mt-0.5 font-mono text-[10px] text-muted">{s.sub}</p>
          </button>
        ))}
      </div>

      <section className="glass-card p-5 sm:p-6">
        <h2 className="mb-1 font-display text-base font-semibold">Setup checklist</h2>
        <p className="mb-5 text-xs text-muted">Honest status of optional configuration and pending content — nothing is faked.</p>
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {checklist.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                onClick={() => goTab(item.tab)}
                className="flex w-full items-start gap-3 rounded-xl border border-line/12 bg-raised/40 p-3.5 text-left transition-colors hover:border-neon/30"
              >
                {item.done ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
                ) : (
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted/50" aria-hidden />
                )}
                <span className="min-w-0">
                  <span className={item.done ? 'block text-xs font-medium text-muted line-through' : 'block text-xs font-medium text-ink'}>
                    {item.label}
                  </span>
                  {item.note && !item.done && <span className="mt-0.5 block text-[10.5px] leading-relaxed text-muted/70">{item.note}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
