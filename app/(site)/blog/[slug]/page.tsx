import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays, Clock } from 'lucide-react';
import BlogViewTracker from '@/components/ui/BlogViewTracker';
import Reveal from '@/components/ui/Reveal';
import { getSnapshot } from '@/lib/db';
import { renderMarkdown, readingTime } from '@/lib/markdown';
import { LANGUAGE_LABELS } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

async function getPost(slug: string) {
  const snap = await getSnapshot();
  return snap.posts.find((p) => p.slug === slug && p.status === 'published') ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: 'Article not found' };
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt || post.title;
  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title,
      description,
      publishedTime: post.publishedAt || undefined,
      images: post.coverImage ? [{ url: post.coverImage }] : [{ url: '/og.png' }],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const snap = await getSnapshot();
  const html = renderMarkdown(post.content);
  const minutes = readingTime(post.content);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    inLanguage: post.language,
    author: { '@type': 'Person', name: snap.profile.name },
    image: post.coverImage || '/og.png',
  };

  return (
    <article className="relative pb-24 pt-32 sm:pt-36" lang={post.language === 'en' ? 'en' : post.language === 'hi' ? 'hi' : 'gu'}>
      <BlogViewTracker slug={post.slug} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="glow-orb left-10 top-20 h-64 w-64 bg-violet/10" aria-hidden />

      <div className="container-x relative max-w-3xl">
        <Link href="/blog" className="mb-8 inline-flex items-center gap-2 font-mono text-xs text-muted transition-colors hover:text-neon">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to blog
        </Link>

        <Reveal>
          <header className="mb-10">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="chip !text-neon border-neon/30">{post.category}</span>
              <span className="chip !text-violet border-violet/30">{LANGUAGE_LABELS[post.language]}</span>
            </div>
            <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">{post.title}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-5 font-mono text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden /> {formatDate(post.publishedAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" aria-hidden /> {minutes} min read
              </span>
              <span>By {snap.profile.name}</span>
            </div>
          </header>
        </Reveal>

        {post.coverImage && (
          <Reveal>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt=""
              className="mb-10 max-h-80 w-full rounded-2xl border border-line/15 object-cover shadow-card"
            />
          </Reveal>
        )}

        <Reveal>
          <div className="prose-dv" dangerouslySetInnerHTML={{ __html: html }} />
        </Reveal>

        <Reveal className="mt-14">
          <div className="glass-card flex flex-col items-center gap-4 p-7 text-center sm:flex-row sm:text-left">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-neon/30 bg-neon/10 font-display text-sm font-bold gradient-text">
              DV
            </span>
            <div className="flex-1">
              <p className="font-display text-sm font-semibold">{snap.profile.name}</p>
              <p className="mt-0.5 text-xs text-muted">{snap.profile.title}</p>
            </div>
            <Link href="/#contact" className="btn-ghost !px-4 !py-2 text-xs">Get in touch</Link>
          </div>
        </Reveal>
      </div>
    </article>
  );
}
