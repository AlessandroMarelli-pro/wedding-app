import { NavbarLayout } from '@/components/admin/admin-navbar-layout';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/sonner';
import { NavbarThemeProvider } from '@/context/navbar-theme-context';
import { useEasterEgg } from '@/hooks/useEasterEgg';
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

  // Initialize Easter egg hook
  useEasterEgg({
    clickCount: 10,
    timeWindow: 2000,
    flipDuration: 1.5,
    imageSrc: '/images/hackerman.png',
    imageAlt: 'Surprise! 🎉',
    text: 'Une production Hackerman 🕵️‍♂️',
  });

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
    <NavbarThemeProvider>
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
            <Component {...pageProps} />
          </>
        )}
        {isProd && <SpeedInsights />}
        {isProd && <Analytics />}
      </ErrorBoundary>{' '}
    </NavbarThemeProvider>
  );
}
