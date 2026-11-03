'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  BarChart3,
  Code2,
  ExternalLink,
  FileBadge,
  FileText,
  FolderKanban,
  GraduationCap,
  Hammer,
  Inbox,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  MessageSquareQuote,
  PenLine,
  Settings,
  User,
  X,
} from 'lucide-react';
import { fetchContent, logout, type AdminContentResponse } from '@/lib/admin-api';
import type { Snapshot } from '@/lib/types';
import { cx } from '@/lib/utils';
import { ToastProvider } from './ui';
import OverviewPanel from './panels/OverviewPanel';
import ProfilePanel from './panels/ProfilePanel';
import SkillsPanel from './panels/SkillsPanel';
import ProjectsPanel from './panels/ProjectsPanel';
import CertificatesPanel from './panels/CertificatesPanel';
import HackathonsPanel from './panels/HackathonsPanel';
import EducationPanel from './panels/EducationPanel';
import BlogPanel from './panels/BlogPanel';
import ResumePanel from './panels/ResumePanel';
import TestimonialsPanel from './panels/TestimonialsPanel';
import MessagesPanel from './panels/MessagesPanel';
import AnalyticsPanel from './panels/AnalyticsPanel';
import SettingsPanel from './panels/SettingsPanel';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'skills', label: 'Skills', icon: Code2 },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'certificates', label: 'Certificates', icon: FileBadge },
  { id: 'hackathons', label: 'Hackathons', icon: Hammer },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'blog', label: 'Blog', icon: PenLine },
  { id: 'resume', label: 'Resume', icon: FileText },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { id: 'messages', label: 'Messages', icon: Inbox },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Site Settings', icon: Settings },
] as const;

export type TabId = (typeof TABS)[number]['id'];

export interface PanelProps {
  snap: Snapshot;
  meta: AdminContentResponse['meta'];
  applySnapshot: (s: Snapshot) => void;
  goTab: (tab: TabId) => void;
}

function DashboardInner({ adminEmail }: { adminEmail: string }) {
  const searchParams = useSearchParams();
  const initialTab = (TABS.find((t) => t.id === searchParams.get('tab'))?.id ?? 'dashboard') as TabId;
  const [tab, setTab] = useState<TabId>(initialTab);
  const [data, setData] = useState<AdminContentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/content');
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      const json = (await res.json()) as AdminContentResponse;
      if (json.ok) {
        setData(json);
        setError(null);
      } else {
        setError(json.error || 'Failed to load content.');
      }
    } catch {
      setError('Network error while loading the dashboard.');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const goTab = useCallback((next: TabId) => {
    setTab(next);
    setSidebarOpen(false);
    window.history.replaceState(null, '', `/admin?tab=${next}`);
  }, []);

  const applySnapshot = useCallback((s: Snapshot) => {
    setData((prev) => (prev ? { ...prev, snapshot: s } : prev));
  }, []);

  const onLogout = async () => {
    await logout();
    window.location.href = '/admin/login';
  };

  const unread = data?.snapshot.messages.filter((m) => !m.read).length ?? 0;

  const panelProps: PanelProps | null = data
    ? { snap: data.snapshot, meta: data.meta, applySnapshot, goTab }
    : null;

  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[250px_1fr]">
      {/* Sidebar — desktop */}
      <aside className="sticky top-0 hidden h-svh flex-col border-r border-line/12 bg-raised/50 lg:flex">
        <SidebarContent tab={tab} goTab={goTab} unread={unread} adminEmail={adminEmail} mode={data?.meta.mode} onLogout={onLogout} />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-line/12 bg-base/85 px-4 py-3 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open admin menu"
          className="grid h-9 w-9 place-items-center rounded-lg border border-line/20 text-ink"
        >
          <Menu className="h-4.5 w-4.5" aria-hidden />
        </button>
        <span className="font-display text-sm font-semibold">Admin · {TABS.find((t) => t.id === tab)?.label}</span>
        <Link href="/" className="font-mono text-[11px] text-neon">
          View site ↗
        </Link>
      </div>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-line/15 bg-base shadow-card">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close admin menu"
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-muted hover:text-ink"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
            <SidebarContent tab={tab} goTab={goTab} unread={unread} adminEmail={adminEmail} mode={data?.meta.mode} onLogout={onLogout} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="min-w-0">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
          {error && !data && (
            <div className="glass-card border-red-400/25 p-8 text-center">
              <p className="text-sm text-red-300">{error}</p>
              <button type="button" onClick={() => void load()} className="btn-ghost mt-4 !px-4 !py-2 text-xs">
                Retry
              </button>
            </div>
          )}

          {!data && !error && (
            <div className="grid place-items-center py-32" aria-busy="true">
              <Loader2 className="h-8 w-8 animate-spin text-neon" aria-label="Loading dashboard" />
            </div>
          )}

          {data && panelProps && (
            <>
              {data.meta.persistenceWarning && (
                <div className="mb-6 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-xs leading-relaxed text-amber-200" role="alert">
                  ⚠ {data.meta.persistenceWarning}
                </div>
              )}
              {tab === 'dashboard' && <OverviewPanel {...panelProps} />}
              {tab === 'profile' && <ProfilePanel {...panelProps} />}
              {tab === 'skills' && <SkillsPanel {...panelProps} />}
              {tab === 'projects' && <ProjectsPanel {...panelProps} />}
              {tab === 'certificates' && <CertificatesPanel {...panelProps} />}
              {tab === 'hackathons' && <HackathonsPanel {...panelProps} />}
              {tab === 'education' && <EducationPanel {...panelProps} />}
              {tab === 'blog' && <BlogPanel {...panelProps} />}
              {tab === 'resume' && <ResumePanel {...panelProps} />}
              {tab === 'testimonials' && <TestimonialsPanel {...panelProps} />}
              {tab === 'messages' && <MessagesPanel {...panelProps} />}
              {tab === 'analytics' && <AnalyticsPanel {...panelProps} />}
              {tab === 'settings' && <SettingsPanel {...panelProps} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SidebarContent({
  tab,
  goTab,
  unread,
  adminEmail,
  mode,
  onLogout,
}: {
  tab: TabId;
  goTab: (t: TabId) => void;
  unread: number;
  adminEmail: string;
  mode?: 'local' | 'supabase';
  onLogout: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-3 border-b border-line/12 px-5 py-5">
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-neon/30 bg-raised/70 font-display text-sm font-bold gradient-text shadow-glow">
          DV
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold">Admin Dashboard</p>
          <p className="truncate font-mono text-[10px] text-muted">{adminEmail}</p>
        </div>
      </div>

      <nav aria-label="Admin sections" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => goTab(id)}
                aria-current={tab === id ? 'page' : undefined}
                className={cx(
                  'flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-all duration-200',
                  tab === id
                    ? 'border border-neon/35 bg-neon/10 text-neon shadow-glow'
                    : 'border border-transparent text-muted hover:bg-raised/70 hover:text-ink',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {label}
                {id === 'messages' && unread > 0 && (
                  <span className="ml-auto rounded-full bg-violet px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-line/12 px-4 py-4">
        <p className="mb-3 flex items-center gap-2 font-mono text-[10px] text-muted">
          <span className={cx('h-2 w-2 rounded-full', mode === 'supabase' ? 'bg-emerald-400' : 'bg-amber-400')} aria-hidden />
          Storage: {mode === 'supabase' ? 'Supabase (persistent)' : 'Local JSON (dev/demo)'}
        </p>
        <Link
          href="/"
          target="_blank"
          className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted transition-colors hover:text-neon"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden /> View public site
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted transition-colors hover:bg-red-400/10 hover:text-red-400"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden /> Sign out
        </button>
      </div>
    </>
  );
}

export default function AdminDashboard({ adminEmail }: { adminEmail: string }) {
  return (
    <ToastProvider>
      <Suspense fallback={<div className="grid min-h-svh place-items-center"><Loader2 className="h-8 w-8 animate-spin text-neon" /></div>}>
        <DashboardInner adminEmail={adminEmail} />
      </Suspense>
    </ToastProvider>
  );
}
