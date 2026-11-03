import { NextResponse } from 'next/server';
import { getSnapshot } from '@/lib/db';
import { buildSystemPrompt, fallbackAnswer } from '@/lib/ai/knowledge';
import { clientIp, rateLimit, startCleanup } from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;
startCleanup();

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

async function askOpenAI(system: string, history: ChatMessage[], question: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 400,
      messages: [
        { role: 'system', content: system },
        ...history.slice(-6).map((m) => ({ role: m.role, content: m.text.slice(0, 800) })),
        { role: 'user', content: question.slice(0, 800) },
      ],
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content?.trim() || null;
}

async function askGemini(system: string, question: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: question.slice(0, 800) }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 400 },
      }),
    },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
}

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const limit = rateLimit(`ai:${ip}`, 12, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: `Too many questions — please wait ${limit.retryAfterSec}s.` },
      { status: 429 },
    );
  }

  let body: { message?: string; history?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const question = String(body.message || '').trim().slice(0, 500);
  if (!question) {
    return NextResponse.json({ ok: false, error: 'Empty question.' }, { status: 400 });
  }
  const history = Array.isArray(body.history)
    ? body.history.filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.text === 'string').slice(-6)
    : [];

  try {
    const snap = await getSnapshot();
    const system = buildSystemPrompt(snap);

    // 1) Real LLM when a server-side key is configured (keys never reach the client).
    if (process.env.OPENAI_API_KEY) {
      const answer = await askOpenAI(system, history, question);
      if (answer) return NextResponse.json({ ok: true, answer, provider: 'openai' });
    }
    if (process.env.GEMINI_API_KEY) {
      const answer = await askGemini(system, question);
      if (answer) return NextResponse.json({ ok: true, answer, provider: 'gemini' });
    }

    // 2) Honest fallback: verified-data knowledge engine (no key configured, or provider failed).
    const answer = fallbackAnswer(question, snap);
    return NextResponse.json({ ok: true, answer, provider: 'builtin' });
  } catch (err) {
    console.error('AI route error:', err);
    return NextResponse.json({ ok: false, error: 'Assistant temporarily unavailable.' }, { status: 500 });
  }
}
