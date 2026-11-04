import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Github,
  Lightbulb,
  ListChecks,
  Target,
  TerminalSquare,
  Triangle,
  Trophy,
  Wrench,
} from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import ProjectViewTracker from '@/components/ui/ProjectViewTracker';
import { getSnapshot } from '@/lib/db';
import { cx, formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const snap = await getSnapshot();
  const project = snap.projects.find((p) => p.slug === params.slug);
  if (!project) return { title: 'Project not found' };
  return {
    title: project.seoTitle || project.title,
    description: project.seoDescription || project.description.slice(0, 160),
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: project.seoTitle || project.title,
      description: project.seoDescription || project.description.slice(0, 160),
      images: project.screenshots.length ? [{ url: project.screenshots[0] }] : [{ url: '/og.png' }],
    },
  };
}

function CaseBlock({
  icon: Icon,
  title,
  body,
  pendingNote,
}: {
  icon: typeof Target;
  title: string;
  body: string;
  pendingNote: string;
}) {
  return (
    <Reveal>
      <div className="glass-card p-6 sm:p-7">
        <h2 className="mb-3 flex items-center gap-2.5 font-display text-lg font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-neon/25 bg-neon/10 text-neon">
            <Icon className="h-4.5 w-4.5" aria-hidden />
          </span>
          {title}
        </h2>
        {body ? (
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted">{body}</p>
        ) : (
          <p className="rounded-xl border border-dashed border-line/25 p-4 font-mono text-xs text-muted">
            {pendingNote}
          </p>
        )}
      </div>
    </Reveal>
  );
}

export default async function ProjectPage({ params }: Props) {
  const snap = await getSnapshot();
  const project = snap.projects.find((p) => p.slug === params.slug);
  if (!project) notFound();

  const others = snap.projects.filter((p) => p.id !== project.id).sort((a, b) => a.order - b.order).slice(0, 3);

  return (
    <div className="relative pb-24 pt-32 sm:pt-36">
      <ProjectViewTracker slug={project.slug} />
      <div className="glow-orb left-1/4 top-0 h-80 w-80 bg-violet/10" aria-hidden />
      <div className="container-x relative">
        <Link
          href="/#projects"
          className="mb-8 inline-flex items-center gap-2 font-mono text-xs text-muted transition-colors hover:text-neon"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to all projects
        </Link>

        {/* Header */}
        <Reveal>
          <header className="mb-10">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="chip !text-neon border-neon/30">{project.category}</span>
              {project.featured && (
                <span className="chip border-amber-300/40 !text-amber-300">
                  <Trophy className="h-3 w-3" aria-hidden /> Featured Project
                </span>
              )}
            </div>
            <h1 className="max-w-4xl font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
              {project.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted">{project.description}</p>

            <div className="mt-7 flex flex-wrap gap-3">
              {project.demoUrl ? (
                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  <ExternalLink className="h-4 w-4" aria-hidden /> Live Demo
                </a>
              ) : (
                <span className="btn-ghost cursor-not-allowed !opacity-50" aria-disabled="true" title="Demo link not published yet">
                  <ExternalLink className="h-4 w-4" aria-hidden /> Demo coming soon
                </span>
              )}
              {project.githubUrl ? (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                  <Github className="h-4 w-4" aria-hidden /> Source Code
                </a>
              ) : (
                <a
                  href={snap.profile.socials.vercel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                  title="Explore deployments on Vercel"
                >
                  <Triangle className="h-4 w-4" aria-hidden /> Explore on Vercel
                </a>
              )}
            </div>
          </header>
        </Reveal>

        {/* Screenshots */}
        {project.screenshots.length > 0 ? (
          <Reveal className="mb-12">
            <div className={cx('grid gap-4', project.screenshots.length > 1 ? 'sm:grid-cols-2' : '')}>
              {project.screenshots.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt={`${project.title} screenshot ${i + 1}`}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  className="w-full rounded-2xl border border-line/15 object-cover shadow-card"
                />
              ))}
            </div>
          </Reveal>
        ) : (
          <Reveal className="mb-12">
            <div className="relative grid h-56 place-items-center overflow-hidden rounded-2xl border border-dashed border-line/25 bg-gradient-to-br from-neon/6 to-violet/6 sm:h-72">
              <div className="grid-bg absolute inset-0 opacity-50" aria-hidden />
              <p className="relative px-6 text-center font-mono text-xs text-muted">
                Screenshots pending — will be uploaded via the Admin Dashboard.
              </p>
            </div>
          </Reveal>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          {/* Case study */}
          <div className="space-y-6">
            <CaseBlock
              icon={Target}
              title="Problem Statement"
              body={project.caseStudy.problem}
              pendingNote="// Problem statement will be added by Drashya via the Admin Dashboard — nothing is auto-generated."
            />
            <CaseBlock
              icon={Lightbulb}
              title="Proposed Solution"
              body={project.caseStudy.solution}
              pendingNote="// Solution details coming soon."
            />
            <CaseBlock
              icon={TerminalSquare}
              title="Development Process"
              body={project.caseStudy.process}
              pendingNote="// Development process write-up coming soon."
            />
            <CaseBlock
              icon={Wrench}
              title="Challenges Faced"
              body={project.caseStudy.challenges}
              pendingNote="// Challenges write-up coming soon."
            />
            <CaseBlock
              icon={Trophy}
              title="Results & Learning"
              body={project.caseStudy.results}
              pendingNote="// Results & learnings coming soon — only genuine outcomes will be published, never invented metrics."
            />
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {project.highlights.length > 0 && (
              <Reveal delay={0.1}>
                <div className="glass-card p-6">
                  <h2 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider text-neon">
                    <ListChecks className="h-4 w-4" aria-hidden /> Key Features
                  </h2>
                  <ul className="space-y-2.5">
                    {project.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2.5 text-sm text-muted">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neon" aria-hidden />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}

            <Reveal delay={0.15}>
              <div className="glass-card p-6">
                <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-violet">
                  Technologies Used
                </h2>
                {project.technologies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((t) => (
                      <span key={t} className="chip">{t}</span>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-line/25 p-4 font-mono text-xs text-muted">
                    Tech stack not published yet — editable from the Admin Dashboard.
                  </p>
                )}
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="glass-card p-6">
                <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-neon">
                  Project Links
                </h2>
                <ul className="space-y-2 font-mono text-xs">
                  <li className="flex justify-between gap-2">
                    <span className="text-muted">Live demo</span>
                    {project.demoUrl ? (
                      <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="text-neon hover:underline">
                        Open ↗
                      </a>
                    ) : (
                      <span className="text-muted">pending</span>
                    )}
                  </li>
                  <li className="flex justify-between gap-2">
                    <span className="text-muted">Source code</span>
                    {project.githubUrl ? (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-neon hover:underline">
                        GitHub ↗
                      </a>
                    ) : (
                      <span className="text-muted">pending</span>
                    )}
                  </li>
                  <li className="flex justify-between gap-2">
                    <span className="text-muted">All deployments</span>
                    <a href={snap.profile.socials.vercel} target="_blank" rel="noopener noreferrer" className="text-neon hover:underline">
                      Vercel ↗
                    </a>
                  </li>
                </ul>
              </div>
            </Reveal>
          </aside>
        </div>

        {/* Other projects */}
        {others.length > 0 && (
          <div className="mt-20">
            <Reveal>
              <h2 className="mb-6 font-display text-xl font-semibold">Explore other projects</h2>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-3">
              {others.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.07} className="h-full">
                  <Link href={`/projects/${p.slug}`} className="glass-card glass-card-hover group flex h-full flex-col p-5" data-cursor-hover>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-violet">{p.category}</span>
                    <h3 className="mt-2 font-display text-sm font-semibold transition-colors group-hover:text-neon">
                      {p.title.split('–')[0].trim()}
                    </h3>
                    <p className="mt-2 line-clamp-2 flex-1 text-xs text-muted">{p.description}</p>
                    <span className="mt-4 inline-flex items-center gap-1 font-mono text-[11px] text-neon">
                      View case study <ExternalLink className="h-3 w-3" aria-hidden />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        )}

        <p className="mt-14 text-center font-mono text-[11px] text-muted">
          Last updated {formatDate(snap.updatedAt)} · Content managed by {snap.profile.name}
        </p>
      </div>
    </div>
  );
}
