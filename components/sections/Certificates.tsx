'use client';

import { useState } from 'react';
import { BookOpenCheck, Download, Eye, FileBadge, GraduationCap } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import SafeImage from '@/components/ui/SafeImage';
import Lightbox from '@/components/ui/Lightbox';
import type { Certificate, LearningTopic } from '@/lib/types';
import { formatDate } from '@/lib/utils';

function CertificateCard({ c }: { c: Certificate }) {
  const [preview, setPreview] = useState(false);

  return (
    <article className="glass-card glass-card-hover flex h-full flex-col overflow-hidden" data-cursor-hover>
      {/* Preview area — real file only; clean branded panel otherwise (no placeholder copy) */}
      {c.file ? (
        c.kind === 'image' ? (
          <button
            type="button"
            onClick={() => setPreview(true)}
            aria-label={`Preview certificate: ${c.title}`}
            className="group/visual relative block aspect-[16/10] w-full overflow-hidden"
          >
            <SafeImage src={c.file} alt={`Certificate: ${c.title}`} className="h-full w-full" />
            <span className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover/visual:opacity-100">
              <span className="grid h-11 w-11 place-items-center rounded-full border border-neon/50 bg-base/80 text-neon backdrop-blur-sm">
                <Eye className="h-5 w-5" aria-hidden />
              </span>
            </span>
          </button>
        ) : (
          <a
            href={c.file}
            target="_blank"
            rel="noopener noreferrer"
            className="grid aspect-[16/10] w-full place-items-center bg-gradient-to-br from-neon/10 to-violet/10 transition-colors hover:from-neon/20"
            aria-label={`Open PDF certificate: ${c.title}`}
          >
            <span className="rounded-xl border border-neon/30 bg-base/70 px-4 py-3 font-mono text-xs font-bold text-neon">
              PDF
            </span>
          </a>
        )
      ) : (
        <div className="relative grid aspect-[16/10] w-full place-items-center bg-gradient-to-br from-neon/6 to-violet/6">
          <div className="grid-bg absolute inset-0 opacity-40" aria-hidden />
          <span className="relative grid h-12 w-12 place-items-center rounded-xl border border-line/25 bg-raised/70 text-muted">
            <FileBadge className="h-5 w-5" aria-hidden />
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <h4 className="font-display text-sm font-semibold leading-snug">{c.title}</h4>
        {(c.org || c.date) && (
          <p className="mt-1.5 text-xs text-soft">
            {c.org}
            {c.org && c.date ? ' · ' : ''}
            {c.date ? formatDate(c.date) : ''}
          </p>
        )}
        {c.file && (
          <div className="mt-4 flex gap-2 border-t border-line/12 pt-4">
            <a
              href={c.file}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-neon/10 px-3 py-2 font-mono text-[11px] font-semibold text-neon transition-all hover:bg-neon/20"
            >
              <Eye className="h-3.5 w-3.5" aria-hidden /> View
            </a>
            <a
              href={c.file}
              download
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line/25 px-3 py-2 font-mono text-[11px] font-semibold text-ink transition-all hover:border-violet/50 hover:text-violet"
            >
              <Download className="h-3.5 w-3.5" aria-hidden /> Download
            </a>
          </div>
        )}
      </div>

      {preview && c.file && (
        <Lightbox src={c.file} alt={`Certificate: ${c.title}`} caption={c.title} onClose={() => setPreview(false)} />
      )}
    </article>
  );
}

export default function Certificates({
  certificates,
  learning,
}: {
  certificates: Certificate[];
  learning: LearningTopic[];
}) {
  return (
    <section id="certificates" data-track-section="certificates" className="section relative">
      <div className="container-x relative">
        <SectionHeading
          eyebrow="Certificates & Learning"
          title="Verified proof, honest progress"
          subtitle="Participation certificates with real files, plus the topics currently being learned — clearly separated."
        />

        {/* A. Participation certificates */}
        <Reveal className="mb-6 flex items-center gap-3">
          <FileBadge className="h-4 w-4 text-neon" aria-hidden />
          <h3 className="font-display text-lg font-semibold">Participation Certificates</h3>
          <span className="h-px flex-1 bg-gradient-to-r from-line/30 to-transparent" aria-hidden />
        </Reveal>

        {certificates.length === 0 ? (
          <Reveal>
            <p className="glass-card mb-16 p-8 text-center text-sm text-muted">
              No certificate files uploaded yet. Genuine certificates (PDF / JPG / PNG) can be added from the Admin Dashboard.
            </p>
          </Reveal>
        ) : (
          <div className="mb-16 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {certificates.map((c, i) => (
              <Reveal key={c.id} delay={Math.min(i * 0.06, 0.3)} className="h-full">
                <CertificateCard c={c} />
              </Reveal>
            ))}
          </div>
        )}

        {/* B. Learning topics */}
        <Reveal className="mb-6 flex items-center gap-3">
          <BookOpenCheck className="h-4 w-4 text-violet" aria-hidden />
          <h3 className="font-display text-lg font-semibold">Learning &amp; Certifications</h3>
          <span className="h-px flex-1 bg-gradient-to-r from-line/30 to-transparent" aria-hidden />
        </Reveal>

        <Reveal delay={0.08}>
          <p className="mb-6 font-mono text-xs text-muted">
            // Currently active learning topics — displayed honestly as topics in progress, not as completed certifications.
          </p>
        </Reveal>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {learning.map((topic, i) => (
            <Reveal key={topic.id} delay={Math.min(i * 0.05, 0.3)}>
              <div className="glass-card glass-card-hover group flex items-center gap-3 p-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-violet/30 bg-violet/10 text-violet transition-transform group-hover:scale-110">
                  <GraduationCap className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold">{topic.title}</p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-neon/80">In progress</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
