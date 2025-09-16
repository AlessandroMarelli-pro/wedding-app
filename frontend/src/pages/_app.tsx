import { NavbarLayout } from '@/components/admin/admin-navbar-layout';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/sonner';
import '@/styles/globals.css';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith('/admin');
  const isAdminLoginPage = router.pathname.startsWith('/admin/login');

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
        <Component {...pageProps} />
      )}
      <SpeedInsights />
      <Analytics />
    </ErrorBoundary>
  );
}
