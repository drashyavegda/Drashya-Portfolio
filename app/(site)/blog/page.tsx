import type { Metadata } from 'next';
import BlogExplorer from '@/components/blog/BlogExplorer';
import { getSnapshot } from '@/lib/db';
import { readingTime } from '@/lib/markdown';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog — Developer Insights',
  description:
    'Articles on programming, DSA, AI, web development and hackathon experiences by Drashya Vegda — in English, Hindi and Gujarati.',
  alternates: { canonical: '/blog' },
};

export default async function BlogPage() {
  const snap = await getSnapshot();
  const posts = snap.posts
    .filter((p) => p.status === 'published')
    .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      category: p.category,
      language: p.language,
      publishedAt: p.publishedAt,
      coverImage: p.coverImage,
      minutes: readingTime(p.content),
    }));

  return (
    <div className="relative min-h-svh pb-24 pt-32 sm:pt-36">
      <div className="glow-orb right-10 top-10 h-72 w-72 bg-neon/10" aria-hidden />
      <div className="container-x relative">
        <header className="mb-12 text-center">
          <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.3em] text-neon">
            <span aria-hidden className="mr-2 text-violet">//</span>Blog
          </p>
          <h1 className="font-display text-4xl font-bold sm:text-5xl">
            Developer <span className="gradient-text">Insights</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted sm:text-base">
            Notes on programming, DSA, AI and hackathon experiences — written in English (EN), हिन्दी (HI) and ગુજરાતી (GU).
          </p>
        </header>
        <BlogExplorer posts={posts} />
      </div>
    </div>
  );
}
