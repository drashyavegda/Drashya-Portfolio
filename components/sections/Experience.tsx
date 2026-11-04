import { Award, CalendarDays, FileCheck2, Hammer, Info } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import type { Hackathon } from '@/lib/types';
import { formatDate } from '@/lib/utils';

const STATUS_META: Record<Hackathon['status'], { label: string; className: string }> = {
  participated: { label: 'Participated', className: 'border-neon/40 bg-neon/10 text-neon' },
  finalist: { label: 'Finalist', className: 'border-violet/40 bg-violet/10 text-violet' },
  winner: { label: 'Winner', className: 'border-amber-300/40 bg-amber-400/10 text-amber-300' },
};

export default function Experience({ hackathons }: { hackathons: Hackathon[] }) {
  return (
    <section id="experience" data-track-section="experience" className="section relative">
      <div className="glow-orb -left-20 bottom-10 h-72 w-72 bg-violet/10" aria-hidden />
      <div className="container-x relative">
        <SectionHeading
          eyebrow="Experience"
          title="Hackathons & Innovation Journey"
          subtitle="More than 10 hackathons and coding competitions so far. The events below are the ones with confirmed participation certificates."
        />

        <Reveal className="mx-auto mb-10 max-w-2xl">
          <div className="glass-card flex items-start gap-3 border-neon/25 p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-neon" aria-hidden />
            <p className="text-xs leading-relaxed text-muted sm:text-sm">
              Every entry below honestly reflects its status — <span className="font-semibold text-ink">participation</span>{' '}
              is shown as participation, and wins are shown only when verified. No fabricated awards or rankings.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {hackathons.map((h, i) => {
            const status = STATUS_META[h.status] ?? STATUS_META.participated;
            return (
              <Reveal key={h.id} delay={Math.min(i * 0.07, 0.35)} className="h-full">
                <article className="glass-card glass-card-hover flex h-full flex-col p-6" data-cursor-hover>
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-violet/30 bg-violet/10 text-violet">
                      <Hammer className="h-5 w-5" aria-hidden />
                    </span>
                    <span className={`rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider ${status.className}`}>
                      {status.label}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-semibold leading-snug">{h.name}</h3>

                  <dl className="mt-4 flex-1 space-y-2.5 text-xs text-soft">
                    {h.date && (
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-neon/70" aria-hidden />
                        <dt className="sr-only">Date</dt>
                        <dd>{formatDate(h.date)}</dd>
                      </div>
                    )}
                    {h.project && (
                      <div className="flex items-start gap-2">
                        <Award className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neon/70" aria-hidden />
                        <dt className="sr-only">Project</dt>
                        <dd>{h.project}</dd>
                      </div>
                    )}
                    {h.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {h.technologies.map((t) => (
                          <span key={t} className="chip !px-2 !py-0.5 font-mono text-[10px]">{t}</span>
                        ))}
                      </div>
                    )}
                    {h.notes && <dd className="pt-1 italic">{h.notes}</dd>}
                  </dl>

                  {(h.certificateFile || h.certificateLink) && (
                    <div className="mt-5 flex items-center justify-between gap-2 border-t border-line/12 pt-4">
                      {h.certificateFile ? (
                        <a
                          href={h.certificateFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-neon hover:underline"
                        >
                          <FileCheck2 className="h-3.5 w-3.5" aria-hidden /> View certificate
                        </a>
                      ) : (
                        <span />
                      )}
                      {h.certificateLink && (
                        <a
                          href={h.certificateLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[11px] text-muted hover:text-violet hover:underline"
                        >
                          Verify ↗
                        </a>
                      )}
                    </div>
                  )}
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
