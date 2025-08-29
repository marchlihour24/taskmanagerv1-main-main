import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of protected routes
const protectedRoutes = ['/dashboard', '/tasks', '/profile'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // Check for Supabase auth cookie
    const token = request.cookies.get('sb-access-token');
    if (!token) {
      // Redirect to login if not authenticated
  return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // Allow request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/tasks/:path*', '/profile/:path*'],
};
