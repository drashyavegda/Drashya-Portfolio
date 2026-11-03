'use client';

import { useEffect, useState } from 'react';

/** Branded DV loading overlay — lightweight, session-once, never blocks content. */
export default function Loader() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('dv-loaded')) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      sessionStorage.setItem('dv-loaded', '1');
      return;
    }
    setVisible(true);
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setLeaving(true);
      sessionStorage.setItem('dv-loaded', '1');
      setTimeout(() => setVisible(false), 450);
    };
    const minTimer = setTimeout(finish, 850); // brief brand moment
    const maxTimer = setTimeout(finish, 1600); // hard cap — never delay the site
    if (document.readyState === 'complete') setTimeout(finish, 850);
    else window.addEventListener('load', () => setTimeout(finish, 250), { once: true });
    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[10000] flex items-center justify-center bg-base transition-opacity duration-400 ${
        leaving ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center gap-5">
        <div className="relative grid h-24 w-24 place-items-center">
          <div className="loader-ring absolute inset-0 rounded-full" />
          <span className="font-display text-3xl font-bold gradient-text">DV</span>
        </div>
        <div className="h-0.5 w-36 overflow-hidden rounded-full bg-line/15">
          <div
            className="h-full rounded-full bg-gradient-to-r from-neon to-violet transition-all duration-700 ease-out"
            style={{ width: leaving ? '100%' : '65%' }}
          />
        </div>
      </div>
    </div>
  );
}
