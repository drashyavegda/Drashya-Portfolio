'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Eye, Laptop, Monitor, Smartphone, Tablet } from 'lucide-react';
import type { PanelProps } from '../AdminDashboard';
import { AdminCard, EmptyRow } from '../ui';
import { fetchAnalytics, type AnalyticsSummaryClient } from '@/lib/admin-api';

function TopList({ title, data, empty }: { title: string; data: Record<string, number>; empty: string }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const max = entries[0]?.[1] || 1;
  return (
    <AdminCard title={title}>
      {entries.length === 0 ? (
        <EmptyRow message={empty} />
      ) : (
        <ul className="space-y-2.5">
          {entries.map(([key, count]) => (
            <li key={key}>
              <div className="mb-1 flex items-center justify-between gap-3 font-mono text-[11px]">
                <span className="truncate text-muted">{key}</span>
                <span className="shrink-0 font-semibold text-neon">{count}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-line/12">
                <div className="h-full rounded-full bg-gradient-to-r from-neon to-violet" style={{ width: `${Math.max(6, (count / max) * 100)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminCard>
  );
}

export default function AnalyticsPanel({ snap }: PanelProps) {
  const [summary, setSummary] = useState<AnalyticsSummaryClient | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchAnalytics()
      .then(setSummary)
      .catch(() => setError(true));
  }, []);

  const projectNames: Record<string, string> = {};
  for (const p of snap.projects) projectNames[p.slug] = p.title.split('–')[0].trim();
  const postTitles: Record<string, string> = {};
  for (const p of snap.posts) postTitles[p.slug] = p.title;

  const byDayEntries = summary ? Object.entries(summary.byDay).sort((a, b) => a[0].localeCompare(b[0])).slice(-14) : [];
  const maxDay = Math.max(1, ...byDayEntries.map(([, v]) => v));

  const deviceIcon = (d: string) => (d === 'mobile' ? Smartphone : d === 'tablet' ? Tablet : d === 'desktop' ? Monitor : Laptop);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Visitor Analytics</h1>
        <p className="mt-1 text-sm text-muted">
          Privacy-friendly: aggregate counts only — no IPs, cookies or personal data. Numbers are real; nothing is estimated.
        </p>
      </header>

      {error && <EmptyRow message="Analytics could not be loaded right now." />}

      {summary && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="glass-card p-4">
              <Eye className="mb-2 h-4 w-4 text-neon" aria-hidden />
              <p className="font-display text-2xl font-bold">{summary.totalVisits}</p>
              <p className="text-xs text-muted">Total page views</p>
            </div>
            <div className="glass-card p-4">
              <BarChart3 className="mb-2 h-4 w-4 text-violet" aria-hidden />
              <p className="font-display text-2xl font-bold">{summary.today}</p>
              <p className="text-xs text-muted">Events today</p>
            </div>
            <div className="glass-card p-4">
              <p className="font-display text-2xl font-bold">{Object.keys(summary.byProject).length}</p>
              <p className="text-xs text-muted">Projects viewed</p>
            </div>
            <div className="glass-card p-4">
              <p className="font-display text-2xl font-bold">{Object.keys(summary.byBlogPost).length}</p>
              <p className="text-xs text-muted">Articles viewed</p>
            </div>
          </div>

          <AdminCard title="Last 14 days" description="Events per day (page, project, section and article views).">
            {byDayEntries.length === 0 ? (
              <EmptyRow message="No recorded activity yet — data appears as visitors browse the site." />
            ) : (
              <div className="flex h-32 items-end gap-1.5">
                {byDayEntries.map(([day, count]) => (
                  <div key={day} className="group flex flex-1 flex-col items-center gap-1.5">
                    <span className="font-mono text-[9px] text-neon opacity-0 transition-opacity group-hover:opacity-100">{count}</span>
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-neon/70 to-violet/70 transition-all group-hover:from-neon group-hover:to-violet"
                      style={{ height: `${Math.max(4, (count / maxDay) * 100)}%` }}
                      title={`${day}: ${count} events`}
                    />
                    <span className="font-mono text-[8.5px] text-muted/70">{day.slice(5)}</span>
                  </div>
                ))}
              </div>
            )}
          </AdminCard>

          <div className="grid gap-4 lg:grid-cols-2">
            <TopList title="Popular pages" data={summary.byPath} empty="No page views recorded yet." />
            <TopList
              title="Popular projects"
              data={Object.fromEntries(Object.entries(summary.byProject).map(([k, v]) => [projectNames[k] || k, v]))}
              empty="No project views recorded yet."
            />
            <TopList title="Popular sections" data={summary.bySection} empty="No section views recorded yet." />
            <TopList
              title="Blog article views"
              data={Object.fromEntries(Object.entries(summary.byBlogPost).map(([k, v]) => [postTitles[k] || k, v]))}
              empty="No article views recorded yet."
            />
          </div>

          <AdminCard title="Device categories" description="Coarse categories derived from the browser user-agent — no fingerprinting.">
            {Object.keys(summary.byDevice).length === 0 ? (
              <EmptyRow message="No device data yet." />
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Object.entries(summary.byDevice)
                  .sort((a, b) => b[1] - a[1])
                  .map(([device, count]) => {
                    const Icon = deviceIcon(device);
                    return (
                      <li key={device} className="flex items-center gap-3 rounded-xl border border-line/12 bg-raised/40 p-3.5">
                        <Icon className="h-4 w-4 text-neon" aria-hidden />
                        <div>
                          <p className="font-display text-sm font-bold">{count}</p>
                          <p className="font-mono text-[10px] capitalize text-muted">{device}</p>
                        </div>
                      </li>
                    );
                  })}
              </ul>
            )}
          </AdminCard>
        </>
      )}

      {!summary && !error && <EmptyRow message="Loading analytics…" />}
    </div>
  );
}
