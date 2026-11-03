'use client';

import { useRef, useState } from 'react';
import { CheckCircle2, Github, Loader2, Linkedin, MapPin, Send, Triangle, AlertCircle } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import CopyEmail from '@/components/ui/CopyEmail';
import { useSound } from '@/components/ui/SoundProvider';
import type { Profile } from '@/lib/types';
import { isValidEmail } from '@/lib/utils';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function Contact({ profile }: { profile: Profile }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [resultMessage, setResultMessage] = useState('');
  const startedAt = useRef(Date.now());
  const { play } = useSound();

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (form.name.trim().length < 2) next.name = 'Please enter your name (at least 2 characters).';
    if (!isValidEmail(form.email)) next.email = 'Please enter a valid email address.';
    if (form.subject.trim().length < 3) next.subject = 'Please enter a subject (at least 3 characters).';
    if (form.message.trim().length < 10) next.message = 'Please write a message (at least 10 characters).';
    if (form.message.length > 5000) next.message = 'Message is too long (max 5000 characters).';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'loading') return;
    if (!validate()) return;
    setStatus('loading');
    setResultMessage('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, startedAt: startedAt.current }),
      });
      const data = (await res.json()) as { ok: boolean; message: string };
      if (res.ok && data.ok) {
        setStatus('success');
        setResultMessage(data.message);
        play('success');
        setForm({ name: '', email: '', subject: '', message: '' });
        startedAt.current = Date.now();
      } else {
        setStatus('error');
        setResultMessage(data.message || 'Something went wrong. Please try again or email directly.');
      }
    } catch {
      setStatus('error');
      setResultMessage('Network error — your message was not sent. Please try again or email directly.');
    }
  };

  const socialLinks = [
    { label: 'LinkedIn', href: profile.socials.linkedin, icon: Linkedin, note: 'Professional network' },
    { label: 'GitHub', href: profile.socials.github, icon: Github, note: 'Code & projects' },
    { label: 'Vercel', href: profile.socials.vercel, icon: Triangle, note: 'Deployed projects' },
  ];

  return (
    <section id="contact" data-track-section="contact" className="section relative">
      <div className="glow-orb left-1/3 bottom-0 h-80 w-80 bg-neon/10" aria-hidden />
      <div className="container-x relative">
        <SectionHeading
          eyebrow="Contact"
          title="Let's build something together"
          subtitle="Have an opportunity, a project idea or just want to say hi? The inbox is open."
        />

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Contact info */}
          <Reveal>
            <div className="flex h-full flex-col gap-4">
              <div className="glass-card p-6">
                <h3 className="mb-4 font-display text-base font-semibold">Direct contact</h3>
                <CopyEmail email={profile.email} />
                <p className="mt-4 flex items-center gap-2 text-sm text-muted">
                  <MapPin className="h-4 w-4 shrink-0 text-violet" aria-hidden />
                  {profile.location}
                </p>
              </div>

              <div className="glass-card flex-1 p-6">
                <h3 className="mb-4 font-display text-base font-semibold">Find me online</h3>
                <ul className="space-y-3">
                  {socialLinks.map(({ label, href, icon: Icon, note }) => (
                    <li key={label}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-4 rounded-xl border border-line/15 bg-raised/40 p-4 transition-all hover:-translate-y-0.5 hover:border-neon/40 hover:shadow-glow"
                      >
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-neon/25 bg-neon/10 text-neon">
                          <Icon className="h-4.5 w-4.5" aria-hidden />
                        </span>
                        <span className="flex-1">
                          <span className="block text-sm font-semibold text-ink">{label}</span>
                          <span className="block text-xs text-muted">{note}</span>
                        </span>
                        <span className="font-mono text-xs text-muted transition-colors group-hover:text-neon" aria-hidden>
                          ↗
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>

          {/* Form */}
          <Reveal delay={0.1}>
            <div className="glass-card relative p-6 sm:p-8">
              {status === 'success' ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center text-center" role="status">
                  <svg viewBox="0 0 52 52" className="mb-6 h-20 w-20" aria-hidden>
                    <circle
                      cx="26" cy="26" r="23" fill="none"
                      stroke="rgb(var(--c-neon))" strokeWidth="2"
                      strokeDasharray="145" strokeDashoffset="145"
                      style={{ animation: 'dash 0.7s ease forwards' }}
                    />
                    <path
                      d="M15 27 l7 7 l15 -15" fill="none"
                      stroke="rgb(var(--c-violet))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                      strokeDasharray="40" strokeDashoffset="40"
                      style={{ animation: 'dash 0.5s 0.5s ease forwards' }}
                    />
                  </svg>
                  <style>{`@keyframes dash { to { stroke-dashoffset: 0; } }`}</style>
                  <h3 className="font-display text-xl font-semibold">Message received!</h3>
                  <p className="mt-2 max-w-sm text-sm text-muted">{resultMessage}</p>
                  <button type="button" onClick={() => setStatus('idle')} className="btn-ghost mt-6 !px-4 !py-2 text-xs">
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit} noValidate>
                  <h3 className="mb-6 font-display text-base font-semibold">Send a message</h3>

                  {/* Honeypot — hidden from humans, catches basic bots */}
                  <div aria-hidden className="absolute -left-[9999px] top-0">
                    <label htmlFor="website">Website</label>
                    <input id="website" name="website" tabIndex={-1} autoComplete="off" readOnly value="" />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="cf-name" className="admin-label">Name *</label>
                      <input
                        id="cf-name" type="text" value={form.name} onChange={set('name')}
                        className="input" placeholder="Your name" required
                        aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'cf-name-err' : undefined}
                        maxLength={100}
                      />
                      {errors.name && <p id="cf-name-err" className="mt-1.5 text-xs text-red-400">{errors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="cf-email" className="admin-label">Email *</label>
                      <input
                        id="cf-email" type="email" value={form.email} onChange={set('email')}
                        className="input" placeholder="you@example.com" required
                        aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'cf-email-err' : undefined}
                        maxLength={254}
                      />
                      {errors.email && <p id="cf-email-err" className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="mt-5">
                    <label htmlFor="cf-subject" className="admin-label">Subject *</label>
                    <input
                      id="cf-subject" type="text" value={form.subject} onChange={set('subject')}
                      className="input" placeholder="What's this about?" required
                      aria-invalid={Boolean(errors.subject)} aria-describedby={errors.subject ? 'cf-subject-err' : undefined}
                      maxLength={200}
                    />
                    {errors.subject && <p id="cf-subject-err" className="mt-1.5 text-xs text-red-400">{errors.subject}</p>}
                  </div>

                  <div className="mt-5">
                    <label htmlFor="cf-message" className="admin-label">Message *</label>
                    <textarea
                      id="cf-message" rows={6} value={form.message} onChange={set('message')}
                      className="input resize-y" placeholder="Write your message here…" required
                      aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'cf-message-err' : undefined}
                      maxLength={5000}
                    />
                    {errors.message && <p id="cf-message-err" className="mt-1.5 text-xs text-red-400">{errors.message}</p>}
                  </div>

                  {status === 'error' && (
                    <p className="mt-4 flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-300" role="alert">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                      {resultMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="btn-primary mt-6 w-full disabled:cursor-wait disabled:opacity-70 sm:w-auto"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Sending…
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" aria-hidden /> Send Message
                      </>
                    )}
                  </button>

                  <p className="mt-4 flex items-center gap-1.5 font-mono text-[10.5px] text-muted/70">
                    <CheckCircle2 className="h-3 w-3" aria-hidden />
                    Protected by honeypot + rate limiting. Your message goes straight to Drashya&apos;s private inbox.
                  </p>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
