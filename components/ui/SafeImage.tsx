'use client';

import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cx } from '@/lib/utils';

/**
 * <img> with honest loading + error states and an attractive fallback panel.
 * Never renders a broken image icon; never crashes the page.
 */
export default function SafeImage({
  src,
  alt,
  className,
  fallbackClassName,
  eager,
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  eager?: boolean;
}) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  if (state === 'error') {
    return (
      <div
        className={cx(
          'grid place-items-center bg-gradient-to-br from-neon/10 via-raised to-violet/10',
          className,
          fallbackClassName,
        )}
        role="img"
        aria-label={alt}
      >
        <div className="grid-bg absolute inset-0 opacity-40" aria-hidden />
        <span className="relative grid h-10 w-10 place-items-center rounded-xl border border-line/25 bg-raised/70 text-muted">
          <ImageOff className="h-4.5 w-4.5" aria-hidden />
        </span>
      </div>
    );
  }

  return (
    <span className={cx('relative block overflow-hidden', className)}>
      {state === 'loading' && <span className="absolute inset-0 animate-pulse bg-line/10" aria-hidden />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setState('ready')}
        onError={() => setState('error')}
        className={cx(
          'h-full w-full object-cover transition-opacity duration-500',
          state === 'ready' ? 'opacity-100' : 'opacity-0',
        )}
      />
    </span>
  );
}
