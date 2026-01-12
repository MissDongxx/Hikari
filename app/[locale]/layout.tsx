import { Metadata } from 'next';
import { PropsWithChildren, Suspense } from 'react';
import { getURL } from '@/utils/helpers';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { TailwindIndicator } from '@/components/tailwind-indicator';
import { ThemeProvider } from '@/components/theme-provider';
import { Inter as FontSans } from 'next/font/google';
import localFont from 'next/font/local';
import type { Viewport } from 'next';
import { RootProvider } from 'fumadocs-ui/provider';
import { TRPCReactProvider } from '@/trpc/react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { locales } from '@/i18n';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ]
};

import '@/styles/globals.css';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
});

// Font files can be colocated inside of `pages`
// IMPORTANT: This path is relative to this file location (app/[locale]/layout.tsx)
// If you move this file, you must update the path accordingly:
// - app/layout.tsx would use '../assets/fonts/...'
// - app/[locale]/layout.tsx uses '../../assets/fonts/...'
const fontHeading = localFont({
  // Alternative fonts available in assets/fonts/:
  // - NotoSansMono-VariableFont_wdth,wght.ttf
  // - Inter-Bold.ttf
  // - Inter-Regular.ttf
  src: '../../assets/fonts/CalSans-SemiBold.woff2',
  variable: '--font-heading',
  display: 'swap'
});

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const localeToOgLocale: Record<string, string> = {
    en: 'en_US',
    zh: 'zh_CN'
  };

  return {
    metadataBase: new URL(getURL()),
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`
    },
    description: siteConfig.description,
    keywords: [
      'Next.js',
      'React',
      'Tailwind CSS',
      'Server Components',
      'Radix UI'
    ],
    openGraph: {
      type: 'website',
      locale: localeToOgLocale[locale] || 'en_US',
      url: siteConfig.url,
      title: siteConfig.name,
      description: siteConfig.description,
      siteName: siteConfig.name
    },
    twitter: {
      card: 'summary_large_image',
      title: siteConfig.name,
      description: siteConfig.description,
      images: [`${siteConfig.url}/og.jpg`]
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png'
    },
    manifest: `${siteConfig.url}/site.webmanifest`,
    alternates: {
      languages: {
        'en': '/en',
        'zh': '/zh',
        'x-default': '/en'
      }
    }
  };
}

export function generateStaticParams() {
  // Import fs to check if translation files exist at build time
  const fs = require('fs');
  const path = require('path');

  return locales
    .map((locale) => {
      const messagesPath = path.join(process.cwd(), 'messages', `${locale}.json`);
      if (fs.existsSync(messagesPath)) {
        return { locale };
      } else {
        console.warn(
          `Warning: Translation file "messages/${locale}.json" does not exist. Skipping static generation for locale "${locale}".`
        );
        return null;
      }
    })
    .filter(Boolean);
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: PropsWithChildren<{ params: { locale: string } }>) {
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  // Normalize locale for HTML lang attribute (zh -> zh-CN, en -> en)
  const htmlLang = locale === 'zh' ? 'zh-CN' : 'en';

  return (
    <html lang={htmlLang} suppressHydrationWarning>
      <head />
      <body
        className={cn(
          'min-h-screen bg-background font-mono antialiased',
          fontSans.variable,
          fontHeading.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NextIntlClientProvider messages={messages}>
            <RootProvider>
              <TRPCReactProvider>{children}</TRPCReactProvider>
            </RootProvider>
            <Toaster />
            {/* <TailwindIndicator /> */}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
