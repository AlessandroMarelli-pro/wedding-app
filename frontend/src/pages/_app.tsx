import { ErrorBoundary } from '@/components/error-boundary';
import {
  DesktopInstallPrompt,
  InstallBanner,
  PWAProvider,
  UpdateBanner,
} from '@/components/pwa';
import { Toaster } from '@/components/ui/toaster';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <PWAProvider>
      <ErrorBoundary>
        <Component {...pageProps} />
        <Toaster />
        <InstallBanner />
        <DesktopInstallPrompt />
        <UpdateBanner />
      </ErrorBoundary>
    </PWAProvider>
  );
}
