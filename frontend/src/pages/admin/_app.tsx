import { NavbarLayout } from '@/components/admin-navbar-layout';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NavbarLayout type="admin">
      <Component {...pageProps} />
    </NavbarLayout>
  );
}
