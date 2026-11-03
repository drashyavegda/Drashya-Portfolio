/** Core content types for the portfolio. Single source of truth for local + Supabase stores. */

export type AvailabilityStatus =
  | 'internships'
  | 'hackathons'
  | 'collaborations'
  | 'unavailable'
  | 'hidden';

export interface Profile {
  name: string;
  title: string;
  intro: string;
  email: string;
  location: string;
  avatar: string | null;
  socials: { github: string; linkedin: string; vercel: string };
  languages: string[];
  interests: string[];
  qualities: string[];
  careerGoals: string[];
  journey: string;
  typingRoles: string[];
  tagline: string;
}

export interface Availability {
  status: AvailabilityStatus;
  visible: boolean;
}

export interface TimelineItem {
  id: string;
  year: string;
  title: string;
  description: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string | null;
}

export interface Education {
  college: string;
  degree: string;
  branch: string;
  admissionYear: number;
  graduationYear: number;
  currentYear: string;
  currentSemester: string;
  timeline: TimelineItem[];
  achievements: Achievement[];
  coursework: string[];
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  /** Honest proficiency description — never a fake percentage. */
  description: string;
  learning: boolean;
}

export interface CaseStudy {
  problem: string;
  solution: string;
  process: string;
  challenges: string;
  results: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  featured: boolean;
  order: number;
  highlights: string[];
  technologies: string[];
  demoUrl: string | null;
  githubUrl: string | null;
  screenshots: string[];
  caseStudy: CaseStudy;
  seoTitle: string;
  seoDescription: string;
}

export type HackathonStatus = 'participated' | 'finalist' | 'winner';

export interface Hackathon {
  id: string;
  name: string;
  date: string | null;
  project: string | null;
  technologies: string[];
  status: HackathonStatus;
  certificateFile: string | null;
  certificateLink: string | null;
  notes: string;
}

export interface Certificate {
  id: string;
  title: string;
  org: string;
  date: string | null;
  file: string | null;
  kind: 'pdf' | 'image';
}

export interface LearningTopic {
  id: string;
  title: string;
  note: string;
}

export type PostLanguage = 'en' | 'hi' | 'gu';
export type PostStatus = 'draft' | 'published';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  category: string;
  language: PostLanguage;
  publishedAt: string | null;
  status: PostStatus;
  seoTitle: string;
  seoDescription: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  feedback: string;
  image: string | null;
  linkedin: string | null;
}

export interface Resume {
  file: string | null;
  uploadedAt: string | null;
}

export interface SiteSettings {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImage: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Snapshot {
  profile: Profile;
  availability: Availability;
  education: Education;
  skills: Skill[];
  projects: Project[];
  hackathons: Hackathon[];
  certificates: Certificate[];
  learning: LearningTopic[];
  posts: BlogPost[];
  testimonials: Testimonial[];
  resume: Resume;
  settings: SiteSettings;
  messages: Message[];
  updatedAt: string;
}

export type EntityKey =
  | 'skills'
  | 'projects'
  | 'hackathons'
  | 'certificates'
  | 'learning'
  | 'posts'
  | 'testimonials';

export const ENTITY_KEYS: EntityKey[] = [
  'skills',
  'projects',
  'hackathons',
  'certificates',
  'learning',
  'posts',
  'testimonials',
];

export const BLOG_CATEGORIES = [
  'Programming',
  'DSA',
  'Artificial Intelligence',
  'Web Development',
  'Hackathon Experiences',
  'Project Development',
  'Technology',
] as const;

export const LANGUAGE_LABELS: Record<PostLanguage, string> = {
  en: 'English',
  hi: 'हिन्दी (Hindi)',
  gu: 'ગુજરાતી (Gujarati)',
};
