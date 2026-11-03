'use client';

import { useMemo, useState } from 'react';
import { BookOpen, Code2, Globe, Sparkles, Wrench, Hash, GraduationCap } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import type { Education, Skill } from '@/lib/types';
import { cx } from '@/lib/utils';

const CATEGORY_ICONS: Record<string, typeof Code2> = {
  'Programming Languages': Code2,
  'Web Development': Globe,
  'Development Tools': Wrench,
  'Currently Learning': BookOpen,
  'Areas of Interest': Sparkles,
};

export default function Skills({ skills, education }: { skills: Skill[]; education: Education }) {
  const categories = useMemo(() => ['All', ...Array.from(new Set(skills.map((s) => s.category)))], [skills]);
  const [active, setActive] = useState('All');
  const visible = active === 'All' ? skills : skills.filter((s) => s.category === active);

  return (
    <section id="skills" data-track-section="skills" className="section relative">
      <div className="glow-orb right-0 top-20 h-72 w-72 bg-neon/10" aria-hidden />
      <div className="container-x relative">
        <SectionHeading
          eyebrow="Skills"
          title="Tools of the trade"
          subtitle="An honest snapshot of what I work with today and what I'm actively learning — no inflated percentages, just real practice."
        />

        {/* Current study status */}
        <Reveal className="mx-auto mb-10 max-w-2xl">
          <div className="glass-card flex flex-col items-center justify-between gap-3 p-4 sm:flex-row sm:p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-violet/30 bg-violet/10 text-violet">
                <GraduationCap className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold">{education.currentYear} · {education.currentSemester}</p>
                <p className="text-xs text-muted">{education.degree}, {education.branch}</p>
              </div>
            </div>
            <p className="font-mono text-xs text-neon">{education.college}</p>
          </div>
        </Reveal>

        {/* Category filters */}
        <Reveal className="mb-10 flex flex-wrap justify-center gap-2" delay={0.05}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
              aria-pressed={active === cat}
              className={cx(
                'rounded-full border px-4 py-2 font-mono text-xs font-medium transition-all duration-300',
                active === cat
                  ? 'border-neon/60 bg-neon/10 text-neon shadow-glow'
                  : 'border-line/20 bg-raised/50 text-muted hover:border-neon/40 hover:text-ink',
              )}
            >
              {cat}
            </button>
          ))}
        </Reveal>

        {/* Skill cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((skill, i) => {
            const Icon = CATEGORY_ICONS[skill.category] ?? Hash;
            return (
              <Reveal key={skill.id} delay={Math.min(i * 0.04, 0.3)}>
                <div
                  className="glass-card glass-card-hover group relative h-full p-5"
                  data-cursor-hover
                  title={skill.description || undefined}
                >
                  {skill.learning && (
                    <span className="absolute right-3 top-3 rounded-full border border-violet/40 bg-violet/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-violet">
                      Learning
                    </span>
                  )}
                  <span
                    className={cx(
                      'mb-4 grid h-11 w-11 place-items-center rounded-xl border transition-all duration-300 group-hover:scale-110',
                      skill.learning
                        ? 'border-violet/30 bg-violet/10 text-violet'
                        : 'border-neon/25 bg-neon/10 text-neon',
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="font-display text-sm font-semibold leading-snug sm:text-base">{skill.name}</h3>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted/80">{skill.category}</p>
                  {skill.description && (
                    <p className="mt-2.5 text-xs leading-relaxed text-muted">{skill.description}</p>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
