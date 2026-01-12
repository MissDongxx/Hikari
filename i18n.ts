import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Can be imported from a shared config
export const locales = ['en', 'zh'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  // Now we know locale is valid, use type assertion
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
