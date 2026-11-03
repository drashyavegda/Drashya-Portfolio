'use client';

import { useEffect, useRef } from 'react';
import { Braces, Cpu, Database, GitBranch, TerminalSquare, Binary, Sparkles } from 'lucide-react';
import { highlight } from '@/lib/highlight';

/**
 * Interactive 3D developer workspace — pure CSS 3D (no heavy WebGL bundle).
 * Mouse-responsive depth, floating tech tiles, orbit rings, glowing particles.
 * Falls back to a static composition for reduced-motion / touch devices.
 */

const CODE_SNIPPET = `const drashya = {
  role: "IT Engineering Student",
  focus: ["AI", "Software Dev"],
  learning: ["DSA", "SQL"],
  build: (idea) => ship(idea)
};`;

const FLOATERS = [
  { icon: Braces, label: '{ }', pos: 'left-[4%] top-[12%]', z: 60, delay: '0s' },
  { icon: TerminalSquare, label: '</>', pos: 'right-[2%] top-[8%]', z: 40, delay: '1.1s' },
  { icon: Cpu, label: 'AI', pos: 'right-[8%] bottom-[16%]', z: 70, delay: '0.5s' },
  { icon: Database, label: 'SQL', pos: 'left-[2%] bottom-[22%]', z: 35, delay: '1.7s' },
  { icon: GitBranch, label: 'git', pos: 'left-[16%] bottom-[2%]', z: 50, delay: '2.3s' },
  { icon: Binary, label: '01', pos: 'right-[16%] top-[42%]', z: 80, delay: '0.8s' },
];

const PARTICLES = [
  { pos: 'left-[12%] top-[24%]', size: 3, delay: '0s', color: 'bg-neon' },
  { pos: 'left-[82%] top-[18%]', size: 2, delay: '1.4s', color: 'bg-violet' },
  { pos: 'left-[68%] top-[76%]', size: 3, delay: '0.7s', color: 'bg-neon' },
  { pos: 'left-[24%] top-[68%]', size: 2, delay: '2.1s', color: 'bg-violet' },
  { pos: 'left-[48%] top-[8%]', size: 2, delay: '1.8s', color: 'bg-neon' },
  { pos: 'left-[90%] top-[55%]', size: 2, delay: '0.4s', color: 'bg-violet' },
  { pos: 'left-[6%] top-[52%]', size: 2, delay: '2.6s', color: 'bg-neon' },
];

export default function HeroScene() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const scene = sceneRef.current;
    if (!wrap || !scene) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(pointer: fine)').matches;

    if (reduced || !fine) {
      scene.style.transform = 'rotateX(4deg) rotateY(-6deg)';
      return;
    }

    let raf = 0;
    let tx = -6;
    let ty = 4;
    let cx = tx;
    let cy = ty;

    const onMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      tx = px * 16; // rotateY
      ty = -py * 12; // rotateX
    };
    const onLeave = () => {
      tx = -6;
      ty = 4;
    };
    const loop = () => {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      scene.style.transform = `rotateX(${cy.toFixed(2)}deg) rotateY(${cx.toFixed(2)}deg)`;
      raf = requestAnimationFrame(loop);
    };

    wrap.addEventListener('mousemove', onMove);
    wrap.addEventListener('mouseleave', onLeave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      wrap.removeEventListener('mousemove', onMove);
      wrap.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto aspect-square w-full max-w-[540px]"
      style={{ perspective: '1200px' }}
      aria-hidden
    >
      {/* Ambient glow */}
      <div className="glow-orb left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 bg-neon/25" />
      <div className="glow-orb right-4 top-10 h-48 w-48 bg-violet/20" />

      <div
        ref={sceneRef}
        className="absolute inset-0 transition-transform duration-100 ease-out"
        style={{ transformStyle: 'preserve-3d', transform: 'rotateX(4deg) rotateY(-6deg)' }}
      >
        {/* Orbit rings */}
        <div
          className="absolute left-1/2 top-1/2 h-[86%] w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-neon/15 animate-spin-slow"
          style={{ transform: 'translate(-50%,-50%) rotateX(72deg)', transformStyle: 'preserve-3d' }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-[104%] w-[104%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet/12"
          style={{ transform: 'translate(-50%,-50%) rotateX(72deg) rotateZ(35deg)', animation: 'spin 26s linear infinite reverse' }}
        />

        {/* Central code window */}
        <div
          className="glass absolute left-1/2 top-1/2 w-[76%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl shadow-card"
          style={{ transform: 'translate(-50%,-50%) translateZ(50px)' }}
        >
          <div className="flex items-center gap-2 border-b border-line/12 bg-raised/70 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            <span className="ml-2 font-mono text-[10px] text-muted">drashya.js — workspace</span>
            <Sparkles className="ml-auto h-3.5 w-3.5 text-neon/70" />
          </div>
          <pre className="overflow-hidden px-4 py-4 font-mono text-[10.5px] leading-relaxed sm:text-xs">
            <code dangerouslySetInnerHTML={{ __html: highlight(CODE_SNIPPET, 'js') }} />
          </pre>
          <div className="border-t border-line/12 bg-raised/60 px-4 py-2.5">
            <p className="font-mono text-[10px] text-muted">
              <span className="text-neon">➜</span> ready to build <span className="term-caret" />
            </p>
          </div>
        </div>

        {/* DV monogram core, behind window */}
        <div
          className="absolute left-1/2 top-1/2 grid h-40 w-40 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-3xl border border-violet/20 bg-gradient-to-br from-neon/10 to-violet/10 shadow-glow-violet backdrop-blur-sm"
          style={{ transform: 'translate(-50%,-50%) translateZ(-60px)' }}
        >
          <span className="font-display text-5xl font-bold gradient-text">DV</span>
        </div>

        {/* Floating tech tiles */}
        {FLOATERS.map(({ icon: Icon, label, pos, z, delay }) => (
          <div
            key={label}
            className={`absolute ${pos} animate-float`}
            style={{ animationDelay: delay, transform: `translateZ(${z}px)` }}
          >
            <div className="glass flex items-center gap-2 rounded-xl px-3 py-2.5 shadow-card transition-transform duration-300 hover:scale-110">
              <Icon className="h-4 w-4 text-neon" />
              <span className="font-mono text-[11px] font-medium text-ink">{label}</span>
            </div>
          </div>
        ))}

        {/* Glowing particles */}
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className={`absolute ${p.pos} ${p.color} rounded-full animate-pulse-glow`}
            style={{
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              boxShadow: '0 0 8px currentColor',
              transform: `translateZ(${20 + (i % 4) * 25}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
