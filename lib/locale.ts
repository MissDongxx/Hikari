import { locales, type Locale } from '@/i18n';

/**
 * Cookie name for storing user's locale preference
 */
export const LOCALE_COOKIE = 'NEXT_LOCALE';

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

/**
 * Set the locale cookie on the client side
 */
export function setLocaleCookie(locale: Locale) {
  if (typeof document !== 'undefined') {
    const maxAge = 60 * 60 * 24 * 365; // 1 year
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${maxAge}; SameSite=lax`;
  }
}

/**
 * Get the locale cookie value on the client side
 */
export function getLocaleCookie(): Locale | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(new RegExp('(^| )' + LOCALE_COOKIE + '=([^;]+)'));
  return match && isLocale(match[2]) ? (match[2] as Locale) : null;
}

