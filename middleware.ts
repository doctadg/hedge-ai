import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// export { default } from "next-auth/middleware" // Basic protection for all matched routes

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // If trying to access admin routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
      // Check if user is logged in AND is an admin
      if (!token || !(token as any).isAdmin) {
        // For API routes, return an unauthorized response
        if (pathname.startsWith('/api/admin')) {
          return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
        }
        // For admin pages, redirect to admin login
        // Use a generic login page if available, or admin login as fallback
        const loginUrl = new URL('/admin/login', req.url); 
        loginUrl.searchParams.set('callbackUrl', req.url);
        return NextResponse.redirect(loginUrl);
      }
    }

    // If trying to access hedge-chat API routes
    if (pathname.startsWith('/api/hedge-chat')) {
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized. Authentication required for chat features.' }, { status: 401 });
      }
      // Premium checks for specific chat functionalities will be handled within each API route.
    }

    // Allow request to proceed if authorized or for public paths not yet covered
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // Define all protected path prefixes
        const protectedPaths = ['/admin', '/api/admin', '/api/hedge-chat'];
        
        // If accessing any protected path, a token must exist.
        if (protectedPaths.some(path => pathname.startsWith(path))) {
          return !!token;
        }
        // For any other routes (public routes), allow access without a token.
        return true;
      },
    },
    pages: {
      // This signIn page is used when `authorized` callback returns false for a matched route.
      // For dashboard and hedge-chat APIs, we redirect manually or return JSON error in the middleware function.
      // For admin, this /admin/login will be used if not admin.
      signIn: '/admin/login', 
    }
  }
);

// Specify which paths should be protected by this middleware
export const config = {
  matcher: [
    '/admin/:path*',           // Protect all routes under /admin
    '/api/admin/:path*',       // Protect all API routes under /api/admin
    // Dashboard routes are now publicly accessible by the middleware;
    // client-side logic will handle auth and premium checks.
    '/api/hedge-chat/:path*',  // Protect all API routes under /api/hedge-chat
  ],
};
