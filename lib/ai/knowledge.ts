import type { Snapshot } from '../types';
import { formatDate } from '../utils';

/**
 * Portfolio knowledge engine.
 *
 * 1. Builds a strict system prompt from the live snapshot for LLM providers
 *    (OpenAI / Gemini) when an API key is configured server-side.
 * 2. Provides a rule-based fallback that answers from verified data only and
 *    honestly says when information is unavailable — no invention, ever.
 */

export function buildSystemPrompt(snap: Snapshot): string {
  const facts = {
    name: snap.profile.name,
    title: snap.profile.title,
    intro: snap.profile.intro,
    location: snap.profile.location,
    email: snap.profile.email,
    socials: snap.profile.socials,
    languagesSpoken: snap.profile.languages,
    education: {
      college: snap.education.college,
      degree: snap.education.degree,
      branch: snap.education.branch,
      admissionYear: snap.education.admissionYear,
      expectedGraduation: snap.education.graduationYear,
      current: `${snap.education.currentYear}, ${snap.education.currentSemester}`,
    },
    skillsByCategory: groupSkills(snap),
    projects: snap.projects.map((p) => ({
      title: p.title,
      category: p.category,
      description: p.description,
      highlights: p.highlights,
      technologies: p.technologies.length ? p.technologies : 'not specified yet',
      demoUrl: p.demoUrl ?? 'not published yet',
      githubUrl: p.githubUrl ?? 'not published yet',
    })),
    hackathons: snap.hackathons.map((h) => ({ name: h.name, status: h.status, date: h.date ?? 'not specified' })),
    participationNote:
      'More than 10 hackathons/coding competitions in total; the listed ones have confirmed participation certificates.',
    learningTopics: snap.learning.map((l) => l.title),
    resumeAvailable: Boolean(snap.resume.file),
    availability: snap.availability.visible && snap.availability.status !== 'hidden' ? snap.availability.status : 'not specified',
    blogPosts: snap.posts.filter((p) => p.status === 'published').map((p) => ({ title: p.title, url: `/blog/${p.slug}` })),
    testimonials: snap.testimonials.length ? snap.testimonials : 'none published yet',
  };

  return [
    `You are the portfolio assistant for ${snap.profile.name}. Answer visitors' questions using ONLY the verified JSON facts below.`,
    'STRICT RULES:',
    '- Never invent awards, rankings, grades, CGPA/SPI, work experience, skills, certifications, project results or personal details.',
    '- If the facts do not contain the answer, say clearly that this information is not available in the portfolio yet, and suggest what IS available.',
    '- Be concise (2-5 sentences), warm and professional. Plain text only, no markdown headings.',
    '- Refer to Drashya in the third person ("he/his") when talking to visitors.',
    '',
    'VERIFIED FACTS (JSON):',
    JSON.stringify(facts, null, 1),
  ].join('\n');
}

export function groupSkills(snap: Snapshot): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const s of snap.skills) {
    (out[s.category] ||= []).push(s.learning ? `${s.name} (learning)` : s.name);
  }
  return out;
}

/* ---------------- Rule-based fallback engine ---------------- */

interface Intent {
  keywords: RegExp;
  answer: (snap: Snapshot) => string;
}

const INTENTS: Intent[] = [
  {
    keywords: /\b(hi|hello|hey|namaste|namaskar)\b/i,
    answer: (s) =>
      `Hello! I'm the portfolio assistant for ${s.profile.name}. You can ask me about his background, education, skills, projects, hackathons or contact details.`,
  },
  {
    keywords: /\b(who is|about|background|introduce|tell me about (him|drashya))\b/i,
    answer: (s) =>
      `${s.profile.intro} He studies ${s.education.degree} in ${s.education.branch} at ${s.education.college} (currently ${s.education.currentYear}, ${s.education.currentSemester}).`,
  },
  {
    keywords: /\b(education|college|university|degree|semester|stud(y|ying)|graduat)\b/i,
    answer: (s) =>
      `He is pursuing ${s.education.degree} in ${s.education.branch} at ${s.education.college}. Admission year ${s.education.admissionYear}, expected graduation ${s.education.graduationYear}. He is currently in his ${s.education.currentYear}, ${s.education.currentSemester}. Specific grades or rankings are not published in the portfolio.`,
  },
  {
    keywords: /\b(skills?|languages?|programming|technologies|tech stack|knows?)\b/i,
    answer: (s) => {
      const grouped = groupSkills(s);
      const parts = Object.entries(grouped).map(([cat, items]) => `${cat}: ${items.join(', ')}`);
      return `Here is his honest skill snapshot — ${parts.join('. ')}. He prefers showing real practice over inflated percentages.`;
    },
  },
  {
    keywords: /\b(learning|currently learn|dsa|data structure|sql)\b/i,
    answer: (s) =>
      `He is actively learning: ${s.skills.filter((k) => k.learning).map((k) => k.name).join(', ') || '—'} — plus ongoing learning topics: ${s.learning.map((l) => l.title).join(', ')}. These are topics in progress, not completed certifications.`,
  },
  {
    keywords: /waste\s?flow/i,
    answer: (s) => projectAnswer(s, 'wasteflow'),
  },
  {
    keywords: /fin\s?track|finance/i,
    answer: (s) => projectAnswer(s, 'fintrack'),
  },
  {
    keywords: /medi\s?nav|health/i,
    answer: (s) => projectAnswer(s, 'medinav'),
  },
  {
    keywords: /quiet\s?place|workplace|study place/i,
    answer: (s) => projectAnswer(s, 'quietplace'),
  },
  {
    keywords: /learn\s?wise|learning platform/i,
    answer: (s) => projectAnswer(s, 'learnwise'),
  },
  {
    keywords: /\b(projects?|built|build|portfolio|work|case stud)\b/i,
    answer: (s) => {
      const list = [...s.projects].sort((a, b) => a.order - b.order).map((p, i) => `${i + 1}. ${p.title.split('–')[0].trim()} (${p.category})`).join('  ');
      return `He has built ${s.projects.length} projects showcased here: ${list}. Each has a case study page. Deployed projects can be explored on his Vercel profile: ${s.profile.socials.vercel}`;
    },
  },
  {
    keywords: /\b(hackathon|competition|innovation)\b/i,
    answer: (s) =>
      `He has participated in more than 10 hackathons and coding competitions. Confirmed participation (with certificates) includes: ${s.hackathons.map((h) => h.name).join(', ')}. All are listed honestly as participation — no fabricated awards or rankings.`,
  },
  {
    keywords: /\b(certificate|certification)\b/i,
    answer: (s) =>
      `Participation certificates are confirmed for ${s.certificates.length} events (${s.hackathons.map((h) => h.name).join(', ')}); files are viewable in the Certificates section once uploaded. His current learning topics (${s.learning.map((l) => l.title).join(', ')}) are shown separately and are NOT completed certifications.`,
  },
  {
    keywords: /\b(contact|email|reach|hire|recruit|intern(ship)?|collaborat|connect)\b/i,
    answer: (s) => {
      const avail =
        s.availability.visible && s.availability.status !== 'hidden'
          ? ` Current status: ${s.availability.status}.`
          : ' No specific availability status is published at the moment.';
      return `You can reach him at ${s.profile.email}, connect on LinkedIn (${s.profile.socials.linkedin}), or use the contact form on this site — messages arrive directly in his inbox.${avail}`;
    },
  },
  {
    keywords: /\b(resume|cv)\b/i,
    answer: (s) =>
      s.resume.file
        ? `His resume is available — use the "Download Resume" button in the hero section.`
        : `An updated resume PDF hasn't been uploaded to the site yet. For the latest CV, please email him at ${s.profile.email}.`,
  },
  {
    keywords: /\b(github|linkedin|vercel|social)\b/i,
    answer: (s) =>
      `GitHub: ${s.profile.socials.github} · LinkedIn: ${s.profile.socials.linkedin} · Vercel: ${s.profile.socials.vercel}`,
  },
  {
    keywords: /\b(blog|article|post|write|writing)\b/i,
    answer: (s) => {
      const published = s.posts.filter((p) => p.status === 'published');
      if (!published.length) return 'No articles are published yet — the blog supports English, Hindi and Gujarati, and first posts will appear soon.';
      return `Published articles: ${published.map((p) => `"${p.title}" (/blog/${p.slug})`).join(', ')}. The blog supports English, Hindi and Gujarati.`;
    },
  },
  {
    keywords: /\b(goal|ambition|future|dream|aspir|career)\b/i,
    answer: (s) => `His career goals: ${s.profile.careerGoals.join('; ')}.`,
  },
  {
    keywords: /\b(interest|hobby|hobbies|fun|gaming|game)\b/i,
    answer: (s) => `Beyond coding he enjoys: ${s.profile.interests.join(', ')}.`,
  },
  {
    keywords: /\b(location|city|where|from|ahmedabad|gujarat)\b/i,
    answer: (s) => `He is based in ${s.profile.location} and studies at ${s.education.college}.`,
  },
  {
    keywords: /\b(testimonial|review|feedback|recommend)\b/i,
    answer: (s) =>
      s.testimonials.length
        ? `There are ${s.testimonials.length} testimonials in the Testimonials section.`
        : 'No testimonials are published yet — only genuine feedback will be added, nothing fabricated.',
  },
];

function projectAnswer(snap: Snapshot, idPart: string): string {
  const p = snap.projects.find((proj) => proj.id.includes(idPart) || proj.slug.includes(idPart));
  if (!p) return 'I could not find that project in the portfolio data.';
  const tech = p.technologies.length ? ` Technologies: ${p.technologies.join(', ')}.` : ' The technology stack has not been published yet.';
  const links = [p.demoUrl && `Live demo: ${p.demoUrl}`, p.githubUrl && `GitHub: ${p.githubUrl}`].filter(Boolean).join(' · ');
  const highlights = p.highlights.length ? ` Key highlights: ${p.highlights.join('; ')}.` : '';
  return `${p.title}: ${p.description}${highlights}${tech}${links ? ` ${links}` : ''} Full case study: /projects/${p.slug}`;
}

export function fallbackAnswer(question: string, snap: Snapshot): string {
  for (const intent of INTENTS) {
    if (intent.keywords.test(question)) return intent.answer(snap);
  }
  return `I don't have verified information about that in Drashya's portfolio, and I won't guess. I can answer questions about his background, education (B.E. IT at ${snap.education.college}), skills, projects (WasteFlow AI, FinTrack, MediNav AI, The Quiet Place, LearnWise AI), hackathons, blog or contact details. (Answered by the built-in knowledge engine — connect an AI provider key for richer conversation.)`;
}

export function formatDateSafe(d: string | null): string {
  return d ? formatDate(d) : 'not specified';
}
