import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
export const locales = ['en', 'zh', 'ja'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export default getRequestConfig(async ({ requestLocale }) => {
  // requestLocale can be undefined when using localePrefix: 'as-needed'
  // In that case, we fall back to the default locale
  let locale = await requestLocale;

  // Validate or fallback to default
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  // Now we know locale is valid
  const validLocale = locale as Locale;

  let messages;
  try {
    messages = (await import(`./messages/${validLocale}.json`)).default;
  } catch (error) {
    // In development, throw error to catch missing translations early
    if (process.env.NODE_ENV === 'development') {
      throw new Error(
        `Missing translation file for locale "${validLocale}". ` +
        `Please create "messages/${validLocale}.json".`
      );
    }
    // In production, fall back to empty object to show raw keys
    console.error(`Missing translation file for locale "${validLocale}"`, error);
    messages = {};
  }

  // Validate that messages is an object
  if (typeof messages !== 'object' || messages === null) {
    throw new Error(`Invalid messages format for locale "${validLocale}"`);
  }

  return {
    locale: validLocale,
    messages
  };
});

