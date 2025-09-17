import { Toaster } from '@/components/ui/sonner';
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
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&display=swap"
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

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.ricerf2026en26.fr/" />
        <meta property="og:title" content="Ariane & Timothe Wedding" />
        <meta
          property="og:description"
          content="Wedding website for Ariane & Timothe's special day"
        />
        <meta
          property="og:image"
          content="https://www.ricerf2026en26.fr/screenshots/desktop-screenshot.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="Ariane & Timothe Wedding Website Screenshot"
        />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://www.ricerf2026en26.fr/" />
        <meta property="twitter:title" content="Ariane & Timothe Wedding" />
        <meta
          property="twitter:description"
          content="Wedding website for Ariane & Timothe's special day"
        />
        <meta
          property="twitter:image"
          content="https://www.ricerf2026en26.fr/screenshots/desktop-screenshot.png"
        />
        <meta
          property="twitter:image:alt"
          content="Ariane & Timothe Wedding Website Screenshot"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
        <Toaster />
      </body>
    </Html>
  );
}
