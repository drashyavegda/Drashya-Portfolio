import Link from 'next/link';
import { ArrowUpRight, Github, Linkedin, Mail, Triangle } from 'lucide-react';
import type { Profile } from '@/lib/types';

const QUICK_LINKS = [
  { label: 'Home', href: '/#home' },
  { label: 'About', href: '/#about' },
  { label: 'Skills', href: '/#skills' },
  { label: 'Projects', href: '/#projects' },
  { label: 'Experience', href: '/#experience' },
  { label: 'Certificates', href: '/#certificates' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/#contact' },
];

export default function Footer({ profile }: { profile: Profile }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-line/12 bg-raised/40">
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon/60 to-transparent"
        aria-hidden
      />
      <div className="container-x py-14 sm:py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Identity */}
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-neon/30 bg-raised/70 font-display text-sm font-bold gradient-text shadow-glow">
                DV
              </span>
              <div>
                <p className="font-display text-base font-semibold">{profile.name}</p>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{profile.title}</p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted italic">
              “{profile.tagline}”
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href={profile.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="grid h-10 w-10 place-items-center rounded-xl border border-line/20 bg-raised/60 text-muted transition-all hover:-translate-y-0.5 hover:border-neon/50 hover:text-neon"
              >
                <Github className="h-4.5 w-4.5" aria-hidden />
              </a>
              <a
                href={profile.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="grid h-10 w-10 place-items-center rounded-xl border border-line/20 bg-raised/60 text-muted transition-all hover:-translate-y-0.5 hover:border-neon/50 hover:text-neon"
              >
                <Linkedin className="h-4.5 w-4.5" aria-hidden />
              </a>
              <a
                href={profile.socials.vercel}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Vercel profile"
                className="grid h-10 w-10 place-items-center rounded-xl border border-line/20 bg-raised/60 text-muted transition-all hover:-translate-y-0.5 hover:border-neon/50 hover:text-neon"
              >
                <Triangle className="h-4 w-4" aria-hidden />
              </a>
              <a
                href={`mailto:${profile.email}`}
                aria-label="Email"
                className="grid h-10 w-10 place-items-center rounded-xl border border-line/20 bg-raised/60 text-muted transition-all hover:-translate-y-0.5 hover:border-neon/50 hover:text-neon"
              >
                <Mail className="h-4.5 w-4.5" aria-hidden />
              </a>
            </div>
          </div>

          {/* Quick navigation */}
          <nav aria-label="Footer">
            <h3 className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.25em] text-neon">Navigate</h3>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-ink"
                  >
                    {link.label}
                    <ArrowUpRight
                      className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Get in touch */}
          <div>
            <h3 className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.25em] text-violet">Get in touch</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={`mailto:${profile.email}`} className="font-mono text-muted transition-colors hover:text-neon">
                  {profile.email}
                </a>
              </li>
              <li className="text-muted">{profile.location}</li>
              <li>
                <Link href="/#contact" className="btn-ghost mt-2 !px-4 !py-2 text-xs">
                  Send a message
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line/12 pt-8 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-muted">
            © {year} {profile.name}. All rights reserved.
          </p>
          <p className="font-mono text-[11px] text-muted/80">
            Designed &amp; built by {profile.name} · <span className="gradient-text font-semibold">Next.js + Tailwind</span>
          </p>
          <p className="max-w-xs text-[11px] leading-relaxed text-muted/70">
            Privacy: this site records anonymous aggregate visit counts only — no personal data, no third-party trackers.
          </p>
        </div>
      </div>
    </footer>
  );
}
