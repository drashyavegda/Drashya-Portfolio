import Link from 'next/link';
import { ArrowRight, CalendarDays, Clock, PenLine } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import type { BlogPost } from '@/lib/types';
import { formatDate, truncate } from '@/lib/utils';
import { readingTime } from '@/lib/markdown';
import { LANGUAGE_LABELS } from '@/lib/types';

export default function BlogPreview({ posts }: { posts: BlogPost[] }) {
  const published = posts
    .filter((p) => p.status === 'published')
    .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))
    .slice(0, 3);

  return (
    <section id="blog-preview" data-track-section="blog" className="section relative">
      <div className="container-x relative">
        <SectionHeading
          eyebrow="Blog"
          title="Developer insights"
          subtitle="Notes on programming, DSA, AI and hackathon experiences — in English, Hindi and Gujarati."
        />

        {published.length === 0 ? (
          <Reveal>
            <div className="glass-card mx-auto max-w-xl p-10 text-center">
              <PenLine className="mx-auto mb-4 h-8 w-8 text-violet" aria-hidden />
              <h3 className="font-display text-lg font-semibold">Articles coming soon</h3>
              <p className="mt-2 text-sm text-muted">
                The blog is set up and ready — first articles will be published shortly. Posts can be written in English,
                Hindi or Gujarati from the Admin Dashboard.
              </p>
              <Link href="/blog" className="btn-ghost mt-6 !px-4 !py-2 text-xs">
                Visit the blog <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          </Reveal>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-3">
              {published.map((post, i) => (
                <Reveal key={post.id} delay={i * 0.08} className="h-full">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="glass-card glass-card-hover group flex h-full flex-col overflow-hidden"
                    data-cursor-hover
                  >
                    {post.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={post.coverImage} alt="" loading="lazy" className="h-36 w-full object-cover" />
                    ) : (
                      <div className="relative grid h-36 w-full place-items-center bg-gradient-to-br from-neon/10 to-violet/10">
                        <div className="grid-bg absolute inset-0 opacity-50" aria-hidden />
                        <PenLine className="relative h-7 w-7 text-neon/60" aria-hidden />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="chip !px-2 !py-0.5 font-mono text-[10px] !text-neon">{post.category}</span>
                        <span className="chip !px-2 !py-0.5 font-mono text-[10px]">{LANGUAGE_LABELS[post.language].split(' ')[0]}</span>
                      </div>
                      <h3 className="font-display text-base font-semibold leading-snug transition-colors group-hover:text-neon">
                        {post.title}
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{truncate(post.excerpt, 120)}</p>
                      <div className="mt-4 flex items-center gap-4 border-t border-line/12 pt-3 font-mono text-[10.5px] text-muted">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="h-3 w-3" aria-hidden /> {formatDate(post.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" aria-hidden /> {readingTime(post.content)} min read
                        </span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
            <Reveal className="mt-10 text-center" delay={0.1}>
              <Link href="/blog" className="btn-ghost">
                Read all articles <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Reveal>
          </>
        )}
      </div>
    </section>
  );
}
