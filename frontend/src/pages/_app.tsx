import { NavbarLayout } from '@/components/admin/admin-navbar-layout';
import { ErrorBoundary } from '@/components/error-boundary';
import { LoadingProgress } from '@/components/loading-progress';
import { Section } from '@/components/section-components';
import { Toaster } from '@/components/ui/sonner';
import '@/styles/globals.css';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { AppProps } from 'next/app';
import { Parisienne } from 'next/font/google';
import { useRouter } from 'next/router';
const bilbo = Parisienne({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bilbo',
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith('/admin');
  const isAdminLoginPage = router.pathname.startsWith('/admin/login');
  const isProd = process.env.NODE_ENV === 'production';
  const scrollToSection = (
    sectionId: string,
    behavior: 'smooth' | 'instant' = 'smooth',
  ) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior });
    }
  };
  return (
    <ErrorBoundary>
      <Toaster position="top-right" richColors closeButton />
      {isAdminPage && !isAdminLoginPage ? (
        <div className=" font-sans">
          <NavbarLayout type="admin">
            <Component {...pageProps} />
          </NavbarLayout>
        </div>
      ) : (
        <>
          <Section id="progress" background="accent">
            <LoadingProgress
              endFunction={() => {
                scrollToSection('home', 'instant');
              }}
              bilbo={bilbo}
            />
          </Section>
          <Component {...pageProps} />
        </>
      )}
      {isProd && <SpeedInsights />}
      {isProd && <Analytics />}
    </ErrorBoundary>
  );
}
