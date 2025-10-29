import { NextResponse, type NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const protectedPrefixes = ['/profile', '/dashboard', '/patients', '/catalog', '/insurers', '/orders', '/authorizations', '/invoices', '/admin'];
  const isProtected = protectedPrefixes.some((p) => url.pathname.startsWith(p));

  if (isProtected) {
    const hasRefresh = req.cookies.get('epem_rt');
    if (!hasRefresh) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/dashboard/:path*',
    '/patients/:path*',
    '/catalog/:path*',
    '/insurers/:path*',
    '/orders/:path*',
    '/authorizations/:path*',
    '/invoices/:path*',
    '/admin/:path*',
  ],
};
