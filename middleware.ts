import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import createMiddleware from 'next-intl/middleware';
import { locales, type Locale, defaultLocale } from './i18n';
import { LOCALE_COOKIE } from '@/lib/locale';

// Create next-intl middleware
// localePrefix: 'as-needed' means default locale (en) doesn't show prefix: /docs
// other locales show prefix: /zh/docs, /ja/docs
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  localeDetection: true // Enable auto-detection to redirect based on browser language
});

export async function middleware(request: NextRequest) {
  // Skip API routes and static files
  if (
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return updateSession(request);
  }

  // Run next-intl middleware
  const intlResponse = intlMiddleware(request);

  // Check if intl middleware wants to redirect
  const redirectLocation = intlResponse.headers.get('location');

  if (redirectLocation) {
    // Extract locale from redirect location and set cookie
    const localeMatch = redirectLocation.match(/^\/([a-z]{2})(\/|$)/);
    const response = NextResponse.redirect(new URL(redirectLocation, request.url), {
      status: intlResponse.status,
      statusText: intlResponse.statusText
    });

    if (localeMatch) {
      const detectedLocale = localeMatch[1] as Locale;
      if (locales.includes(detectedLocale)) {
        response.cookies.set(LOCALE_COOKIE, detectedLocale, {
          maxAge: 60 * 60 * 24 * 365,
          path: '/',
          sameSite: 'lax'
        });
      }
    } else {
      // If no locale prefix is found in the redirect location, use default locale
      response.cookies.set(LOCALE_COOKIE, defaultLocale, {
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
        sameSite: 'lax'
      });
    }

    await updateSession(request);
    response.headers.set('x-current-path', request.nextUrl.pathname);

    return response;
  }

  // No redirect - return intl response directly
  // The intlResponse contains the necessary rewrite headers for localePrefix: 'as-needed'
  // to properly route unprefixed paths like /docs to [locale]/docs
  await updateSession(request);

  return intlResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};
