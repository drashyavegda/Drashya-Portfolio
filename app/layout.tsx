import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { getSnapshot } from '@/lib/db';
import Loader from '@/components/ui/Loader';
import Cursor from '@/components/ui/Cursor';
import { SoundProvider } from '@/components/ui/SoundProvider';
export const dynamic = 'force-dynamic';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export async function generateMetadata(): Promise<Metadata> {
  const snap = await getSnapshot();
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  return {
    metadataBase: base ? new URL(base) : undefined,
    title: {
      default: snap.settings.seoTitle,
      template: `%s · ${snap.profile.name}`,
    },
    description: snap.settings.seoDescription,
    keywords: snap.settings.seoKeywords.split(',').map((k) => k.trim()).filter(Boolean),
    authors: [{ name: snap.profile.name }],
    creator: snap.profile.name,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'profile',
      title: snap.settings.seoTitle,
      description: snap.settings.seoDescription,
      images: [{ url: snap.settings.ogImage || '/og.png', width: 1200, height: 630 }],
      url: base || undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: snap.settings.seoTitle,
      description: snap.settings.seoDescription,
      images: [snap.settings.ogImage || '/og.png'],
    },
    robots: { index: true, follow: true },
    icons: { icon: '/favicon.svg' },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#05070c' },
    { media: '(prefers-color-scheme: light)', color: '#f6f8fc' },
  ],
  width: 'device-width',
  initialScale: 1,
};

const themeInit = `
(function () {
  try {
    document.documentElement.classList.add('js');
    var stored = localStorage.getItem('dv-theme');
    var theme = stored === 'light' || stored === 'dark' ? stored : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const snap = await getSnapshot();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: snap.profile.name,
    jobTitle: snap.profile.title,
    description: snap.profile.intro,
    email: `mailto:${snap.profile.email}`,
    address: { '@type': 'PostalAddress', addressLocality: 'Ahmedabad', addressRegion: 'Gujarat', addressCountry: 'IN' },
    knowsLanguage: snap.profile.languages,
    sameAs: [snap.profile.socials?.github, snap.profile.socials?.linkedin, snap.profile.socials?.vercel].filter(
      (u): u is string => Boolean(u),
    ),
    knowsAbout: snap.skills.map((s) => s.name),
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <noscript>
          <style>{`.fade-item{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className={`${sans.variable} ${display.variable} ${mono.variable} font-sans`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SoundProvider>
          {children}
          <Loader />
          <Cursor />
        </SoundProvider>
      </body>
    </html>
  );
}
