import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const path = nextUrl.pathname;

  // Check if user is authenticated
  if (!session?.user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const role = session.user.role;

  // Role-based route protection
  if (path.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  if (path.startsWith('/regulator') && !['REGULATOR', 'ADMIN'].includes(role)) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  if (path.startsWith('/blood-bank') && !['BLOOD_BANK_STAFF', 'ADMIN'].includes(role)) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  if (path.startsWith('/hospital') && !['HOSPITAL_STAFF', 'ADMIN'].includes(role)) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  if (path.startsWith('/donor') && !['DONOR', 'ADMIN'].includes(role)) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/admin',
    '/admin/:path*',
    '/regulator',
    '/regulator/:path*',
    '/blood-bank',
    '/blood-bank/:path*',
    '/hospital',
    '/hospital/:path*',
    '/donor',
    '/donor/:path*',
  ],
};
