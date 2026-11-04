'use client';

import { useRef, useState } from 'react';
import { Check, Copy, Play, TerminalSquare } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import { highlight } from '@/lib/highlight';
import { cx } from '@/lib/utils';

/**
 * Interactive developer workspace with predefined, safe code demonstrations.
 * "Run Example" replays preconfigured outputs client-side — no visitor code is
 * ever executed anywhere.
 */

interface Example {
  lang: string;
  file: string;
  code: string;
  runSteps: string[];
  output: string[];
}

const EXAMPLES: Example[] = [
  {
    lang: 'C++',
    file: 'fibonacci.cpp',
    code: `// Fibonacci series — C++
#include <iostream>
using namespace std;

int main() {
    int n = 10, a = 0, b = 1;
    cout << "Fibonacci series (" << n << " terms):" << endl;
    for (int i = 0; i < n; i++) {
        cout << a << " ";
        int next = a + b;
        a = b;
        b = next;
    }
    cout << endl;
    return 0;
}`,
    runSteps: ['g++ fibonacci.cpp -o fibonacci', './fibonacci'],
    output: ['Fibonacci series (10 terms):', '0 1 1 2 3 5 8 13 21 34', '', '[process exited with code 0]'],
  },
  {
    lang: 'Java',
    file: 'Factorial.java',
    code: `// Factorial with recursion — Java
public class Factorial {

    static long fact(int n) {
        if (n <= 1) return 1;
        return n * fact(n - 1);
    }

    public static void main(String[] args) {
        System.out.println("Factorials from 1 to 10:");
        for (int i = 1; i <= 10; i++) {
            System.out.println(i + "! = " + fact(i));
        }
    }
}`,
    runSteps: ['javac Factorial.java', 'java Factorial'],
    output: [
      'Factorials from 1 to 10:',
      '1! = 1', '2! = 2', '3! = 6', '4! = 24', '5! = 120',
      '6! = 720', '7! = 5040', '8! = 40320', '9! = 362880', '10! = 3628800',
      '', '[process exited with code 0]',
    ],
  },
  {
    lang: 'JavaScript',
    file: 'projects.js',
    code: `// Filter AI projects — JavaScript
const projects = [
  { name: "WasteFlow AI", category: "AI / Sustainability" },
  { name: "FinTrack", category: "Finance / AI" },
  { name: "MediNav AI", category: "AI / Healthcare" },
  { name: "The Quiet Place", category: "Web / Productivity" },
  { name: "LearnWise AI", category: "AI / Education" },
];

const aiProjects = projects
  .filter((p) => p.category.includes("AI"))
  .map((p) => p.name);

console.log("AI-powered projects:", aiProjects.length);
aiProjects.forEach((name) => console.log(" -", name));`,
    runSteps: ['node projects.js'],
    output: [
      'AI-powered projects: 4',
      ' - WasteFlow AI',
      ' - FinTrack',
      ' - MediNav AI',
      ' - LearnWise AI',
      '', '[process exited with code 0]',
    ],
  },
];

export default function Workspace() {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [consoleLines, setConsoleLines] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const example = EXAMPLES[idx];

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const selectExample = (i: number) => {
    clearTimers();
    setIdx(i);
    setPhase('idle');
    setConsoleLines([]);
  };

  const run = () => {
    if (phase === 'running') return;
    clearTimers();
    setConsoleLines([]);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPhase('running');

    if (reduced) {
      setConsoleLines([...example.runSteps.map((s) => `$ ${s}`), ...example.output]);
      setPhase('done');
      return;
    }

    let t = 0;
    const stepDelay = 420;
    example.runSteps.forEach((s) => {
      t += stepDelay;
      timers.current.push(setTimeout(() => setConsoleLines((l) => [...l, `$ ${s}`]), t));
    });
    t += 300;
    example.output.forEach((line, i) => {
      t += line === '' ? 80 : Math.min(140, 60 + i * 8);
      timers.current.push(setTimeout(() => setConsoleLines((l) => [...l, line]), t));
    });
    timers.current.push(setTimeout(() => setPhase('done'), t + 150));
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(example.code);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = example.code;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const codeLines = example.code.split('\n');

  return (
    <section id="workspace" data-track-section="workspace" className="section relative">
      <div className="container-x relative">
        <SectionHeading
          eyebrow="Developer Workspace"
          title="A peek into the editor"
          subtitle="Predefined, safe code demonstrations in C++, Java and JavaScript. Hit Run Example to replay the output — nothing arbitrary is ever executed."
        />

        <Reveal>
          <div className="glass-card mx-auto max-w-5xl overflow-hidden shadow-card">
            {/* Title bar: language selector */}
            <div className="flex flex-wrap items-center gap-2 border-b border-line/12 bg-raised/70 px-4 py-3">
              <div className="mr-2 flex gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
              </div>
              <div role="tablist" aria-label="Language selector" className="flex flex-wrap gap-1">
                {EXAMPLES.map((ex, i) => (
                  <button
                    key={ex.lang}
                    role="tab"
                    type="button"
                    aria-selected={i === idx}
                    onClick={() => selectExample(i)}
                    className={cx(
                      'rounded-lg px-3 py-1.5 font-mono text-xs font-medium transition-all duration-200',
                      i === idx
                        ? 'bg-neon/15 text-neon shadow-glow'
                        : 'text-muted hover:bg-raised hover:text-ink',
                    )}
                  >
                    {ex.lang}
                  </button>
                ))}
              </div>
              <span className="ml-auto hidden font-mono text-[11px] text-muted sm:block">{example.file}</span>
            </div>

            <div className="grid lg:grid-cols-2">
              {/* Editor */}
              <div className="relative border-b border-line/12 lg:border-b-0 lg:border-r">
                <div className="flex max-h-[420px] overflow-auto">
                  <div className="sticky left-0 select-none bg-raised/40 px-3 py-4 text-right font-mono text-xs leading-relaxed text-muted/50" aria-hidden>
                    {codeLines.map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  <pre className="flex-1 px-3 py-4 font-mono text-xs leading-relaxed sm:text-[13px]">
                    <code dangerouslySetInnerHTML={{ __html: highlight(example.code, example.lang) }} />
                  </pre>
                </div>
                <div className="absolute right-3 top-3 flex gap-2">
                  <button
                    type="button"
                    onClick={copyCode}
                    aria-label={copied ? 'Code copied' : `Copy ${example.lang} code`}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-line/25 bg-base/80 text-muted backdrop-blur transition-all hover:border-neon/50 hover:text-neon"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
                  </button>
                </div>
              </div>

              {/* Output console */}
              <div className="flex min-h-[280px] flex-col bg-[#070910]">
                <div className="flex items-center justify-between border-b border-line/12 px-4 py-3">
                  <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted">
                    <TerminalSquare className="h-3.5 w-3.5 text-neon" aria-hidden /> Output
                  </span>
                  <button
                    type="button"
                    onClick={run}
                    disabled={phase === 'running'}
                    className={cx(
                      'inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-mono text-xs font-semibold transition-all',
                      phase === 'running'
                        ? 'cursor-wait bg-line/15 text-muted'
                        : 'bg-gradient-to-r from-neon to-violet text-white shadow-glow hover:brightness-110',
                    )}
                  >
                    <Play className={cx('h-3.5 w-3.5', phase === 'running' && 'animate-pulse')} aria-hidden />
                    {phase === 'running' ? 'Running…' : 'Run Example'}
                  </button>
                </div>
                <div className="flex-1 overflow-auto px-4 py-3 font-mono text-xs leading-relaxed" role="log" aria-live="polite" aria-label="Program output">
                  {consoleLines.length === 0 ? (
                    <p className="text-muted">
                      {phase === 'idle' ? '// Press “Run Example” to see the predefined output…' : ''}
                      <span className={phase === 'idle' ? 'term-caret' : ''} />
                    </p>
                  ) : (
                    consoleLines.map((line, i) => (
                      <p
                        key={i}
                        className={cx(
                          'whitespace-pre-wrap',
                          line.startsWith('$') ? 'text-neon' : line.startsWith('[') ? 'text-muted' : 'text-emerald-200/90',
                        )}
                      >
                        {line || '\u00A0'}
                      </p>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-5 text-center font-mono text-[11px] text-muted">
            Safe by design: only predefined demonstrations run in your browser — visitor-submitted code is never executed.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
