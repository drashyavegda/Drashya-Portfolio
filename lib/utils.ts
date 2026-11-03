/** Shared helpers. */

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) && email.length <= 254;
}

export function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '';
  const d = new Date(date.length <= 10 ? `${date}T00:00:00` : date);
  if (Number.isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function deviceFromUA(ua: string): 'desktop' | 'mobile' | 'tablet' | 'unknown' {
  if (!ua) return 'unknown';
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  if (/mobi|android.*mobile|iphone|ipod/i.test(ua)) return 'mobile';
  return 'desktop';
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}
