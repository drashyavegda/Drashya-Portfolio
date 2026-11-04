'use client';

import { useEffect, useRef, useState } from 'react';
import { TerminalSquare } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import { cx } from '@/lib/utils';

export interface TerminalData {
  name: string;
  title: string;
  intro: string;
  skillsByCategory: Record<string, string[]>;
  projects: Array<{ title: string; category: string }>;
  education: {
    college: string;
    degree: string;
    branch: string;
    admissionYear: number;
    graduationYear: number;
    currentYear: string;
    currentSemester: string;
  };
  hackathons: string[];
  email: string;
  socials: { github: string; linkedin: string; vercel: string };
  blogPosts: Array<{ title: string; slug: string }>;
  resumeAvailable: boolean;
}

type LineKind = 'in' | 'out' | 'err' | 'accent' | 'success';
interface Line {
  id: number;
  kind: LineKind;
  text: string;
}

const COMMANDS = ['help', 'whoami', 'skills', 'projects', 'education', 'hackathons', 'blog', 'resume', 'contact', 'socials', 'clear'];

let lineId = 0;
const mk = (kind: LineKind, text: string): Line => ({ id: ++lineId, kind, text });

export default function Terminal({ data }: { data: TerminalData }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const history = useRef<string[]>([]);
  const histIdx = useRef(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    setLines([
      mk('accent', `${data.name.toLowerCase().replace(/\s+/g, '-')}@portfolio: ~`),
      mk('out', 'Interactive terminal — type `help` to list commands.'),
      mk('out', '────────────────────────────────────────────'),
    ]);
    return () => timers.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, busy]);

  const push = (newLines: Line[], stagger = true) => {
    const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!stagger || reduced || newLines.length <= 1) {
      setLines((prev) => [...prev, ...newLines]);
      return;
    }
    setBusy(true);
    newLines.forEach((line, i) => {
      timers.current.push(setTimeout(() => setLines((prev) => [...prev, line]), i * 55));
    });
    timers.current.push(setTimeout(() => setBusy(false), newLines.length * 55 + 60));
  };

  const execute = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    const out: Line[] = [];

    if (!cmd) return [];

    switch (cmd) {
      case 'help':
        out.push(
          mk('accent', 'Available commands:'),
          ...[
            ['whoami', 'Who is Drashya?'],
            ['skills', 'Current skills and learning focus'],
            ['projects', 'Portfolio projects'],
            ['education', 'Education details'],
            ['hackathons', 'Hackathon participation'],
            ['blog', 'Blog articles'],
            ['resume', 'Resume availability'],
            ['contact', 'Contact information'],
            ['socials', 'Social links'],
            ['clear', 'Clear the terminal'],
          ].map(([c, d]) => mk('out', `  ${c.padEnd(12)} — ${d}`)),
          mk('out', 'Tip: press Tab to autocomplete. A few Easter eggs are hidden…'),
        );
        break;
      case 'whoami':
        out.push(mk('success', data.intro), mk('out', `Title: ${data.title}`));
        break;
      case 'skills':
        out.push(mk('accent', 'Skills:'));
        for (const [cat, items] of Object.entries(data.skillsByCategory)) {
          out.push(mk('out', `  ${cat}: ${items.join(', ')}`));
        }
        break;
      case 'projects':
        out.push(mk('accent', 'Projects:'));
        data.projects.forEach((p, i) => out.push(mk('out', `  ${i + 1}. ${p.title}  [${p.category}]`)));
        out.push(mk('out', 'Browse full case studies in the Projects section above.'));
        break;
      case 'education':
        out.push(
          mk('accent', 'Education:'),
          mk('out', `  College   : ${data.education.college}`),
          mk('out', `  Degree    : ${data.education.degree} — ${data.education.branch}`),
          mk('out', `  Duration  : ${data.education.admissionYear} – ${data.education.graduationYear} (expected)`),
          mk('out', `  Current   : ${data.education.currentYear}, ${data.education.currentSemester}`),
        );
        break;
      case 'hackathons':
        out.push(mk('accent', 'Hackathon participation (confirmed certificates):'));
        data.hackathons.forEach((h, i) => out.push(mk('out', `  ${i + 1}. ${h} — Participated`)));
        out.push(mk('out', 'Note: 10+ hackathons/coding competitions in total; verified ones are listed here.'));
        break;
      case 'blog':
        if (data.blogPosts.length === 0) {
          out.push(mk('out', 'No published articles yet — check back soon.'));
        } else {
          out.push(mk('accent', 'Blog articles:'));
          data.blogPosts.forEach((p) => out.push(mk('out', `  • ${p.title}  →  /blog/${p.slug}`)));
        }
        break;
      case 'resume':
        out.push(
          data.resumeAvailable
            ? mk('success', 'Resume is available — use the Download Resume button in the hero section.')
            : mk('out', 'An updated resume PDF has not been uploaded yet. Contact via email for the latest CV.'),
        );
        break;
      case 'contact':
        out.push(mk('accent', 'Contact:'), mk('out', `  Email: ${data.email}`), mk('out', '  Or use the contact form in the Contact section.'));
        break;
      case 'socials':
        out.push(
          mk('accent', 'Socials:'),
          mk('out', `  GitHub  : ${data.socials.github}`),
          mk('out', `  LinkedIn: ${data.socials.linkedin}`),
          mk('out', `  Vercel  : ${data.socials.vercel}`),
        );
        break;
      case 'clear':
        setLines([]);
        return [];
      // ---- Easter eggs ----
      case 'sudo hire-drashya':
      case 'sudo hire-me':
      case 'hire-me':
        out.push(
          mk('success', '✔ Request received!'),
          mk('out', `Drashya is a quick learner, a problem solver and an innovative thinker.`),
          mk('out', `Send the details to ${data.email} — serious inquiries only, infinite enthusiasm guaranteed.`),
        );
        break;
      case 'rm -rf /':
        out.push(mk('err', 'Nice try 😏 This portfolio is protected by years of DSA practice.'));
        break;
      case 'coffee':
      case 'chai':
        out.push(mk('out', 'Brewing ☕ … hackathon fuel ready. Now shipping 2x faster.'));
        break;
      case 'dv':
        out.push(
          mk('accent', '  ██████╗ ██╗   ██╗'),
          mk('accent', '  ██╔══██╗██║   ██║'),
          mk('accent', '  ██║  ██║██║   ██║'),
          mk('accent', '  ██║  ██║╚██╗ ██╔╝'),
          mk('accent', '  ██████╔╝ ╚████╔╝ '),
          mk('accent', '  ╚═════╝   ╚═══╝  '),
          mk('out', `  ${data.name} — ${data.title}`),
        );
        break;
      case 'sudo make me a sandwich':
        out.push(mk('out', 'Okay. 🥪 But only because you asked politely with sudo.'));
        break;
      default:
        out.push(mk('err', `command not found: ${cmd.split(' ')[0]}`), mk('out', "Type `help` to see available commands."));
    }
    return out;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = input;
    if (!raw.trim() || busy) return;
    history.current.unshift(raw);
    histIdx.current = -1;
    setLines((prev) => [...prev, mk('in', raw)]);
    setInput('');
    const result = execute(raw);
    if (result.length) push(result);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.current.length) {
        histIdx.current = Math.min(histIdx.current + 1, history.current.length - 1);
        setInput(history.current[histIdx.current]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      histIdx.current = Math.max(histIdx.current - 1, -1);
      setInput(histIdx.current === -1 ? '' : history.current[histIdx.current]);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const match = COMMANDS.find((c) => c.startsWith(input.trim().toLowerCase()) && input.trim());
      if (match) setInput(match);
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <section id="terminal" data-track-section="terminal" className="section relative">
      <div className="container-x relative">
        <SectionHeading
          eyebrow="Interactive Terminal"
          title="Talk to the portfolio"
          subtitle="A tiny developer-style shell. Type a command, press Enter, and explore — help, whoami, skills, projects, and a few surprises."
        />

        <Reveal>
          <div
            className="glass-card mx-auto max-w-4xl overflow-hidden shadow-card"
            onClick={() => inputRef.current?.focus()}
            role="presentation"
          >
            <div className="flex items-center gap-2 border-b border-line/12 bg-raised/70 px-4 py-3">
              <TerminalSquare className="h-4 w-4 text-neon" aria-hidden />
              <span className="font-mono text-xs text-muted">drashya@portfolio: ~/interactive-shell</span>
              <span className="ml-auto flex gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
              </span>
            </div>

            <div
              ref={scrollRef}
              className="h-[340px] overflow-y-auto bg-[#070910] px-4 py-3 font-mono text-[12.5px] leading-relaxed sm:text-[13px]"
              aria-label="Terminal output"
              role="log"
              aria-live="polite"
            >
              {lines.map((line) => (
                <p
                  key={line.id}
                  className={cx(
                    'whitespace-pre-wrap break-words',
                    line.kind === 'in' && 'text-ink',
                    line.kind === 'out' && 'text-slate-300',
                    line.kind === 'err' && 'text-red-400',
                    line.kind === 'accent' && 'text-neon',
                    line.kind === 'success' && 'text-emerald-300',
                  )}
                >
                  {line.kind === 'in' && (
                    <>
                      <span className="text-violet">visitor</span>
                      <span className="text-muted">@portfolio</span>
                      <span className="text-neon">:~$ </span>
                    </>
                  )}
                  {line.text || '\u00A0'}
                </p>
              ))}
              {busy && <p className="text-muted">…</p>}
            </div>

            {/* Suggestions */}
            <div className="flex flex-wrap gap-1.5 border-t border-line/12 bg-raised/50 px-4 py-2.5">
              {COMMANDS.slice(0, 9).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setInput(c);
                    inputRef.current?.focus();
                  }}
                  className="rounded-md border border-line/20 px-2 py-0.5 font-mono text-[10.5px] text-muted transition-colors hover:border-neon/50 hover:text-neon"
                >
                  {c}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-line/12 bg-[#070910] px-4 py-3">
              <span className="font-mono text-[13px]" aria-hidden>
                <span className="text-violet">visitor</span>
                <span className="text-muted">@portfolio</span>
                <span className="text-neon">:~$</span>
              </span>
              <label htmlFor="terminal-input" className="sr-only">
                Terminal command input
              </label>
              <input
                id="terminal-input"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                placeholder="type `help` and press Enter…"
                className="flex-1 bg-transparent font-mono text-[13px] text-ink caret-neon outline-none placeholder:text-muted/50"
              />
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
