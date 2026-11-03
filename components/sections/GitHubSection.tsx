'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, ExternalLink, GitFork, Github, RefreshCw, Star, Users } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';

interface GhUser {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  public_repos: number;
  followers: number;
  html_url: string;
}

interface GhRepo {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  updated_at: string;
  fork: boolean;
}

interface GhData {
  user: GhUser | null;
  repos: GhRepo[];
  fromCache: boolean;
  error: string | null;
}

const LANG_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5', Java: '#b07219',
  'C++': '#f34b7d', C: '#555555', HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051',
};

export default function GitHubSection({ username, profileUrl }: { username: string; profileUrl: string }) {
  const [data, setData] = useState<GhData | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  const load = () => {
    setState('loading');
    fetch(`/api/github?u=${encodeURIComponent(username)}`)
      .then((r) => r.json())
      .then((d: GhData) => {
        if (d.user || d.repos?.length) {
          setData(d);
          setState('ready');
        } else {
          setData(d);
          setState('error');
        }
      })
      .catch(() => setState('error'));
  };

  useEffect(load, [username]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section id="github" data-track-section="github" className="section relative">
      <div className="glow-orb right-10 top-10 h-64 w-64 bg-neon/8" aria-hidden />
      <div className="container-x relative">
        <SectionHeading
          eyebrow="GitHub"
          title="Live from the repository"
          subtitle="Real-time public data from GitHub — repositories, languages and activity as they actually are."
        />

        {state === 'loading' && (
          <div className="mx-auto max-w-5xl" aria-busy="true" aria-label="Loading GitHub data">
            <div className="glass-card mb-6 flex items-center gap-4 p-6">
              <div className="h-16 w-16 animate-pulse rounded-full bg-line/15" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 animate-pulse rounded bg-line/15" />
                <div className="h-3 w-64 animate-pulse rounded bg-line/15" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass-card h-36 animate-pulse p-5">
                  <div className="h-3.5 w-2/3 rounded bg-line/15" />
                  <div className="mt-3 h-3 w-full rounded bg-line/10" />
                  <div className="mt-2 h-3 w-4/5 rounded bg-line/10" />
                </div>
              ))}
            </div>
          </div>
        )}

        {state === 'error' && (
          <Reveal className="mx-auto max-w-xl text-center">
            <div className="glass-card p-8">
              <AlertTriangle className="mx-auto mb-4 h-8 w-8 text-amber-400" aria-hidden />
              <h3 className="font-display text-lg font-semibold">GitHub data unavailable right now</h3>
              <p className="mt-2 text-sm text-muted">
                {data?.error
                  ? data.error
                  : "The GitHub API could not be reached (it may be rate-limited). No statistics are shown rather than displaying made-up numbers."}
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={load} className="btn-ghost !px-4 !py-2 text-xs">
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Retry
                </button>
                <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="btn-primary !px-4 !py-2 text-xs">
                  <Github className="h-3.5 w-3.5" aria-hidden /> Visit GitHub profile
                </a>
              </div>
            </div>
          </Reveal>
        )}

        {state === 'ready' && data?.user && (
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <div className="glass-card mb-8 flex flex-col items-center gap-5 p-6 sm:flex-row sm:p-7">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.user.avatar_url}
                  alt={`${data.user.login} GitHub avatar`}
                  className="h-18 w-18 h-[72px] w-[72px] rounded-2xl border border-neon/25 shadow-glow"
                  loading="lazy"
                />
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-display text-lg font-semibold">
                    {data.user.name || data.user.login}
                    <span className="ml-2 font-mono text-xs font-normal text-muted">@{data.user.login}</span>
                  </h3>
                  {data.user.bio && <p className="mt-1 text-sm text-muted">{data.user.bio}</p>}
                  <div className="mt-3 flex flex-wrap justify-center gap-4 font-mono text-xs text-muted sm:justify-start">
                    <span className="flex items-center gap-1.5">
                      <Github className="h-3.5 w-3.5 text-neon" aria-hidden /> {data.user.public_repos} public repos
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-violet" aria-hidden /> {data.user.followers} followers
                    </span>
                  </div>
                </div>
                <a href={data.user.html_url} target="_blank" rel="noopener noreferrer" className="btn-primary shrink-center !px-4 !py-2.5 text-xs">
                  <Github className="h-4 w-4" aria-hidden /> GitHub Profile
                </a>
              </div>
            </Reveal>

            {data.fromCache && (
              <p className="mb-4 text-center font-mono text-[11px] text-muted/70">
                Showing cached data (GitHub rate limit reached) — refreshed periodically.
              </p>
            )}

            {data.repos.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">
                No public repositories visible yet.{' '}
                <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="text-neon underline-offset-4 hover:underline">
                  Check the profile <ExternalLink className="inline h-3 w-3" aria-hidden />
                </a>
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.repos.map((repo, i) => (
                  <Reveal key={repo.id} delay={Math.min(i * 0.05, 0.3)} className="h-full">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-card glass-card-hover group flex h-full flex-col p-5"
                      data-cursor-hover
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-mono text-sm font-semibold text-neon transition-colors group-hover:brightness-125">
                          {repo.name}
                        </h4>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                      </div>
                      <p className="mt-2 line-clamp-2 flex-1 text-xs leading-relaxed text-muted">
                        {repo.description || 'No description provided.'}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-[11px] text-muted">
                        {repo.language && (
                          <span className="flex items-center gap-1.5">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ background: LANG_COLORS[repo.language] || '#8b949e' }}
                              aria-hidden
                            />
                            {repo.language}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" aria-hidden /> {repo.stargazers_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitFork className="h-3 w-3" aria-hidden /> {repo.forks_count}
                        </span>
                      </div>
                    </a>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
