'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cx } from '@/lib/utils';

export default function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('dv-theme');
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(stored === 'light' || stored === 'dark' ? stored : current === 'light' ? 'light' : 'dark');
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('dv-theme', next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={cx(
        'relative grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-line/20 bg-raised/60 text-muted transition-all duration-300 hover:border-neon/50 hover:text-neon hover:shadow-glow',
        className,
      )}
    >
      <Sun
        className={cx(
          'absolute h-4 w-4 transition-all duration-500',
          mounted && theme === 'dark' ? 'translate-y-0 rotate-0 opacity-100' : '-translate-y-6 rotate-90 opacity-0',
        )}
        aria-hidden
      />
      <Moon
        className={cx(
          'absolute h-4 w-4 transition-all duration-500',
          mounted && theme === 'light' ? 'translate-y-0 rotate-0 opacity-100' : 'translate-y-6 -rotate-90 opacity-0',
        )}
        aria-hidden
      />
    </button>
  );
}
