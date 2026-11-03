'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, ExternalLink, Github, Layers, Star, Triangle } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import type { Project } from '@/lib/types';
import { cx } from '@/lib/utils';

function projectShortTitle(p: Project): string {
  return p.title.split('–')[0].split('—')[0].trim();
}

function ProjectVisual({ project }: { project: Project }) {
  if (project.screenshots.length > 0) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={project.screenshots[0]}
        alt={`${projectShortTitle(project)} screenshot`}
        loading="lazy"
        className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    );
  }
  // Decorative placeholder until real screenshots are uploaded via /admin.
  return (
    <div className="relative grid h-44 w-full place-items-center overflow-hidden bg-gradient-to-br from-neon/12 via-raised to-violet/12">
      <div className="grid-bg absolute inset-0 opacity-60" aria-hidden />
      <span className="relative font-display text-4xl font-bold gradient-text drop-shadow-[0_0_20px_rgb(var(--c-neon)/0.4)]">
        {projectShortTitle(project)
          .split(' ')
          .slice(0, 2)
          .map((w) => w[0])
          .join('')}
      </span>
      <span className="absolute bottom-3 right-3 font-mono text-[9px] uppercase tracking-widest text-muted/60">
        screenshot pending
      </span>
    </div>
  );
}

function ProjectCard({ project, compact }: { project: Project; compact?: boolean }) {
  const short = projectShortTitle(project);
  return (
    <article
      className={cx('glass-card glass-card-hover group flex h-full flex-col overflow-hidden', compact ? '' : '')}
      data-cursor-hover
    >
      <div className="relative">
        <ProjectVisual project={project} />
        {project.featured && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-amber-300/40 bg-amber-400/15 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-300 backdrop-blur-sm">
            <Star className="h-3 w-3 fill-current" aria-hidden /> Featured
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-full border border-line/25 bg-base/70 px-2.5 py-1 font-mono text-[10px] text-muted backdrop-blur-sm">
          {project.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-display text-base font-semibold leading-snug sm:text-lg">
          <Link href={`/projects/${project.slug}`} className="transition-colors group-hover:text-neon">
            {short}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">{project.description}</p>

        {project.highlights.length > 0 && (
          <ul className="mt-4 space-y-1.5">
            {project.highlights.slice(0, compact ? 2 : 4).map((h) => (
              <li key={h} className="flex items-start gap-2 text-xs text-muted">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-neon" aria-hidden />
                {h}
              </li>
            ))}
          </ul>
        )}

        {project.technologies.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.technologies.map((t) => (
              <span key={t} className="chip !px-2 !py-0.5 font-mono text-[10px]">{t}</span>
            ))}
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line/12 pt-4">
          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-neon/10 px-3.5 py-2 font-mono text-xs font-semibold text-neon transition-all hover:bg-neon/20 hover:shadow-glow"
          >
            Case Study <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line/25 px-3.5 py-2 font-mono text-xs font-semibold text-ink transition-all hover:border-neon/50 hover:text-neon"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden /> Live Demo
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${short} on GitHub`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line/25 px-3.5 py-2 font-mono text-xs font-semibold text-ink transition-all hover:border-neon/50 hover:text-neon"
            >
              <Github className="h-3.5 w-3.5" aria-hidden /> GitHub
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Projects({ projects, vercelUrl }: { projects: Project[]; vercelUrl: string }) {
  const sorted = useMemo(() => [...projects].sort((a, b) => a.order - b.order), [projects]);
  const categories = useMemo(() => ['All', ...Array.from(new Set(sorted.map((p) => p.category)))], [sorted]);
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' ? sorted : sorted.filter((p) => p.category === filter);
  const featured = filtered.filter((p) => p.featured);
  const others = filtered.filter((p) => !p.featured);

  return (
    <section id="projects" data-track-section="projects" className="section relative">
      <div className="glow-orb left-1/4 top-0 h-80 w-80 bg-violet/10" aria-hidden />
      <div className="container-x relative">
        <SectionHeading
          eyebrow="Projects"
          title="Things I've built"
          subtitle="AI-powered platforms and web products — from sustainability to finance to healthcare. Every project has its own case study."
        />

        {/* Filters */}
        <Reveal className="mb-10 flex flex-wrap justify-center gap-2" delay={0.05}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              aria-pressed={filter === cat}
              className={cx(
                'rounded-full border px-4 py-2 font-mono text-xs font-medium transition-all duration-300',
                filter === cat
                  ? 'border-neon/60 bg-neon/10 text-neon shadow-glow'
                  : 'border-line/20 bg-raised/50 text-muted hover:border-neon/40 hover:text-ink',
              )}
            >
              {cat}
            </button>
          ))}
        </Reveal>

        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-muted">No projects in this category yet.</p>
        )}

        {featured.length > 0 && (
          <>
            <Reveal className="mb-6 flex items-center gap-3">
              <Star className="h-4 w-4 text-amber-300" aria-hidden />
              <h3 className="font-display text-lg font-semibold">Featured Projects</h3>
              <span className="h-px flex-1 bg-gradient-to-r from-line/30 to-transparent" aria-hidden />
            </Reveal>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featured.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.08} className="h-full">
                  <ProjectCard project={p} />
                </Reveal>
              ))}
            </div>
          </>
        )}

        {others.length > 0 && (
          <>
            <Reveal className="mb-6 mt-14 flex items-center gap-3">
              <Layers className="h-4 w-4 text-neon" aria-hidden />
              <h3 className="font-display text-lg font-semibold">More Projects</h3>
              <span className="h-px flex-1 bg-gradient-to-r from-line/30 to-transparent" aria-hidden />
            </Reveal>
            <div className="grid gap-6 md:grid-cols-2">
              {others.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.08} className="h-full">
                  <ProjectCard project={p} compact />
                </Reveal>
              ))}
            </div>
          </>
        )}

        <Reveal className="mt-14 text-center" delay={0.1}>
          <a
            href={vercelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            <Triangle className="h-4 w-4" aria-hidden /> Explore All Projects on Vercel
          </a>
        </Reveal>
      </div>
    </section>
  );
}
