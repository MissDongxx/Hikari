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
import { RootProvider } from 'fumadocs-ui/provider/next';
import { TRPCReactProvider } from '@/trpc/react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
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
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });

  const localeToOgLocale: Record<string, string> = {
    en: 'en_US',
    zh: 'zh_CN',
    ja: 'ja_JP'
  };

  return {
    metadataBase: new URL(getURL()),
    title: {
      default: t('title'),
      template: `%s | ${t('title')}`
    },
    description: t('description'),
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
      title: t('title'),
      description: t('description'),
      siteName: siteConfig.name
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
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
        'ja': '/ja',
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
  params
}: PropsWithChildren<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;

  // Enable static rendering - required for localePrefix: 'as-needed'
  // This tells next-intl what locale to use for this request
  setRequestLocale(locale);

  // getMessages() uses the locale from request context set above
  const messages = await getMessages();

  // Normalize locale for HTML lang attribute (zh -> zh-CN, ja -> ja, en -> en)
  const htmlLang = locale === 'zh' ? 'zh-CN' : locale === 'ja' ? 'ja' : 'en';

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
