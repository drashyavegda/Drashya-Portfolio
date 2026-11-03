'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useSound } from './SoundProvider';

export default function BackToTop() {
  const [show, setShow] = useState(false);
  const { play } = useSound();

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 640);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => {
        play('open');
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      }}
      className={`fixed bottom-6 left-6 z-40 grid h-11 w-11 place-items-center rounded-full border border-line/25 bg-raised/80 text-muted shadow-card backdrop-blur-md transition-all duration-300 hover:border-neon/60 hover:text-neon hover:shadow-glow sm:bottom-8 sm:left-8 ${
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <ArrowUp className="h-4.5 w-4.5" aria-hidden />
    </button>
  );
}
