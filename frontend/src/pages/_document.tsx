import { Toaster } from '@/components/ui/sonner';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Head, Html, Main, NextScript } from 'next/document';
export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Ariane & Timothe Wedding" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Wedding" />
        <meta
          name="description"
          content="Wedding website for Ariane & Timothe's special day"
        />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#be185d" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#be185d" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />

        <link
          rel="apple-touch-icon"
          sizes="96x96"
          href="/icons/icon-96x96.png"
        />

        {/* Favicon */}
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/icons/icon-96x96.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/icon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/icon-16x16.png"
        />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&display=swap&family=Arvo:ital,wght@0,400;0,700;1,400;1,700&family=Bilbo&family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Geist+Mono&family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap"
          rel="stylesheet"
        />

        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Splash Screens */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />

        {/* Prevent zoom on iOS */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
        <Toaster />
        <SpeedInsights />
      </body>
    </Html>
  );
}
