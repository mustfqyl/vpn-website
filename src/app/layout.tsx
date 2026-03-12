import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import BackgroundEffects from "@/app/components/BackgroundEffects";

import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: `${siteConfig.name}VPN — Private & Fast`,
  description: `Experience the internet without limits with ${siteConfig.name}VPN. Private, fast, and secure network infrastructure.`,
  keywords: ["VPN", "privacy", "security", "fast internet", "encrypted", "post-quantum"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <script
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
      <body>
        <ThemeProvider>
          <BackgroundEffects />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
