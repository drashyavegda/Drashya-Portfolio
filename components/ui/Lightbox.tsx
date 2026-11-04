'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, X, XCircle } from 'lucide-react';

/**
 * Client-only image lightbox. Opens over the page (no navigation, no server
 * involvement), closes via button, backdrop click or Escape, locks body
 * scroll, and shows honest loading / error states.
 */
export default function Lightbox({
  src,
  alt,
  caption,
  onClose,
}: {
  src: string;
  alt: string;
  caption?: string;
  onClose: () => void;
}) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={caption || alt}
      onClick={onClose}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close image preview"
        className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-xl border border-line/25 bg-raised/80 text-ink transition-colors hover:border-neon/50 hover:text-neon"
      >
        <X className="h-5 w-5" aria-hidden />
      </button>

      <figure
        className="relative flex max-h-full max-w-4xl flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {state === 'loading' && (
          <div className="grid h-64 w-64 place-items-center rounded-2xl border border-line/20 bg-raised/60" role="status" aria-label="Loading image">
            <Loader2 className="h-8 w-8 animate-spin text-neon" aria-hidden />
          </div>
        )}
        {state === 'error' && (
          <div className="grid h-64 w-64 place-items-center rounded-2xl border border-red-400/30 bg-red-400/10 p-6 text-center">
            <div>
              <XCircle className="mx-auto mb-3 h-8 w-8 text-red-400" aria-hidden />
              <p className="text-sm text-red-200">This image could not be loaded.</p>
              <p className="mt-1 font-mono text-[10px] text-muted">{src}</p>
            </div>
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          onLoad={() => setState('ready')}
          onError={() => setState('error')}
          className={state === 'ready' ? 'max-h-[78vh] max-w-full rounded-2xl border border-line/20 object-contain shadow-card' : 'hidden'}
        />
        {caption && state === 'ready' && (
          <figcaption className="mt-3 max-w-xl text-center font-mono text-xs text-muted">{caption}</figcaption>
        )}
      </figure>
    </div>
  );
}
