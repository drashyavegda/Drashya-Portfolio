import type { MetadataRoute } from 'next';
import { getSnapshot } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const snap = await getSnapshot();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/blog`, changeFrequency: 'weekly', priority: 0.8 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = snap.projects.map((p) => ({
    url: `${base}/projects/${p.slug}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const postRoutes: MetadataRoute.Sitemap = snap.posts
    .filter((p) => p.status === 'published')
    .map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.publishedAt ? new Date(p.publishedAt) : undefined,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

  return [...staticRoutes, ...projectRoutes, ...postRoutes];
}
