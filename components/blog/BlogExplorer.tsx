'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, Clock, PenLine, Search } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import { BLOG_CATEGORIES, LANGUAGE_LABELS, type PostLanguage } from '@/lib/types';
import { cx, formatDate } from '@/lib/utils';

export interface BlogListItem {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  language: PostLanguage;
  publishedAt: string | null;
  coverImage: string | null;
  minutes: number;
}

export default function BlogExplorer({ posts }: { posts: BlogListItem[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [language, setLanguage] = useState<'all' | PostLanguage>('all');

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(posts.map((p) => p.category)))],
    [posts],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (category !== 'All' && p.category !== category) return false;
      if (language !== 'all' && p.language !== language) return false;
      if (q && !`${p.title} ${p.excerpt} ${p.category}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [posts, query, category, language]);

  return (
    <div>
      {/* Controls */}
      <div className="glass-card mx-auto mb-10 max-w-3xl p-4 sm:p-5">
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <label htmlFor="blog-search" className="sr-only">Search articles</label>
          <input
            id="blog-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            className="input !pl-11"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by language">
            {(['all', 'en', 'hi', 'gu'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                aria-pressed={language === lang}
                className={cx(
                  'rounded-lg border px-3 py-1.5 font-mono text-[11px] font-medium transition-all',
                  language === lang
                    ? 'border-violet/60 bg-violet/15 text-violet'
                    : 'border-line/20 text-muted hover:border-violet/40 hover:text-ink',
                )}
              >
                {lang === 'all' ? 'All languages' : LANGUAGE_LABELS[lang]}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              aria-pressed={category === cat}
              className={cx(
                'rounded-full border px-3 py-1.5 font-mono text-[11px] font-medium transition-all',
                category === cat
                  ? 'border-neon/60 bg-neon/10 text-neon'
                  : 'border-line/20 text-muted hover:border-neon/40 hover:text-ink',
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {posts.length === 0 ? (
        <div className="glass-card mx-auto max-w-xl p-10 text-center">
          <PenLine className="mx-auto mb-4 h-8 w-8 text-violet" aria-hidden />
          <h2 className="font-display text-lg font-semibold">No articles published yet</h2>
          <p className="mt-2 text-sm text-muted">
            The multilingual blog (English · Hindi · Gujarati) is ready — articles will appear here as soon as they are
            published from the Admin Dashboard. Categories include: {BLOG_CATEGORIES.slice(0, 4).join(', ')} and more.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">
          No articles match your filters.{' '}
          <button
            type="button"
            className="text-neon underline-offset-4 hover:underline"
            onClick={() => {
              setQuery('');
              setCategory('All');
              setLanguage('all');
            }}
          >
            Reset filters
          </button>
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((post, i) => (
            <Reveal key={post.slug} delay={Math.min(i * 0.06, 0.3)} className="h-full">
              <Link
                href={`/blog/${post.slug}`}
                className="glass-card glass-card-hover group flex h-full flex-col overflow-hidden"
                data-cursor-hover
              >
                {post.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.coverImage} alt="" loading="lazy" className="h-40 w-full object-cover" />
                ) : (
                  <div className="relative grid h-40 w-full place-items-center bg-gradient-to-br from-neon/10 to-violet/10">
                    <div className="grid-bg absolute inset-0 opacity-50" aria-hidden />
                    <PenLine className="relative h-7 w-7 text-neon/60" aria-hidden />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="chip !px-2 !py-0.5 font-mono text-[10px] !text-neon">{post.category}</span>
                    <span className="chip !px-2 !py-0.5 font-mono text-[10px] !text-violet">
                      {LANGUAGE_LABELS[post.language]}
                    </span>
                  </div>
                  <h2 className="font-display text-base font-semibold leading-snug transition-colors group-hover:text-neon">
                    {post.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{post.excerpt}</p>
                  <div className="mt-4 flex items-center gap-4 border-t border-line/12 pt-3 font-mono text-[10.5px] text-muted">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-3 w-3" aria-hidden /> {formatDate(post.publishedAt)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" aria-hidden /> {post.minutes} min read
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
