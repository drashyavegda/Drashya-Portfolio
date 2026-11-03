import type { EntityKey, Snapshot } from './types';
import { isValidEmail, isValidUrl, slugify } from './utils';

/** Server-side validation & sanitization for all admin writes. */

export type ValidationResult = { ok: true; data: Record<string, unknown> } | { ok: false; error: string };

function str(v: unknown, max = 2000, fallback = ''): string {
  if (typeof v !== 'string') return fallback;
  return v.trim().slice(0, max);
}

function strOrNull(v: unknown, max = 500): string | null {
  const s = str(v, max);
  return s.length ? s : null;
}

function strArray(v: unknown, maxItems = 30, maxLen = 200): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
    .slice(0, maxItems)
    .map((x) => x.trim().slice(0, maxLen));
}

function bool(v: unknown): boolean {
  return v === true || v === 'true';
}

function urlOrNull(v: unknown, field: string): { value: string | null; error?: string } {
  const s = strOrNull(v, 500);
  if (s && !isValidUrl(s)) return { value: null, error: `${field} must be a valid http(s) URL.` };
  return { value: s };
}

export function validateEntity(
  entity: EntityKey,
  input: Record<string, unknown>,
  snapshot: Snapshot,
  currentId?: string,
): ValidationResult {
  switch (entity) {
    case 'skills': {
      const name = str(input.name, 80);
      if (!name) return { ok: false, error: 'Skill name is required.' };
      return {
        ok: true,
        data: {
          name,
          category: str(input.category, 80) || 'Programming Languages',
          description: str(input.description, 300),
          learning: bool(input.learning),
        },
      };
    }

    case 'projects': {
      const title = str(input.title, 200);
      if (!title) return { ok: false, error: 'Project title is required.' };
      let slug = str(input.slug, 100) ? slugify(str(input.slug, 100)) : slugify(title);
      if (!slug) return { ok: false, error: 'Could not derive a URL slug from the title.' };
      const clash = snapshot.projects.find((p) => p.slug === slug && p.id !== currentId);
      if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
      const demo = urlOrNull(input.demoUrl, 'Live demo URL');
      if (demo.error) return { ok: false, error: demo.error };
      const gh = urlOrNull(input.githubUrl, 'GitHub URL');
      if (gh.error) return { ok: false, error: gh.error };
      const caseStudyIn = (input.caseStudy ?? {}) as Record<string, unknown>;
      return {
        ok: true,
        data: {
          title,
          slug,
          category: str(input.category, 100) || 'Project',
          description: str(input.description, 3000),
          featured: bool(input.featured),
          order: Number.isFinite(Number(input.order)) ? Math.max(0, Math.min(999, Number(input.order))) : 99,
          highlights: strArray(input.highlights, 20, 200),
          technologies: strArray(input.technologies, 20, 60),
          demoUrl: demo.value,
          githubUrl: gh.value,
          screenshots: strArray(input.screenshots, 8, 500),
          caseStudy: {
            problem: str(caseStudyIn.problem, 5000),
            solution: str(caseStudyIn.solution, 5000),
            process: str(caseStudyIn.process, 5000),
            challenges: str(caseStudyIn.challenges, 5000),
            results: str(caseStudyIn.results, 5000),
          },
          seoTitle: str(input.seoTitle, 120),
          seoDescription: str(input.seoDescription, 300),
        },
      };
    }

    case 'hackathons': {
      const name = str(input.name, 150);
      if (!name) return { ok: false, error: 'Event name is required.' };
      const status = ['participated', 'finalist', 'winner'].includes(String(input.status))
        ? String(input.status)
        : 'participated';
      const link = urlOrNull(input.certificateLink, 'Verification link');
      if (link.error) return { ok: false, error: link.error };
      return {
        ok: true,
        data: {
          name,
          date: strOrNull(input.date, 20),
          project: strOrNull(input.project, 300),
          technologies: strArray(input.technologies, 15, 60),
          status,
          certificateFile: strOrNull(input.certificateFile, 500),
          certificateLink: link.value,
          notes: str(input.notes, 500),
        },
      };
    }

    case 'certificates': {
      const title = str(input.title, 200);
      if (!title) return { ok: false, error: 'Certificate title is required.' };
      return {
        ok: true,
        data: {
          title,
          org: str(input.org, 150),
          date: strOrNull(input.date, 20),
          file: strOrNull(input.file, 500),
          kind: input.kind === 'pdf' ? 'pdf' : 'image',
        },
      };
    }

    case 'learning': {
      const title = str(input.title, 150);
      if (!title) return { ok: false, error: 'Topic title is required.' };
      return {
        ok: true,
        data: { title, note: str(input.note, 300) || 'Learning topic — not a completed certification.' },
      };
    }

    case 'posts': {
      const title = str(input.title, 200);
      if (!title) return { ok: false, error: 'Post title is required.' };
      let slug = str(input.slug, 100) ? slugify(str(input.slug, 100)) : slugify(title);
      if (!slug) return { ok: false, error: 'Could not derive a URL slug from the title.' };
      const clash = snapshot.posts.find((p) => p.slug === slug && p.id !== currentId);
      if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
      const language = ['en', 'hi', 'gu'].includes(String(input.language)) ? String(input.language) : 'en';
      const status = input.status === 'published' ? 'published' : 'draft';
      return {
        ok: true,
        data: {
          title,
          slug,
          excerpt: str(input.excerpt, 400),
          content: str(input.content, 60000),
          coverImage: strOrNull(input.coverImage, 500),
          category: str(input.category, 80) || 'Programming',
          language,
          publishedAt: strOrNull(input.publishedAt, 20) ?? (status === 'published' ? new Date().toISOString().slice(0, 10) : null),
          status,
          seoTitle: str(input.seoTitle, 120),
          seoDescription: str(input.seoDescription, 300),
        },
      };
    }

    case 'testimonials': {
      const name = str(input.name, 100);
      const feedback = str(input.feedback, 1000);
      if (!name || !feedback) return { ok: false, error: 'Name and feedback are required.' };
      const li = urlOrNull(input.linkedin, 'LinkedIn URL');
      if (li.error) return { ok: false, error: li.error };
      return {
        ok: true,
        data: {
          name,
          role: str(input.role, 100),
          feedback,
          image: strOrNull(input.image, 500),
          linkedin: li.value,
        },
      };
    }

    default:
      return { ok: false, error: 'Unknown entity.' };
  }
}

export function validateSitePatch(input: Record<string, unknown>): ValidationResult {
  const data: Record<string, unknown> = {};

  if (input.profile && typeof input.profile === 'object') {
    const p = input.profile as Record<string, unknown>;
    const socialsIn = (p.socials ?? {}) as Record<string, unknown>;
    const email = str(p.email, 254);
    if (email && !isValidEmail(email)) return { ok: false, error: 'Profile email is invalid.' };
    const gh = urlOrNull(socialsIn.github, 'GitHub URL');
    if (gh.error) return { ok: false, error: gh.error };
    const li = urlOrNull(socialsIn.linkedin, 'LinkedIn URL');
    if (li.error) return { ok: false, error: li.error };
    const vc = urlOrNull(socialsIn.vercel, 'Vercel URL');
    if (vc.error) return { ok: false, error: vc.error };
    data.profile = {
      ...(p.name !== undefined ? { name: str(p.name, 100) } : {}),
      ...(p.title !== undefined ? { title: str(p.title, 150) } : {}),
      ...(p.intro !== undefined ? { intro: str(p.intro, 1000) } : {}),
      ...(p.email !== undefined ? { email } : {}),
      ...(p.location !== undefined ? { location: str(p.location, 120) } : {}),
      ...(p.avatar !== undefined ? { avatar: strOrNull(p.avatar, 500) } : {}),
      ...(p.tagline !== undefined ? { tagline: str(p.tagline, 200) } : {}),
      ...(p.journey !== undefined ? { journey: str(p.journey, 1500) } : {}),
      ...(p.languages !== undefined ? { languages: strArray(p.languages, 10, 40) } : {}),
      ...(p.interests !== undefined ? { interests: strArray(p.interests, 20, 150) } : {}),
      ...(p.qualities !== undefined ? { qualities: strArray(p.qualities, 10, 80) } : {}),
      ...(p.careerGoals !== undefined ? { careerGoals: strArray(p.careerGoals, 15, 200) } : {}),
      ...(p.typingRoles !== undefined ? { typingRoles: strArray(p.typingRoles, 8, 60) } : {}),
      ...(gh.value !== undefined || li.value !== undefined || vc.value !== undefined
        ? {
            socials: {
              ...(gh.value ? { github: gh.value } : {}),
              ...(li.value ? { linkedin: li.value } : {}),
              ...(vc.value ? { vercel: vc.value } : {}),
            },
          }
        : {}),
    };
  }

  if (input.availability && typeof input.availability === 'object') {
    const a = input.availability as Record<string, unknown>;
    const status = ['internships', 'hackathons', 'collaborations', 'unavailable', 'hidden'].includes(String(a.status))
      ? String(a.status)
      : 'hidden';
    data.availability = { status, visible: bool(a.visible) && status !== 'hidden' };
  }

  if (input.education && typeof input.education === 'object') {
    const e = input.education as Record<string, unknown>;
    const admissionYear = Number(e.admissionYear);
    const graduationYear = Number(e.graduationYear);
    if (e.admissionYear !== undefined && (!Number.isFinite(admissionYear) || admissionYear < 1950 || admissionYear > 2100)) {
      return { ok: false, error: 'Admission year is invalid.' };
    }
    if (
      e.graduationYear !== undefined &&
      (!Number.isFinite(graduationYear) || graduationYear < 1950 || graduationYear > 2100)
    ) {
      return { ok: false, error: 'Graduation year is invalid.' };
    }
    const timeline = Array.isArray(e.timeline)
      ? e.timeline
          .filter((t): t is Record<string, unknown> => Boolean(t) && typeof t === 'object')
          .slice(0, 30)
          .map((t) => ({
            id: str(t.id, 60) || `tl-${Math.random().toString(36).slice(2, 8)}`,
            year: str(t.year, 30),
            title: str(t.title, 150),
            description: str(t.description, 600),
          }))
      : undefined;
    const achievements = Array.isArray(e.achievements)
      ? e.achievements
          .filter((t): t is Record<string, unknown> => Boolean(t) && typeof t === 'object')
          .slice(0, 30)
          .map((t) => ({
            id: str(t.id, 60) || `ach-${Math.random().toString(36).slice(2, 8)}`,
            title: str(t.title, 150),
            description: str(t.description, 600),
            date: strOrNull(t.date, 30),
          }))
      : undefined;
    data.education = {
      ...(e.college !== undefined ? { college: str(e.college, 150) } : {}),
      ...(e.degree !== undefined ? { degree: str(e.degree, 120) } : {}),
      ...(e.branch !== undefined ? { branch: str(e.branch, 120) } : {}),
      ...(e.admissionYear !== undefined ? { admissionYear } : {}),
      ...(e.graduationYear !== undefined ? { graduationYear } : {}),
      ...(e.currentYear !== undefined ? { currentYear: str(e.currentYear, 60) } : {}),
      ...(e.currentSemester !== undefined ? { currentSemester: str(e.currentSemester, 60) } : {}),
      ...(timeline ? { timeline } : {}),
      ...(achievements ? { achievements } : {}),
      ...(e.coursework !== undefined ? { coursework: strArray(e.coursework, 40, 120) } : {}),
    };
  }

  if (input.resume && typeof input.resume === 'object') {
    const r = input.resume as Record<string, unknown>;
    data.resume = {
      file: strOrNull(r.file, 500),
      uploadedAt: r.file ? new Date().toISOString() : null,
    };
  }

  if (input.settings && typeof input.settings === 'object') {
    const s = input.settings as Record<string, unknown>;
    data.settings = {
      ...(s.seoTitle !== undefined ? { seoTitle: str(s.seoTitle, 140) } : {}),
      ...(s.seoDescription !== undefined ? { seoDescription: str(s.seoDescription, 320) } : {}),
      ...(s.seoKeywords !== undefined ? { seoKeywords: str(s.seoKeywords, 400) } : {}),
      ...(s.ogImage !== undefined ? { ogImage: str(s.ogImage, 500) || '/og.png' } : {}),
    };
  }

  if (!Object.keys(data).length) return { ok: false, error: 'No valid fields to update.' };
  return { ok: true, data };
}
