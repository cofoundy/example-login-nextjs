import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  
  // Check if user is logged in
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
  
  // Check if user is verified
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

// Only apply middleware to protected routes
export const config = { 
  matcher: ["/dashboard", "/profile", "/settings"]
};