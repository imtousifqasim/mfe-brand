import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from './lib/auth/token';

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // 1. SEO 301 Redirect: Legacy /products?category=... -> Clean /category/...
  if (pathname === '/products' && searchParams.has('category')) {
    const categorySlug = searchParams.get('category');
    if (categorySlug) {
      const targetUrl = new URL(`/category/${encodeURIComponent(categorySlug)}`, req.url);
      // Preserve other filter/sorting params (e.g. sortBy)
      searchParams.forEach((value, key) => {
        if (key !== 'category') {
          targetUrl.searchParams.set(key, value);
        }
      });
      return NextResponse.redirect(targetUrl, 301);
    }
  }

  // 2. SEO 301 Redirect: Legacy /collections/... -> Clean /category/...
  if (pathname.startsWith('/collections/')) {
    const slug = pathname.replace('/collections/', '');
    const targetUrl = new URL(`/category/${slug}`, req.url);
    searchParams.forEach((value, key) => targetUrl.searchParams.set(key, value));
    return NextResponse.redirect(targetUrl, 301);
  }

  // 3. Admin Route Security & Access Control
  if (pathname.startsWith('/admin')) {
    const sessionCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const session = sessionCookie ? await verifyAdminSessionToken(sessionCookie) : null;
    const isAuthenticated = Boolean(session && session.role === 'super_admin');

    // Handle /admin/login route
    if (pathname === '/admin/login') {
      if (isAuthenticated) {
        const dashboardUrl = new URL('/admin', req.url);
        return NextResponse.redirect(dashboardUrl);
      }
      return NextResponse.next();
    }

    // All other /admin/** routes require verified authentication
    if (!isAuthenticated) {
      const loginUrl = new URL('/admin/login', req.url);
      const fullPath = pathname + req.nextUrl.search;
      if (fullPath !== '/admin') {
        loginUrl.searchParams.set('redirect', fullPath);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/products',
    '/collections/:path*',
  ],
};
