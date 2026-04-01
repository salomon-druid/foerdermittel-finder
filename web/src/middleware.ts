import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const protectedPaths = ['/dashboard', '/profil'];
  const path = request.nextUrl.pathname;
  
  const isProtected = protectedPaths.some(
    (p) => path === p || path.startsWith(p + '/')
  );

  const hasToken = request.cookies.get('sb-access-token')?.value;
  const hasAuth = request.cookies.get('authenticated')?.value;
  const isAuthenticated = !!(hasToken || hasAuth);

  if (path === '/login') {
    return NextResponse.next();
  }

  if (isProtected && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/profil/:path*', '/login'],
};
