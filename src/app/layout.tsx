import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import BackgroundEffects from "@/app/components/BackgroundEffects";
import ErrorBoundary from "@/app/components/ErrorBoundary";

import { siteConfig } from "@/lib/siteConfig";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: `${siteConfig.name} — See Unseen`,
  description: `${siteConfig.name}: See Unseen. Experience the internet without limits. Private, lightning-fast, and post-quantum encrypted network infrastructure.`,
  keywords: ["VPN", "privacy", "security", "fast internet", "encrypted", "post-quantum", "oculve"],
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get('x-nonce') || "";

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem('theme');
                  var theme = savedTheme;
                  
                  if (!theme) {
                    theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
                  }
                  
                  if (theme === 'light') {
                    document.documentElement.classList.add('light');
                  } else {
                    document.documentElement.classList.remove('light');
                  }
                } catch (e) { console.error(e); }
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <ErrorBoundary>
          <ThemeProvider>
            <BackgroundEffects />
            {children}
            <Analytics />
            <SpeedInsights />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
