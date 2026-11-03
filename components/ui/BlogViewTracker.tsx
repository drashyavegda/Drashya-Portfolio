'use client';

import { useEffect } from 'react';
import { trackOnce } from './AnalyticsTracker';

export default function BlogViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    trackOnce('blog_view', slug);
  }, [slug]);
  return null;
}
