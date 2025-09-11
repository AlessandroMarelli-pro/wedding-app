import { NavbarLayout } from '@/components/admin-navbar-layout';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith('/admin');

  return (
    <ErrorBoundary>
      {isAdminPage ? (
        <NavbarLayout type="admin">
          <Component {...pageProps} />
        </NavbarLayout>
      ) : (
        <Component {...pageProps} />
      )}
      <Toaster />
    </ErrorBoundary>
  );
}
