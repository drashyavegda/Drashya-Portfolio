'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github, Linkedin, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { SoundToggle } from './SoundProvider';
import AvailabilityBadge from './AvailabilityBadge';
import type { Availability } from '@/lib/types';
import { cx } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Home', href: '#home', section: 'home' },
  { label: 'About', href: '#about', section: 'about' },
  { label: 'Skills', href: '#skills', section: 'skills' },
  { label: 'Projects', href: '#projects', section: 'projects' },
  { label: 'Experience', href: '#experience', section: 'experience' },
  { label: 'Certificates', href: '#certificates', section: 'certificates' },
  { label: 'Blog', href: '/blog', section: 'blog' },
  { label: 'Contact', href: '#contact', section: 'contact' },
];

interface Props {
  name: string;
  socials: { github: string; linkedin: string };
  availability: Availability;
}

export default function Navbar({ name, socials, availability }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('home');
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Active section highlighting (home page only).
  useEffect(() => {
    if (!isHome) {
      setActive(pathname.startsWith('/blog') ? 'blog' : '');
      return;
    }
    const sections = NAV_LINKS.map((l) => document.getElementById(l.section)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [isHome, pathname]);

  // Lock body scroll while mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const linkHref = (href: string) => (href.startsWith('/') ? href : isHome ? href : `/${href}`);

  return (
    <header
      className={cx(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled || open
          ? 'border-b border-line/12 bg-base/75 shadow-[0_8px_32px_rgb(0_0_0/0.25)] backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <nav aria-label="Primary" className="container-x flex h-16 items-center justify-between gap-4 sm:h-[72px]">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3" aria-label={`${name} — home`}>
          <span className="relative grid h-10 w-10 place-items-center rounded-xl border border-neon/30 bg-raised/70 font-display text-sm font-bold gradient-text shadow-glow transition-transform duration-300 group-hover:scale-105">
            DV
            <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-neon animate-pulse-glow" aria-hidden />
          </span>
          <span className="hidden font-display text-sm font-semibold tracking-wide sm:block">
            {name}
            <span className="block font-mono text-[10px] font-normal uppercase tracking-[0.22em] text-muted">
              Developer Portfolio
            </span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={linkHref(link.href)}
                className={cx(
                  'relative rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-200',
                  active === link.section ? 'text-neon' : 'text-muted hover:text-ink',
                )}
              >
                {link.label}
                <span
                  className={cx(
                    'absolute inset-x-3 -bottom-0.5 h-px bg-gradient-to-r from-neon to-violet transition-opacity duration-300',
                    active === link.section ? 'opacity-100' : 'opacity-0',
                  )}
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          <span className="mr-1 hidden xl:block">
            <AvailabilityBadge availability={availability} />
          </span>
          <a
            href={socials.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profile"
            className="hidden h-9 w-9 place-items-center rounded-full border border-line/20 bg-raised/60 text-muted transition-all hover:border-neon/50 hover:text-neon sm:grid"
          >
            <Github className="h-4 w-4" aria-hidden />
          </a>
          <a
            href={socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn profile"
            className="hidden h-9 w-9 place-items-center rounded-full border border-line/20 bg-raised/60 text-muted transition-all hover:border-neon/50 hover:text-neon sm:grid"
          >
            <Linkedin className="h-4 w-4" aria-hidden />
          </a>
          <SoundToggle className="hidden sm:grid" />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="grid h-9 w-9 place-items-center rounded-full border border-line/20 bg-raised/60 text-ink transition-colors hover:border-neon/50 lg:hidden"
          >
            {open ? <X className="h-4.5 w-4.5" aria-hidden /> : <Menu className="h-4.5 w-4.5" aria-hidden />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={cx(
          'lg:hidden',
          open ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        aria-hidden={!open}
      >
        <div className="container-x pb-8 pt-2">
          <ul
            className={cx(
              'glass flex flex-col gap-1 rounded-2xl p-4 transition-all duration-300',
              open ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0',
            )}
          >
            {NAV_LINKS.map((link, i) => (
              <li
                key={link.label}
                style={{ transitionDelay: open ? `${i * 35}ms` : '0ms' }}
                className={cx(
                  'transition-all duration-300',
                  open ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0',
                )}
              >
                <Link
                  href={linkHref(link.href)}
                  onClick={() => setOpen(false)}
                  tabIndex={open ? 0 : -1}
                  className={cx(
                    'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                    active === link.section && isHome
                      ? 'bg-neon/10 text-neon'
                      : 'text-muted hover:bg-raised/70 hover:text-ink',
                  )}
                >
                  {link.label}
                  <span className="font-mono text-[10px] text-muted/60">0{i + 1}</span>
                </Link>
              </li>
            ))}
            <li className="mt-2 flex items-center justify-center gap-3 border-t border-line/12 pt-4">
              <AvailabilityBadge availability={availability} />
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
