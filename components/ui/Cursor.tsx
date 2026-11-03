'use client';

import { useEffect } from 'react';

/** Subtle glowing custom cursor — desktop fine-pointer only, respects reduced motion. */
export default function Cursor() {
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return;

    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.append(dot, ring);
    document.body.classList.add('custom-cursor-enabled');

    let mx = -100;
    let my = -100;
    let rx = -100;
    let ry = -100;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate3d(${mx - 3}px, ${my - 3}px, 0)`;
      const target = e.target as HTMLElement;
      const interactive = target.closest('a, button, input, textarea, select, [role="button"], [data-cursor-hover]');
      document.body.classList.toggle('cursor-hover', Boolean(interactive));
    };

    const loop = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate3d(${rx - ring.offsetWidth / 2}px, ${ry - ring.offsetHeight / 2}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    const onLeave = () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    };
    const onEnter = () => {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.documentElement.addEventListener('mouseenter', onEnter);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.documentElement.removeEventListener('mouseenter', onEnter);
      dot.remove();
      ring.remove();
      document.body.classList.remove('custom-cursor-enabled', 'cursor-hover');
    };
  }, []);

  return null;
}
