import type { Metadata } from 'next';
import { getSession } from '@/lib/auth-server';
import { LandingNav } from './(marketing)/_components/landing-nav';
import { Hero } from './(marketing)/_components/hero';
import { InstallBand } from './(marketing)/_components/install-band';
import { WidgetDemo } from './(marketing)/_components/widget-demo';
import { LayoutGallery } from './(marketing)/_components/layout-gallery';
import { FeaturesGrid } from './(marketing)/_components/features-grid';
import { FinalCta } from './(marketing)/_components/final-cta';
import { LandingFooter } from './(marketing)/_components/landing-footer';

export const dynamic = 'force-dynamic';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const ogImage = `${baseUrl}/og-landing.png`;
const title = 'Open Embed UI — Show off your open-source PRs anywhere';
const description =
  'Drop a single <script> tag on your blog, portfolio, or README. Get a live, themed widget of your merged contributions — no iframes, no API keys, no maintenance.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: baseUrl },
  openGraph: {
    title,
    description,
    url: baseUrl,
    siteName: 'Open Embed UI',
    images: [{ url: ogImage, width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [ogImage],
  },
};

export default async function Home() {
  const session = await getSession();
  const isAuthenticated = Boolean(session?.user);

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <LandingNav isAuthenticated={isAuthenticated} />
      <main className="flex-1">
        <Hero isAuthenticated={isAuthenticated} />
        <InstallBand />
        <WidgetDemo />
        <LayoutGallery />
        <FeaturesGrid />
        <FinalCta isAuthenticated={isAuthenticated} />
      </main>
      <LandingFooter />
    </div>
  );
}
