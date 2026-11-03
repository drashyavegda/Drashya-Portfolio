import Image from 'next/image';
import {
  BookOpen,
  GraduationCap,
  Lightbulb,
  Rocket,
  Sparkles,
  Target,
  Zap,
  Gamepad2,
  Languages,
} from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import EducationTimeline from './EducationTimeline';
import type { Education, Profile } from '@/lib/types';

const QUALITY_ICONS: Record<string, typeof Zap> = {
  'Quick learner': Zap,
  'Problem solver': Target,
  'Innovative thinker': Lightbulb,
};

export default function About({ profile, education }: { profile: Profile; education: Education }) {
  return (
    <section id="about" data-track-section="about" className="section relative">
      <div className="glow-orb -left-40 top-1/3 h-80 w-80 bg-violet/10" aria-hidden />
      <div className="container-x relative">
        <SectionHeading
          eyebrow="About Me"
          title="The person behind the code"
          subtitle="A quick look at who I am, what I'm studying, and where I'm headed."
        />

        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Left: identity card */}
          <Reveal className="h-fit">
            <div className="glass-card glass-card-hover overflow-hidden">
              <div className="relative h-56 w-full sm:h-64">
                {profile.avatar ? (
                  <Image
                    src={profile.avatar}
                    alt={`Illustrated avatar of ${profile.name}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 400px"
                    className="object-cover"
                    priority={false}
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center bg-gradient-to-br from-neon/15 to-violet/15">
                    <span className="font-display text-6xl font-bold gradient-text">DV</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-raised via-transparent to-transparent" aria-hidden />
              </div>
              <div className="p-6">
                <h3 className="font-display text-lg font-semibold">{profile.name}</h3>
                <p className="mt-1 font-mono text-xs text-neon">{profile.title}</p>

                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-violet" aria-hidden />
                    <div>
                      <dt className="font-semibold text-ink">{education.college}</dt>
                      <dd className="text-muted">
                        {education.degree} · {education.branch}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-neon" aria-hidden />
                    <div>
                      <dt className="font-semibold text-ink">
                        {education.currentYear}, {education.currentSemester}
                      </dt>
                      <dd className="text-muted">
                        {education.admissionYear} – {education.graduationYear} (expected)
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Languages className="mt-0.5 h-4 w-4 shrink-0 text-violet" aria-hidden />
                    <div>
                      <dt className="font-semibold text-ink">Languages</dt>
                      <dd className="text-muted">{profile.languages.join(' · ')}</dd>
                    </div>
                  </div>
                </dl>
              </div>
            </div>
          </Reveal>

          {/* Right: story */}
          <div className="space-y-8">
            <Reveal delay={0.1}>
              <div className="glass-card p-6 sm:p-8">
                <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
                  <Sparkles className="h-5 w-5 text-neon" aria-hidden /> My Story
                </h3>
                <p className="text-sm leading-relaxed text-muted sm:text-base">{profile.intro}</p>
                <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
                  <span className="font-semibold text-ink">My programming journey: </span>
                  {profile.journey}
                </p>
              </div>
            </Reveal>

            {/* Strongest qualities */}
            <Reveal delay={0.15}>
              <h3 className="mb-4 font-display text-base font-semibold uppercase tracking-wider text-muted">
                Strongest qualities
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {profile.qualities.map((quality, i) => {
                  const Icon = QUALITY_ICONS[quality] ?? Rocket;
                  return (
                    <div
                      key={quality}
                      className="glass-card glass-card-hover group p-5 text-center"
                      style={{ transitionDelay: `${i * 40}ms` }}
                    >
                      <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-xl border border-neon/25 bg-neon/10 text-neon transition-transform duration-300 group-hover:scale-110">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <p className="text-sm font-semibold">{quality}</p>
                    </div>
                  );
                })}
              </div>
            </Reveal>

            {/* Career goals */}
            <Reveal delay={0.2}>
              <div className="glass-card p-6 sm:p-8">
                <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold">
                  <Target className="h-4.5 w-4.5 text-violet" aria-hidden /> Career goals
                </h3>
                <ul className="space-y-2.5">
                  {profile.careerGoals.map((goal) => (
                    <li key={goal} className="flex items-start gap-3 text-sm text-muted">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r from-neon to-violet" aria-hidden />
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* Interests */}
            <Reveal delay={0.25}>
              <div className="glass-card p-6 sm:p-8">
                <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold">
                  <Gamepad2 className="h-4.5 w-4.5 text-neon" aria-hidden /> Beyond the code
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <span key={interest} className="chip transition-colors hover:border-violet/50 hover:text-violet">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Education timeline */}
        <EducationTimeline education={education} />
      </div>
    </section>
  );
}
