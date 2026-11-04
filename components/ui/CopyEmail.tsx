'use client';

import { useState } from 'react';
import { Check, Copy, Mail } from 'lucide-react';
import { useSound } from './SoundProvider';

export default function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const { play } = useSound();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      // Fallback for older browsers / restricted contexts.
      const ta = document.createElement('textarea');
      ta.value = email;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    play('success');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card inline-flex items-center gap-1 p-1.5 pl-4">
      <Mail className="mr-2 h-4 w-4 shrink-0 text-neon" aria-hidden />
      <a
        href={`mailto:${email}`}
        className="font-mono text-sm text-white transition-colors hover:text-neon sm:text-base"
      >
        {email}
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Email copied' : 'Copy email address'}
        className="ml-2 grid h-9 w-9 place-items-center rounded-xl border border-line/20 bg-raised/60 text-muted transition-all hover:border-neon/50 hover:text-neon"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-400" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
      </button>
    </div>
  );
}
