'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { cx } from '@/lib/utils';

/**
 * Optional subtle interaction sounds, synthesized with the Web Audio API
 * (zero audio files). OFF by default. Audio context is only created after a
 * real user gesture, honoring browser autoplay policies.
 */

type SoundKind = 'click' | 'success' | 'open' | 'toggle';

interface SoundCtx {
  enabled: boolean;
  toggle: () => void;
  play: (kind: SoundKind) => void;
}

const SoundContext = createContext<SoundCtx>({ enabled: false, toggle: () => {}, play: () => {} });

export function useSound() {
  return useContext(SoundContext);
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    try {
      setEnabled(localStorage.getItem('dv-sound') === 'on');
    } catch {
      /* storage unavailable */
    }
  }, []);

  const getCtx = useCallback(() => {
    if (!audioRef.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      audioRef.current = new AC();
    }
    if (audioRef.current.state === 'suspended') void audioRef.current.resume();
    return audioRef.current;
  }, []);

  const play = useCallback(
    (kind: SoundKind) => {
      if (!enabled) return;
      const ctx = getCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes: Array<[number, number, number]> =
        kind === 'click'
          ? [[880, now, 0.05]]
          : kind === 'success'
            ? [[660, now, 0.07], [880, now + 0.07, 0.09]]
            : kind === 'open'
              ? [[520, now, 0.06], [780, now + 0.06, 0.08]]
              : [[600, now, 0.04]];
      for (const [freq, start, dur] of notes) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.06, start + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + dur + 0.02);
      }
    },
    [enabled, getCtx],
  );

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('dv-sound', next ? 'on' : 'off');
      } catch {
        /* ignore */
      }
      if (next) {
        // Play a confirmation tone immediately (this runs inside a user gesture).
        const ctx = getCtx();
        if (ctx) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = 740;
          gain.gain.setValueAtTime(0.0001, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.012);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
          osc.connect(gain).connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
        }
      }
      return next;
    });
  }, [getCtx]);

  // One global delegated listener — subtle click on interactive elements only.
  useEffect(() => {
    if (!enabled) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [role="button"], input[type="submit"], input[type="checkbox"]')) {
        play('click');
      }
    };
    document.addEventListener('click', onClick, { passive: true });
    return () => document.removeEventListener('click', onClick);
  }, [enabled, play]);

  return <SoundContext.Provider value={{ enabled, toggle, play }}>{children}</SoundContext.Provider>;
}

export function SoundToggle({ className }: { className?: string }) {
  const { enabled, toggle } = useSound();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={enabled ? 'Turn interaction sounds off' : 'Turn interaction sounds on'}
      aria-pressed={enabled}
      title={enabled ? 'Sound on' : 'Sound off'}
      className={cx(
        'grid h-9 w-9 place-items-center rounded-full border border-line/20 bg-raised/60 text-muted transition-all duration-300 hover:border-violet/50 hover:text-violet',
        className,
      )}
    >
      {enabled ? <Volume2 className="h-4 w-4" aria-hidden /> : <VolumeX className="h-4 w-4" aria-hidden />}
    </button>
  );
}
