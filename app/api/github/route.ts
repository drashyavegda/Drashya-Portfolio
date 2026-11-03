import { NextResponse } from 'next/server';
import { clientIp, rateLimit, startCleanup } from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';
startCleanup();

/**
 * Server-side GitHub proxy with caching + rate-limit resilience.
 * Only real GitHub API data is returned — never fabricated stats.
 */

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface CacheEntry {
  at: number;
  payload: Record<string, unknown>;
}

const cache = new Map<string, CacheEntry>();

async function ghFetch(url: string): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'drashya-vegda-portfolio',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (process.env.GITHUB_PERSONAL_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_PERSONAL_TOKEN}`;
  }
  return fetch(url, { headers, next: { revalidate: 0 } } as never);
}

export async function GET(req: Request) {
  const ip = clientIp(req.headers);
  const limit = rateLimit(`gh:${ip}`, 30, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ user: null, repos: [], fromCache: false, error: 'Too many requests.' }, { status: 429 });
  }

  const username = (new URL(req.url).searchParams.get('u') || process.env.GITHUB_USERNAME || 'drashyavegda')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 39);

  const cached = cache.get(username);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return NextResponse.json({ ...cached.payload, fromCache: true });
  }

  try {
    const [userRes, reposRes] = await Promise.all([
      ghFetch(`https://api.github.com/users/${username}`),
      ghFetch(`https://api.github.com/users/${username}/repos?per_page=30&sort=pushed`),
    ]);

    if (!userRes.ok) {
      const rateLimited = userRes.status === 403 || userRes.status === 429;
      if (cached && rateLimited) {
        // Serve stale cache when GitHub rate-limits us.
        return NextResponse.json({
          ...cached.payload,
          fromCache: true,
          error: 'GitHub API rate limit reached — showing cached data.',
        });
      }
      return NextResponse.json({
        user: null,
        repos: [],
        fromCache: false,
        error: rateLimited
          ? 'GitHub API rate limit reached. Try again shortly.'
          : `GitHub profile "${username}" could not be loaded (HTTP ${userRes.status}).`,
      });
    }

    const user = await userRes.json();
    let repos: unknown[] = [];
    if (reposRes.ok) {
      const all = (await reposRes.json()) as Array<Record<string, unknown>>;
      // Original repos first, then forks; cap at 9 for a tidy grid.
      const originals = all.filter((r) => !r.fork);
      const forks = all.filter((r) => r.fork);
      repos = [...originals, ...forks].slice(0, 9);
    }

    const payload = { user, repos };
    cache.set(username, { at: Date.now(), payload });
    return NextResponse.json({ ...payload, fromCache: false, error: null });
  } catch {
    if (cached) {
      return NextResponse.json({ ...cached.payload, fromCache: true, error: 'Network issue — showing cached data.' });
    }
    return NextResponse.json({
      user: null,
      repos: [],
      fromCache: false,
      error: 'Could not reach the GitHub API right now.',
    });
  }
}
