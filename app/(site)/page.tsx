import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Skills from '@/components/sections/Skills';
import Projects from '@/components/sections/Projects';
import Workspace from '@/components/sections/Workspace';
import Terminal from '@/components/sections/Terminal';
import type { TerminalData } from '@/components/sections/Terminal';
import GitHubSection from '@/components/sections/GitHubSection';
import Experience from '@/components/sections/Experience';
import Certificates from '@/components/sections/Certificates';
import BlogPreview from '@/components/sections/BlogPreview';
import Testimonials from '@/components/sections/Testimonials';
import Contact from '@/components/sections/Contact';
import { getSnapshot } from '@/lib/db';
import { groupSkills } from '@/lib/ai/knowledge';

/** Always render fresh content so admin edits appear without redeployment. */
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const snap = await getSnapshot();

  const terminalData: TerminalData = {
    name: snap.profile.name,
    title: snap.profile.title,
    intro: snap.profile.intro,
    skillsByCategory: groupSkills(snap),
    projects: [...snap.projects]
      .sort((a, b) => a.order - b.order)
      .map((p) => ({ title: p.title.split('–')[0].trim(), category: p.category })),
    education: {
      college: snap.education.college,
      degree: snap.education.degree,
      branch: snap.education.branch,
      admissionYear: snap.education.admissionYear,
      graduationYear: snap.education.graduationYear,
      currentYear: snap.education.currentYear,
      currentSemester: snap.education.currentSemester,
    },
    hackathons: snap.hackathons.map((h) => h.name),
    email: snap.profile.email,
    socials: snap.profile.socials,
    blogPosts: snap.posts
      .filter((p) => p.status === 'published')
      .map((p) => ({ title: p.title, slug: p.slug })),
    resumeAvailable: Boolean(snap.resume.file),
  };

  const githubUsername = snap.profile.socials.github.replace(/\/+$/, '').split('/').pop() || 'drashyavegda';

  return (
    <>
      <Hero profile={snap.profile} availability={snap.availability} resume={snap.resume} />
      <About profile={snap.profile} education={snap.education} />
      <Skills skills={snap.skills} education={snap.education} />
      <Projects projects={snap.projects} vercelUrl={snap.profile.socials.vercel} />
      <Workspace />
      <GitHubSection username={githubUsername} profileUrl={snap.profile.socials.github} />
      <Experience hackathons={snap.hackathons} />
      <Certificates certificates={snap.certificates} learning={snap.learning} />
      <Terminal data={terminalData} />
      <BlogPreview posts={snap.posts} />
      <Testimonials testimonials={snap.testimonials} />
      <Contact profile={snap.profile} />
    </>
  );
}
