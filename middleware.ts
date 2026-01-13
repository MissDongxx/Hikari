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

  // Check if intl middleware returned a redirect
  const redirectLocation = intlResponse.headers.get('location');

  if (redirectLocation) {
    // If intl middleware wants to redirect, we need to apply session management
    // and then return a redirect response
    await updateSession(request); // Apply session side-effects

    // Create a new redirect response with the location from intl middleware
    const response = NextResponse.redirect(new URL(redirectLocation, request.url), {
      status: intlResponse.status,
      statusText: intlResponse.statusText
    });

    // Copy custom headers
    response.headers.set('x-current-path', request.nextUrl.pathname);

    // Preserve x- headers from intl response
    intlResponse.headers.forEach((value, key) => {
      if (key.toLowerCase().startsWith('x-')) {
        response.headers.set(key, value);
      }
    });

    return response;
  }

  // No redirect, apply normal session management
  const sessionResponse = await updateSession(request);
  sessionResponse.headers.set('x-current-path', request.nextUrl.pathname);

  // Preserve x- headers from intl response
  intlResponse.headers.forEach((value, key) => {
    if (key.toLowerCase().startsWith('x-')) {
      sessionResponse.headers.set(key, value);
    }
  });

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
