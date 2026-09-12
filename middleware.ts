import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from './lib/auth/token';

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Only handle admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const sessionCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = sessionCookie ? await verifyAdminSessionToken(sessionCookie) : null;
  const isAuthenticated = Boolean(session && session.role === 'super_admin');

  // Handle /admin/login route
  if (pathname === '/admin/login') {
    if (isAuthenticated) {
      // Already logged in -> redirect to admin dashboard
      const dashboardUrl = new URL('/admin', req.url);
      return NextResponse.redirect(dashboardUrl);
    }
    return NextResponse.next();
  }

  // All other /admin/** routes require verified authentication
  if (!isAuthenticated) {
    const loginUrl = new URL('/admin/login', req.url);
    const fullPath = pathname + search;
    if (fullPath !== '/admin') {
      loginUrl.searchParams.set('redirect', fullPath);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
