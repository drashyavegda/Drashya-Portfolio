'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, Send, Sparkles, Trash2, X } from 'lucide-react';
import { cx } from '@/lib/utils';
import { useSound } from './SoundProvider';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

const SUGGESTIONS = [
  'Who is Drashya?',
  'What programming languages does he know?',
  'Tell me about WasteFlow AI',
  'What projects has he built?',
  'How can I contact him?',
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: "Hi! I'm Drashya's portfolio assistant. Ask me about his background, education, skills, projects, hackathons or how to get in touch.",
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { play } = useSound();

  useEffect(() => {
    if (open) {
      play('open');
      setTimeout(() => inputRef.current?.focus(), 250);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing, open]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || typing) return;
    setError(null);
    setInput('');
    const history = messages.slice(-6);
    setMessages((m) => [...m, { role: 'user', text: question }]);
    setTyping(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, history }),
      });
      const data = (await res.json()) as { ok: boolean; answer?: string; error?: string };
      if (res.ok && data.ok && data.answer) {
        setMessages((m) => [...m, { role: 'assistant', text: data.answer! }]);
      } else {
        setError(data.error || 'The assistant is temporarily unavailable.');
        setMessages((m) => [
          ...m,
          {
            role: 'assistant',
            text: 'Sorry — I could not process that right now. Please try again in a moment, or explore the sections directly.',
          },
        ]);
      }
    } catch {
      setError('Network error.');
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: 'Connection issue — please check your network and try again.' },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      {/* Floating toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close portfolio assistant' : 'Open portfolio assistant'}
        aria-expanded={open}
        className={cx(
          'fixed bottom-6 right-6 z-[60] grid h-14 w-14 place-items-center rounded-2xl border border-neon/40 text-white shadow-glow transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgb(var(--c-neon)/0.5)] sm:bottom-8 sm:right-8',
          'bg-gradient-to-br from-neon to-violet',
          open && 'rotate-0 scale-95',
        )}
      >
        {open ? <X className="h-5 w-5" aria-hidden /> : <Bot className="h-6 w-6" aria-hidden />}
        {!open && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-base bg-emerald-400" />
          </span>
        )}
      </button>

      {/* Chat panel */}
      <div
        role="dialog"
        aria-label="AI portfolio assistant"
        className={cx(
          'fixed bottom-24 right-4 z-[60] flex w-[calc(100vw-2rem)] max-w-[400px] flex-col overflow-hidden rounded-2xl border border-line/20 bg-base/95 shadow-card backdrop-blur-xl transition-all duration-300 sm:bottom-28 sm:right-8',
          open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
        )}
        style={{ height: 'min(560px, calc(100dvh - 8rem))' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-line/12 bg-raised/70 px-4 py-3.5">
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-neon to-violet text-white">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <div className="flex-1">
            <p className="font-display text-sm font-semibold">Portfolio Assistant</p>
            <p className="flex items-center gap-1.5 font-mono text-[10px] text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
              Answers from verified portfolio data
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setMessages([]);
              setError(null);
            }}
            aria-label="Clear chat"
            title="Clear chat"
            className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-raised hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close assistant"
            className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-raised hover:text-ink"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.length === 0 && (
            <p className="py-6 text-center text-xs text-muted">Chat cleared. Ask me anything about Drashya!</p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={cx('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={cx(
                  'max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed',
                  m.role === 'user'
                    ? 'rounded-br-md bg-gradient-to-br from-neon to-violet text-white'
                    : 'rounded-bl-md border border-line/15 bg-raised/80 text-ink',
                )}
              >
                {m.text}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start" aria-label="Assistant is typing">
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-line/15 bg-raised/80 px-4 py-3">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neon [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neon [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet [animation-delay:300ms]" />
              </div>
            </div>
          )}
          {error && <p className="text-center font-mono text-[10px] text-red-400/90" role="alert">{error}</p>}

          {/* Suggestions */}
          {!typing && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {SUGGESTIONS.filter(
                (s) => !messages.some((m) => m.role === 'user' && m.text.toLowerCase() === s.toLowerCase()),
              )
                .slice(0, 3)
                .map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void send(s)}
                    className="rounded-full border border-neon/25 bg-neon/5 px-3 py-1.5 text-[11px] text-neon transition-all hover:bg-neon/15"
                  >
                    {s}
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="flex items-center gap-2 border-t border-line/12 bg-raised/60 px-3 py-3"
        >
          <label htmlFor="chat-input" className="sr-only">Ask the portfolio assistant</label>
          <input
            id="chat-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about projects, skills, contact…"
            maxLength={500}
            className="flex-1 rounded-xl border border-line/15 bg-base/70 px-3.5 py-2.5 text-[13px] text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-neon/50"
          />
          <button
            type="submit"
            disabled={typing || !input.trim()}
            aria-label="Send message"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-neon to-violet text-white transition-all hover:brightness-110 disabled:opacity-40"
          >
            <Send className="h-4 w-4" aria-hidden />
          </button>
        </form>
      </div>
    </>
  );
}
