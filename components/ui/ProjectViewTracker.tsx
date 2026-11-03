'use client';

import { useEffect } from 'react';
import { trackOnce } from './AnalyticsTracker';

export default function ProjectViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    trackOnce('project_view', slug);
  }, [slug]);
  return null;
}
