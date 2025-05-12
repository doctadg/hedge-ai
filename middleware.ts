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
        // If not admin, redirect to admin login page or a general unauthorized page
        // For API routes, just return an unauthorized response
        if (pathname.startsWith('/api/admin')) {
          return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
        }
        // For admin pages, redirect to admin login
        const adminLoginUrl = new URL('/admin/login', req.url);
        adminLoginUrl.searchParams.set('callbackUrl', req.url); // Redirect back after login
        return NextResponse.redirect(adminLoginUrl);
      }
    }
    // Allow request to proceed if authorized
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // This callback is used by withAuth to determine if the user is authorized
        // If accessing a protected route (matched by config below), token must exist.
        // Further role-based checks (like isAdmin) are done inside the middleware function above.
        return !!token; // User is authorized if token exists
      },
    },
    pages: {
      signIn: '/admin/login', // Redirect to this page if token doesn't exist for protected routes
    }
  }
);

// Specify which paths should be protected by this middleware
export const config = {
  matcher: [
    '/admin/:path*', // Protect all routes under /admin
    '/api/admin/:path*', // Protect all API routes under /api/admin
    '/dashboard/:path*', // Protect all routes under /dashboard
  ],
};
