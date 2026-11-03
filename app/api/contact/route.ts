import { NextResponse } from 'next/server';
import { getStore } from '@/lib/db';
import { clientIp, rateLimit, startCleanup } from '@/lib/ratelimit';
import { isValidEmail } from '@/lib/utils';

export const dynamic = 'force-dynamic';
startCleanup();

interface ContactBody {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  website?: string; // honeypot
  startedAt?: number; // form-open timestamp for timing check
}

async function sendViaResend(to: string, from: string, subject: string, html: string, apiKey: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const limit = rateLimit(`contact:${ip}`, 3, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, message: `Too many messages sent. Please try again in ${limit.retryAfterSec}s or email directly.` },
      { status: 429 },
    );
  }

  let body: ContactBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request.' }, { status: 400 });
  }

  // Spam guards: honeypot + suspiciously fast submission.
  const tooFast = typeof body.startedAt === 'number' && Date.now() - body.startedAt < 2500;
  if (body.website || tooFast) {
    // Tell bots what they want to hear; store nothing.
    return NextResponse.json({ ok: true, message: 'Message sent successfully.' });
  }

  const name = String(body.name || '').trim().slice(0, 100);
  const email = String(body.email || '').trim().slice(0, 254);
  const subject = String(body.subject || '').trim().slice(0, 200);
  const message = String(body.message || '').trim().slice(0, 5000);

  if (name.length < 2 || !isValidEmail(email) || subject.length < 3 || message.length < 10) {
    return NextResponse.json({ ok: false, message: 'Please check the form fields and try again.' }, { status: 400 });
  }

  try {
    const store = await getStore();
    const snap = await store.getSnapshot();

    // Always persist to the private admin inbox first — delivery is guaranteed.
    await store.addMessage({ name, email, subject, message });

    // Optional real email delivery via Resend when configured.
    let emailed = false;
    const resendKey = process.env.RESEND_API_KEY;
    const resendFrom = process.env.RESEND_FROM_EMAIL;
    if (resendKey && resendFrom) {
      emailed = await sendViaResend(
        snap.profile.email,
        resendFrom,
        `Portfolio contact: ${subject}`,
        `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p><p><strong>Subject:</strong> ${subject}</p><hr/><p style="white-space:pre-wrap">${message
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')}</p>`,
        resendKey,
      );
    }

    return NextResponse.json({
      ok: true,
      delivery: emailed ? 'emailed' : 'stored',
      message: emailed
        ? `Thanks, ${name}! Your message was sent to Drashya's email. He'll get back to you soon.`
        : `Thanks, ${name}! Your message was delivered to Drashya's private inbox. He'll get back to you soon.`,
    });
  } catch (err) {
    console.error('Contact error:', err);
    return NextResponse.json(
      {
        ok: false,
        message: `Your message could not be delivered. Please email directly at ${process.env.ADMIN_EMAIL || 'drashyavegda1969@gmail.com'}.`,
      },
      { status: 500 },
    );
  }
}
