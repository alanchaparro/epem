import { NextResponse, type NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const isProtected = url.pathname.startsWith('/profile') || url.pathname.startsWith('/dashboard');

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
  matcher: ['/profile/:path*', '/dashboard/:path*'],
};

