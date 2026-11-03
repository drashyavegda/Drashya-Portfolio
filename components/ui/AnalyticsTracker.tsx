'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Privacy-friendly analytics: aggregate counts only (path, section, project,
 * device category). No IPs, cookies or personal data are collected client-side.
 */

export type TrackType = 'page_view' | 'project_view' | 'section_view' | 'blog_view';

function deviceCategory(): 'desktop' | 'mobile' | 'tablet' | 'unknown' {
  const ua = navigator.userAgent;
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  if (/mobi|android.*mobile|iphone|ipod/i.test(ua)) return 'mobile';
  return 'desktop';
}

export async function sendEvents(events: Array<{ type: TrackType; key: string }>) {
  if (!events.length) return;
  try {
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: events.map((e) => ({ ...e, device: deviceCategory() })) }),
      keepalive: true,
    });
  } catch {
    /* analytics must never break the experience */
  }
}

export function trackOnce(type: TrackType, key: string) {
  if (typeof window === 'undefined') return;
  const storageKey = `dv-tracked:${type}:${key}`;
  try {
    if (sessionStorage.getItem(storageKey)) return;
    sessionStorage.setItem(storageKey, '1');
  } catch {
    /* proceed without dedupe */
  }
  void sendEvents([{ type, key }]);
}

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackOnce('page_view', pathname || '/');
  }, [pathname]);

  // Section visibility tracking on the home page.
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-track-section]'));
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const key = (entry.target as HTMLElement).dataset.trackSection!;
            trackOnce('section_view', key);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.35 },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
