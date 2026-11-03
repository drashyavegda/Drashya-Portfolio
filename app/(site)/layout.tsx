import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import BackToTop from '@/components/ui/BackToTop';
import Chatbot from '@/components/ui/Chatbot';
import AnalyticsTracker from '@/components/ui/AnalyticsTracker';
import { getSnapshot } from '@/lib/db';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const snap = await getSnapshot();
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[10001] focus:rounded-lg focus:bg-neon focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
      >
        Skip to main content
      </a>
      <Navbar
        name={snap.profile.name}
        socials={{ github: snap.profile.socials.github, linkedin: snap.profile.socials.linkedin }}
        availability={snap.availability}
      />
      <main id="main">{children}</main>
      <Footer profile={snap.profile} />
      <BackToTop />
      <Chatbot />
      <AnalyticsTracker />
    </>
  );
}
