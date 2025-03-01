import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
  const isDashboardRoute = req.nextUrl.pathname === '/dashboard';
  
  // Check if user is logged in
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
  
  // Handle admin redirection - If an admin user goes to /dashboard, redirect to /admin
  if (isDashboardRoute && token.role === 'ADMIN') {
    return NextResponse.redirect(new URL("/admin", req.url));
  }
  
  // Handle admin routes
  if (isAdminRoute) {
    // Check if user has admin role
    if (token.role !== 'ADMIN') {
      // If not admin, redirect to dashboard
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    
    // Admin is authenticated, allow access
    return NextResponse.next();
  }
  
  // For non-admin routes, check if user is verified
  if (token.isVerified === false) {
    // Redirect to verification page with email
    const email = token.email as string;
    return NextResponse.redirect(
      new URL(`/verify?email=${encodeURIComponent(email)}`, req.url)
    );
  }
  
  // Allow access to protected routes
  return NextResponse.next();
}

// Apply middleware to protected routes and admin routes
export const config = { 
  matcher: ["/dashboard", "/profile", "/settings", "/admin/:path*"]
};