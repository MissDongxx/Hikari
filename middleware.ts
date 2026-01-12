import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

// Create the next-intl middleware
const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: 'en',

  // Automatically detect locale from Accept-Language header
  localeDetection: true
});

export async function middleware(request: NextRequest) {
  // Run next-intl middleware first to handle locale routing/redirects
  const intlResponse = intlMiddleware(request);

  // Apply Supabase session management and custom headers
  const sessionResponse = await updateSession(request);

  // Copy important headers from intl response
  intlResponse.headers.forEach((value, key) => {
    // Preserve redirect and other critical headers from intl middleware
    if (key.toLowerCase() === 'location' || key.toLowerCase().startsWith('x-')) {
      sessionResponse.headers.set(key, value);
    }
  });

  // Set custom header
  sessionResponse.headers.set('x-current-path', request.nextUrl.pathname);

  return sessionResponse;
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
