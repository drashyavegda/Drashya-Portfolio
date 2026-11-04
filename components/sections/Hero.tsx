'use client';

import { useEffect, useState } from 'react';
import { ArrowDown, Download, Github, Linkedin, MousePointer2, Triangle, Wand2, Mail } from 'lucide-react';
import HeroScene from './HeroScene';
import AvailabilityBadge from '@/components/ui/AvailabilityBadge';
import CopyEmail from '@/components/ui/CopyEmail';
import type { Availability, Profile, Resume } from '@/lib/types';
import { cx } from '@/lib/utils';

interface Props {
  profile: Profile;
  availability: Availability;
  resume: Resume;
}

function useTypewriter(roles: string[]) {
  const [text, setText] = useState(roles[0] ?? '');
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReduced(true);
      setText(roles[0] ?? '');
      return;
    }
    setText('');
    let roleIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const role = roles[roleIdx] ?? '';
      if (!deleting) {
        charIdx++;
        setText(role.slice(0, charIdx));
        if (charIdx === role.length) {
          deleting = true;
          timer = setTimeout(tick, 1800);
          return;
        }
        timer = setTimeout(tick, 55 + Math.random() * 45);
      } else {
        charIdx--;
        setText(role.slice(0, charIdx));
        if (charIdx === 0) {
          deleting = false;
          roleIdx = (roleIdx + 1) % roles.length;
          timer = setTimeout(tick, 350);
          return;
        }
        timer = setTimeout(tick, 28);
      }
    };
    timer = setTimeout(tick, 600);
    return () => clearTimeout(timer);
  }, [roles]);

  return { text, reduced };
}

export default function Hero({ profile, availability, resume }: Props) {
  const { text, reduced } = useTypewriter(profile.typingRoles);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section id="home" data-track-section="home" className="relative flex min-h-svh items-center overflow-hidden pb-16 pt-28 sm:pt-32">
      {/* Background layers */}
      <div className="grid-bg absolute inset-0" aria-hidden />
      <div className="glow-orb -left-32 top-10 h-96 w-96 bg-neon/12" aria-hidden />
      <div className="glow-orb -right-24 bottom-0 h-96 w-96 bg-violet/12" aria-hidden />

      <div className="container-x relative z-10 grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        {/* Left: identity */}
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <div className={cx('fade-item mb-5 flex justify-center lg:justify-start', mounted && 'on')}>
            <AvailabilityBadge availability={availability} />
          </div>

          <p className={cx('fade-item font-mono text-sm uppercase tracking-[0.35em] text-neon', mounted && 'on')} style={{ transitionDelay: '100ms' }}>
            Hello, I&apos;m
          </p>

          <h1
            className={cx('fade-item mt-3 font-display text-[2.6rem] font-bold leading-[1.05] tracking-tight sm:text-6xl xl:text-7xl', mounted && 'on')}
            style={{ transitionDelay: '200ms' }}
          >
            <span className="block text-ink">{profile.name.split(' ')[0]}</span>
            <span className="block gradient-text drop-shadow-[0_0_28px_rgb(var(--c-neon)/0.35)]">
              {profile.name.split(' ').slice(1).join(' ')}
            </span>
          </h1>

          <p
            className={cx('fade-item mt-4 font-mono text-base text-muted sm:text-lg', mounted && 'on')}
            style={{ transitionDelay: '300ms' }}
            aria-live="polite"
          >
            <span className="text-violet">&gt;</span> {text}
            <span className={reduced ? '' : 'term-caret'} aria-hidden />
            <span className="sr-only">{profile.typingRoles.join(', ')}</span>
          </p>

          <p
            className={cx('fade-item mt-3 font-display text-sm font-medium text-ink/90 sm:text-base', mounted && 'on')}
            style={{ transitionDelay: '350ms' }}
          >
            {profile.title}
          </p>

          <p
            className={cx('fade-item mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted sm:text-base lg:mx-0', mounted && 'on')}
            style={{ transitionDelay: '450ms' }}
          >
            {profile.intro}
          </p>

          {/* CTAs */}
          <div
            className={cx('fade-item mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start', mounted && 'on')}
            style={{ transitionDelay: '500ms' }}
          >
            <a href="#projects" className="btn-primary">
              <Wand2 className="h-4 w-4" aria-hidden /> View My Work
            </a>
            <a href="#contact" className="btn-ghost">
              <Mail className="h-4 w-4" aria-hidden /> Let&apos;s Connect
            </a>
            {resume.file && (
              <a href={resume.file} download className="btn-ghost" aria-label="Download resume PDF">
                <Download className="h-4 w-4" aria-hidden /> Download Resume
              </a>
            )}
          </div>

          {/* Socials + email */}
          <div
            className={cx('fade-item mt-9 flex flex-col items-center gap-4 sm:flex-row lg:items-start', mounted && 'on')}
            style={{ transitionDelay: '600ms' }}
          >
            <div className="flex items-center gap-2.5">
              <a
                href={profile.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="grid h-10 w-10 place-items-center rounded-xl border border-line/20 bg-raised/60 text-muted transition-all hover:-translate-y-1 hover:border-neon/50 hover:text-neon hover:shadow-glow"
              >
                <Github className="h-4.5 w-4.5" aria-hidden />
              </a>
              <a
                href={profile.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="grid h-10 w-10 place-items-center rounded-xl border border-line/20 bg-raised/60 text-muted transition-all hover:-translate-y-1 hover:border-neon/50 hover:text-neon hover:shadow-glow"
              >
                <Linkedin className="h-4.5 w-4.5" aria-hidden />
              </a>
              <a
                href={profile.socials.vercel}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Vercel profile"
                className="grid h-10 w-10 place-items-center rounded-xl border border-line/20 bg-raised/60 text-muted transition-all hover:-translate-y-1 hover:border-neon/50 hover:text-neon hover:shadow-glow"
              >
                <Triangle className="h-4 w-4" aria-hidden />
              </a>
            </div>
            <CopyEmail email={profile.email} />
          </div>
        </div>

        {/* Right: 3D workspace */}
        <div className={cx('fade-item order-1 lg:order-2', mounted && 'on')} style={{ transitionDelay: '200ms' }}>
          <HeroScene />
        </div>
      </div>

      {/* Scroll hint */}
      <a
        href="#about"
        aria-label="Scroll to About section"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-muted transition-colors hover:text-neon md:flex"
      >
        <MousePointer2 className="h-4 w-4 animate-float" aria-hidden />
        <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <ArrowDown className="h-3.5 w-3.5 animate-bounce" aria-hidden />
      </a>
    </section>
  );
}
