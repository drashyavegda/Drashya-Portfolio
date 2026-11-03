import { CalendarDays } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import type { Education } from '@/lib/types';

export default function EducationTimeline({ education }: { education: Education }) {
  return (
    <div className="mt-20">
      <Reveal>
        <h3 className="mb-10 text-center font-display text-2xl font-bold sm:text-3xl">
          Education <span className="gradient-text">Timeline</span>
        </h3>
      </Reveal>

      <div className="relative mx-auto max-w-3xl">
        {/* Glowing spine */}
        <div
          className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-neon/60 via-violet/50 to-transparent sm:left-1/2"
          aria-hidden
        />

        <ol className="space-y-10">
          {education.timeline.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.08}>
              <li
                className={`relative pl-12 sm:w-1/2 sm:pl-0 ${
                  i % 2 === 0 ? 'sm:pr-12 sm:text-right' : 'sm:ml-auto sm:pl-12'
                }`}
              >
                {/* Node */}
                <span
                  className={`absolute left-4 top-2 grid h-8 w-8 -translate-x-1/2 place-items-center rounded-full border border-neon/40 bg-base shadow-glow sm:top-1 ${
                    i % 2 === 0 ? 'sm:left-auto sm:right-0 sm:translate-x-1/2' : 'sm:left-0 sm:-translate-x-1/2'
                  }`}
                  aria-hidden
                >
                  <CalendarDays className="h-3.5 w-3.5 text-neon" />
                </span>

                <div className="glass-card glass-card-hover p-5">
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-violet">{item.year}</p>
                  <h4 className="mt-1.5 font-display text-base font-semibold text-ink">{item.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>

        {education.achievements.length > 0 && (
          <Reveal className="mt-12">
            <div className="glass-card p-6">
              <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-neon">
                Academic achievements
              </h4>
              <ul className="space-y-3">
                {education.achievements.map((a) => (
                  <li key={a.id} className="text-sm">
                    <span className="font-semibold text-ink">{a.title}</span>
                    {a.date && <span className="ml-2 font-mono text-xs text-muted">{a.date}</span>}
                    {a.description && <p className="mt-0.5 text-muted">{a.description}</p>}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        )}

        {education.coursework.length > 0 && (
          <Reveal className="mt-6" delay={0.1}>
            <div className="glass-card p-6">
              <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-violet">
                Coursework
              </h4>
              <div className="flex flex-wrap gap-2">
                {education.coursework.map((c) => (
                  <span key={c} className="chip">{c}</span>
                ))}
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}
