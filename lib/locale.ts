import { locales, type Locale } from '@/i18n';

export function isLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export function getDefaultLocale(): Locale {
  return 'en';
}

export function getLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split('/');
  const locale = segments[1];

  if (isLocale(locale)) {
    return locale;
  }

  return getDefaultLocale();
}
