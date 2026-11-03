import { MessageSquareQuote, Quote } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import type { Testimonial } from '@/lib/types';

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <section id="testimonials" data-track-section="testimonials" className="section relative">
      <div className="container-x relative">
        <SectionHeading eyebrow="Testimonials" title="What people say" />

        {testimonials.length === 0 ? (
          <Reveal>
            <div className="glass-card mx-auto max-w-xl border-dashed p-10 text-center">
              <MessageSquareQuote className="mx-auto mb-4 h-8 w-8 text-muted" aria-hidden />
              <h3 className="font-display text-base font-semibold text-ink">No testimonials published yet</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                This space is reserved for genuine feedback from collaborators, mentors and teammates. Nothing is
                fabricated — real testimonials will appear here once added via the Admin Dashboard.
              </p>
            </div>
          </Reveal>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.id} delay={Math.min(i * 0.07, 0.3)} className="h-full">
                <figure className="glass-card glass-card-hover flex h-full flex-col p-6">
                  <Quote className="mb-4 h-6 w-6 text-neon/50" aria-hidden />
                  <blockquote className="flex-1 text-sm leading-relaxed text-muted">“{t.feedback}”</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-line/12 pt-4">
                    {t.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.image} alt="" loading="lazy" className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <span className="grid h-10 w-10 place-items-center rounded-full border border-neon/30 bg-neon/10 font-display text-xs font-bold text-neon">
                        {t.name.slice(0, 1)}
                      </span>
                    )}
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      {t.role && <p className="text-xs text-muted">{t.role}</p>}
                      {t.linkedin && (
                        <a
                          href={t.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[10px] text-neon hover:underline"
                        >
                          LinkedIn ↗
                        </a>
                      )}
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
